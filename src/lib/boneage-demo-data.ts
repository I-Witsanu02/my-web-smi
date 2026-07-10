export type RoiName =
  | "DP3"
  | "MP3"
  | "PP3"
  | "MP5"
  | "PP1"
  | "Carpal"
  | "MC1"
  | "Radius"
  | "Ulna";

export type XaiMethod = "Grad-CAM" | "Grad-CAM++" | "Score-CAM" | "Eigen-CAM";

export const boneAgeDemoAssets = {
  xrayOriginal: "/demo/bone-age/xrays/xray-left-hand-demo-01.jpg",
  xraySecondary: "/demo/bone-age/xrays/xray-left-hand-demo-02.jpg",
  smiExample: "/demo/bone-age/roi-detections/smi-dp3-example-13y10m.png",
  roiReference: "/demo/bone-age/roi-detections/roi-9points-reference.png",
  roiDetectionCases: "/demo/bone-age/roi-detections/roi-detection-three-cases-yolo11.jpg",
  xaiCropsGradcam: "/demo/bone-age/xai/roi-crops-and-gradcam-demo.jpg",
  systemFlow: "/demo/bone-age/infographics/explainable-bone-age-system-flow.png"
};

export const boneAgeDemoCase = {
  caseCode: "BA-DEMO-10226",
  chronologicalAgeMonths: 166,
  chronologicalAgeText: "13y 10m",
  predictedBoneAgeMonths: 200,
  predictedBoneAgeText: "16y 8m",
  baCaDifferenceMonths: 34,
  uncertaintyMonths: 6.3,
  modelVersion: "FocalNet-Tiny v6.2",
  interpretationFlag: "Clinical review suggested",
  disclaimer: "Clinical decision support only. Not a medical diagnosis."
};

export const demoQualityChecks = [
  { label: "Hand/wrist detected", value: "Detected", status: "pass", score: 0.96 },
  { label: "Orientation", value: "PA left hand", status: "pass", score: 0.91 },
  { label: "Brightness", value: "Acceptable", status: "pass", score: 0.88 },
  { label: "Contrast", value: "Acceptable", status: "pass", score: 0.86 },
  { label: "Blur", value: "Low blur", status: "pass", score: 0.9 },
  { label: "Marker/text interference", value: "Minor edge marker", status: "review", score: 0.68 }
] as const;

export const demoRoiDetections = [
  { roi: "DP3", confidence: 0.85 },
  { roi: "MP3", confidence: 0.87 },
  { roi: "PP3", confidence: 0.88 },
  { roi: "MP5", confidence: 0.86 },
  { roi: "PP1", confidence: 0.82 },
  { roi: "Carpal", confidence: 0.91 },
  { roi: "MC1", confidence: 0.69 },
  { roi: "Radius", confidence: 0.85 },
  { roi: "Ulna", confidence: 0.85 }
] satisfies { roi: RoiName; confidence: number }[];

export const demoRoiImportance = [
  { roi: "PP3", value: 0.12 },
  { roi: "MP3", value: 0.119 },
  { roi: "Carpal", value: 0.115 },
  { roi: "DP3", value: 0.112 },
  { roi: "MC1", value: 0.108 },
  { roi: "PP1", value: 0.107 },
  { roi: "MP5", value: 0.102 },
  { roi: "Ulna", value: 0.097 },
  { roi: "Radius", value: 0.095 }
] satisfies { roi: RoiName; value: number }[];

export const demoXaiMethodComparison = [
  { method: "Grad-CAM", roiOverlap: 0.82, heatmapArea: 0.31, entropy: 0.44, processingTimeMs: 180 },
  { method: "Grad-CAM++", roiOverlap: 0.86, heatmapArea: 0.28, entropy: 0.39, processingTimeMs: 240 },
  { method: "Score-CAM", roiOverlap: 0.79, heatmapArea: 0.34, entropy: 0.47, processingTimeMs: 960 },
  { method: "Eigen-CAM", roiOverlap: 0.73, heatmapArea: 0.37, entropy: 0.51, processingTimeMs: 90 }
] satisfies {
  method: XaiMethod;
  roiOverlap: number;
  heatmapArea: number;
  entropy: number;
  processingTimeMs: number;
}[];
