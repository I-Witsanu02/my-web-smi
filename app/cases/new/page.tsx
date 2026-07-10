import { Save } from "lucide-react";
import { AssistantMissingFieldsPanel, CaseIntakeCard } from "@/components/clinical";
import { AppShell, ClinicalDisclaimerBanner, Stepper } from "@/components/layout";
import { LinkButton } from "@/components/ui/button";
import { sampleCase } from "@/lib/mock-data";

export default function NewCasePage() {
  return (
    <AppShell title="New Case Intake" subtitle="Anonymized metadata only" active="cases">
      <Stepper steps={["Screening", "Case", "Upload", "ROI", "Result"]} current={1} />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <CaseIntakeCard />
          <div className="flex flex-wrap gap-3">
            <LinkButton href="/cases" variant="secondary">
              <Save className="h-4 w-4" />
              Save Draft
            </LinkButton>
            <LinkButton href={`/cases/${sampleCase.id}/upload`}>Save and Continue</LinkButton>
          </div>
          <ClinicalDisclaimerBanner />
        </div>
        <AssistantMissingFieldsPanel />
      </div>
    </AppShell>
  );
}
