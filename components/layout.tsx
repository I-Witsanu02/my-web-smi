import Link from "next/link";
import {
  Activity,
  Bell,
  ClipboardList,
  Database,
  FileText,
  History,
  LayoutDashboard,
  Lock,
  Search,
  ShieldCheck,
  UploadCloud
} from "lucide-react";
import { clinicalDisclaimer, sampleCase } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { RoleName } from "@/lib/types";

const navItems = [
  { href: "/screening", label: "Screening", icon: Activity },
  { href: "/cases", label: "Cases", icon: ClipboardList },
  { href: `/cases/${sampleCase.id}/upload`, label: "Upload", icon: UploadCloud },
  { href: `/cases/${sampleCase.id}/result`, label: "Results", icon: LayoutDashboard },
  { href: "/admin/models", label: "Models", icon: Database },
  { href: "/audit", label: "Audit", icon: History }
];

export function AppShell({
  children,
  title,
  subtitle,
  active,
  role = "clinician"
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  active?: string;
  role?: RoleName;
}) {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar active={active} />
      <div className="min-h-screen lg:pl-72">
        <Topbar title={title} subtitle={subtitle} role={role} />
        <main className="mx-auto max-w-container-max space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="border-t border-outline-variant bg-surface-container-low px-4 py-3 lg:px-8">
          <ClinicalDisclaimerBanner compact />
        </footer>
      </div>
    </div>
  );
}

export function Sidebar({ active }: { active?: string }) {
  return (
    <aside className="hidden h-screen w-72 flex-col bg-primary text-white lg:fixed lg:inset-y-0 lg:flex">
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-container text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-bold">BoneAge AI</p>
            <p className="text-sm text-white/70">Clinical Support</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.href || active === item.label.toLowerCase();
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white",
                isActive && "bg-primary-container text-white ring-1 ring-white/10"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="rounded-lg bg-white/10 p-4">
          <p className="text-sm font-semibold">Dr. Lee</p>
          <p className="text-xs uppercase tracking-wide text-white/60">Pediatric Clinician</p>
        </div>
      </div>
    </aside>
  );
}

export function Topbar({
  title,
  subtitle,
  role
}: {
  title: string;
  subtitle?: string;
  role: RoleName;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-outline-variant bg-surface/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-container-max flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="label-caps">{subtitle ?? "Explainable Bone Age Assessment"}</p>
          <h1 className="text-2xl font-bold text-primary">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden h-10 w-72 items-center gap-2 rounded-full bg-surface-container-low px-4 md:flex">
            <Search className="h-4 w-4 text-on-surface-variant" />
            <span className="text-sm text-on-surface-variant">Search anonymized cases</span>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-on-surface-variant">
            <Bell className="h-5 w-5" />
          </button>
          <div className="rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white">
            {role}
          </div>
        </div>
      </div>
    </header>
  );
}

export function Stepper({
  steps,
  current
}: {
  steps: string[];
  current: number;
}) {
  return (
    <ol className="grid gap-2 rounded-xl border border-outline-variant bg-white p-3 shadow-clinical sm:grid-cols-5">
      {steps.map((step, index) => (
        <li
          key={step}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold",
            index <= current ? "bg-surface-container-low text-primary" : "text-on-surface-variant"
          )}
        >
          <span
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full text-xs",
              index <= current ? "bg-primary text-white" : "bg-slate-100"
            )}
          >
            {index + 1}
          </span>
          {step}
        </li>
      ))}
    </ol>
  );
}

export function ClinicalDisclaimerBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-outline-variant bg-surface-container-low p-4 text-on-surface-variant",
        compact && "border-0 bg-transparent p-0"
      )}
    >
      <Lock className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
      <p className="text-xs font-semibold uppercase tracking-[0.05em]">{clinicalDisclaimer}</p>
    </div>
  );
}

export function SecurityBadges() {
  const badges = [
    { label: "Encrypted", icon: ShieldCheck },
    { label: "Audit log", icon: FileText },
    { label: "Role-based access", icon: Lock }
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {badges.map(({ label, icon: Icon }) => (
        <div key={label} className="flex items-center gap-2 rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm font-semibold text-primary">
          <Icon className="h-4 w-4 text-secondary" />
          {label}
        </div>
      ))}
    </div>
  );
}
