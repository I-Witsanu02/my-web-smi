from __future__ import annotations

import logging
from typing import Annotated

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.logging_config import configure_logging
from app.schemas import (
    HealthResponse,
    ImageInput,
    PredictionResponse,
    QualityCheckResponse,
    ReportExportResponse,
    RequestMetadata,
    RoiDetectionResponse,
    RoiImportance,
    Sex,
    XaiResponse,
)
from app.services.image_io import load_image_stats, save_upload
from app.services.model_service import BoneAgeModelService
from app.services.report_service import ReportService
from app.services.xai_service import XaiService

configure_logging()
logger = logging.getLogger(__name__)
settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.api_version,
    description="Mock-first backend for explainable pediatric bone age assessment research.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model_service = BoneAgeModelService(settings)
xai_service = XaiService(settings.storage_root / "heatmaps")
report_service = ReportService(settings.storage_root / "reports")


async def parse_image_input(
    request: Request,
    file: UploadFile | None,
    case_id: str | None,
    image_path: str | None,
    chronological_age_months: int | None,
    sex: Sex | None,
) -> ImageInput:
    uploaded_path: str | None = None
    if file is not None:
        saved_path = save_upload(file, settings.storage_root / "uploads")
        uploaded_path = str(saved_path)

    if case_id and chronological_age_months is not None:
        return ImageInput(
            case_id=case_id,
            image_path=uploaded_path or image_path,
            metadata=RequestMetadata(chronological_age_months=chronological_age_months, sex=sex or Sex.unknown),
        )

    try:
        payload = await request.json()
    except Exception as exc:
        raise HTTPException(status_code=422, detail="Provide multipart form fields or a JSON body.") from exc

    parsed = ImageInput.model_validate(payload)
    if uploaded_path:
        parsed.image_path = uploaded_path
    return parsed


SharedFile = Annotated[UploadFile | None, File(description="Optional uploaded X-ray image")] 
SharedCaseId = Annotated[str | None, Form(description="Anonymized case ID")]
SharedImagePath = Annotated[str | None, Form(description="Existing uploaded image path")]
SharedAge = Annotated[int | None, Form(description="Chronological age in months")]
SharedSex = Annotated[Sex | None, Form(description="Biological sex metadata")]


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        version=settings.api_version,
        model_version=model_service.model_version,
        checkpoint_loaded=model_service.checkpoint_loaded,
    )


@app.post("/quality-check", response_model=QualityCheckResponse)
async def quality_check(
    request: Request,
    file: SharedFile = None,
    case_id: SharedCaseId = None,
    image_path: SharedImagePath = None,
    chronological_age_months: SharedAge = None,
    sex: SharedSex = None,
) -> QualityCheckResponse:
    payload = await parse_image_input(request, file, case_id, image_path, chronological_age_months, sex)
    logger.info("quality_check case_id=%s image_path=%s", payload.case_id, payload.image_path)
    checks = model_service.quality_check(load_image_stats(payload.image_path))
    overall = "fail" if any(check.status == "fail" for check in checks) else "review" if any(check.status == "review" for check in checks) else "pass"
    return QualityCheckResponse(case_id=payload.case_id, image_path=payload.image_path, checks=checks, overall_status=overall)


@app.post("/roi-detect", response_model=RoiDetectionResponse)
async def roi_detect(
    request: Request,
    file: SharedFile = None,
    case_id: SharedCaseId = None,
    image_path: SharedImagePath = None,
    chronological_age_months: SharedAge = None,
    sex: SharedSex = None,
) -> RoiDetectionResponse:
    payload = await parse_image_input(request, file, case_id, image_path, chronological_age_months, sex)
    logger.info("roi_detect case_id=%s image_path=%s", payload.case_id, payload.image_path)
    rois = model_service.detect_rois(load_image_stats(payload.image_path))
    return RoiDetectionResponse(case_id=payload.case_id, image_path=payload.image_path, rois=rois, model_version=model_service.model_version)


@app.post("/predict", response_model=PredictionResponse)
async def predict(
    request: Request,
    file: SharedFile = None,
    case_id: SharedCaseId = None,
    image_path: SharedImagePath = None,
    chronological_age_months: SharedAge = None,
    sex: SharedSex = None,
) -> PredictionResponse:
    payload = await parse_image_input(request, file, case_id, image_path, chronological_age_months, sex)
    logger.info("predict case_id=%s checkpoint_loaded=%s", payload.case_id, model_service.checkpoint_loaded)
    prediction = model_service.predict_bone_age(payload.metadata)
    return PredictionResponse(
        case_id=payload.case_id,
        model_version=model_service.model_version,
        checkpoint_loaded=model_service.checkpoint_loaded,
        **prediction,
    )


@app.post("/xai", response_model=XaiResponse)
async def xai(
    request: Request,
    file: SharedFile = None,
    case_id: SharedCaseId = None,
    image_path: SharedImagePath = None,
    chronological_age_months: SharedAge = None,
    sex: SharedSex = None,
) -> XaiResponse:
    payload = await parse_image_input(request, file, case_id, image_path, chronological_age_months, sex)
    logger.info("xai case_id=%s methods=Grad-CAM,Grad-CAM++,Score-CAM,Eigen-CAM", payload.case_id)
    heatmaps = xai_service.generate_heatmaps(payload.case_id)
    importance = [RoiImportance(**item) for item in model_service.roi_importance()]
    return XaiResponse(case_id=payload.case_id, heatmaps=heatmaps, roi_importance=importance, model_version=model_service.model_version)


@app.post("/report-export", response_model=ReportExportResponse)
async def report_export(
    request: Request,
    file: SharedFile = None,
    case_id: SharedCaseId = None,
    image_path: SharedImagePath = None,
    chronological_age_months: SharedAge = None,
    sex: SharedSex = None,
) -> ReportExportResponse:
    payload = await parse_image_input(request, file, case_id, image_path, chronological_age_months, sex)
    logger.info("report_export case_id=%s", payload.case_id)
    prediction = PredictionResponse(
        case_id=payload.case_id,
        model_version=model_service.model_version,
        checkpoint_loaded=model_service.checkpoint_loaded,
        **model_service.predict_bone_age(payload.metadata),
    )
    rois = model_service.detect_rois(load_image_stats(payload.image_path))
    heatmaps = xai_service.generate_heatmaps(payload.case_id)
    report_path = report_service.export(
        payload.case_id,
        {
            "case_id": payload.case_id,
            "metadata": payload.metadata.model_dump(),
            "prediction": prediction.model_dump(),
            "rois": [roi.model_dump() for roi in rois],
            "heatmaps": [heatmap.model_dump() for heatmap in heatmaps],
        },
    )
    return ReportExportResponse(
        case_id=payload.case_id,
        report_path=str(report_path),
        prediction=prediction,
        roi_count=len(rois),
        heatmap_count=len(heatmaps),
    )
