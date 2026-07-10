import type { RoleName } from "@/lib/types";

export const roleCapabilities: Record<RoleName, string[]> = {
  admin: ["manage models", "view audit", "view cases", "download reports"],
  clinician: ["create cases", "upload x-rays", "run prediction", "generate reports"],
  researcher: ["view de-identified cases", "compare xai", "export aggregate metrics"],
  demo: ["screening preview", "view sample case"]
};

export function can(role: RoleName, capability: string) {
  return roleCapabilities[role].includes(capability);
}
