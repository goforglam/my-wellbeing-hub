import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { observations } from "@/lib/insights";

export const Route=createFileRoute("/insights")({component:InsightsPage});

function InsightsPage(){
 const {data}=useStore(); const items=observations(data.checkins,30);
 return <AppShell><PageHeader title="Insights" subtitle="Observed relationships in your own data — descriptive, not diagnostic."/>
 <div className="space-y-4">{items.length?items.map(o=><Card key={o.id} className="surface"><CardHeader><CardTitle className="text-base">{o.title}</CardTitle><CardDescription>{o.strength} relationship across {o.days} days</CardDescription></CardHeader><CardContent><p className="text-sm leading-6 text-muted-foreground">{o.body}</p><p className="mt-2 text-xs text-muted-foreground">Correlation: {o.r.toFixed(2)} · This does not establish cause and effect.</p></CardContent></Card>):<Card className="surface"><CardContent className="pt-6 text-sm text-muted-foreground">Keep checking in for a few weeks and your personal patterns will appear here.</CardContent></Card>}</div>
 </AppShell>;
}
