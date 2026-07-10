from __future__ import annotations

import json
from pathlib import Path
from typing import Any


class ReportService:
    def __init__(self, report_dir: Path) -> None:
        self.report_dir = report_dir
        self.report_dir.mkdir(parents=True, exist_ok=True)

    def export(self, case_id: str, payload: dict[str, Any]) -> Path:
        path = self.report_dir / f"{case_id}_report_payload.json"
        path.write_text(json.dumps(payload, indent=2, default=str), encoding="utf-8")
        return path
