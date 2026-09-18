import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { ChartCard, RelationScatter, TrendArea, TrendLines } from "@/components/charts";
import { DemoBadge, Disclaimer, EmptyState, StatCard } from "@/components/stat";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import { average, lastNDays, round, series } from "@/lib/insights";
import { todayISO } from "@/lib/demo-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Work & Wellbeing" },
      { name: "description", content: "Your 7 and 30 day trends across mood, energy, stress, workload and sleep." },
      { property: "og:title", content: "Dashboard · Work & Wellbeing" },
      { property: "og:description", content: "Gentle trends across mood, energy, stress and workload." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data } = useStore();
  const [range, setRange] = useState<"7" | "30">("7");
  const days = Number(range);
  const today = data.checkins.find((c) => c.date === todayISO());
  const rows = lastNDays(data.checkins, days);
  const avg = (k: "mood" | "energy" | "stress" | "mental_load" | "perceived_workload") =>
    round(average(rows.map((r) => r[k])));

  const trend = series(data.checkins, days, [
    "mood",
    "energy",
    "stress",
    "mental_load",
    "perceived_workload",
  ]);
  const hoursTrend = series(data.checkins, days, ["working_hours", "sleep_hours"]);
  const scatter = rows.map((c) => ({
    mood: c.mood,
    stress: c.stress,
    workload: c.perceived_workload,
    sleep: c.sleep_hours,
    energy: c.energy,
    meetings: c.meeting_hours,
    mental_load: c.mental_load,
    hours: c.working_hours,
  }));

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        subtitle="How things have been moving, without any scoring or judgment."
        action={
          <div className="flex shrink-0 items-center gap-2">
            {data.isDemo ? <DemoBadge /> : null}
            <Tabs value={range} onValueChange={(v) => setRange(v as "7" | "30")}>
              <TabsList>
                <TabsTrigger value="7">7 days</TabsTrigger>
                <TabsTrigger value="30">30 days</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          body="Once you've saved a few check-ins, your trends will appear here."
        />
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard label="Today mood" value={today?.mood ?? null} unit="/10" />
            <StatCard label="Today energy" value={today?.energy ?? null} unit="/10" tone="sage" />
            <StatCard label={`Mood · ${days}d`} value={avg("mood")} unit="/10" />
            <StatCard label={`Energy · ${days}d`} value={avg("energy")} unit="/10" tone="sage" />
            <StatCard label={`Stress · ${days}d`} value={avg("stress")} unit="/10" tone="clay" />
            <StatCard label={`Workload · ${days}d`} value={avg("perceived_workload")} unit="/10" />
          </div>

          <ChartCard title="Mood, energy and stress" description={`Last ${days} days`}>
            <TrendLines
              data={trend}
              lines={[
                { key: "mood", name: "Mood", color: "var(--chart-1)" },
                { key: "energy", name: "Energy", color: "var(--chart-2)" },
                { key: "stress", name: "Stress", color: "var(--chart-4)" },
              ]}
            />
          </ChartCard>

          <div className="grid gap-5 lg:grid-cols-2">
            <ChartCard title="Workload and mental load" description={`Last ${days} days`}>
              <TrendLines
                data={trend}
                lines={[
                  { key: "perceived_workload", name: "Workload", color: "var(--chart-1)" },
                  { key: "mental_load", name: "Mental load", color: "var(--chart-3)" },
                ]}
              />
            </ChartCard>
            <ChartCard title="Sleep hours" description={`Last ${days} days`}>
              <TrendArea data={hoursTrend} dataKey="sleep_hours" name="Sleep" color="var(--chart-3)" domain={[0, 12]} />
            </ChartCard>
            <ChartCard title="Workload vs mood" description="Each dot is one day" footnote="Things that happened together — not a cause.">
              <RelationScatter data={scatter} xKey="workload" yKey="mood" xName="Workload" yName="Mood" color="var(--chart-1)" />
            </ChartCard>
            <ChartCard title="Workload vs stress" description="Each dot is one day">
              <RelationScatter data={scatter} xKey="workload" yKey="stress" xName="Workload" yName="Stress" color="var(--chart-4)" />
            </ChartCard>
            <ChartCard title="Sleep vs energy" description="Each dot is one day">
              <RelationScatter data={scatter} xKey="sleep" yKey="energy" xName="Sleep hours" yName="Energy" color="var(--chart-2)" />
            </ChartCard>
            <ChartCard title="Meeting load vs mental load" description="Each dot is one day">
              <RelationScatter data={scatter} xKey="meetings" yKey="mental_load" xName="Meeting hours" yName="Mental load" color="var(--chart-3)" />
            </ChartCard>
            <ChartCard title="Work hours vs perceived workload" description="Each dot is one day">
              <RelationScatter data={scatter} xKey="hours" yKey="workload" xName="Hours worked" yName="Perceived workload" color="var(--chart-5)" />
            </ChartCard>
          </div>

          <Disclaimer />
        </div>
      )}
    </AppShell>
  );
}
