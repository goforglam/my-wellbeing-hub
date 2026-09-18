import {
  EMOTION_OPTIONS,
  GENTLE_HABITS,
  PLEASANT_EMOTIONS,
  type AppData,
  type DailyCheckin,
  type EmotionEntry,
  type EmotionKey,
  type ISODate,
  type MovementLevel,
  type WellbeingLog,
  type WorkLog,
} from "./types";

export const DEMO_USER_ID = "demo-user";

export function toISODate(d: Date): ISODate {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function todayISO(): ISODate {
  return toISODate(new Date());
}

export function addDays(date: ISODate, days: number): ISODate {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function startOfWeek(date: ISODate): ISODate {
  const d = new Date(`${date}T00:00:00`);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day);
  return toISODate(d);
}

export function formatDay(date: ISODate, opts?: Intl.DateTimeFormatOptions) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(
    undefined,
    opts ?? { weekday: "short", day: "numeric", month: "short" },
  );
}

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Deterministic pseudo-random so demo data is stable within a session. */
function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const clamp = (n: number, lo = 1, hi = 10) => Math.min(hi, Math.max(lo, Math.round(n)));
const round1 = (n: number) => Math.round(n * 10) / 10;

const REFLECTIONS = [
  "A full day, but I finished the thing I'd been avoiding.",
  "Back-to-back calls left little room to think.",
  "Slower morning helped me settle into the afternoon.",
  "Good conversation with the team — felt understood.",
  "Lots of small interruptions, not much depth.",
  "Quiet and steady. Nothing dramatic, and that was nice.",
];
const GIVERS = [
  "A walk at lunch",
  "Focused morning block",
  "Finishing the draft",
  "Coffee with a colleague",
  "Cooking dinner slowly",
  "A clear to-do list",
];
const DRAINS = [
  "Three unplanned meetings",
  "Context switching",
  "An inbox that kept growing",
  "Late finish",
  "Ambiguous priorities",
  "Poor sleep the night before",
];
const NEEDS = [
  "A protected deep-work block",
  "An earlier finish",
  "A proper lunch break",
  "Fewer meetings",
  "Some movement",
  "To say no to one thing",
];
const INTENTIONS = [
  "Do one thing properly.",
  "Work at a pace I can repeat.",
  "Protect the morning.",
  "Notice when I'm tired.",
  "Be kind to myself today.",
  "Finish before dinner.",
];

