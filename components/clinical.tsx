import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  HelpCircle,
  UserRoundCheck
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { LinkButton } from "@/components/ui/button";
import { ClinicalDisclaimerBanner } from "@/components/layout";
import { clinicalDisclaimer, growthMetrics, sampleCase, screeningResult } from "@/lib/mock-data";
import type { CaseSummary, GrowthMetric, RiskLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

const riskStyles: Record<RiskLevel, string> = {
  normal: "bg-success-container text-success",
  monitor: "bg-amber-container text-amber",
  "possible delayed growth": "bg-amber-container text-amber",
  "possible advanced maturation": "bg-amber-container text-amber",
  "clinical review suggested": "bg-error-container text-error"
};

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide", riskStyles[risk])}>
      {risk}
    </span>
  );
}

export function ConsentCard() {
  return (
    <Card>
      <CardContent className="space-y-4">
        <label className="flex items-start gap-3">
          <input className="mt-1 h-4 w-4 rounded border-outline-variant text-primary" type="checkbox" />
          <span className="text-sm">
            I accept clinical research use terms and understand that this tool supports professional review only.
          </span>
        </label>
        <ClinicalDisclaimerBanner />
      </CardContent>
    </Card>
  );
}

export function PatientSummaryCard({ patientCase = sampleCase }: { patientCase?: CaseSummary }) {
  return (
    <Card>
      <CardHeader title={`Case ID: ${patientCase.id}`} eyebrow="Anonymized case" action={<RiskBadge risk={patientCase.interpretation} />} />
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <SummaryItem label="Chronological age" value={patientCase.chronologicalAge} />
        <SummaryItem label="Sex" value={patientCase.sex} />
        <SummaryItem label="Height" value={`${patientCase.heightCm} cm`} />
        <SummaryItem label="Weight" value={`${patientCase.weightKg} kg`} />
      </CardContent>
    </Card>
  );
}

function SummaryItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="label-caps">{label}</p>
      <p className="mt-1 text-lg font-semibold text-primary">{value}</p>
    </div>
  );
}

export function GrowthScreeningForm() {
  return (
    <Card>
      <CardHeader title="Growth Screening Intake" eyebrow="Pre-X-ray screening" />
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Chronological age">
            <Input defaultValue="10y 0m" />
          </Field>
          <Field label="Sex">
            <Select defaultValue="female">
              <option value="female">Female</option>
              <option value="male">Male</option>
            </Select>
          </Field>
          <Field label="BMI">
            <Input defaultValue="18.8" />
          </Field>
          <Field label="Height">
            <Input defaultValue="142.5 cm" />
          </Field>
          <Field label="Weight">
            <Input defaultValue="38.2 kg" />
          </Field>
          <Field label="Growth velocity">
            <Input defaultValue={screeningResult.growthVelocity} />
          </Field>
          <Field label="Father height">
            <Input defaultValue="176 cm" />
          </Field>
          <Field label="Mother height">
            <Input defaultValue="159 cm" />
          </Field>
          <Field label="Puberty signs">
            <Select defaultValue="none">
              <option value="none">None reported</option>
              <option value="early">Early signs</option>
              <option value="delayed">Delayed signs</option>
            </Select>
          </Field>
        </div>
        <Field label="Previous height records">
          <Textarea defaultValue={"Age 6: 113.4 cm\nAge 7: 120.2 cm\nAge 8: 127.6 cm\nAge 9: 135.1 cm"} />
        </Field>
        <Field label="Endocrine history">
          <Textarea defaultValue="No confirmed endocrine disorder in this mock case." />
        </Field>
      </CardContent>
    </Card>
  );
}

