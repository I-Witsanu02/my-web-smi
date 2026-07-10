import { audit } from "@/lib/audit";
import { mockApiResponse, mockInferenceEnvelope } from "@/lib/api";
import { growthMetrics, screeningResult } from "@/lib/mock-data";

export async function POST() {
  await audit({ action: "edit case", role: "clinician", userId: "mock-user", caseId: "BA-9412-A" });

  return mockApiResponse(
    {
      ...mockInferenceEnvelope("screening"),
      metrics: growthMetrics,
      result: screeningResult
    },
    "Preliminary growth screening calculated from mock data"
  );
}
