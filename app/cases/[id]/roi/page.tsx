import { AppShell, ClinicalDisclaimerBanner, Stepper } from "@/components/layout";
import { DemoRoiDetectionPanel } from "@/src/components/boneage-demo/BoneAgeDemoPanels";

export default function RoiPage() {
  return (
    <AppShell title="Multi-ROI Detection" subtitle="Bone landmarks and crop review" active="Upload">
      <Stepper steps={["Screening", "Case", "Upload", "ROI", "Result"]} current={3} />
      <DemoRoiDetectionPanel />
      <ClinicalDisclaimerBanner />
    </AppShell>
  );
}
