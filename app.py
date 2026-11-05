from __future__ import annotations

import base64
import csv
import hashlib
import hmac
import json
import os
import re
import shutil
import time
import uuid
from collections import defaultdict, deque
from functools import lru_cache
from io import BytesIO
from io import StringIO
from datetime import datetime, timezone
from pathlib import Path
from typing import Annotated

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from PIL import Image, ImageOps
from pydantic import BaseModel, Field

from model_service import APP_ROOT, REGISTRY_PATH, SERVICE, load_registry, resolve_checkpoint
import persistence


def load_local_env(path: Path) -> None:
    if not path.is_file():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


@lru_cache(maxsize=16)
def _checkpoint_sha256(path: str, size: int, modified_ns: int) -> str:
    with Path(path).open("rb") as handle:
        return hashlib.file_digest(handle, "sha256").hexdigest()


def checkpoint_provenance(entry: dict) -> dict[str, str]:
    """Return stable, non-sensitive identity metadata for a model checkpoint."""
    checkpoint = resolve_checkpoint(entry)
    stat = checkpoint.stat()
    digest = _checkpoint_sha256(str(checkpoint.resolve()), stat.st_size, stat.st_mtime_ns)
    return {
        "id": str(entry.get("id", "")),
        "name": str(entry.get("display_name", entry.get("id", ""))),
        "file": checkpoint.name,
        "sha256": digest,
    }


load_local_env(APP_ROOT / ".env")
AUTH_USERNAME = os.getenv("BONEAGE_USERNAME", "")
AUTH_PASSWORD = os.getenv("BONEAGE_PASSWORD", "")
AUTH_SECRET = os.getenv("BONEAGE_SESSION_SECRET", "")
AUTH_TTL_SECONDS = 12 * 60 * 60
ALLOWED_ORIGINS = [origin.strip().rstrip("/") for origin in os.getenv("BONEAGE_ALLOWED_ORIGINS", "").split(",") if origin.strip()]
DEMO_ENABLED = os.getenv("BONEAGE_DEMO_ENABLED", "0") == "1"
DEMO_MAX_BYTES = int(os.getenv("BONEAGE_DEMO_MAX_BYTES", str(20 * 1024 * 1024)))
DEMO_RATE_LIMIT = int(os.getenv("BONEAGE_DEMO_RATE_LIMIT", "5"))
DEMO_RATE_WINDOW_SECONDS = int(os.getenv("BONEAGE_DEMO_RATE_WINDOW_SECONDS", "600"))
DEMO_REQUESTS: dict[str, deque[float]] = defaultdict(deque)

# Authentication is opt-in through explicit local environment values. Never
# create a fallback account: an unset or placeholder credential must fail closed.
AUTH_USERS: dict[str, dict[str, str]] = {}
AUTH_SECRET_CONFIGURED = len(AUTH_SECRET) >= 32 and AUTH_SECRET not in {
    "replace-with-a-long-random-secret", "change-me", "secret", ""
}
if AUTH_USERNAME and AUTH_PASSWORD and AUTH_SECRET_CONFIGURED and AUTH_PASSWORD != "change-me":
    AUTH_USERS[AUTH_USERNAME] = {"password": AUTH_PASSWORD, "role": "Clinical Reviewer"}


def issue_session_token(username: str, role: str) -> str:
    expires_at = int(time.time()) + AUTH_TTL_SECONDS
    payload = json.dumps({"sub": username, "role": role, "exp": expires_at}, separators=(",", ":")).encode("utf-8")
    encoded = base64.urlsafe_b64encode(payload).decode("ascii").rstrip("=")
    signature = hmac.new(AUTH_SECRET.encode("utf-8"), encoded.encode("ascii"), hashlib.sha256).hexdigest()
    return f"{encoded}.{signature}"


