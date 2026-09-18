import { addDays, todayISO } from "./demo-data";
import type { AppData, DailyCheckin, ISODate } from "./types";

export function lastNDays<T extends { date: ISODate }>(rows: T[], n: number): T[] {
  const cutoff = addDays(todayISO(), -(n - 1));
  return rows.filter((r) => r.date >= cutoff).sort((a, b) => a.date.localeCompare(b.date));
}

export function inRange<T extends { date: ISODate }>(rows: T[], start: ISODate, end: ISODate): T[] {
  return rows.filter((r) => r.date >= start && r.date <= end).sort((a, b) => a.date.localeCompare(b.date));
}

export function average(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function round(n: number | null, digits = 1): number | null {
  if (n === null || Number.isNaN(n)) return null;
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

/** Pearson correlation. Returns null when there is not enough data. */
export function correlation(pairs: Array<[number, number]>): number | null {
  const n = pairs.length;
  if (n < 6) return null;
  const mx = pairs.reduce((a, p) => a + p[0], 0) / n;
  const my = pairs.reduce((a, p) => a + p[1], 0) / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (const [x, y] of pairs) {
    num += (x - mx) * (y - my);
    dx += (x - mx) ** 2;
    dy += (y - my) ** 2;
  }
  if (dx === 0 || dy === 0) return null;
  return num / Math.sqrt(dx * dy);
}

export type Strength = "slight" | "moderate" | "fairly clear";

export function strengthOf(r: number): Strength | null {
  const a = Math.abs(r);
  if (a < 0.2) return null;
  if (a < 0.4) return "slight";
  if (a < 0.6) return "moderate";
  return "fairly clear";
}

export interface Observation {
  id: string;
  title: string;
  body: string;
  r: number;
  strength: Strength;
  days: number;
}

interface PairDef {
  id: string;
  x: keyof DailyCheckin;
  y: keyof DailyCheckin;
  up: string;
  down: string;
  title: string;
}

const PAIRS: PairDef[] = [
  {
    id: "workload-stress",
    x: "perceived_workload",
    y: "stress",
    title: "Workload and stress",
    up: "Days with a heavier perceived workload have also tended to be days you rated stress higher.",
    down: "Days with a heavier perceived workload have tended to be days you rated stress lower.",
  },
  {
    id: "workload-mood",
    x: "perceived_workload",
    y: "mood",
    title: "Workload and mood",
    up: "Heavier-workload days have also tended to be days you rated mood higher.",
    down: "Heavier-workload days have tended to be days you rated mood lower.",
  },
  {
    id: "sleep-energy",
    x: "sleep_hours",
    y: "energy",
    title: "Sleep and energy",
    up: "Nights with more sleep have been followed by days you rated energy higher.",
    down: "Nights with more sleep have been followed by days you rated energy lower.",
  },
  {
    id: "meetings-mental-load",
    x: "meeting_hours",
    y: "mental_load",
    title: "Meetings and mental load",
    up: "Days with more meeting hours have also tended to be days you rated mental load higher.",
    down: "Days with more meeting hours have tended to be days you rated mental load lower.",
  },
  {
    id: "hours-perceived",
    x: "working_hours",
    y: "perceived_workload",
    title: "Hours worked and how heavy it felt",
    up: "Longer working days have also tended to feel heavier.",
    down: "Longer working days have tended to feel lighter.",
  },
  {
    id: "deep-work-mood",
    x: "deep_work_hours",
    y: "mood",
    title: "Deep work and mood",
    up: "Days with more uninterrupted deep work have also tended to be days you rated mood higher.",
    down: "Days with more uninterrupted deep work have tended to be days you rated mood lower.",
  },
  {
    id: "sleep-quality-stress",
    x: "sleep_quality",
    y: "stress",
    title: "Sleep quality and stress",
    up: "Better-rated sleep has also tended to come with higher stress ratings.",
    down: "Better-rated sleep has tended to come with lower stress ratings.",
  },
];

export function observations(checkins: DailyCheckin[], days = 30): Observation[] {
  const rows = lastNDays(checkins, days);
  const out: Observation[] = [];
  for (const p of PAIRS) {
    const pairs = rows.map((c) => [Number(c[p.x]), Number(c[p.y])] as [number, number]);
    const r = correlation(pairs);
    if (r === null) continue;
    const strength = strengthOf(r);
    if (!strength) continue;
    out.push({
      id: p.id,
      title: p.title,
      body: r > 0 ? p.up : p.down,
      r,
      strength,
      days: rows.length,
    });
  }
  return out.sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
}

export interface SeriesPoint {
  date: ISODate;
  [key: string]: number | string;
}

export function series(checkins: DailyCheckin[], days: number, keys: Array<keyof DailyCheckin>) {
  return lastNDays(checkins, days).map((c) => {
    const point: SeriesPoint = { date: c.date };
    keys.forEach((k) => (point[k as string] = Number(c[k])));
    return point;
  });
}

export function weekSummary(data: AppData, weekStart: ISODate) {
  const weekEnd = addDays(weekStart, 6);
  const checkins = inRange(data.checkins, weekStart, weekEnd);
  const work = inRange(data.workLogs, weekStart, weekEnd);
  const wellbeing = inRange(data.wellbeingLogs, weekStart, weekEnd);
  const avg = (key: keyof DailyCheckin) => round(average(checkins.map((c) => Number(c[key]))));
  const best = checkins.length
    ? checkins.reduce((a, b) => (b.mood > a.mood ? b : a))
    : null;
  const hardest = checkins.length
    ? checkins.reduce((a, b) => (b.mood < a.mood ? b : a))
    : null;
  return {
    weekStart,
    weekEnd,
    checkins,
    work,
    wellbeing,
    entries: checkins.length,
    mood: avg("mood"),
    energy: avg("energy"),
    stress: avg("stress"),
    mentalLoad: avg("mental_load"),
    workload: avg("perceived_workload"),
    sleep: avg("sleep_hours"),
    totalHours: round(work.reduce((a, w) => a + w.meeting_hours + w.deep_work_hours + w.admin_hours + w.urgent_unplanned_hours, 0)),
    tasksCompleted: work.reduce((a, w) => a + w.tasks_completed, 0),
    tasksCarried: work.reduce((a, w) => a + w.tasks_carried_over, 0),
    recovery: round(average(wellbeing.map((w) => w.recovery))),
    best,
    hardest,
  };
}
