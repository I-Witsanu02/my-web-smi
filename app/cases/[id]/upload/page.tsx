import { AppShell, ClinicalDisclaimerBanner, Stepper } from "@/components/layout";
import { DemoXrayUploadPreview } from "@/src/components/boneage-demo/BoneAgeDemoPanels";

export default function UploadPage() {
  return (
    <AppShell title="X-ray Upload and Quality Check" subtitle="Hand-wrist image review" active="Upload">
      <Stepper steps={["Screening", "Case", "Upload", "ROI", "Result"]} current={2} />
      <DemoXrayUploadPreview />
      <ClinicalDisclaimerBanner />
    </AppShell>
  );
}
