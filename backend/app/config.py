from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Explainable Bone Age Assessment API"
    api_version: str = "0.1.0"
    model_checkpoint_path: str | None = Field(default=None, alias="MODEL_CHECKPOINT_PATH")
    model_version: str = Field(default="FocalNet-Tiny v6.2-mock", alias="MODEL_VERSION")
    storage_root: Path = Field(default=Path("backend/storage"), alias="BACKEND_STORAGE_ROOT")
    cors_origins: list[str] = Field(default=["http://localhost:3000", "http://127.0.0.1:3000"])

    model_config = SettingsConfigDict(env_file=".env", extra="ignore", populate_by_name=True)


@lru_cache
def get_settings() -> Settings:
    return Settings()
