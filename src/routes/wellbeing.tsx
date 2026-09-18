import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ScaleSlider } from "@/components/scale-slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { todayISO } from "@/lib/demo-data";
import { GENTLE_HABITS } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/wellbeing")({ component: WellbeingPage });

function WellbeingPage() {
  const { data, saveWellbeingLog } = useStore();
  const date=todayISO();
  const existing=useMemo(()=>data.wellbeingLogs.find(w=>w.date===date),[data.wellbeingLogs,date]);
  const [form,setForm]=useState({recovery:existing?.recovery??6,nourishment:existing?.nourishment??6,movement:existing?.movement??6,sleep:existing?.sleep??6,relaxation:existing?.relaxation??5,connection:existing?.connection??6,feeling_supported:existing?.feeling_supported??6,gentle_habits:existing?.gentle_habits??[] as string[],notes:existing?.notes??""});
  const set=(k:keyof typeof form,v:any)=>setForm(f=>({...f,[k]:v}));
  const toggle=(h:string)=>set("gentle_habits",form.gentle_habits.includes(h)?form.gentle_habits.filter(x=>x!==h):[...form.gentle_habits,h]);
  const save=()=>{saveWellbeingLog(date,form);toast.success("Wellbeing log saved");};
  return <AppShell><PageHeader title="Wellbeing" subtitle="Small signals that help you notice what supports a sustainable week." action={<Button onClick={save} size="lg" className="rounded-xl">Save wellbeing</Button>} />
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="surface"><CardHeader><CardTitle>How supported do you feel?</CardTitle><CardDescription>Use a quick, subjective read.</CardDescription></CardHeader><CardContent className="grid gap-6 sm:grid-cols-2">
        <ScaleSlider id="recovery" label="Recovery" value={form.recovery} onChange={v=>set("recovery",v)} lowLabel="Low" highLabel="Good" tone="sage"/>
        <ScaleSlider id="nourishment" label="Nourishment" value={form.nourishment} onChange={v=>set("nourishment",v)} lowLabel="Low" highLabel="Good"/>
        <ScaleSlider id="movement" label="Movement" value={form.movement} onChange={v=>set("movement",v)} lowLabel="Little" highLabel="Plenty" tone="sage"/>
        <ScaleSlider id="sleep" label="Sleep" value={form.sleep} onChange={v=>set("sleep",v)} lowLabel="Poor" highLabel="Restorative" tone="sky"/>
        <ScaleSlider id="relaxation" label="Relaxation" value={form.relaxation} onChange={v=>set("relaxation",v)} lowLabel="None" highLabel="Good"/>
        <ScaleSlider id="connection" label="Connection" value={form.connection} onChange={v=>set("connection",v)} lowLabel="Low" highLabel="Good"/>
        <ScaleSlider id="supported" label="Feeling supported" value={form.feeling_supported} onChange={v=>set("feeling_supported",v)} lowLabel="Not much" highLabel="Very" tone="sage"/>
      </CardContent></Card>
      <Card className="surface"><CardHeader><CardTitle>Gentle habits</CardTitle><CardDescription>Optional wellbeing observations — never a fertility score.</CardDescription></CardHeader><CardContent><div className="flex flex-wrap gap-2">{GENTLE_HABITS.map(h=><button key={h} type="button" onClick={()=>toggle(h)} className={cn("rounded-full border px-3 py-1.5 text-sm",form.gentle_habits.includes(h)?"border-primary bg-primary/10":"border-border hover:bg-secondary")}>{h}</button>)}</div><div className="mt-6"><Textarea rows={5} value={form.notes} onChange={e=>set("notes",e.target.value)} className="rounded-xl" placeholder="Anything worth noticing?" /></div></CardContent></Card>
    </div>
  </AppShell>;
}
