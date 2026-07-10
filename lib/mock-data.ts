import type {
  AuditLogEntry,
  CaseSummary,
  GrowthMetric,
  GrowthRecord,
  RoiDetection,
  XaiMethodResult
} from "@/lib/types";

export const clinicalDisclaimer =
  "Clinical decision support only. Not a medical diagnosis. / ระบบนี้ใช้เพื่อสนับสนุนการพิจารณาทางคลินิก ไม่ใช่การวินิจฉัยแทนแพทย์";

export const demoCase = {
  caseCode: "BA-DEMO-10226",
  sex: "MALE",
  chronologicalAgeMonths: 166,
  predictedBoneAgeMonths: 200,
  baCaDifferenceMonths: 34,
  uncertaintyMonths: 6.3,
  model: "FocalNet-Tiny v6.2",
  screeningFlag: "CLINICAL REVIEW SUGGESTED",
  roiImportance: [
    { roi: "PP3", value: 0.88 },
    { roi: "Carpal", value: 0.82 },
    { roi: "MP3", value: 0.74 },
    { roi: "DP3", value: 0.68 },
    { roi: "Radius", value: 0.61 },
    { roi: "Ulna", value: 0.52 }
  ]
} as const;

export const sampleCase: CaseSummary = {
  id: demoCase.caseCode,
  chronologicalAge: "13y 10m",
  predictedBoneAge: "16y 8m",
  difference: `+${demoCase.baCaDifferenceMonths} months`,
  uncertainty: `+/- ${demoCase.uncertaintyMonths} months`,
  modelVersion: demoCase.model,
  interpretation: "clinical review suggested",
  sex: demoCase.sex,
  heightCm: 142.5,
  weightKg: 38.2,
  bmi: 18.8,
  createdAt: "2026-07-10T08:30:00+07:00",
  status: "predicted"
};

export const growthRecords: GrowthRecord[] = [
  { ageYears: 6, heightCm: 113.4, weightKg: 20.6 },
  { ageYears: 7, heightCm: 120.2, weightKg: 23.1 },
  { ageYears: 8, heightCm: 127.6, weightKg: 27.4 },
  { ageYears: 9, heightCm: 135.1, weightKg: 32.8 },
  { ageYears: 10, heightCm: 142.5, weightKg: 38.2 }
];

export const growthMetrics: GrowthMetric[] = [
  {
    label: "Height-for-age",
    value: "74th percentile",
    zScore: "+0.64",
    percentile: "74",
    status: "normal"
  },
  {
    label: "Weight-for-age",
    value: "61st percentile",
    zScore: "+0.28",
    percentile: "61",
    status: "normal"
  },
  {
    label: "BMI-for-age",
    value: "62nd percentile",
    zScore: "+0.31",
    percentile: "62",
    status: "monitor"
  }
];

export const screeningResult = {
  risk: "monitor" as const,
  growthVelocity: "7.4 cm/year",
  midParentalHeight: "164.0 cm +/- 5 cm",
  summary:
    "Preliminary screening suggests growth is broadly within expected range with a mild maturity discrepancy worth monitoring before X-ray review."
};

export const qualityChecks = [
  { label: "Hand/wrist detected", value: "Detected", status: "pass" as const },
  { label: "Orientation status", value: "PA left hand", status: "pass" as const },
  { label: "Brightness/contrast", value: "Acceptable", status: "pass" as const },
  { label: "Blur", value: "Low blur", status: "pass" as const },
  { label: "Marker/text interference", value: "Minor edge marker", status: "review" as const }
];

