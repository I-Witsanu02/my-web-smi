import { AppShell } from "@/components/layout";
import { ModelCard } from "@/components/xai-reporting";
import { modelVersions } from "@/lib/mock-data";

export default function AdminModelsPage() {
  return (
    <AppShell title="Model Administration" subtitle="Evaluation and monitoring placeholders" active="Models" role="admin">
      <div className="space-y-6">
        {modelVersions.map((model) => (
          <ModelCard key={model.name} model={model} />
        ))}
      </div>
    </AppShell>
  );
}
