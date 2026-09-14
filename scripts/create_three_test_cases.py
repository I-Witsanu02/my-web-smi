from __future__ import annotations

import json
import os
import shutil
from datetime import datetime
from pathlib import Path

import requests
from dotenv import load_dotenv


ROOT = Path(__file__).resolve().parents[1]
TARGET = Path(r"D:\workspace\ทดสอบ")
BASE_URL = "http://127.0.0.1:8766"
MODEL_ID = "full18_focalnet_b8"
MAX_ACCEPTED_ERROR_MONTHS = 6.58

ROI_DETAILS = {
    "Carpal": ("Carpal Bones", "กระดูกข้อมือ"),
    "DP3": ("Distal Phalanx 3", "ข้อนิ้วส่วนปลาย นิ้วกลาง"),
    "MC1": ("Metacarpal 1", "กระดูกฝ่ามือ นิ้วโป้ง"),
    "MP3": ("Middle Phalanx 3", "ข้อนิ้วส่วนกลาง นิ้วกลาง"),
    "MP5": ("Middle Phalanx 5", "ข้อนิ้วส่วนกลาง นิ้วก้อย"),
    "PP1": ("Proximal Phalanx 1", "ข้อนิ้วส่วนโคน นิ้วโป้ง"),
    "PP3": ("Proximal Phalanx 3", "ข้อนิ้วส่วนโคน นิ้วกลาง"),
    "Radius": ("Distal Radius", "ปลายกระดูกเรเดียส"),
    "Ulna": ("Distal Ulna", "ปลายกระดูกอัลนา"),
}

# Ordered by earlier measured error so the script keeps the best passing cases.
CANDIDATES = [
    ("1435", 180.0, 1, Path(r"D:\workspace\Bone_age\pipeline_output\male\1435.png")),
    ("10901", 156.0, 0, Path(r"D:\workspace\Bone_age\pipeline_output\female\10901.png")),
    ("1377", 180.0, 0, Path(r"D:\workspace\Bone_age\pipeline_output\female\1377.png")),
    ("1391", 180.0, 1, Path(r"D:\workspace\Bone_age\pipeline_output\male\1391.png")),
    ("1436", 108.0, 1, Path(r"D:\workspace\Bone_age\pipeline_output\male\1436.png")),
]


def age_label(months: float) -> str:
    whole = int(round(months))
    return f"{whole // 12}y{whole % 12}m"


def make_case(candidate_id: str, truth: float, male: int, filename: str, result: dict) -> dict:
    prediction = result["prediction"]
    predicted = float(prediction["predicted_months"])
    offset = round(predicted - truth, 1)
    width, height = result["image_size"]
    detections = {item["roi"]: item for item in result["detections"]}
    rois = []
    for index, (code, (name, name_th)) in enumerate(ROI_DETAILS.items(), start=1):
        item = detections[code]
        x1, y1, x2, y2 = item["box"]
        importance = float(prediction["roi_gate"].get(code, 0))
        rois.append({
            "id": f"roi-{index}", "code": code, "name": name, "nameTh": name_th,
            "confidence": item["confidence"], "source": item.get("source", "detector"),
            "importance": round(importance * 100), "xaiImportance": importance,
            "thumbnailUrl": item["crop_data_url"], "status": "accepted",
            "bbox": {
                "left": f"{x1 / width * 100}%", "top": f"{y1 / height * 100}%",
                "width": f"{(x2 - x1) / width * 100}%", "height": f"{(y2 - y1) / height * 100}%",
            },
            "anatomicalNote": "",
        })
    label = age_label(truth)
    return {
        "id": f"TEST-{label.upper()}-{candidate_id}", "patientId": f"TEST-{candidate_id}",
        "isTestCase": True, "groundTruthBoneAgeMonths": truth, "sourceImageName": filename,
        "name": {"first": "ทดสอบโมเดล", "last": label}, "dob": "", "measurementDate": "",
        "chronologicalAgeMonths": truth, "chronologicalAgeDisplay": label,
        "sex": "Male" if male else "Female", "currentStep": "Prediction", "lastStep": "Prediction",
        "status": "Review Required", "updatedAt": "Just now", "heightCm": 0, "weightKg": 0,
        "bmi": 0, "heightPercentile": "ไม่ใช้กับเคสทดสอบ", "fatherHeightCm": 0,
        "motherHeightCm": 0, "midParentalHeightCm": 0,
        "primaryIndication": f"MODEL TEST CASE — ground truth {label}",
        "clinicalNotes": f"ภาพทดสอบแยกจากข้อมูลผู้ป่วยจริง; source ID {candidate_id}",
        "growthStandard": "Ground-truth dataset label", "predictedAgeMonths": predicted,
        "rawPredictedAgeMonths": predicted, "reviewedPredictedAgeMonths": truth,
        "predictedAgeDisplay": age_label(predicted), "offsetMonths": offset,
        "offsetType": "Normal" if abs(offset) < 3 else ("Advanced" if offset > 0 else "Delayed"),
        "uncertaintyMonths": 0, "confidenceInterval": "Not estimated",
        "xrayImageUrl": result["full_hand_url"], "xaiHeatmapUrl": result.get("xai_image", ""),
        "xaiEvidenceStatus": "generated" if result.get("xai_image") else "unavailable", "rois": rois,
        "modelId": prediction["model_id"], "modelDisplayName": prediction["model_name"],
        "modelArchitecture": "FocalNet Tiny SRF + 9-ROI fusion + sex FiLM",
        "preprocessingVersion": prediction["preprocess"], "experimentId": "FULL18_AUG200_V6_A1_SLOW_PLATEAU_E50",
        "validationMaeMonths": prediction.get("validation_mae_months"), "imageQualityCheck": "Passed",
        "detectorName": result["detector"], "roisAccepted": 9, "roisTotal": 9,
        "xaiMethod": result.get("xai_method"), "xaiAcknowledged": False, "checklistComplete": False,
    }


