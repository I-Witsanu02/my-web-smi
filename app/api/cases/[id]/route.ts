import { mockApiResponse } from "@/lib/api";
import { cases, sampleCase } from "@/lib/mock-data";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const patientCase = cases.find((item) => item.id === id) ?? sampleCase;

  return mockApiResponse({ case: patientCase }, "Mock case returned");
}
