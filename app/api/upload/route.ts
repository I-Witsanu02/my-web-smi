import { audit } from "@/lib/audit";
import { mockApiResponse, mockInferenceEnvelope } from "@/lib/api";
import { qualityChecks } from "@/lib/mock-data";
import { buildStorageKey, storageBuckets } from "@/lib/storage";

export async function POST() {
  await audit({ action: "upload image", role: "clinician", userId: "mock-user", caseId: "BA-9412-A" });

  return mockApiResponse(
    {
      ...mockInferenceEnvelope("upload"),
      qualityChecks,
      object: {
        bucket: storageBuckets.xrays,
        key: buildStorageKey("BA-9412-A", "xray/original.dcm"),
        contentType: "application/dicom"
      }
    },
    "Mock upload accepted"
  );
}
