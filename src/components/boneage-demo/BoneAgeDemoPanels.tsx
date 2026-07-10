import Image from "next/image";
import { AlertTriangle, CheckCircle2, Download, FileImage, ImageUp, ScanLine } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LinkButton, Button } from "@/components/ui/button";
import { ClinicalDisclaimerBanner } from "@/components/layout";
import {
  boneAgeDemoAssets,
  boneAgeDemoCase,
  demoQualityChecks,
  demoRoiDetections,
  demoRoiImportance,
  demoXaiMethodComparison
} from "@/src/lib/boneage-demo-data";
import { cn } from "@/lib/utils";

function DemoBadge() {
  return (
    <span className="inline-flex rounded-full bg-secondary-container px-3 py-1 text-xs font-bold uppercase tracking-wide text-on-secondary-container">
      Demo data
    </span>
  );
}

function PercentBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
      <div className="h-full rounded-full bg-secondary" style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }} />
    </div>
  );
}

function DemoImage({
  src,
  alt,
  className,
  imageClassName = "h-auto w-full object-contain"
}: {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-outline-variant bg-slate-950", className)}>
      <Image src={src} alt={alt} width={1400} height={1000} className={imageClassName} priority />
    </div>
  );
}

export function DemoXrayUploadPreview({ showAction = true }: { showAction?: boolean }) {
  return (
    <Card>
      <CardHeader title="X-ray Upload Preview" eyebrow="Local sample image" action={<DemoBadge />} />
      <CardContent className="space-y-5">
        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <DemoImage src={boneAgeDemoAssets.xrayOriginal} alt="Demo left hand wrist X-ray" />
          <div className="space-y-4">
            <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low p-6 text-center">
              <ImageUp className="h-10 w-10 text-secondary" />
              <p className="mt-3 text-lg font-semibold text-primary">Drag and drop X-ray file</p>
              <p className="mt-1 text-sm text-on-surface-variant">JPG, PNG, or DICOM. This panel uses a local demo image.</p>
              <button className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Upload Image</button>
            </div>
            <QualityCheckCards />
          </div>
        </div>
        {showAction ? (
          <LinkButton href={`/cases/${boneAgeDemoCase.caseCode}/roi`} className="w-full">
            <ScanLine className="h-4 w-4" />
            Run Multi-ROI Detection
          </LinkButton>
        ) : null}
        <ClinicalDisclaimerBanner />
      </CardContent>
    </Card>
  );
}

