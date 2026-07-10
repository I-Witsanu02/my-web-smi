from __future__ import annotations

import json
from pathlib import Path
from time import perf_counter

from app.schemas import HeatmapArtifact, XaiMethod


class XaiService:
    methods = [XaiMethod.grad_cam, XaiMethod.grad_cam_plus_plus, XaiMethod.score_cam, XaiMethod.eigen_cam]

    def __init__(self, heatmap_dir: Path) -> None:
        self.heatmap_dir = heatmap_dir
        self.heatmap_dir.mkdir(parents=True, exist_ok=True)

    def generate_heatmaps(self, case_id: str) -> list[HeatmapArtifact]:
        artifacts: list[HeatmapArtifact] = []
        for index, method in enumerate(self.methods):
            started = perf_counter()
            file_path = self.heatmap_dir / f"{case_id}_{method.value.replace('+', 'plus').replace('-', '_')}.json"
            payload = {
                "case_id": case_id,
                "method": method.value,
                "placeholder": True,
                "message": "Replace with real heatmap tensor/image generation later.",
            }
            file_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
            elapsed_ms = int((perf_counter() - started) * 1000) + 40 + index * 30
            artifacts.append(
                HeatmapArtifact(
                    method=method,
                    file_path=str(file_path),
                    roi_overlap=round(0.78 - index * 0.03, 2),
                    heatmap_area=round(0.21 + index * 0.03, 2),
                    entropy=round(0.41 + index * 0.04, 2),
                    processing_time_ms=elapsed_ms,
                )
            )
        return artifacts
