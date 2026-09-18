import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/emotions")({ component: EmotionsPage });

function EmotionsPage() {
  const { data }=useStore();
  const counts=data.emotions.reduce<Record<string,number>>((m,e)=>{m[e.emotion]=(m[e.emotion]??0)+1;return m;},{});
  const top=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,8);
  return <AppShell><PageHeader title="Emotions" subtitle="Your emotional history, without labeling any feeling as good or bad." />
    <div className="grid gap-5 lg:grid-cols-2"><Card className="surface"><CardHeader><CardTitle>Most frequent</CardTitle></CardHeader><CardContent className="space-y-3">{top.length?top.map(([emotion,count])=><div key={emotion} className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3 capitalize"><span>{emotion}</span><span className="text-sm text-muted-foreground">{count} days</span></div>):<p className="text-sm text-muted-foreground">Your emotion history will appear after your first check-in.</p>}</CardContent></Card>
    <Card className="surface"><CardHeader><CardTitle>Recent days</CardTitle></CardHeader><CardContent className="space-y-3">{data.emotions.slice(-10).reverse().map(e=><div key={e.id} className="flex items-center justify-between text-sm"><span>{e.date}</span><span className="capitalize text-muted-foreground">{e.emotion}</span></div>)}</CardContent></Card></div>
  </AppShell>;
}