def verify_session_token(token: str) -> dict | None:
    if not token or not AUTH_SECRET:
        return None
    try:
        encoded, signature = token.rsplit(".", 1)
        expected = hmac.new(AUTH_SECRET.encode("utf-8"), encoded.encode("ascii"), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature, expected):
            return None
        padding = "=" * (-len(encoded) % 4)
        payload = json.loads(base64.urlsafe_b64decode(encoded + padding).decode("utf-8"))
        username = str(payload.get("sub", ""))
        user = AUTH_USERS.get(username)
        if not user or payload.get("role") != user["role"] or int(payload.get("exp", 0)) <= int(time.time()):
            return None
        return {"name": username, "role": user["role"]}
    except (ValueError, TypeError, json.JSONDecodeError):
        return None


FRONTEND = APP_ROOT / "dist"
REVIEWS = APP_ROOT / "runtime" / "reviews"
REVIEWS.mkdir(parents=True, exist_ok=True)
CASES_PATH = APP_ROOT / "runtime" / "cases.json"
AUDIT_PATH = APP_ROOT / "runtime" / "audit.jsonl"
RUNTIME_ASSETS = APP_ROOT / "runtime" / "assets"
RUNTIME_ASSETS.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="Skeleton Bone Age Research Prototype",
    version="1.0.0",
    description="Nine-ROI bone-age prediction and review API. Research use only.",
)
if ALLOWED_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )
# The GPU service is deployed independently from the Vite site in production.
# `dist/` is deliberately not copied into the GPU image, so mounting it
# unconditionally made the otherwise valid inference API fail at startup.
# Keep static serving for the local all-in-one workflow, but make it optional
# for API-only Docker deployments.
if (FRONTEND / "assets").is_dir():
    app.mount("/assets", StaticFiles(directory=FRONTEND / "assets"), name="assets")
app.mount("/runtime-assets", StaticFiles(directory=RUNTIME_ASSETS), name="runtime-assets")


@app.middleware("http")
async def require_api_session(request: Request, call_next):
    path = request.url.path
    if request.method == "OPTIONS":
        return await call_next(request)
    public_api_paths = {"/api/health", "/api/auth/login", "/api/demo/predict"}
    if (path.startswith(("/api/", "/runtime-assets/"))) and path not in public_api_paths:
        authorization = request.headers.get("authorization", "")
        token = authorization.removeprefix("Bearer ").strip() if authorization.startswith("Bearer ") else request.cookies.get("skeleton_session", "")
        if not verify_session_token(token):
            return JSONResponse(status_code=401, content={"detail": "กรุณาเข้าสู่ระบบใหม่"})
        if request.method not in {"GET", "HEAD", "OPTIONS"}:
            from urllib.parse import urlparse
            origin = request.headers.get("origin")
            trusted_cross_origin = origin and origin.rstrip("/") in ALLOWED_ORIGINS
            if origin and urlparse(origin).netloc != request.headers.get("host") and not trusted_cross_origin:
                return JSONResponse(status_code=403, content={"detail": "Cross-origin write rejected"})
    return await call_next(request)


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=120)
    password: str = Field(min_length=1, max_length=200)


class ReviewRequest(BaseModel):
    case_id: str = Field(min_length=1, max_length=120)
    patient_id: str = Field(min_length=1, max_length=80)
    model_id: str
    raw_prediction_months: float = Field(ge=0, le=240)
    reviewed_prediction_months: float = Field(ge=0, le=240)
    chronological_age_months: float | None = Field(default=None, ge=0, le=300)
    sex: str = Field(default="unknown", max_length=20)
    reviewer_note: str = Field(default="", max_length=2000)
    status: str = Field(default="reviewed", pattern="^(draft|reviewed|accepted|rejected)$")
    inference_id: str = Field(default="", max_length=40)
    assessment_method: str = Field(default="unspecified", max_length=100)
    reviewer_name: str = Field(default="", max_length=120)
    view_settings: dict = Field(default_factory=dict)
    curation_checks: dict[str, bool] = Field(default_factory=dict)
    curation_evidence: str = Field(default="", max_length=2000)


