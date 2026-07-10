from __future__ import annotations

import shutil
from pathlib import Path
from typing import Any
from uuid import uuid4

try:
    import cv2
except ImportError:  # pragma: no cover - optional runtime dependency
    cv2 = None

try:
    from PIL import Image
except ImportError:  # pragma: no cover - optional runtime dependency
    Image = None

from fastapi import UploadFile


def save_upload(file: UploadFile, upload_dir: Path) -> Path:
    upload_dir.mkdir(parents=True, exist_ok=True)
    suffix = Path(file.filename or "xray.png").suffix or ".png"
    destination = upload_dir / f"{uuid4().hex}{suffix}"
    with destination.open("wb") as output:
        shutil.copyfileobj(file.file, output)
    return destination


def load_image_stats(image_path: str | None) -> dict[str, Any]:
    if not image_path:
        return {"available": False, "width": 0, "height": 0, "brightness": 0.52, "contrast": 0.58, "blur": 0.18}

    path = Path(image_path)
    if not path.exists():
        return {"available": False, "width": 0, "height": 0, "brightness": 0.52, "contrast": 0.58, "blur": 0.18}

    if cv2 is not None:
        image = cv2.imread(str(path), cv2.IMREAD_GRAYSCALE)
        if image is not None:
            brightness = float(image.mean() / 255.0)
            contrast = float(image.std() / 128.0)
            blur = float(min(cv2.Laplacian(image, cv2.CV_64F).var() / 1000.0, 1.0))
            height, width = image.shape[:2]
            return {
                "available": True,
                "width": width,
                "height": height,
                "brightness": round(brightness, 3),
                "contrast": round(min(contrast, 1.0), 3),
                "blur": round(1.0 - min(blur, 1.0), 3),
            }

    if Image is not None:
        with Image.open(path) as image:
            width, height = image.size
        return {"available": True, "width": width, "height": height, "brightness": 0.56, "contrast": 0.62, "blur": 0.16}

    return {"available": True, "width": 0, "height": 0, "brightness": 0.56, "contrast": 0.62, "blur": 0.16}
