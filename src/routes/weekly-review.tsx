import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { startOfWeek, todayISO } from "@/lib/demo-data";
import { weekSummary } from "@/lib/insights";

export const Route=createFileRoute("/weekly-review")({component:WeeklyReviewPage});

function WeeklyReviewPage(){
 const {data,saveReflection}=useStore(); const week=startOfWeek(todayISO()); const existing=useMemo(()=>data.reflections.find(r=>r.week_start===week),[data.reflections,week]); const summary=weekSummary(data,week);
 const [form,setForm]=useState({went_well:existing?.went_well??"",felt_heavy:existing?.felt_heavy??"",learned:existing?.learned??"",next_week_focus:existing?.next_week_focus??""});
 const set=(k:keyof typeof form,v:string)=>setForm(f=>({...f,[k]:v}));
 const save=()=>{saveReflection(week,form);toast.success("Weekly reflection saved");};
 return <AppShell><PageHeader title="Weekly review" subtitle="A short pause to notice the week before moving into the next one." action={<Button onClick={save} size="lg" className="rounded-xl">Save review</Button>}/>
 <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Check-ins",summary.entries],["Mood",summary.mood??"—"],["Energy",summary.energy??"—"],["Stress",summary.stress??"—"]].map(([l,v])=><div key={String(l)} className="surface p-4"><div className="text-xs text-muted-foreground">{l}</div><div className="mt-1 text-2xl font-semibold">{v}</div></div>)}</div>
 <div className="grid gap-5 lg:grid-cols-2">{[["went_well","What went well?","A few things worth keeping."],["felt_heavy","What felt heavy?","Notice patterns without judging them."],["learned","What did I notice?","Observed patterns, not causal conclusions."],["next_week_focus","What do I want next week to feel like?","One gentle focus."]].map(([key,title,desc])=><Card key={key} className="surface"><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{desc}</CardDescription></CardHeader><CardContent><Textarea rows={5} value={form[key as keyof typeof form]} onChange={e=>set(key as keyof typeof form,e.target.value)} className="rounded-xl"/></CardContent></Card>)}</div>
 </AppShell>;
}
