import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/app-shell";
import { NumberField } from "@/components/scale-slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { todayISO } from "@/lib/demo-data";

export const Route = createFileRoute("/work")({ component: WorkPage });

function WorkPage() {
  const { data, saveWorkLog } = useStore();
  const date = todayISO();
  const existing = useMemo(() => data.workLogs.find((w) => w.date === date), [data.workLogs, date]);
  const [form, setForm] = useState({
    working_hours: existing?.working_hours ?? 7.5, meeting_hours: existing?.meeting_hours ?? 2,
    deep_work_hours: existing?.deep_work_hours ?? 2, admin_hours: existing?.admin_hours ?? 1,
    urgent_unplanned_hours: existing?.urgent_unplanned_hours ?? 0.5,
    tasks_completed: existing?.tasks_completed ?? 4, tasks_carried_over: existing?.tasks_carried_over ?? 1,
    notes: existing?.notes ?? "",
  });
  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const save = () => { saveWorkLog(date, form); toast.success("Work log saved"); };

  return <AppShell><PageHeader title="Work" subtitle="Capture the shape of your working day, not just the hours." action={<Button onClick={save} size="lg" className="rounded-xl">Save work log</Button>} />
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="surface"><CardHeader><CardTitle>Today at work</CardTitle><CardDescription>Estimates are enough.</CardDescription></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
        <NumberField id="working" label="Working hours" value={form.working_hours} onChange={(v)=>set("working_hours",v)} suffix="h" />
        <NumberField id="meetings" label="Meeting hours" value={form.meeting_hours} onChange={(v)=>set("meeting_hours",v)} suffix="h" />
        <NumberField id="deep" label="Deep work" value={form.deep_work_hours} onChange={(v)=>set("deep_work_hours",v)} suffix="h" />
        <NumberField id="admin" label="Admin" value={form.admin_hours} onChange={(v)=>set("admin_hours",v)} suffix="h" />
        <NumberField id="urgent" label="Urgent / unplanned" value={form.urgent_unplanned_hours} onChange={(v)=>set("urgent_unplanned_hours",v)} suffix="h" />
        <NumberField id="done" label="Tasks completed" value={form.tasks_completed} onChange={(v)=>set("tasks_completed",v)} />
        <NumberField id="carry" label="Tasks carried over" value={form.tasks_carried_over} onChange={(v)=>set("tasks_carried_over",v)} />
      </CardContent></Card>
      <Card className="surface"><CardHeader><CardTitle>Context</CardTitle><CardDescription>What is useful to remember about the day?</CardDescription></CardHeader><CardContent className="space-y-2"><Label htmlFor="work-notes">Notes</Label><Textarea id="work-notes" rows={7} value={form.notes} onChange={(e)=>set("notes",e.target.value)} className="rounded-xl" placeholder="A key meeting, interruption, win, or something that carried over…" /></CardContent></Card>
    </div>
    <div className="mt-5"><Card className="surface"><CardHeader><CardTitle>Recent work days</CardTitle></CardHeader><CardContent className="space-y-2">{data.workLogs.slice(-7).reverse().map((w)=><div key={w.date} className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3 text-sm"><span>{w.date}</span><span className="text-muted-foreground">{w.working_hours}h · {w.meeting_hours}h meetings · {w.tasks_completed} tasks</span></div>)}</CardContent></Card></div>
  </AppShell>;
}