export function QualityCheckCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {demoQualityChecks.map((check) => (
        <div key={check.label} className="rounded-lg bg-surface-container-low p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              {check.status === "pass" ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" /> : <AlertTriangle className="mt-0.5 h-4 w-4 text-amber" />}
              <div>
                <p className="text-sm font-semibold text-primary">{check.label}</p>
                <p className="text-xs text-on-surface-variant">{check.value}</p>
              </div>
            </div>
            <span className={cn("rounded-full px-2 py-1 text-[10px] font-bold uppercase", check.status === "pass" ? "bg-success-container text-success" : "bg-amber-container text-amber")}>
              {check.status}
            </span>
          </div>
          <div className="mt-3">
            <PercentBar value={check.score} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DemoRoiDetectionPanel({ showAction = true }: { showAction?: boolean }) {
  return (
    <Card>
      <CardHeader title="Multi-ROI Detection" eyebrow="YOLOv11-style mock detection" action={<DemoBadge />} />
      <CardContent className="space-y-5">
        <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <DemoImage src={boneAgeDemoAssets.roiReference} alt="9-point ROI detection reference" imageClassName="mx-auto max-h-[720px] w-auto object-contain" />
            <DemoImage src={boneAgeDemoAssets.roiDetectionCases} alt="YOLOv11-style ROI detection examples" />
          </div>
          <RoiConfidenceList />
        </div>
        {showAction ? <LinkButton href={`/cases/${boneAgeDemoCase.caseCode}/result`} className="w-full">Run Bone Age Prediction</LinkButton> : null}
        <ClinicalDisclaimerBanner />
      </CardContent>
    </Card>
  );
}

export function RoiConfidenceList() {
  return (
    <Card className="shadow-none">
      <CardHeader title="ROI Confidence" eyebrow="9 anatomical regions" />
      <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {demoRoiDetections.map((item) => (
          <div key={item.roi} className="rounded-lg bg-surface-container-low p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-semibold text-primary">{item.roi}</span>
              <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-secondary">{Math.round(item.confidence * 100)}%</span>
            </div>
            <PercentBar value={item.confidence} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function DemoPredictionAndXaiPanel({ showActions = true }: { showActions?: boolean }) {
  return (
    <div className="space-y-6">
      <PredictionResultPanel showActions={showActions} />
      <XaiResultPanel />
    </div>
  );
}

export function PredictionResultPanel({ showActions = true }: { showActions?: boolean }) {
  const comparison = [
    { label: "Chronological age", months: boneAgeDemoCase.chronologicalAgeMonths },
    { label: "Predicted bone age", months: boneAgeDemoCase.predictedBoneAgeMonths }
  ];

  return (
    <Card>
      <CardHeader title="Prediction Result" eyebrow={`Case ID ${boneAgeDemoCase.caseCode}`} action={<DemoBadge />} />
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-5">
          <MetricCard label="Chronological Age" value={boneAgeDemoCase.chronologicalAgeText} detail={`${boneAgeDemoCase.chronologicalAgeMonths} months`} />
          <MetricCard label="Predicted Bone Age" value={boneAgeDemoCase.predictedBoneAgeText} detail={`${boneAgeDemoCase.predictedBoneAgeMonths} months`} />
          <MetricCard label="BA-CA Difference" value={`+${boneAgeDemoCase.baCaDifferenceMonths} months`} detail="Advanced relative to CA" />
          <MetricCard label="Uncertainty" value={`+/- ${boneAgeDemoCase.uncertaintyMonths} months`} detail="Mock interval" />
          <MetricCard label="Model" value={boneAgeDemoCase.modelVersion} detail={boneAgeDemoCase.interpretationFlag} warning />
        </div>
        <div className="rounded-xl border border-outline-variant bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="label-caps">Age comparison chart</p>
              <h3 className="text-lg font-semibold text-primary">Chronological vs Predicted Bone Age</h3>
            </div>
            <span className="rounded-full bg-error-container px-3 py-1 text-xs font-bold uppercase text-error">
              Clinical review suggested
            </span>
          </div>
          <div className="space-y-4">
            {comparison.map((item) => (
              <div key={item.label} className="grid gap-2 md:grid-cols-[180px_1fr_80px] md:items-center">
                <span className="text-sm font-semibold text-primary">{item.label}</span>
                <PercentBar value={item.months / 220} />
                <span className="text-sm font-bold text-on-surface-variant">{item.months} mo</span>
              </div>
            ))}
          </div>
        </div>
        {showActions ? (
          <div className="flex flex-wrap gap-3">
            <LinkButton href={`/cases/${boneAgeDemoCase.caseCode}/xai`}>View XAI</LinkButton>
            <LinkButton href={`/cases/${boneAgeDemoCase.caseCode}/report`} variant="secondary">Generate Report</LinkButton>
          </div>
        ) : null}
        <ClinicalDisclaimerBanner />
      </CardContent>
    </Card>
  );
}

function MetricCard({ label, value, detail, warning = false }: { label: string; value: string; detail: string; warning?: boolean }) {
  return (
    <div className={cn("rounded-xl p-4", warning ? "bg-amber-container text-amber" : "bg-surface-container-low text-primary")}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-75">{label}</p>
      <p className="mt-2 text-xl font-bold">{value}</p>
      <p className="mt-2 text-xs opacity-75">{detail}</p>
    </div>
  );
}

export function XaiResultPanel() {
  return (
    <Card>
      <CardHeader title="Explainable AI Result" eyebrow="Grad-CAM family placeholders" action={<DemoBadge />} />
      <CardContent className="space-y-5">
        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <DemoImage src={boneAgeDemoAssets.xaiCropsGradcam} alt="ROI crops and Grad-CAM demo" />
          <RoiImportanceChart />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {demoXaiMethodComparison.map((method) => (
            <div key={method.method} className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
              <div className="flex items-center gap-2">
                <FileImage className="h-4 w-4 text-secondary" />
                <p className="font-semibold text-primary">{method.method}</p>
              </div>
              <p className="mt-2 text-xs text-on-surface-variant">Placeholder heatmap using demo XAI asset.</p>
              <div className="mt-3">
                <PercentBar value={method.roiOverlap} />
              </div>
            </div>
          ))}
        </div>
        <XaiMethodComparisonTable />
        <div className="rounded-xl border border-amber/20 bg-amber-container p-4 text-sm font-semibold text-amber">
          Heatmaps help inspect model behavior but do not prove that the model reasons like a physician.
        </div>
        <ClinicalDisclaimerBanner />
      </CardContent>
    </Card>
  );
}

export function RoiImportanceChart() {
  const maxValue = Math.max(...demoRoiImportance.map((item) => item.value));

  return (
    <Card className="shadow-none">
      <CardHeader title="ROI Importance" eyebrow="Relative contribution" />
      <CardContent className="space-y-3">
        {demoRoiImportance.map((item) => (
          <div key={item.roi} className="grid grid-cols-[70px_1fr_58px] items-center gap-3 text-sm">
            <span className="font-semibold text-primary">{item.roi}</span>
            <PercentBar value={item.value / maxValue} />
            <span className="text-right font-semibold text-on-surface-variant">{item.value.toFixed(3)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function XaiMethodComparisonTable() {
  return (
    <Card className="shadow-none">
      <CardHeader title="XAI Method Comparison" eyebrow="Mock metrics" />
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-outline-variant text-xs uppercase tracking-wide text-on-surface-variant">
            <tr>
              <th className="py-3">Method</th>
              <th>ROI overlap</th>
              <th>Heatmap area</th>
              <th>Entropy</th>
              <th>Processing time</th>
            </tr>
          </thead>
          <tbody>
            {demoXaiMethodComparison.map((row) => (
              <tr key={row.method} className="border-b border-slate-100 hover:bg-surface-container-low">
                <td className="py-3 font-semibold text-primary">{row.method}</td>
                <td>{Math.round(row.roiOverlap * 100)}%</td>
                <td>{Math.round(row.heatmapArea * 100)}%</td>
                <td>{row.entropy.toFixed(2)}</td>
                <td>{row.processingTimeMs} ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

export function DemoReportPanel() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Report Preview"
          eyebrow={`Case ID ${boneAgeDemoCase.caseCode}`}
          action={
            <Button>
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          }
        />
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <DemoImage src={boneAgeDemoAssets.xrayOriginal} alt="Report X-ray preview" />
            <DemoImage src={boneAgeDemoAssets.roiReference} alt="Report ROI overlay" />
            <DemoImage src={boneAgeDemoAssets.xaiCropsGradcam} alt="Report XAI heatmap" className="md:col-span-2" />
          </div>
          <PredictionSummary />
          <RoiImportanceChart />
          <div className="rounded-xl border border-outline-variant bg-white p-4">
            <p className="label-caps">Doctor note</p>
            <p className="mt-2 min-h-20 text-sm text-on-surface-variant">
              Demo draft note: predicted bone age is advanced relative to chronological age. Clinician review and full patient context are required.
            </p>
          </div>
          <ClinicalDisclaimerBanner />
        </CardContent>
      </Card>
      <CaseHistoryTimeline />
    </div>
  );
}

function PredictionSummary() {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <MetricCard label="Chronological Age" value={boneAgeDemoCase.chronologicalAgeText} detail={`${boneAgeDemoCase.chronologicalAgeMonths} months`} />
      <MetricCard label="Predicted Bone Age" value={boneAgeDemoCase.predictedBoneAgeText} detail={`${boneAgeDemoCase.predictedBoneAgeMonths} months`} />
      <MetricCard label="BA-CA" value={`+${boneAgeDemoCase.baCaDifferenceMonths} months`} detail={boneAgeDemoCase.interpretationFlag} warning />
      <MetricCard label="Uncertainty" value={`+/- ${boneAgeDemoCase.uncertaintyMonths} months`} detail={boneAgeDemoCase.modelVersion} />
    </div>
  );
}

export function CaseHistoryTimeline() {
  return (
    <Card>
      <CardHeader title="Case History Timeline" eyebrow="Demo workflow events" action={<DemoBadge />} />
      <CardContent className="grid gap-3 md:grid-cols-5">
        {["X-ray uploaded", "Quality checked", "ROI detected", "Prediction generated", "Report drafted"].map((event, index) => (
          <div key={event} className="rounded-lg bg-surface-container-low p-3">
            <p className="label-caps">Step {index + 1}</p>
            <p className="mt-2 text-sm font-semibold text-primary">{event}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
