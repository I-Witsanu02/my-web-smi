from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from app.config import Settings
from app.schemas import QualityCheck, RequestMetadata, RoiBox

logger = logging.getLogger(__name__)

ROI_LABELS = ["Carpal", "Radius", "Ulna", "PP3", "MP3", "DP3", "MC1", "MP5", "PP1"]


class BoneAgeModelService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.checkpoint_loaded = False
        self.device = "cpu"
        self._model: Any = None
        self._load_checkpoint_if_available()

    def _load_checkpoint_if_available(self) -> None:
        checkpoint_path = self.settings.model_checkpoint_path
        if not checkpoint_path:
            logger.info("MODEL_CHECKPOINT_PATH not set; using mock inference")
            return

        path = Path(checkpoint_path)
        if not path.exists():
            logger.warning("Checkpoint path does not exist; using mock inference: %s", path)
            return

        try:
            import torch

            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            checkpoint = torch.load(path, map_location=self.device)
            self._model = checkpoint
            self.checkpoint_loaded = True
            logger.info("Loaded checkpoint placeholder from %s on %s", path, self.device)
        except Exception:
            logger.exception("Unable to load checkpoint; falling back to mock inference")
            self._model = None
            self.checkpoint_loaded = False

    @property
    def model_version(self) -> str:
        return self.settings.model_version

    def quality_check(self, stats: dict[str, Any]) -> list[QualityCheck]:
        brightness = float(stats["brightness"])
        contrast = float(stats["contrast"])
        blur = float(stats["blur"])
        image_available = bool(stats["available"])

        return [
            QualityCheck(
                name="hand_wrist_detected",
                status="pass" if image_available else "review",
                value="detected" if image_available else "mocked without readable image",
                score=0.92 if image_available else 0.72,
            ),
            QualityCheck(name="orientation_status", status="pass", value="PA left hand assumed", score=0.88),
            QualityCheck(
                name="brightness_contrast",
                status="pass" if 0.25 <= brightness <= 0.85 and contrast >= 0.2 else "review",
                value=f"brightness={brightness}, contrast={contrast}",
                score=max(0.0, min((contrast + brightness) / 2, 1.0)),
            ),
            QualityCheck(
                name="blur",
                status="pass" if blur < 0.35 else "review",
                value=f"blur_score={blur}",
                score=max(0.0, min(1.0 - blur, 1.0)),
            ),
            QualityCheck(name="marker_text_interference", status="review", value="not evaluated by mock model", score=0.68),
        ]

    def detect_rois(self, stats: dict[str, Any]) -> list[RoiBox]:
        width = float(stats.get("width") or 1024)
        height = float(stats.get("height") or 1280)
        templates = [
            ("Carpal", 0.34, 0.58, 0.26, 0.18, 0.94),
            ("Radius", 0.23, 0.76, 0.18, 0.17, 0.91),
            ("Ulna", 0.55, 0.76, 0.15, 0.17, 0.89),
            ("PP3", 0.44, 0.26, 0.12, 0.14, 0.96),
            ("MP3", 0.43, 0.39, 0.13, 0.13, 0.95),
            ("DP3", 0.44, 0.14, 0.11, 0.12, 0.93),
            ("MC1", 0.18, 0.48, 0.13, 0.16, 0.88),
            ("MP5", 0.67, 0.43, 0.12, 0.14, 0.86),
            ("PP1", 0.13, 0.34, 0.13, 0.14, 0.90),
        ]
        return [
            RoiBox(
                label=label,
                x=round(x * width, 2),
                y=round(y * height, 2),
                width=round(w * width, 2),
                height=round(h * height, 2),
                confidence=confidence,
            )
            for label, x, y, w, h, confidence in templates
        ]

    def predict_bone_age(self, metadata: RequestMetadata) -> dict[str, Any]:
        chronological = metadata.chronological_age_months
        sex_offset = -2 if metadata.sex.value == "female" else 0
        predicted = max(0, chronological - 4 + sex_offset)
        difference = predicted - chronological

        if abs(difference) <= 6:
            flag = "monitor"
        elif difference < -6:
            flag = "possible delayed growth"
        else:
            flag = "possible advanced maturation"

        return {
            "chronological_age_months": chronological,
            "predicted_bone_age_months": predicted,
            "ba_ca_difference_months": difference,
            "uncertainty_months": 1.8 if not self.checkpoint_loaded else 1.4,
            "interpretation_flag": flag,
        }

    def roi_importance(self) -> list[dict[str, float | str]]:
        return [
            {"roi": "PP3", "importance": 0.88},
            {"roi": "Carpal", "importance": 0.82},
            {"roi": "MP3", "importance": 0.74},
            {"roi": "DP3", "importance": 0.68},
            {"roi": "Radius", "importance": 0.61},
            {"roi": "Ulna", "importance": 0.52},
        ]
