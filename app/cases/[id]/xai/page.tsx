import { AppShell, ClinicalDisclaimerBanner } from "@/components/layout";
import { XaiResultPanel } from "@/src/components/boneage-demo/BoneAgeDemoPanels";

export default function XaiPage() {
  return (
    <AppShell title="Explainable AI Comparison" subtitle="Heatmap inspection and ROI contribution" active="Results">
      <XaiResultPanel />
      <ClinicalDisclaimerBanner />
    </AppShell>
  );
}