class FeedbackStatusRequest(BaseModel):
    status: str = Field(pattern="^(candidate|approved|rejected|blocked_locked_test)$")
    note: str = Field(default="", max_length=2000)

class AnnotationFeedbackRequest(BaseModel):
    case_id: str = Field(min_length=1,max_length=120)
    category: str = Field(pattern='^(ROI|XAI)$')
    inference_id: str = Field(min_length=32,max_length=32,pattern='^[a-f0-9]{32}$')
    roi_revision: int = Field(ge=0)
    decision: str = Field(pattern='^(uncertain|plausible|implausible)$')
    note: str = Field(default='',max_length=2000)
    rois: list[dict] = Field(default_factory=list,max_length=9)
    xai_method: str = Field(default='',max_length=80)


class CasesRequest(BaseModel):
    cases: list[dict]


class AuditRequest(BaseModel):
    id: str = Field(min_length=1, max_length=120)
    timestamp: str = Field(min_length=1, max_length=80)
    level: str = Field(pattern="^(INFO|WARN|AUDIT)$")
    module: str = Field(min_length=1, max_length=80)
    message: str = Field(min_length=1, max_length=2000)
    case_id: str | None = Field(default=None, max_length=120)


def enforce_demo_rate_limit(request: Request) -> None:
    client_key = request.client.host if request.client else "unknown"
    now = time.time()
    requests = DEMO_REQUESTS[client_key]
    while requests and now - requests[0] > DEMO_RATE_WINDOW_SECONDS:
        requests.popleft()
    if len(requests) >= DEMO_RATE_LIMIT:
        raise HTTPException(status_code=429, detail="ทดลองได้ไม่เกิน 5 ครั้งต่อ 10 นาที กรุณารอสักครู่")
    requests.append(now)


def write_json_atomic(path: Path, payload: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    temporary.replace(path)


def save_data_url(value: str, target: Path) -> str:
    _, encoded = value.split(",", 1)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(base64.b64decode(encoded))
    relative = target.relative_to(RUNTIME_ASSETS).as_posix()
    return f"/runtime-assets/{relative}"


def public_model(item: dict) -> dict:
    safe = {key: value for key, value in item.items() if key != "checkpoint"}
    checkpoint = resolve_checkpoint(item)
    safe["checkpoint_file"] = checkpoint.name
    safe["checkpoint_available"] = checkpoint.is_file()
    return safe


@app.post("/api/auth/login")
def login(request: LoginRequest) -> dict:
    user = AUTH_USERS.get(request.username)
    configured = bool(AUTH_USERS and AUTH_SECRET_CONFIGURED)
    valid_password = bool(user) and hmac.compare_digest(request.password, user["password"])
    if not (configured and valid_password and user):
        persistence.event("LOGIN_FAILED", "anonymous")
        raise HTTPException(status_code=401, detail="ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง")
    token = issue_session_token(request.username, user["role"])
    persistence.event("LOGIN", request.username)
    response = JSONResponse({
        "authenticated": True,
        "token": token,
        "expires_in_seconds": AUTH_TTL_SECONDS,
        "user": {"name": request.username, "role": user["role"]},
    })
    response.set_cookie("skeleton_session", token, httponly=True, samesite="strict", max_age=AUTH_TTL_SECONDS,
                        secure=os.getenv("BONEAGE_HTTPS", "0") == "1")
    return response


@app.get("/api/auth/session")
def auth_session(request: Request) -> dict:
    authorization = request.headers.get("authorization", "")
    token = authorization.removeprefix("Bearer ").strip() if authorization.startswith("Bearer ") else request.cookies.get("skeleton_session", "")
    user = verify_session_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="กรุณาเข้าสู่ระบบใหม่")
    return {"authenticated": True, "user": user}


@app.get("/api/health")
def health() -> dict:
    registry = load_registry()
    active = next(item for item in registry["models"] if item["id"] == registry["default_model"])
    return {
        "status": "ok",
        "app": "Skeleton Bone Age",
        "analysis_system": "bone-age-analysis-1-18",
        "device": str(SERVICE.device),
        "model_available": resolve_checkpoint(active).is_file(),
        "research_only": True,
    }


