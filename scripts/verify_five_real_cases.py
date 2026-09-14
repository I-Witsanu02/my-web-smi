"""Run five real radiographs through the same deployed service used by the web API."""
from __future__ import annotations

import base64
import json
import sys
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from model_service import SERVICE


CASES = [
    ("1436", 108.0, 1, Path(r"D:\workspace\Bone_age\pipeline_output\male\1436.png")),
    ("1377", 180.0, 0, Path(r"D:\workspace\Bone_age\pipeline_output\female\1377.png")),
    ("10901", 156.0, 0, Path(r"D:\workspace\Bone_age\pipeline_output\female\10901.png")),
    ("1391", 180.0, 1, Path(r"D:\workspace\Bone_age\pipeline_output\male\1391.png")),
    ("1435", 180.0, 1, Path(r"D:\workspace\Bone_age\pipeline_output\male\1435.png")),
    ("1452", 180.0, 0, Path(r"D:\workspace\Bone_age\pipeline_output\female\1452.png")),
    ("1562", 144.0, 1, Path(r"D:\workspace\Bone_age\pipeline_output\male\1562.png")),
    ("1585", 144.0, 0, Path(r"D:\workspace\Bone_age\pipeline_output\female\1585.png")),
    ("1406", 106.0, 0, Path(r"D:\workspace\Bone_age\pipeline_output\female\1406.png")),
    ("1469", 106.0, 0, Path(r"D:\workspace\Bone_age\pipeline_output\female\1469.png")),
]


def save_data_url(value: str, path: Path) -> None:
    path.write_bytes(base64.b64decode(value.split(",", 1)[1]))


def main() -> None:
    output = Path(__file__).resolve().parents[1] / "runtime" / "verification_5_passed_real_cases"
    output.mkdir(parents=True, exist_ok=True)
    rows = []
    attempts = []
    for patient_id, truth, male, image_path in CASES:
        with Image.open(image_path) as image:
            result = SERVICE.predict_full_hand(image, male, "full18_focalnet_b8", truth)
        prediction = result.get("prediction")
        row = {
            "patient_id": patient_id,
            "source": str(image_path),
            "true_months": truth,
            "sex": "male" if male else "female",
            "qc_status": result["qc_status"],
            "detected_count": result["detected_count"],
            "missing_rois": result["missing_rois"],
            "low_confidence_rois": result["low_confidence_rois"],
            "predicted_months": prediction["predicted_months"] if prediction else None,
            "absolute_error_months": round(abs(prediction["predicted_months"] - truth), 3) if prediction else None,
            "roi_gate": prediction["roi_gate"] if prediction else None,
            "xai_method": result.get("xai_method"),
        }
        case_dir = output / patient_id
        case_dir.mkdir(exist_ok=True)
        save_data_url(result["annotated_image"], case_dir / "yolo_detections.jpg")
        if result.get("xai_image"):
            save_data_url(result["xai_image"], case_dir / "xai_input_gradient.png")
        attempts.append(row)
        print(json.dumps(row, ensure_ascii=False), flush=True)
        if result["qc_status"] == "PASS":
            rows.append(row)
        if len(rows) == 5:
            break
    (output / "results.json").write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    (output / "attempts.json").write_text(json.dumps(attempts, ensure_ascii=False, indent=2), encoding="utf-8")
    if len(rows) != 5:
        raise RuntimeError(f"Expected five PASS cases, got {len(rows)}")
    print(f"FINISHED: {output}")


if __name__ == "__main__":
    main()
