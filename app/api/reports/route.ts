import { audit } from "@/lib/audit";
import { mockApiResponse, mockInferenceEnvelope } from "@/lib/api";
import { sampleCase } from "@/lib/mock-data";
import { buildStorageKey, storageBuckets } from "@/lib/storage";

export async function POST() {
  await audit({ action: "generate report", role: "clinician", userId: "mock-user", caseId: sampleCase.id });

  return mockApiResponse(
    {
      ...mockInferenceEnvelope("reports"),
      report: {
        caseId: sampleCase.id,
        bucket: storageBuckets.reports,
        key: buildStorageKey(sampleCase.id, "reports/draft-report.pdf"),
        status: "draft"
      }
    },
    "Mock report generated"
  );
}
