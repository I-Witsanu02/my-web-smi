import { Download, FileText, Flame, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button, LinkButton } from "@/components/ui/button";
import { ClinicalDisclaimerBanner } from "@/components/layout";
import { XrayViewer } from "@/components/imaging";
import { auditLogs, sampleCase, xaiMethodResults } from "@/lib/mock-data";
import type { AuditLogEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

export function XaiHeatmapGrid() {
  const methods = ["Grad-CAM", "Grad-CAM++", "Score-CAM", "Eigen-CAM"];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {methods.map((method) => (
        <Card key={method}>
          <CardHeader title={method} eyebrow="Heatmap inspection" />
          <CardContent>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-950 diagnostic-grid">
              <div className="absolute inset-8 rounded-[45%] bg-white/55" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_35%,rgba(239,68,68,0.75),transparent_20%),radial-gradient(circle_at_56%_58%,rgba(250,204,21,0.7),transparent_24%)] mix-blend-screen" />
              <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-black/55 px-3 py-2 text-xs font-semibold text-white">
                <Flame className="h-4 w-4" />
                ROI-focused activation
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function XaiMethodComparisonTable() {
  return (
    <Card>
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
            {xaiMethodResults.map((row) => (
              <tr key={row.method} className="border-b border-slate-100 hover:bg-surface-container-low">
                <td className="py-3 font-semibold text-primary">{row.method}</td>
                <td>{row.roiOverlap}</td>
                <td>{row.heatmapArea}</td>
                <td>{row.entropy}</td>
                <td>{row.processingTimeMs} ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

export function XaiWarning() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber/20 bg-amber-container p-4 text-amber">
      <ShieldAlert className="mt-0.5 h-5 w-5" />
      <p className="text-sm font-semibold">
        Heatmaps help inspect model behavior but do not prove that the model reasons like a physician.
      </p>
    </div>
  );
}

export function ReportPreview() {
  return (
    <Card>
      <CardHeader
        title="Report Preview"
        eyebrow={`Case ${sampleCase.id}`}
        action={
          <Button>
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        }
      />
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <ReportSection title="Case summary" value={`${sampleCase.chronologicalAge}, ${sampleCase.sex}, anonymized`} />
          <ReportSection title="Screening result" value="Monitor. Preliminary screening only." />
          <ReportSection title="Bone age result" value={`${sampleCase.predictedBoneAge}, BA-CA ${sampleCase.difference}`} />
          <ReportSection title="XAI summary" value="Highest ROI importance: PP3, Carpal, MP3." />
        </div>
        <div className="rounded-lg bg-surface-container-low p-4">
          <p className="label-caps">AI-generated summary</p>
          <p className="mt-2 text-sm text-on-surface-variant">
            Mock report indicates predicted bone age is slightly below chronological age with limited uncertainty. This text is a draft for clinician review.
          </p>
        </div>
        <div className="rounded-lg border border-outline-variant bg-white p-4">
          <p className="label-caps">Doctor note</p>
          <p className="mt-2 min-h-20 text-sm text-on-surface-variant">Add clinician interpretation before finalizing the report.</p>
        </div>
        <ClinicalDisclaimerBanner />
      </CardContent>
    </Card>
  );
}

function ReportSection({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-container-low p-4">
      <p className="label-caps">{title}</p>
      <p className="mt-2 text-sm font-semibold text-primary">{value}</p>
    </div>
  );
}

export function ReportEvidenceGrid() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <XrayViewer title="X-ray Preview" />
      <XrayViewer overlays title="ROI Detection Preview" />
      <XrayViewer heatmap title="XAI Heatmap Preview" />
      <Card>
        <CardHeader title="Case Timeline" eyebrow="History" />
        <CardContent className="space-y-3">
          {["Screening completed", "X-ray uploaded", "ROI detection run", "Prediction generated", "Report drafted"].map((event) => (
            <div key={event} className="flex items-center gap-3 rounded-lg bg-surface-container-low p-3">
              <FileText className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium">{event}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function AuditLogTable({ logs = auditLogs }: { logs?: AuditLogEntry[] }) {
  return (
    <Card>
      <CardHeader title="Audit Log" eyebrow="Important user actions" />
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-outline-variant text-xs uppercase tracking-wide text-on-surface-variant">
            <tr>
              <th className="py-3">Timestamp</th>
              <th>User</th>
              <th>Role</th>
              <th>Action</th>
              <th>Case ID</th>
              <th>IP address</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-slate-100 hover:bg-surface-container-low">
                <td className="py-3">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="font-medium text-primary">{log.user}</td>
                <td>
                  <span className="rounded-full bg-surface-container-low px-2 py-1 text-xs font-bold uppercase">{log.role}</span>
                </td>
                <td>{log.action}</td>
                <td>{log.caseId ?? "-"}</td>
                <td>{log.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

export function ModelVersionBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
        active ? "bg-success-container text-success" : "bg-surface-container-low text-on-surface-variant"
      )}
    >
      {active ? "Active model" : "Archived"}
    </span>
  );
}

export function ModelCard({
  model
}: {
  model: {
    name: string;
    active: boolean;
    mae: string;
    rmse: string;
    inferenceCount: number;
    failedInferences: number;
    distribution: string;
    drift: string;
  };
}) {
  return (
    <Card>
      <CardHeader title={model.name} eyebrow="Model version" action={<ModelVersionBadge active={model.active} />} />
      <CardContent className="grid gap-4 md:grid-cols-3">
        <ReportSection title="MAE" value={model.mae} />
        <ReportSection title="RMSE" value={model.rmse} />
        <ReportSection title="Inference count" value={model.inferenceCount.toLocaleString()} />
        <ReportSection title="Failed inference logs" value={String(model.failedInferences)} />
        <ReportSection title="Data distribution" value={model.distribution} />
        <ReportSection title="Drift warning" value={model.drift} />
      </CardContent>
    </Card>
  );
}

export function ReportActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <LinkButton href={`/cases/${sampleCase.id}/xai`} variant="secondary">
        View XAI
      </LinkButton>
      <LinkButton href={`/cases/${sampleCase.id}/report`}>
        Generate Report
      </LinkButton>
    </div>
  );
}
