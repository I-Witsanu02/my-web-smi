export type RoleName = "admin" | "clinician" | "researcher" | "demo";

export type RiskLevel =
  | "normal"
  | "monitor"
  | "possible delayed growth"
  | "possible advanced maturation"
  | "clinical review suggested";

export type QualityStatus = "pass" | "review" | "fail";

export type RoiLabel =
  | "Carpal"
  | "Radius"
  | "Ulna"
  | "PP3"
  | "MP3"
  | "DP3"
  | "MC1"
  | "MP5"
  | "PP1";

export type AuditAction =
  | "login"
  | "view case"
  | "edit case"
  | "upload image"
  | "run prediction"
  | "generate report"
  | "download report";

export interface GrowthRecord {
  ageYears: number;
  heightCm: number;
  weightKg: number;
}

export interface GrowthMetric {
  label: string;
  value: string;
  zScore: string;
  percentile: string;
  status: RiskLevel;
}

export interface RoiDetection {
  label: RoiLabel;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface XaiMethodResult {
  method: string;
  roiOverlap: string;
  heatmapArea: string;
  entropy: string;
  processingTimeMs: number;
}

export interface CaseSummary {
  id: string;
  chronologicalAge: string;
  predictedBoneAge: string;
  difference: string;
  uncertainty: string;
  modelVersion: string;
  interpretation: RiskLevel;
  sex: "MALE" | "FEMALE" | "OTHER" | "UNKNOWN";
  heightCm: number;
  weightKg: number;
  bmi: number;
  createdAt: string;
  status: "draft" | "screened" | "uploaded" | "predicted" | "reported";
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: RoleName;
  action: AuditAction;
  caseId?: string;
  ipAddress: string;
}
