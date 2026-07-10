from __future__ import annotations

from enum import Enum
from typing import Literal
from pydantic import BaseModel, Field


CLINICAL_DISCLAIMER = "Clinical decision support only. Not a diagnosis."


class Sex(str, Enum):
    female = "female"
    male = "male"
    other = "other"
    unknown = "unknown"


class XaiMethod(str, Enum):
    grad_cam = "Grad-CAM"
    grad_cam_plus_plus = "Grad-CAM++"
    score_cam = "Score-CAM"
    eigen_cam = "Eigen-CAM"


class RequestMetadata(BaseModel):
    chronological_age_months: int = Field(ge=0, le=240)
    sex: Sex = Sex.unknown


class ImageInput(BaseModel):
    case_id: str = Field(min_length=1)
    image_path: str | None = None
    metadata: RequestMetadata


class QualityCheck(BaseModel):
    name: str
    status: Literal["pass", "review", "fail"]
    value: str
    score: float = Field(ge=0.0, le=1.0)


class QualityCheckResponse(BaseModel):
    case_id: str
    image_path: str | None
    checks: list[QualityCheck]
    overall_status: Literal["pass", "review", "fail"]
    disclaimer: str = CLINICAL_DISCLAIMER


class RoiBox(BaseModel):
    label: str
    confidence: float = Field(ge=0.0, le=1.0)
    x: float = Field(ge=0.0)
    y: float = Field(ge=0.0)
    width: float = Field(gt=0.0)
    height: float = Field(gt=0.0)


class RoiDetectionResponse(BaseModel):
    case_id: str
    image_path: str | None
    rois: list[RoiBox]
    model_version: str
    disclaimer: str = CLINICAL_DISCLAIMER


class PredictionResponse(BaseModel):
    case_id: str
    chronological_age_months: int
    predicted_bone_age_months: int
    ba_ca_difference_months: int
    uncertainty_months: float
    interpretation_flag: str
    model_version: str
    checkpoint_loaded: bool
    disclaimer: str = CLINICAL_DISCLAIMER


class HeatmapArtifact(BaseModel):
    method: XaiMethod
    file_path: str
    roi_overlap: float
    heatmap_area: float
    entropy: float
    processing_time_ms: int


class RoiImportance(BaseModel):
    roi: str
    importance: float


class XaiResponse(BaseModel):
    case_id: str
    heatmaps: list[HeatmapArtifact]
    roi_importance: list[RoiImportance]
    warning: str = "Heatmaps help inspect model behavior but do not prove that the model reasons like a physician."
    model_version: str
    disclaimer: str = CLINICAL_DISCLAIMER


class ReportExportResponse(BaseModel):
    case_id: str
    report_path: str
    prediction: PredictionResponse
    roi_count: int
    heatmap_count: int
    disclaimer: str = CLINICAL_DISCLAIMER


class HealthResponse(BaseModel):
    status: Literal["ok"]
    version: str
    model_version: str
    checkpoint_loaded: bool
    disclaimer: str = CLINICAL_DISCLAIMER
