"""Preflight local BoneAge installation without loading or exposing image data."""
from __future__ import annotations

import hashlib
import hmac
import json
import os
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]


def checkpoint_path(entry: dict) -> Path:
    env_name = entry.get("checkpoint_env")
    configured = os.getenv(env_name, "") if env_name else ""
    path = Path(configured or entry["checkpoint"])
    return path if path.is_absolute() else ROOT / path


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def check(entry: dict, required: bool) -> bool:
    path = checkpoint_path(entry)
    env_key = entry.get("checkpoint_env", "")
    expected_key = (
        env_key.removesuffix("_CHECKPOINT") + "_SHA256"
        if env_key
        else "BONEAGE_CHECKPOINT_SHA256_" + re.sub(r"[^A-Za-z0-9]+", "_", str(entry.get("id", "UNKNOWN"))).strip("_").upper()
    )
    expected = os.getenv(expected_key, "").strip().lower()
    if not path.is_file():
        print(f"MISSING  {entry.get('id', 'model')}: checkpoint ไม่พบตาม path ที่ตั้งไว้")
        return False
    actual = sha256(path)
    if expected and not hmac.compare_digest(actual, expected):
        print(f"FAIL     {entry.get('id', 'model')}: SHA-256 ไม่ตรงกับ {expected_key}")
        return False
    if required and not expected:
        print(f"FAIL     {entry.get('id', 'model')}: ต้องกำหนด {expected_key} เมื่อเปิด BONEAGE_REQUIRE_CHECKPOINT_SHA256=1")
        return False
    suffix = "SHA-256 matched" if expected else "SHA-256 computed; expected hash not configured"
    print(f"OK       {entry.get('id', 'model')}: file exists; {suffix}")
    return True


def main() -> int:
    env_file = ROOT / ".env"
    if env_file.is_file():
        for raw in env_file.read_text(encoding="utf-8-sig").splitlines():
            if "=" in raw and not raw.strip().startswith("#"):
                key, value = raw.split("=", 1)
                os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))
    registry_path = Path(os.getenv("BONEAGE_MODEL_REGISTRY", ROOT / "model_registry.json"))
    if not registry_path.is_absolute():
        registry_path = ROOT / registry_path
    try:
        registry = json.loads(registry_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"FAIL     อ่าน model registry ไม่ได้: {exc}")
        return 2

    required_hash = os.getenv("BONEAGE_REQUIRE_CHECKPOINT_SHA256", "0") == "1"
    by_id = {item["id"]: item for item in registry.get("models", [])}
    selected_id = os.getenv("BONEAGE_DEFAULT_MODEL", registry.get("default_model", ""))
    selected = by_id.get(selected_id)
    if not selected:
        print(f"FAIL     ไม่พบโมเดลเริ่มต้น {selected_id!r} ใน registry")
        return 2

    ok = check(selected, required_hash)
    detector = registry.get("detector")
    if detector:
        ok = check(detector, required_hash) and ok

    try:
        import torch
        print(f"INFO     PyTorch {torch.__version__}; CUDA available={torch.cuda.is_available()}")
        if torch.cuda.is_available():
            print(f"INFO     GPU: {torch.cuda.get_device_name(0)}")
        elif os.getenv("BONEAGE_DEVICE", "cuda").lower().startswith("cuda"):
            ok = False
            print("FAIL     ตั้งค่าให้ใช้ CUDA แต่ PyTorch มองไม่เห็น GPU (ยังไม่ทดสอบการทำนาย)")
    except ImportError:
        ok = False
        print("FAIL     ไม่พบ PyTorch ใน Python environment นี้")

    print("INFO     Preflight นี้ไม่เปิดภาพ ไม่โหลด checkpoint เข้าโมเดล และไม่ยืนยันการทำนายจริง")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
