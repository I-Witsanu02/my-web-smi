import type { AuditAction, RoleName } from "@/lib/types";

export interface AuditEventInput {
  action: AuditAction;
  role: RoleName;
  userId: string;
  caseId?: string;
  metadata?: Record<string, unknown>;
}

export async function audit(event: AuditEventInput) {
  const entry = {
    ...event,
    timestamp: new Date().toISOString(),
    ipAddress: "mock-request-ip"
  };

  console.info("[audit]", entry);
  return entry;
}