export function generateDemoData(): AppData {
  const rng = makeRng(20260918);
  const now = new Date().toISOString();
  const days = 75;

  const checkins: DailyCheckin[] = [];
  const emotions: EmotionEntry[] = [];
  const workLogs: WorkLog[] = [];
  const wellbeingLogs: WellbeingLog[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(todayISO(), -i);
    const dow = new Date(`${date}T00:00:00`).getDay();
    const weekend = dow === 0 || dow === 6;
    if (weekend && rng() < 0.45) continue; // realistic gaps

    const workload = weekend ? clamp(2 + rng() * 3) : clamp(4 + rng() * 6);
    const meetings = weekend ? 0 : round1(rng() * (workload / 2.2));
    const working = weekend ? round1(rng() * 2.5) : round1(5.5 + workload * 0.35 + rng() * 1.2);
    const deep = Math.max(0, round1(working - meetings - (0.8 + rng() * 1.6)));
    const sleepHours = round1(6 + rng() * 2.4 - (workload > 7 ? 0.5 : 0));
    const sleepQuality = clamp(sleepHours * 1.1 + rng() * 2 - 1.5);
    const stress = clamp(workload * 0.75 + (10 - sleepQuality) * 0.25 + rng() * 2 - 1);
    const mentalLoad = clamp(workload * 0.55 + meetings * 0.7 + rng() * 2 - 1);
    const energy = clamp(11 - stress * 0.5 + sleepQuality * 0.4 + rng() * 2 - 1.5);
    const mood = clamp(energy * 0.55 + (10 - stress) * 0.4 + rng() * 2 - 1);
    const movement: MovementLevel =
      rng() < 0.2 ? "none" : rng() < 0.45 ? "light" : rng() < 0.8 ? "moderate" : "active";

    checkins.push({
      id: uid(),
      user_id: DEMO_USER_ID,
      date,
      mood,
      energy,
      stress,
      mental_load: mentalLoad,
      perceived_workload: workload,
      working_hours: working,
      meeting_hours: meetings,
      deep_work_hours: deep,
      sleep_hours: sleepHours,
      sleep_quality: sleepQuality,
      movement,
      reflection: REFLECTIONS[Math.floor(rng() * REFLECTIONS.length)]!,
      energy_givers: GIVERS[Math.floor(rng() * GIVERS.length)]!,
      energy_drains: DRAINS[Math.floor(rng() * DRAINS.length)]!,
      needs_tomorrow: NEEDS[Math.floor(rng() * NEEDS.length)]!,
      intention: INTENTIONS[Math.floor(rng() * INTENTIONS.length)]!,
      created_at: now,
      updated_at: now,
    });

    const pool: EmotionKey[] =
      mood >= 6
        ? PLEASANT_EMOTIONS
        : (EMOTION_OPTIONS.filter((e) => !PLEASANT_EMOTIONS.includes(e)) as EmotionKey[]);
    const picks = new Set<EmotionKey>();
    const count = 1 + Math.floor(rng() * 3);
    while (picks.size < count) picks.add(pool[Math.floor(rng() * pool.length)]!);
    if (rng() < 0.35) picks.add(EMOTION_OPTIONS[Math.floor(rng() * EMOTION_OPTIONS.length)]!);
    picks.forEach((emotion) =>
      emotions.push({ id: uid(), user_id: DEMO_USER_ID, date, emotion, created_at: now }),
    );

    if (!weekend) {
      workLogs.push({
        id: uid(),
        user_id: DEMO_USER_ID,
        date,
        meeting_hours: meetings,
        deep_work_hours: deep,
        admin_hours: round1(rng() * 1.8),
        urgent_unplanned_hours: round1(rng() * (workload > 7 ? 2.2 : 0.9)),
        tasks_completed: Math.round(2 + rng() * 6),
        tasks_carried_over: Math.round(rng() * 4),
        notes: "",
        created_at: now,
        updated_at: now,
      });
    }

    const habits = GENTLE_HABITS.filter(() => rng() < 0.45) as unknown as string[];
    wellbeingLogs.push({
      id: uid(),
      user_id: DEMO_USER_ID,
      date,
      recovery: clamp(energy * 0.6 + rng() * 4 - 1),
      nourishment: clamp(6 + rng() * 4 - 2),
      movement: clamp(movement === "none" ? 2 + rng() * 2 : 5 + rng() * 5),
      sleep: sleepQuality,
      relaxation: clamp(10 - stress * 0.6 + rng() * 2 - 1),
      connection: clamp(5 + rng() * 5 - 1),
      feeling_supported: clamp(6 + rng() * 4 - 1.5),
      gentle_habits: habits,
      notes: "",
      created_at: now,
      updated_at: now,
    });
  }

  return {
    isDemo: true,
    profile: {
      id: uid(),
      user_id: DEMO_USER_ID,
      display_name: "You",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      created_at: now,
      updated_at: now,
    },
    preferences: {
      id: uid(),
      user_id: DEMO_USER_ID,
      hours_format: "decimal",
      week_starts_on: "monday",
      fertility_layer_enabled: false,
      gentle_reminders: true,
      created_at: now,
      updated_at: now,
    },
    checkins,
    emotions,
    workLogs,
    wellbeingLogs,
    reflections: [],
  };
}

export function emptyData(): AppData {
  const demo = generateDemoData();
  return {
    ...demo,
    isDemo: false,
    checkins: [],
    emotions: [],
    workLogs: [],
    wellbeingLogs: [],
    reflections: [],
  };
}