@app.get("/api/models")
def models() -> dict:
    registry = load_registry()
    return {
        "default_model": registry["default_model"],
        "models": [public_model(item) for item in registry["models"]],
        "detector": public_model(registry["detector"]),
    }


@app.post("/api/demo/predict")
def demo_predict(
    request: Request,
    image: Annotated[UploadFile, File()],
    sex: Annotated[str, Form()],
    chronological_age_months: Annotated[float, Form()],
    height_cm: Annotated[float | None, Form()] = None,
    weight_kg: Annotated[float | None, Form()] = None,
    model_id: Annotated[str, Form()] = "full18_focalnet_b8",
) -> dict:
    """Anonymous research demo. Images are processed in memory and are not persisted."""
    if not DEMO_ENABLED:
        raise HTTPException(status_code=503, detail="Public demo is disabled")
    enforce_demo_rate_limit(request)
    if sex not in {"female", "male"}:
        raise HTTPException(status_code=422, detail="กรุณาระบุเพศหญิงหรือชาย")
    if not 1 <= chronological_age_months <= 216:
        raise HTTPException(status_code=422, detail="ต้นแบบรองรับอายุ 1 เดือนถึง 18 ปี")
    if height_cm is not None and not 30 <= height_cm <= 230:
        raise HTTPException(status_code=422, detail="ส่วนสูงอยู่นอกช่วงที่รองรับ")
    if weight_kg is not None and not 1 <= weight_kg <= 250:
        raise HTTPException(status_code=422, detail="น้ำหนักอยู่นอกช่วงที่รองรับ")
    if image.content_type not in {"image/jpeg", "image/png"}:
        raise HTTPException(status_code=415, detail="รองรับเฉพาะไฟล์ภาพ JPG หรือ PNG")

    payload = image.file.read(DEMO_MAX_BYTES + 1)
    if len(payload) > DEMO_MAX_BYTES:
        raise HTTPException(status_code=413, detail="ภาพมีขนาดเกิน 20 MB")
    try:
        with Image.open(BytesIO(payload)) as uploaded:
            uploaded.verify()
        with Image.open(BytesIO(payload)) as uploaded:
            rgb = uploaded.convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=422, detail="ไม่สามารถอ่านไฟล์ภาพได้") from exc
    if rgb.width < 256 or rgb.height < 256:
        raise HTTPException(status_code=422, detail="ภาพต้องมีความกว้างและความสูงอย่างน้อย 256 พิกเซล")
    if rgb.width * rgb.height > 50_000_000:
        raise HTTPException(status_code=413, detail="ความละเอียดภาพสูงเกินขีดจำกัด")

    try:
        result = SERVICE.predict_full_hand(
            rgb,
            male=1.0 if sex == "male" else 0.0,
            model_id=model_id,
            chronological_age_months=chronological_age_months,
            reviewed_boxes=None,
        )
    except (FileNotFoundError, RuntimeError, ValueError) as exc:
        raise HTTPException(status_code=503, detail=f"โมเดลยังไม่พร้อมใช้งาน: {exc}") from exc

    # Keep the anonymous response small and do not write the upload or crops to disk.
    for detection in result.get("detections", []):
        detection.pop("crop_data_url", None)
    prediction = result.get("prediction")
    if isinstance(prediction, dict):
        for internal_key in (
            "model_id", "model_name", "device", "preprocess", "roi_gate",
            "auxiliary_groups", "_pixel_attribution",
        ):
            prediction.pop(internal_key, None)
    for internal_key in ("detector", "protocol_warning", "xai_method", "xai_metadata"):
        result.pop(internal_key, None)
    result.update({
        "image_size": [rgb.width, rgb.height],
        "demo": True,
        "image_retained": False,
        "height_cm": height_cm,
        "weight_kg": weight_kg,
        "anthropometrics_used_by_model": False,
        "clinical_disclaimer": "ผลจากโมเดลวิจัยไม่ใช่การวินิจฉัย โปรดปรึกษาแพทย์หรือรังสีแพทย์",
    })
    return result