def main() -> None:
    raise RuntimeError(
        "Disabled: this legacy demo selects cases by known prediction error and "
        "substitutes bone age for chronological age. Use audit_validation.py "
        "with a fixed validation manifest; retain all failures."
    )
    # Historical implementation retained for audit only; unreachable by design.
    load_dotenv(ROOT / ".env")
    TARGET.mkdir(parents=True, exist_ok=True)
    session = requests.Session()
    login = session.post(f"{BASE_URL}/api/auth/login", json={
        "username": os.environ["BONEAGE_USERNAME"], "password": os.environ["BONEAGE_PASSWORD"],
    }, timeout=30)
    login.raise_for_status()

    accepted_cases = []
    report = []
    for candidate_id, truth, male, source in CANDIDATES:
        if len(accepted_cases) == 3:
            break
        if not source.is_file():
            report.append({"source_id": candidate_id, "accepted": False, "reason": "missing source"})
            continue
        label = age_label(truth)
        case_id = f"TEST-{label.upper()}-{candidate_id}"
        with source.open("rb") as image_file:
            response = session.post(
                f"{BASE_URL}/api/predict/full-hand",
                files={"image": (source.name, image_file, "image/png")},
                data={"male": male, "model_id": MODEL_ID, "chronological_age_months": truth, "case_id": case_id},
                timeout=180,
            )
        response.raise_for_status()
        result = response.json()
        predicted = result.get("prediction", {}).get("predicted_months")
        error = abs(float(predicted) - truth) if predicted is not None else None
        accepted = result.get("qc_status") == "PASS" and error is not None and error <= MAX_ACCEPTED_ERROR_MONTHS
        report.append({
            "source_id": candidate_id, "truth_months": truth, "predicted_months": predicted,
            "absolute_error_months": round(error, 3) if error is not None else None,
            "qc_status": result.get("qc_status"), "detected_rois": result.get("detected_count"), "accepted": accepted,
        })
        if not accepted:
            continue
        filename = f"{label}_case{candidate_id}.png"
        shutil.copy2(source, TARGET / filename)
        accepted_cases.append(make_case(candidate_id, truth, male, filename, result))

    if len(accepted_cases) != 3:
        raise RuntimeError(f"Only {len(accepted_cases)} cases met the acceptance criteria")

    existing = session.get(f"{BASE_URL}/api/cases", timeout=30).json().get("cases", [])
    accepted_ids = {item["id"] for item in accepted_cases}
    merged = [item for item in existing if item.get("id") not in accepted_ids] + accepted_cases
    saved = session.put(f"{BASE_URL}/api/cases", json={"cases": merged}, timeout=30)
    saved.raise_for_status()
    output = {"created_at": datetime.now().astimezone().isoformat(), "threshold_months": MAX_ACCEPTED_ERROR_MONTHS, "attempts": report, "accepted_case_ids": sorted(accepted_ids)}
    (TARGET / "ผลทดสอบ.json").write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(output, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
