import { mockApiResponse } from "@/lib/api";
import { cases } from "@/lib/mock-data";

export async function GET() {
  return mockApiResponse({ cases }, "Mock cases returned");
}
