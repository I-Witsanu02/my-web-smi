import { AppShell, Stepper } from "@/components/layout";
import { PredictionResultPanel } from "@/src/components/boneage-demo/BoneAgeDemoPanels";

export default function ResultPage() {
  return (
    <AppShell title="Prediction Result" subtitle="Mock model output for clinician review" active="Results">
      <Stepper steps={["Screening", "Case", "Upload", "ROI", "Result"]} current={4} />
      <PredictionResultPanel />
    </AppShell>
  );
}
