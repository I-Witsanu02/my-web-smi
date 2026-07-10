import Link from "next/link";
import { AppShell } from "@/components/layout";
import { RiskBadge } from "@/components/clinical";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { cases } from "@/lib/mock-data";

export default function CasesPage() {
  return (
    <AppShell title="Anonymized Cases" subtitle="No real patient names stored" active="cases">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-on-surface-variant">
          Case list uses anonymized identifiers and mock data while preserving the API shape for a future FastAPI/PyTorch backend.
        </p>
        <LinkButton href="/cases/new">Create New Case</LinkButton>
      </div>
      <Card>
        <CardHeader title="Recent Cases" eyebrow="Mock records" />
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-outline-variant text-xs uppercase tracking-wide text-on-surface-variant">
              <tr>
                <th className="py-3">Case ID</th>
                <th>Chronological age</th>
                <th>Bone age</th>
                <th>BA-CA</th>
                <th>Status</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-surface-container-low">
                  <td className="py-3 font-semibold text-primary">
                    <Link href={`/cases/${item.id}/result`}>{item.id}</Link>
                  </td>
                  <td>{item.chronologicalAge}</td>
                  <td>{item.predictedBoneAge}</td>
                  <td>{item.difference}</td>
                  <td>{item.status}</td>
                  <td>
                    <RiskBadge risk={item.interpretation} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
