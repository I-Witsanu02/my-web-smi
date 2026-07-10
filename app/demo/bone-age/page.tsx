import { AppShell, ClinicalDisclaimerBanner } from "@/components/layout";
import {
  DemoPredictionAndXaiPanel,
  DemoRoiDetectionPanel,
  DemoXrayUploadPreview
} from "@/src/components/boneage-demo/BoneAgeDemoPanels";

export default function BoneAgeDemoPage() {
  return (
    <AppShell title="Bone Age Demo" subtitle="All local demo panels in one workflow" active="cases">
      <div className="space-y-6">
        <DemoXrayUploadPreview showAction={false} />
        <DemoRoiDetectionPanel showAction={false} />
        <DemoPredictionAndXaiPanel showActions={false} />
        <ClinicalDisclaimerBanner />
      </div>
    </AppShell>
  );
}
