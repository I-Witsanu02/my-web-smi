import { AppShell } from "@/components/layout";
import { AuditLogTable } from "@/components/xai-reporting";

export default function AuditPage() {
  return (
    <AppShell title="Audit Trail" subtitle="Login, case, prediction, and report actions" active="Audit" role="admin">
      <AuditLogTable />
    </AppShell>
  );
}
