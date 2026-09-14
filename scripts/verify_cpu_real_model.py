"""Run one full, real CPU inference without saving the patient image.

Example (Windows PowerShell):
  $env:BONEAGE_DEVICE='cpu'
  python scripts/verify_cpu_real_model.py "D:\\deidentified\\hand.png" --sex female --age-months 156
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path

os.environ.setdefault("BONEAGE_DEVICE", "cpu")
WEB_ROOT = Path(__file__).resolve().parents[1]
if str(WEB_ROOT) not in sys.path:
    sys.path.insert(0, str(WEB_ROOT))

from PIL import Image

from model_service import SERVICE


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify real YOLO, FocalNet, and XAI inference on CPU.")
    parser.add_argument("image", type=Path, help="De-identified left hand/wrist JPG or PNG")
    parser.add_argument("--sex", choices=("female", "male"), required=True)
    parser.add_argument("--age-months", type=float, required=True, help="Chronological age in months")
    args = parser.parse_args()

    if not args.image.is_file():
        parser.error(f"Image not found: {args.image}")

    started = time.perf_counter()
    with Image.open(args.image) as opened:
        result = SERVICE.predict_full_hand(
            opened,
            male=1.0 if args.sex == "male" else 0.0,
            model_id="full18_focalnet_b8",
            chronological_age_months=args.age_months,
        )
    elapsed_seconds = round(time.perf_counter() - started, 2)

    summary = {
        "device": str(SERVICE.device),
        "elapsed_seconds": elapsed_seconds,
        "qc_status": result["qc_status"],
        "detected_count": result["detected_count"],
        "missing_rois": result["missing_rois"],
        "prediction_months": result.get("prediction", {}).get("predicted_months"),
        "prediction_age": result.get("prediction", {}).get("predicted_age"),
        "xai_generated": bool(result.get("xai_image")),
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0 if result["qc_status"] == "PASS" and result.get("prediction") else 2


if __name__ == "__main__":
    sys.exit(main())
