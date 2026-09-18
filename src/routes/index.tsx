import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Check, Moon, Sparkles } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { DemoBadge, StatCard } from "@/components/stat";
import { NumberField, ScaleSlider } from "@/components/scale-slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { formatDay, todayISO } from "@/lib/demo-data";
import { EMOTION_OPTIONS, PLEASANT_EMOTIONS, type EmotionKey, type MovementLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today · Work & Wellbeing" },
      {
        name: "description",
        content:
          "A one-minute daily check-in for mood, energy, workload and recovery — calm, private, and yours.",
      },
      { property: "og:title", content: "Today · Work & Wellbeing" },
      {
        property: "og:description",
        content: "A calm daily check-in for how work and life are actually going.",
      },
    ],
  }),
  component: TodayPage,
});

const MOVEMENT: Array<{ value: MovementLevel; label: string }> = [
  { value: "none", label: "Rest" },
  { value: "light", label: "Light" },
  { value: "moderate", label: "Moderate" },
  { value: "active", label: "Active" },
];

function TodayPage() {
  const { data, hydrated, saveCheckin } = useStore();
  const date = todayISO();
  const existing = useMemo(() => data.checkins.find((c) => c.date === date), [data.checkins, date]);
  const existingEmotions = useMemo(
    () => data.emotions.filter((e) => e.date === date).map((e) => e.emotion),
    [data.emotions, date],
  );

  const [form, setForm] = useState({
    mood: 6,
    energy: 6,
    stress: 4,
    mental_load: 5,
    perceived_workload: 5,
    working_hours: 7.5,
    meeting_hours: 2,
    deep_work_hours: 2,
    sleep_hours: 7.5,
    sleep_quality: 6,
    movement: "light" as MovementLevel,
    reflection: "",
    energy_givers: "",
    energy_drains: "",
    needs_tomorrow: "",
    intention: "",
  });
  const [emotions, setEmotions] = useState<EmotionKey[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (existing) {
      setForm({
        mood: existing.mood,
        energy: existing.energy,
        stress: existing.stress,
        mental_load: existing.mental_load,
        perceived_workload: existing.perceived_workload,
        working_hours: existing.working_hours,
        meeting_hours: existing.meeting_hours,
        deep_work_hours: existing.deep_work_hours,
        sleep_hours: existing.sleep_hours,
        sleep_quality: existing.sleep_quality,
        movement: existing.movement,
        reflection: existing.reflection,
        energy_givers: existing.energy_givers,
        energy_drains: existing.energy_drains,
        needs_tomorrow: existing.needs_tomorrow,
        intention: existing.intention,
      });
      setEmotions(existingEmotions);
    }
  }, [hydrated, existing, existingEmotions]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleEmotion = (e: EmotionKey) =>
    setEmotions((prev) => (prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]));

  const handleSave = () => {
    saveCheckin(date, form, emotions);
    setSaved(true);
    toast.success("Check-in saved", { description: "That's today captured. Nothing else needed." });
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <AppShell>
      <PageHeader
        title={`${greeting}, ${data.profile.display_name}`}
        subtitle={`${formatDay(date, { weekday: "long", day: "numeric", month: "long" })} · takes about a minute`}
        action={
          <div className="flex shrink-0 items-center gap-2">
            {data.isDemo ? <DemoBadge /> : null}
            <Button onClick={handleSave} size="lg" className="rounded-xl">
              {existing || saved ? <Check className="h-4 w-4" /> : null}
              {existing || saved ? "Update check-in" : "Save check-in"}
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card className="surface">
            <CardHeader>
              <CardTitle className="text-base">How today feels</CardTitle>
              <CardDescription>Slide roughly — a gut answer is the right answer.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <ScaleSlider id="mood" label="Mood" value={form.mood} onChange={(v) => set("mood", v)} lowLabel="Heavy" highLabel="Bright" />
              <ScaleSlider id="energy" label="Energy" value={form.energy} onChange={(v) => set("energy", v)} lowLabel="Empty" highLabel="Full" tone="sage" />
              <ScaleSlider id="stress" label="Stress" value={form.stress} onChange={(v) => set("stress", v)} lowLabel="Settled" highLabel="Stretched" />
              <ScaleSlider id="mental_load" label="Mental load" value={form.mental_load} onChange={(v) => set("mental_load", v)} lowLabel="Clear" highLabel="Crowded" />
              <ScaleSlider id="workload" label="Perceived workload" value={form.perceived_workload} onChange={(v) => set("perceived_workload", v)} lowLabel="Light" highLabel="Heavy" />
              <ScaleSlider id="sleep_quality" label="Sleep quality" value={form.sleep_quality} onChange={(v) => set("sleep_quality", v)} lowLabel="Restless" highLabel="Restorative" tone="sky" />
            </CardContent>
          </Card>

          <Card className="surface">
            <CardHeader>
              <CardTitle className="text-base">Hours &amp; body</CardTitle>
              <CardDescription>Estimates are fine. Leave anything blank at zero.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <NumberField id="working" label="Working" value={form.working_hours} onChange={(v) => set("working_hours", v)} suffix="h" />
                <NumberField id="meetings" label="Meetings" value={form.meeting_hours} onChange={(v) => set("meeting_hours", v)} suffix="h" />
                <NumberField id="deep" label="Deep work" value={form.deep_work_hours} onChange={(v) => set("deep_work_hours", v)} suffix="h" />
                <NumberField id="sleep" label="Sleep" value={form.sleep_hours} onChange={(v) => set("sleep_hours", v)} suffix="h" />
              </div>
              <div className="space-y-2">
                <Label>Movement today</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {MOVEMENT.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      aria-pressed={form.movement === m.value}
                      onClick={() => set("movement", m.value)}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        form.movement === m.value
                          ? "border-primary bg-primary/10 font-medium text-foreground"
                          : "border-border bg-background text-muted-foreground hover:bg-secondary",
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="surface">
            <CardHeader>
              <CardTitle className="text-base">Emotions</CardTitle>
              <CardDescription>Pick as many or as few as fit. All of them are allowed.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {EMOTION_OPTIONS.map((e) => {
                  const on = emotions.includes(e);
                  const pleasant = PLEASANT_EMOTIONS.includes(e);
                  return (
                    <button
                      key={e}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleEmotion(e)}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-sm capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        on
                          ? pleasant
                            ? "border-sage bg-accent text-accent-foreground"
                            : "border-clay bg-primary/10 text-foreground"
                          : "border-border bg-background text-muted-foreground hover:bg-secondary",
                      )}
                    >
                      {e}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="surface">
            <CardHeader>
              <CardTitle className="text-base">A few words</CardTitle>
              <CardDescription>Optional. One line is plenty.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reflection">Today, in a sentence</Label>
                <Textarea id="reflection" rows={2} value={form.reflection} onChange={(e) => set("reflection", e.target.value)} placeholder="What stands out about today?" className="rounded-xl" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="givers">What gave me energy?</Label>
                  <Textarea id="givers" rows={2} value={form.energy_givers} onChange={(e) => set("energy_givers", e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="drains">What drained me?</Label>
                  <Textarea id="drains" rows={2} value={form.energy_drains} onChange={(e) => set("energy_drains", e.target.value)} className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="needs">What do I need tomorrow?</Label>
                <Input id="needs" value={form.needs_tomorrow} onChange={(e) => set("needs_tomorrow", e.target.value)} placeholder="One thing that would help" className="h-11 rounded-xl" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} size="lg" className="w-full rounded-xl sm:w-auto">
              {existing || saved ? "Update check-in" : "Save check-in"}
            </Button>
          </div>
        </div>

        <div className="space-y-5">
          <Card className="surface">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-clay" /> Today's intention
              </CardTitle>
              <CardDescription>A gentle direction, not a target.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="intention"
                rows={3}
                value={form.intention}
                onChange={(e) => set("intention", e.target.value)}
                placeholder="Work at a pace I can repeat."
                className="rounded-xl bg-secondary/40 text-base"
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Mood" value={form.mood} unit="/10" />
            <StatCard label="Energy" value={form.energy} unit="/10" tone="sage" />
            <StatCard label="Stress" value={form.stress} unit="/10" />
            <StatCard label="Workload" value={form.perceived_workload} unit="/10" tone="clay" />
          </div>

          <Card className="surface">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Moon className="h-4 w-4 text-sky" /> Last night
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {form.sleep_hours} hours, rated {form.sleep_quality}/10. Movement:{" "}
              {MOVEMENT.find((m) => m.value === form.movement)?.label.toLowerCase()}.
            </CardContent>
          </Card>

          <Link
            to="/dashboard"
            className="surface flex items-center justify-between gap-3 px-4 py-4 text-sm transition-colors hover:bg-secondary/50"
          >
            <span className="min-w-0">
              <span className="block font-medium">See your trends</span>
              <span className="block truncate text-muted-foreground">7 and 30 day view</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