@app.post("/api/predict/full-hand")
def predict_full_hand(
    image: Annotated[UploadFile, File()],
    male: Annotated[int, Form()] = 0,
    model_id: Annotated[str, Form()] = "full18_focalnet_b8",
    chronological_age_months: Annotated[float | None, Form()] = None,
    case_id: Annotated[str, Form()] = "uploaded-case",
    reviewed_boxes: Annotated[str | None, Form()] = None,
    xai_method: Annotated[str, Form()] = 'GradCAM',
    scorecam_topk: Annotated[int, Form()] = 16,
    detect_only: Annotated[bool, Form()] = False,
) -> dict:
    if male not in {0, 1}:
        raise HTTPException(status_code=422, detail="male ต้องเป็น 0 หรือ 1")
    from cam_service import METHODS
    from model_service import ROI_ORDER
    if xai_method not in (*METHODS,'SmoothGrad') or scorecam_topk not in (0,8,16,32):
        raise HTTPException(status_code=422,detail='Unsupported XAI method / ScoreCAM setting')
    try:
        with Image.open(image.file) as uploaded:
            rgb = ImageOps.exif_transpose(uploaded).convert("RGB")
        parsed_boxes = json.loads(reviewed_boxes) if reviewed_boxes else None
        if not detect_only and (not parsed_boxes or set(parsed_boxes)!=set(ROI_ORDER)):
            raise ValueError('ตรวจและยืนยัน ROI ครบ 9 จุดก่อนทำนายอายุ')
        result = SERVICE.predict_full_hand(
            rgb,
            male=float(male),
            model_id=model_id,
            chronological_age_months=chronological_age_months,
            reviewed_boxes=parsed_boxes,
            xai_method=xai_method,
            scorecam_topk=scorecam_topk,
            detect_only=detect_only,
        )
        result["image_size"] = [rgb.width, rgb.height]
        safe_case = re.sub(r"[^A-Za-z0-9_.-]", "_", case_id).strip("._") or "uploaded-case"
        inference_id = uuid.uuid4().hex
        case_dir = RUNTIME_ASSETS / safe_case / inference_id
        case_dir.mkdir(parents=True, exist_ok=True)
        original_path = case_dir / "full_hand.png"
        rgb.save(original_path, format="PNG")
        result["full_hand_url"] = f"/runtime-assets/{safe_case}/{inference_id}/full_hand.png"
        if result.get("annotated_image", "").startswith("data:"):
            result["annotated_image"] = save_data_url(result["annotated_image"], case_dir / "annotated.png")
        if result.get("xai_image", "").startswith("data:"):
            result["xai_image"] = save_data_url(result["xai_image"], case_dir / "xai_roi_gate.png")
        if result.get('xai_layer', '').startswith('data:'):
            result['xai_layer'] = save_data_url(result['xai_layer'], case_dir / 'xai_layer.png')
        for detection in result.get("detections", []):
            crop = detection.get("crop_data_url", "")
            if crop.startswith("data:"):
                detection["crop_data_url"] = save_data_url(
                    crop,
                    case_dir / "roi" / f"{detection['roi']}.png",
                )
        result['inference_id'] = inference_id
        result['case_id'] = case_id
        result['created_at'] = persistence.now()
        result['image_sha256'] = hashlib.sha256(original_path.read_bytes()).hexdigest()
        result['device'] = str(SERVICE.device)
        result['male'] = male
        result['chronological_age_months'] = chronological_age_months
        result['model_id'] = model_id
        registry = load_registry()
        model_entry = next(m for m in registry['models'] if m['id'] == model_id)
        model_provenance = (
            checkpoint_provenance(model_entry)
            if result.get('prediction')
            else {"file": Path(model_entry['checkpoint']).name, "sha256": ""}
        )
        detector_provenance = checkpoint_provenance(registry['detector'])
        result['checkpoint_file'] = model_provenance['file']
        result['checkpoint_sha256'] = model_provenance['sha256']
        result['detector_id'] = detector_provenance['id']
        result['detector_name'] = detector_provenance['name']
        result['detector_checkpoint_file'] = detector_provenance['file']
        result['detector_checkpoint_sha256'] = detector_provenance['sha256']
        result['detector_imgsz'] = int(registry['detector'].get('imgsz', 0))
        result['detector_roi_classes'] = list(registry['detector'].get('required_rois', []))
        records = APP_ROOT / 'runtime' / 'inferences'
        records.mkdir(parents=True, exist_ok=True)
        write_json_atomic(records / f'{inference_id}.json', result)
        persistence.event('INFERENCE_COMPLETED', AUTH_USERNAME, case_id, {
            'inference_id': inference_id, 'image_sha256': result['image_sha256'],
            'prediction': result.get('prediction'), 'device': result['device'],
        })
        return result
    except (ValueError, KeyError, FileNotFoundError) as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Full-hand pipeline failed: {error}") from error


