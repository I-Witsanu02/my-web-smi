import { NextResponse } from "next/server";
import { clinicalDisclaimer, sampleCase } from "@/lib/mock-data";

export function mockApiResponse<T>(data: T, message = "Mock response") {
  return NextResponse.json({
    ok: true,
    message,
    disclaimer: clinicalDisclaimer,
    data
  });
}

export function mockInferenceEnvelope(stage: string) {
  return {
    caseId: sampleCase.id,
    stage,
    backend: "mock",
    fastApiReady: false,
    nextIntegration:
      "Replace this route with a service call to the FastAPI/PyTorch inference backend."
  };
}
