import { AppShell } from "@/components/layout";
import { AuditLogTable } from "@/components/xai-reporting";
import { DemoReportPanel } from "@/src/components/boneage-demo/BoneAgeDemoPanels";

export default function ReportPage() {
  return (
    <AppShell title="Clinical Report" subtitle="Draft report for clinician review" active="Results">
      <DemoReportPanel />
      <AuditLogTable />
    </AppShell>
  );
}