@app.post("/api/reviews")
def save_review(request: ReviewRequest) -> dict:
    from review_protocol import protected_patient_ids
    case = persistence.get_case(request.case_id) or {}
    inference = {}
    if request.inference_id:
        if not re.fullmatch(r'[a-f0-9]{32}', request.inference_id):
            raise HTTPException(422, 'Invalid inference id')
        record = APP_ROOT / 'runtime' / 'inferences' / f'{request.inference_id}.json'
        if not record.is_file():
            raise HTTPException(422, 'Inference record not found')
        inference = json.loads(record.read_text(encoding='utf-8'))
        if inference['case_id'] != request.case_id or not inference.get('prediction'):
            raise HTTPException(422, 'Inference does not belong to this case or QC has not passed')
        request.raw_prediction_months = inference['prediction']['predicted_months']
        request.model_id = inference['model_id']
    safe_id = re.sub(r"[^A-Za-z0-9_.-]", "_", request.patient_id).strip("._") or "case"
    timestamp = datetime.now(timezone.utc).isoformat()
    payload = {**request.model_dump(), "saved_at": timestamp, "research_only": True}
    persistence.event("EXPERT_REVIEW", AUTH_USERNAME, request.patient_id, payload)
    target = REVIEWS / f"{safe_id}.json"
    target.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    case = persistence.get_case(request.case_id) or {}
    protected, registry_complete = protected_patient_ids()
    is_locked = bool(case.get('isTestCase')) or request.patient_id in protected or case.get('datasetSplit') in ('validation', 'test', 'locked_test')
    feedback_status = "blocked_locked_test" if is_locked else "candidate"
    patient_key = hashlib.sha256(request.patient_id.encode("utf-8")).hexdigest()[:16]
    feedback_payload = {
        'patient_id':request.patient_id,
        'inference_id': request.inference_id,
        'image_sha256': inference.get('image_sha256', ''),
        'checkpoint_sha256': inference.get('checkpoint_sha256', ''),
        'detector_id': inference.get('detector_id', ''),
        'detector_checkpoint_sha256': inference.get('detector_checkpoint_sha256', ''),
        'device': inference.get('device', ''),
        'assessment_method': request.assessment_method,
        'reviewer_name': request.reviewer_name,
        'review_status': request.status,
        'view_settings': request.view_settings,
        'curation_checks': {**request.curation_checks, 'split_clearance_approved': bool(registry_complete and request.curation_checks.get('split_clearance_approved') and not is_locked)},
        'curation_evidence': request.curation_evidence,
        "schema_version": "boneage-feedback-v1",
        "case_id": request.case_id,
        "patient_key": patient_key,
        "chronological_age_months": request.chronological_age_months,
        "sex": request.sex,
        "source_image_url": inference.get('full_hand_url') or case.get("xrayImageUrl", ""),
        "raw_prediction_months": request.raw_prediction_months,
        "expert_bone_age_months": request.reviewed_prediction_months,
        "signed_error_vs_expert_months": round(request.raw_prediction_months - request.reviewed_prediction_months, 3),
        "absolute_error_vs_expert_months": round(abs(request.raw_prediction_months - request.reviewed_prediction_months), 3),
        "model_id": request.model_id,
        "model_display_name": case.get("modelDisplayName", ""),
        "detector_name": case.get("detectorName", ""),
        "preprocessing_version": case.get("preprocessingVersion", ""),
        "rois": case.get("rois", []),
        "reviewer_note": request.reviewer_note,
        "requires_independent_adjudication": True,
        "training_eligible": False,
        "locked_test": is_locked,
        "created_at": timestamp,
    }
    feedback = persistence.save_feedback(request.case_id, AUTH_USERNAME, feedback_payload, feedback_status)
    return {
        "saved": True, "review_id": safe_id, "saved_at": timestamp,
        "feedback_id": feedback["id"], "feedback_revision": feedback["revision"],
        "feedback_status": feedback["status"],
    }


