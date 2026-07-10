import { Activity, ShieldCheck } from "lucide-react";
import { ConsentCard } from "@/components/clinical";
import { ClinicalDisclaimerBanner, SecurityBadges } from "@/components/layout";
import { LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-surface-container-lowest lg:grid-cols-2">
      <section className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-6">
          <div>
            <div className="mb-4 flex items-center gap-3 text-primary">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary-container">
                <ShieldCheck className="h-6 w-6 text-on-secondary-container" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">BoneAge AI</h1>
                <p className="text-sm text-on-surface-variant">Clinician Portal and Decision Support</p>
              </div>
            </div>
            <ClinicalDisclaimerBanner />
          </div>
          <Card>
            <CardContent className="space-y-4">
              <Field label="Demo email">
                <Input defaultValue="demo@boneage.local" type="email" />
              </Field>
              <Field label="Role">
                <Select defaultValue="clinician">
                  <option value="clinician">Clinician</option>
                  <option value="researcher">Researcher</option>
                  <option value="admin">Admin</option>
                  <option value="demo">Demo user</option>
                </Select>
              </Field>
              <p className="rounded-lg bg-surface-container-low p-3 text-sm font-semibold text-primary">
                Demo mode: no password is required. Anyone can enter this prototype.
              </p>
              <ConsentCard />
              <LinkButton href="/screening" className="w-full">
                Enter Demo System
              </LinkButton>
            </CardContent>
          </Card>
          <SecurityBadges />
        </div>
      </section>
      <section className="flex items-center justify-center bg-primary p-6 lg:p-12">
        <div className="w-full max-w-lg rounded-xl border border-white/20 bg-white/90 p-6 shadow-clinical">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label-caps">Anonymous preview</p>
              <h2 className="mt-1 text-xl font-semibold text-primary">Growth Screening Snapshot</h2>
            </div>
            <Activity className="h-6 w-6 text-secondary" />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <PreviewMetric label="BMI" value="18.8" detail="62nd percentile" />
            <PreviewMetric label="Height" value="142.5 cm" detail="74th percentile" />
            <PreviewMetric label="Weight" value="38.2 kg" detail="61st percentile" />
            <PreviewMetric label="Risk flag" value="Monitor" detail="Preliminary only" />
          </div>
          <p className="mt-6 rounded-lg bg-error-container p-3 text-sm font-semibold text-error">
            No patient-identifiable information is stored in preview mode.
          </p>
        </div>
      </section>
    </main>
  );
}

function PreviewMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg bg-surface-container-low p-4">
      <p className="label-caps">{label}</p>
      <p className="mt-2 text-2xl font-bold text-primary">{value}</p>
      <p className="text-sm text-on-surface-variant">{detail}</p>
    </div>
  );
}
