import { AppShell, Stepper } from "@/components/layout";
import { GrowthMetricGrid, GrowthScreeningForm, ScreeningResultsPanel } from "@/components/clinical";
import { GrowthTrendChart } from "@/components/charts";

export default function ScreeningPage() {
  return (
    <AppShell title="Growth Screening Analysis" subtitle="First working page after login" active="/screening">
      <Stepper steps={["Screening", "Case", "Upload", "ROI", "Result"]} current={0} />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <GrowthScreeningForm />
          <GrowthTrendChart />
        </div>
        <div className="space-y-6">
          <GrowthMetricGrid />
          <ScreeningResultsPanel />
        </div>
      </div>
    </AppShell>
  );
}