@app.get("/api/reviews/{patient_id}")
def get_review(patient_id: str) -> dict:
    safe_id = re.sub(r"[^A-Za-z0-9_.-]", "_", patient_id).strip("._") or "case"
    target = REVIEWS / f"{safe_id}.json"
    if not target.is_file():
        raise HTTPException(status_code=404, detail="ยังไม่มีผลการทบทวน")
    return json.loads(target.read_text(encoding="utf-8"))


@app.get("/api/feedback")
def list_feedback(status: str | None = None) -> dict:
    allowed = {None, "candidate", "approved", "rejected", "blocked_locked_test"}
    if status not in allowed:
        raise HTTPException(status_code=422, detail="feedback status ไม่ถูกต้อง")
    items = persistence.list_feedback(status)
    return {"feedback": items, "count": len(items), "updated_at": persistence.now()}

@app.post('/api/feedback/annotations')
def save_annotation_feedback(payload: AnnotationFeedbackRequest,request: Request) -> dict:
    token=request.headers.get('authorization','').removeprefix('Bearer ').strip() or request.cookies.get('skeleton_session','')
    user=verify_session_token(token)
    if not user:raise HTTPException(401,'Authentication required')
    record=APP_ROOT/'runtime/inferences'/f'{payload.inference_id}.json'
    if not record.is_file():raise HTTPException(422,'Inference record not found')
    inference=json.loads(record.read_text(encoding='utf-8'))
    if inference['case_id']!=payload.case_id:raise HTTPException(422,'Inference belongs to another case')
    case=persistence.get_case(payload.case_id) or {}
    protected,complete=protected_patient_ids()
    locked=case.get('isTestCase') or case.get('patientId') in protected or case.get('datasetSplit') in ('validation','test','locked_test')
    data={**payload.model_dump(),'reviewer_name':user['name'],'reviewer_role':user['role'],'patient_id':case.get('patientId',''),'locked_test':bool(locked),'training_eligible':False,'review_status':'reviewed','reviewer_note':payload.note,'source_image_url':inference.get('full_hand_url'),'model_id':inference.get('model_id'),'requires_independent_adjudication':True,'curation_checks':{},'curation_evidence':''}
    return persistence.save_feedback(payload.case_id,user['name'],data,'blocked_locked_test' if locked else 'candidate')


@app.patch("/api/feedback/{feedback_id}")
def set_feedback_status(feedback_id: str, request: FeedbackStatusRequest) -> dict:
    try:
        result = persistence.update_feedback_status(feedback_id, request.status, AUTH_USERNAME, request.note)
    except ValueError as error:
        raise HTTPException(422, str(error)) from error
    if not result:
        raise HTTPException(status_code=404, detail="ไม่พบ feedback")
    return result