export const roiDetections: RoiDetection[] = [
  { label: "Carpal", confidence: 0.94, x: 34, y: 58, width: 26, height: 18 },
  { label: "Radius", confidence: 0.91, x: 23, y: 76, width: 18, height: 17 },
  { label: "Ulna", confidence: 0.89, x: 55, y: 76, width: 15, height: 17 },
  { label: "PP3", confidence: 0.96, x: 44, y: 26, width: 12, height: 14 },
  { label: "MP3", confidence: 0.95, x: 43, y: 39, width: 13, height: 13 },
  { label: "DP3", confidence: 0.93, x: 44, y: 14, width: 11, height: 12 },
  { label: "MC1", confidence: 0.88, x: 18, y: 48, width: 13, height: 16 },
  { label: "MP5", confidence: 0.86, x: 67, y: 43, width: 12, height: 14 },
  { label: "PP1", confidence: 0.9, x: 13, y: 34, width: 13, height: 14 }
];

export const roiImportance = demoCase.roiImportance.map((item) => ({
  roi: item.roi,
  importance: item.value
}));

export const xaiMethodResults: XaiMethodResult[] = [
  { method: "Grad-CAM", roiOverlap: "78%", heatmapArea: "21%", entropy: "0.41", processingTimeMs: 82 },
  { method: "Grad-CAM++", roiOverlap: "81%", heatmapArea: "18%", entropy: "0.38", processingTimeMs: 116 },
  { method: "Score-CAM", roiOverlap: "74%", heatmapArea: "24%", entropy: "0.45", processingTimeMs: 244 },
  { method: "Eigen-CAM", roiOverlap: "69%", heatmapArea: "29%", entropy: "0.53", processingTimeMs: 66 }
];

export const cases: CaseSummary[] = [
  sampleCase,
  {
    ...sampleCase,
    id: "BA-5820-K",
    chronologicalAge: "12y 4m",
    predictedBoneAge: "12y 11m",
    difference: "+7 months",
    interpretation: "possible advanced maturation",
    status: "reported"
  },
  {
    ...sampleCase,
    id: "BA-1138-Q",
    chronologicalAge: "8y 2m",
    predictedBoneAge: "8y 1m",
    difference: "-1 month",
    interpretation: "normal",
    status: "uploaded"
  }
];

export const auditLogs: AuditLogEntry[] = [
  {
    id: "AUD-1001",
    timestamp: "2026-07-10T08:12:10+07:00",
    user: "dr.lee@clinic.example",
    role: "clinician",
    action: "login",
    ipAddress: "10.12.4.18"
  },
  {
    id: "AUD-1002",
    timestamp: "2026-07-10T08:21:44+07:00",
    user: "dr.lee@clinic.example",
    role: "clinician",
    action: "view case",
    caseId: "BA-9412-A",
    ipAddress: "10.12.4.18"
  },
  {
    id: "AUD-1003",
    timestamp: "2026-07-10T08:28:02+07:00",
    user: "dr.lee@clinic.example",
    role: "clinician",
    action: "upload image",
    caseId: "BA-9412-A",
    ipAddress: "10.12.4.18"
  },
  {
    id: "AUD-1004",
    timestamp: "2026-07-10T08:31:20+07:00",
    user: "dr.lee@clinic.example",
    role: "clinician",
    action: "run prediction",
    caseId: "BA-9412-A",
    ipAddress: "10.12.4.18"
  },
  {
    id: "AUD-1005",
    timestamp: "2026-07-10T08:42:03+07:00",
    user: "study-admin@example.org",
    role: "admin",
    action: "generate report",
    caseId: "BA-9412-A",
    ipAddress: "10.12.4.22"
  }
];

export const modelVersions = [
  {
    name: "FocalNet-Tiny v6.2",
    active: true,
    mae: "5.8 months",
    rmse: "7.1 months",
    inferenceCount: 12842,
    failedInferences: 17,
    distribution: "Balanced ages 4-16, female 51%, male 49%",
    drift: "No active drift alert. Monitoring placeholder only."
  },
  {
    name: "FocalNet-Tiny v6.1",
    active: false,
    mae: "6.3 months",
    rmse: "7.7 months",
    inferenceCount: 9042,
    failedInferences: 31,
    distribution: "Ages 5-15, female 50%, male 50%",
    drift: "Retired baseline."
  }
];
