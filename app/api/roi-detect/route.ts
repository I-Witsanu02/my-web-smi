import { audit } from "@/lib/audit";
import { mockApiResponse, mockInferenceEnvelope } from "@/lib/api";
import { roiDetections } from "@/lib/mock-data";

export async function POST() {
  await audit({ action: "run prediction", role: "clinician", userId: "mock-user", caseId: "BA-9412-A" });

  return mockApiResponse(
    {
      ...mockInferenceEnvelope("roi-detect"),
      detections: roiDetections
    },
    "Mock ROI detection completed"
  );
}
