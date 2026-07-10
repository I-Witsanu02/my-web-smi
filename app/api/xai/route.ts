import { mockApiResponse, mockInferenceEnvelope } from "@/lib/api";
import { roiImportance, xaiMethodResults } from "@/lib/mock-data";

export async function POST() {
  return mockApiResponse(
    {
      ...mockInferenceEnvelope("xai"),
      roiImportance,
      methods: xaiMethodResults
    },
    "Mock XAI heatmaps generated"
  );
}
