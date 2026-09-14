export type Language = 'th' | 'en';

export type AppView =
  | 'overview'
  | 'cases'
  | 'screening'
  | 'intake'
  | 'imaging'
  | 'roi'
  | 'prediction'
  | 'xai'
  | 'report'
  | 'checklist'
  | 'review-queue'
  | 'references'
  | 'logs'
  | 'help'
  | 'support'
  | 'settings';

export type CaseStatus = 'Draft' | 'Review Req' | 'Review Required' | 'Processing' | 'Complete' | 'Finalized';

export type WorkflowStep =
  | 'Intake'
  | 'Screening'
  | 'Imaging'
  | 'ROI'
  | 'ROI Selection'
  | 'ROI Extraction'
  | 'Prediction'
  | 'XAI Gen'
  | 'XAI'
  | 'Report'
  | 'Report Generation'
  | 'Checklist'
  | 'Completed';

export interface PatientCase {
  id: string;
  patientId: string;
  isTestCase?: boolean;
  groundTruthBoneAgeMonths?: number;
  sourceImageName?: string;
  name: {
    first: string;
    last: string;
  };
  dob: string; // YYYY-MM-DD
  measurementDate: string; // YYYY-MM-DD
  chronologicalAgeMonths: number;
  chronologicalAgeDisplay: string; // e.g. "12y 4m"
  sex: 'Male' | 'Female' | 'Other';
  currentStep: WorkflowStep;
  status: CaseStatus;
  updatedAt: string;
  lastStep: string;

  // Anthropometry
  heightCm: number;
  weightKg: number;
  bmi: number;
  heightPercentile: string;

  // Parental
  fatherHeightCm: number;
  motherHeightCm: number;
  midParentalHeightCm: number;

  // Clinical
  primaryIndication: string;
  clinicalNotes: string;
  growthStandard: string;

  // Prediction
  predictedAgeMonths: number;
  predictedAgeDisplay: string; // e.g. "13y 0m"
  rawPredictedAgeMonths?: number;
  reviewedPredictedAgeMonths?: number;
  offsetMonths: number; // e.g. +8
  offsetType: 'Advanced' | 'Delayed' | 'Normal';
  uncertaintyMonths: number; // e.g. ±4
  confidenceInterval: string; // "95% CI"

  // Images
  xrayImageUrl: string;
  xaiHeatmapUrl: string;
  xaiEvidenceStatus?: 'generated' | 'reference' | 'unavailable';
  xaiMethod?: string;
  rois: DetectedROI[];

  // Model Provenance
  modelId: string;
  modelDisplayName?: string;
  modelArchitecture: string;
  preprocessingVersion: string;
  experimentId: string;
  validationMaeMonths?: number;
  detectorName?: string;

  // Quality Checks
  imageQualityCheck: 'Passed' | 'Flagged' | 'Failed';
  roisAccepted: number;
  roisTotal: number;
  xaiAcknowledged: boolean;
  checklistComplete: boolean;
  reviewedBy?: string;
  reviewDate?: string;
}

export interface DetectedROI {
  id: string;
  code: string; // e.g. "Carpal", "Radius", "Ulna", "DP3", "MP3", "MP5", "PP1", "PP3", "MC1"
  name: string;
  nameTh: string;
  confidence: number;
  source?: 'detector' | 'expert_review';
  importance: number; // 0-100 percentage
  thumbnailUrl: string;
  bbox: {
    top: string;
    left: string;
    width: string;
    height: string;
  };
  flagged?: boolean;
  status?: 'accepted' | 'flagged' | 'pending';
  anatomicalNote?: string;
  xaiImportance?: number;
}

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  institution: string;
  avatarUrl: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'AUDIT';
  module: string;
  message: string;
  caseId?: string;
}