export function GrowthMetricCard({ metric }: { metric: GrowthMetric }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4">
        <div>
          <p className="label-caps">{metric.label}</p>
          <p className="mt-2 text-2xl font-bold text-primary">{metric.value}</p>
          <p className="text-sm text-on-surface-variant">Z-score {metric.zScore}</p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
          <CheckCircle2 className="h-7 w-7" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ScreeningResultsPanel() {
  return (
    <Card className="border-l-4 border-l-amber">
      <CardHeader
        title="Preliminary Screening Result"
        eyebrow="Screening only"
        action={<RiskBadge risk={screeningResult.risk} />}
      />
      <CardContent className="space-y-4">
        <p className="text-sm text-on-surface-variant">{screeningResult.summary}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <SummaryItem label="Mid-parental height" value={screeningResult.midParentalHeight} />
          <SummaryItem label="Growth velocity" value={screeningResult.growthVelocity} />
        </div>
        <ClinicalDisclaimerBanner />
        <LinkButton href={`/cases/${sampleCase.id}/upload`} className="w-full">
          Continue to X-ray Upload
        </LinkButton>
      </CardContent>
    </Card>
  );
}

export function PredictionSummaryCards() {
  const items = [
    ["Chronological age", sampleCase.chronologicalAge],
    ["Predicted bone age", sampleCase.predictedBoneAge],
    ["BA-CA difference", sampleCase.difference],
    ["Uncertainty", sampleCase.uncertainty]
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {items.map(([label, value]) => (
        <Card key={label}>
          <CardContent>
            <p className="label-caps">{label}</p>
            <p className="mt-2 text-2xl font-bold text-primary">{value}</p>
            <p className="mt-3 text-xs text-on-surface-variant">{clinicalDisclaimer}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function UncertaintyCard() {
  return (
    <Card>
      <CardHeader title="Uncertainty and Interpretation" eyebrow="Model output" action={<RiskBadge risk={sampleCase.interpretation} />} />
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-surface-container-low p-4">
          <p className="label-caps">Model version</p>
          <p className="mt-1 text-lg font-semibold text-primary">{sampleCase.modelVersion}</p>
        </div>
        <p className="text-sm text-on-surface-variant">
          Prediction interval is shown to help clinicians judge confidence. It should be interpreted with image quality, history, and physical examination.
        </p>
        <ClinicalDisclaimerBanner />
      </CardContent>
    </Card>
  );
}

export function CaseIntakeCard() {
  return (
    <Card>
      <CardHeader title="Create New Anonymized Case" eyebrow="Case metadata" />
      <CardContent className="space-y-5">
        <div className="rounded-lg bg-surface-container-low p-4">
          <p className="label-caps">Generated Case ID</p>
          <p className="mt-1 text-2xl font-bold text-primary">BA-9412-A</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Date of birth offset">
            <Input defaultValue="10 years 0 months" />
          </Field>
          <Field label="Sex">
            <Select defaultValue="female">
              <option value="female">Female</option>
              <option value="male">Male</option>
            </Select>
          </Field>
          <Field label="Referring department">
            <Input defaultValue="Pediatric Endocrinology" />
          </Field>
          <Field label="Study consent">
            <Select defaultValue="consented">
              <option value="consented">Consented</option>
              <option value="pending">Pending</option>
            </Select>
          </Field>
          <Field label="Clinical question">
            <Input defaultValue="Growth velocity review" />
          </Field>
          <Field label="Role access">
            <Select defaultValue="clinician">
              <option value="clinician">Clinician</option>
              <option value="researcher">Researcher</option>
              <option value="demo">Demo user</option>
            </Select>
          </Field>
        </div>
        <Field label="Case note">
          <Textarea defaultValue="No identifiable patient name is stored in this prototype." />
        </Field>
      </CardContent>
    </Card>
  );
}

export function AssistantMissingFieldsPanel() {
  const items = [
    { label: "Consent status confirmed", icon: ClipboardCheck },
    { label: "No real patient name entered", icon: UserRoundCheck },
    { label: "Clinical question present", icon: FileSearch },
    { label: "X-ray not uploaded yet", icon: HelpCircle }
  ];

  return (
    <Card>
      <CardHeader title="AI Assistant Checklist" eyebrow="Required fields" />
      <CardContent className="space-y-3">
        {items.map(({ label, icon: Icon }, index) => (
          <div key={label} className="flex items-center gap-3 rounded-lg bg-surface-container-low p-3">
            <Icon className={cn("h-5 w-5", index < 3 ? "text-success" : "text-amber")} />
            <span className="text-sm font-medium">{label}</span>
          </div>
        ))}
        <div className="flex items-start gap-2 rounded-lg bg-amber-container p-3 text-amber">
          <AlertTriangle className="mt-0.5 h-4 w-4" />
          <p className="text-sm font-semibold">Upload a left hand-wrist X-ray before ROI detection.</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function GrowthMetricGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {growthMetrics.map((metric) => (
        <GrowthMetricCard key={metric.label} metric={metric} />
      ))}
    </div>
  );
}