@app.get("/api/feedback/export.csv")
def export_feedback_csv(status: str = "approved") -> Response:
    if status not in {"candidate", "approved", "rejected", "blocked_locked_test"}:
        raise HTTPException(status_code=422, detail="feedback status ไม่ถูกต้อง")
    output = StringIO()
    fields = [
        "feedback_id", "case_id", "revision", "status", "patient_key", "source_image_url",
        "sex", "chronological_age_months", "raw_prediction_months", "expert_bone_age_months",
        "signed_error_vs_expert_months", "absolute_error_vs_expert_months", "model_id",
        "detector_name", "preprocessing_version", "training_eligible", "locked_test", "created_at",
    ]
    writer = csv.DictWriter(output, fieldnames=fields)
    writer.writeheader()
    for item in (persistence.exportable_feedback() if status == 'approved' else persistence.list_feedback(status)):
        payload = item["payload"]
        writer.writerow({
            "feedback_id": item["id"], "case_id": item["case_id"], "revision": item["revision"],
            "status": item["status"], **{field: payload.get(field, "") for field in fields[4:]},
        })
    return Response(
        output.getvalue(), media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="boneage_feedback_{status}.csv"'},
    )

@app.get('/api/feedback/training-plan')
def feedback_training_plan() -> dict:
    from review_protocol import protected_patient_ids
    from feedback_learning import approved_training_feedback
    ids,complete=protected_patient_ids()
    if not complete:
        return {'accepted':[],'blocked_reason':'Protected split manifests unavailable','automatic_training':False,'automatic_release':False}
    return approved_training_feedback(persistence.exportable_feedback(),ids)


@app.get("/api/cases")
def list_cases() -> dict:
    return {"cases": persistence.list_cases(), "updated_at": persistence.now()}


@app.put("/api/cases")
def save_cases(request: CasesRequest) -> dict:
    if len(request.cases) > 10000:
        raise HTTPException(status_code=422, detail="จำนวนเคสมากเกินขอบเขตของโปรแกรมต้นแบบ")
    timestamp = datetime.now(timezone.utc).isoformat()
    payload = {"cases": request.cases, "updated_at": timestamp, "research_only": True}
    try:
        persistence.save_cases(request.cases, AUTH_USERNAME)
    except ValueError as error:
        raise HTTPException(422, str(error)) from error
    return {"saved": True, "count": len(request.cases), "saved_at": timestamp}


@app.delete("/api/cases/{case_id}")
def delete_case(case_id: str) -> dict:
    if not persistence.delete_case(case_id, AUTH_USERNAME):
        raise HTTPException(status_code=404, detail="ไม่พบเคส")
    safe_case = re.sub(r"[^A-Za-z0-9_.-]", "_", case_id).strip("._")
    case_assets = RUNTIME_ASSETS / safe_case
    if safe_case and case_assets.is_dir() and case_assets.parent.resolve() == RUNTIME_ASSETS.resolve():
        shutil.rmtree(case_assets)
    return {"deleted": True, "case_id": case_id}


@app.post("/api/audit")
def append_audit(request: AuditRequest) -> dict:
    persistence.event(request.module, AUTH_USERNAME, request.case_id, request.model_dump())
    AUDIT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with AUDIT_PATH.open("a", encoding="utf-8") as stream:
        stream.write(json.dumps(request.model_dump(), ensure_ascii=False) + "\n")
    return {"saved": True}


@app.get("/api/history")
def case_history(case_id: str | None = None):
    return {"events": persistence.history(case_id)}


@app.get("/")
def index() -> Response:
    if not (FRONTEND / "index.html").is_file():
        return JSONResponse({
            "service": "boneage-gpu-api",
            "status": "ready",
            "health": "/api/health",
            "docs": "/docs",
        })
    return FileResponse(FRONTEND / "index.html")


@app.get("/{path:path}")
def spa_fallback(path: str) -> Response:
    if not (FRONTEND / "index.html").is_file():
        return JSONResponse({"detail": "Not found"}, status_code=404)
    candidate = (FRONTEND / path).resolve()
    if FRONTEND.resolve() in candidate.parents and candidate.is_file():
        return FileResponse(candidate)
    return FileResponse(FRONTEND / "index.html")
