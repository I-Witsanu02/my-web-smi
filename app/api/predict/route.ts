import { audit } from "@/lib/audit";
import { mockApiResponse, mockInferenceEnvelope } from "@/lib/api";
import { sampleCase } from "@/lib/mock-data";

export async function POST() {
  await audit({ action: "run prediction", role: "clinician", userId: "mock-user", caseId: sampleCase.id });

  return mockApiResponse(
    {
      ...mockInferenceEnvelope("predict"),
      prediction: {
        chronologicalAge: sampleCase.chronologicalAge,
        predictedBoneAge: sampleCase.predictedBoneAge,
        difference: sampleCase.difference,
        uncertainty: sampleCase.uncertainty,
        modelVersion: sampleCase.modelVersion,
        interpretation: sampleCase.interpretation
      }
    },
    "Mock bone age prediction completed"
  );
}
