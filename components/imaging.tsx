import { CheckCircle2, FileImage, ImageUp, ScanLine, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { qualityChecks, roiDetections, sampleCase } from "@/lib/mock-data";
import type { QualityStatus, RoiDetection } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<QualityStatus, string> = {
  pass: "bg-success-container text-success",
  review: "bg-amber-container text-amber",
  fail: "bg-error-container text-error"
};

export function XrayUploadDropzone() {
  return (
    <Card>
      <CardHeader title="Upload Hand-Wrist X-ray" eyebrow="JPG, PNG, or DICOM" />
      <CardContent>
        <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low p-8 text-center">
          <ImageUp className="h-12 w-12 text-secondary" />
          <p className="mt-4 text-lg font-semibold text-primary">Drop X-ray image here</p>
          <p className="mt-1 text-sm text-on-surface-variant">Mock upload stores files through an S3-compatible object key design.</p>
          <button className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Choose file</button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ImageQualityCheckCard() {
  return (
    <Card>
      <CardHeader title="Image Quality Checks" eyebrow="Automated review" />
      <CardContent className="space-y-3">
        {qualityChecks.map((check) => (
          <div key={check.label} className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
            <div className="flex items-center gap-3">
              {check.status === "pass" ? <CheckCircle2 className="h-5 w-5 text-success" /> : <TriangleAlert className="h-5 w-5 text-amber" />}
              <div>
                <p className="text-sm font-semibold text-primary">{check.label}</p>
                <p className="text-xs text-on-surface-variant">{check.value}</p>
              </div>
            </div>
            <span className={cn("rounded-full px-2 py-1 text-xs font-bold uppercase", statusStyles[check.status])}>
              {check.status}
            </span>
          </div>
        ))}
        <LinkButton href={`/cases/${sampleCase.id}/roi`} className="w-full">
          <ScanLine className="h-4 w-4" />
          Run ROI Detection
        </LinkButton>
      </CardContent>
    </Card>
  );
}

export function XrayViewer({
  overlays = false,
  heatmap = false,
  title = "X-ray Preview"
}: {
  overlays?: boolean;
  heatmap?: boolean;
  title?: string;
}) {
  return (
    <Card>
      <CardHeader title={title} eyebrow={`Case ${sampleCase.id}`} />
      <CardContent>
        <div className="relative mx-auto aspect-[4/5] max-h-[640px] w-full max-w-xl overflow-hidden rounded-xl border border-outline-variant bg-slate-950 diagnostic-grid">
          <div className="absolute inset-8 rounded-[42%_48%_36%_38%] bg-slate-200/85 blur-[1px]" />
          <div className="absolute left-[42%] top-[8%] h-[50%] w-[10%] rounded-full bg-white/70" />
          <div className="absolute left-[30%] top-[11%] h-[49%] w-[8%] rotate-[-8deg] rounded-full bg-white/60" />
          <div className="absolute left-[53%] top-[12%] h-[47%] w-[8%] rotate-[6deg] rounded-full bg-white/60" />
          <div className="absolute left-[64%] top-[18%] h-[40%] w-[7%] rotate-[12deg] rounded-full bg-white/55" />
          <div className="absolute left-[20%] top-[24%] h-[32%] w-[8%] rotate-[-28deg] rounded-full bg-white/55" />
          <div className="absolute bottom-[8%] left-[34%] h-[35%] w-[28%] rounded-b-full bg-white/60" />
          {heatmap ? (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_46%_30%,rgba(239,68,68,0.75),transparent_16%),radial-gradient(circle_at_40%_58%,rgba(250,204,21,0.65),transparent_18%),radial-gradient(circle_at_58%_54%,rgba(20,184,166,0.45),transparent_20%)] mix-blend-screen" />
          ) : null}
          {overlays ? <RoiOverlayViewer detections={roiDetections} /> : null}
          <div className="absolute bottom-3 left-3 rounded-lg bg-black/50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white">
            De-identified mock X-ray
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RoiOverlayViewer({ detections }: { detections: RoiDetection[] }) {
  return (
    <>
      {detections.map((roi) => (
        <div
          key={roi.label}
          className="absolute rounded border-2 border-secondary bg-secondary/10"
          style={{
            left: `${roi.x}%`,
            top: `${roi.y}%`,
            width: `${roi.width}%`,
            height: `${roi.height}%`
          }}
        >
          <span className="absolute -top-6 left-0 rounded bg-secondary px-2 py-0.5 text-[10px] font-bold text-white">
            {roi.label}
          </span>
        </div>
      ))}
    </>
  );
}

export function RoiCropGrid() {
  return (
    <Card>
      <CardHeader title="ROI Crops" eyebrow="Detection confidence" />
      <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {roiDetections.map((roi) => (
          <div key={roi.label} className="rounded-lg border border-outline-variant bg-slate-950 p-2">
            <div className="flex aspect-square items-center justify-center rounded bg-slate-800 text-slate-200">
              <FileImage className="h-8 w-8" />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-white">{roi.label}</span>
              <span className="rounded-full bg-secondary-container px-2 py-0.5 text-xs font-bold text-on-secondary-container">
                {Math.round(roi.confidence * 100)}%
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
