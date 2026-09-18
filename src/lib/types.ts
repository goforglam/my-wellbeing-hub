/**
 * Domain model for Work & Wellbeing.
 *
 * These interfaces mirror the planned Supabase schema (see supabase/schema.sql).
 * Every user-owned row carries `user_id` plus a date and timestamps, so the
 * local demo store can be swapped for Supabase without changing screen code.
 */

export type UUID = string;
/** ISO date, `YYYY-MM-DD`. */
export type ISODate = string;

export type Scale10 = number; // 1..10

export const EMOTION_OPTIONS = [
  "calm",
  "focused",
  "motivated",
  "energised",
  "happy",
  "proud",
  "excited",
  "frustrated",
  "anxious",
  "overwhelmed",
  "drained",
  "low",
] as const;

export type EmotionKey = (typeof EMOTION_OPTIONS)[number];

export const PLEASANT_EMOTIONS: EmotionKey[] = [
  "calm",
  "focused",
  "motivated",
  "energised",
  "happy",
  "proud",
  "excited",
];

export type MovementLevel = "none" | "light" | "moderate" | "active";

export interface Profile {
  id: UUID;
  user_id: UUID;
  display_name: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: UUID;
  user_id: UUID;
  hours_format: "decimal" | "hours_minutes";
  week_starts_on: "monday" | "sunday";
  /** Opt-in, off by default. Wellbeing habits only — never fertility claims. */
  fertility_layer_enabled: boolean;
  gentle_reminders: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyCheckin {
  id: UUID;
  user_id: UUID;
  date: ISODate;
  mood: Scale10;
  energy: Scale10;
  stress: Scale10;
  mental_load: Scale10;
  perceived_workload: Scale10;
  working_hours: number;
  meeting_hours: number;
  deep_work_hours: number;
  sleep_hours: number;
  sleep_quality: Scale10;
  movement: MovementLevel;
  reflection: string;
  energy_givers: string;
  energy_drains: string;
  needs_tomorrow: string;
  intention: string;
  created_at: string;
  updated_at: string;
}

/** Emotions selected on a given day (own table for trend queries). */
export interface EmotionEntry {
  id: UUID;
  user_id: UUID;
  date: ISODate;
  emotion: EmotionKey;
  created_at: string;
}

export interface WorkLog {
  id: UUID;
  user_id: UUID;
  date: ISODate;
  meeting_hours: number;
  deep_work_hours: number;
  admin_hours: number;
  urgent_unplanned_hours: number;
  tasks_completed: number;
  tasks_carried_over: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface WellbeingLog {
  id: UUID;
  user_id: UUID;
  date: ISODate;
  recovery: Scale10;
  nourishment: Scale10;
  movement: Scale10;
  sleep: Scale10;
  relaxation: Scale10;
  connection: Scale10;
  feeling_supported: Scale10;
  /** Optional, opt-in wellbeing habits. Not medical, not predictive. */
  gentle_habits: string[];
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface WeeklyReflection {
  id: UUID;
  user_id: UUID;
  /** Monday of the reviewed week. */
  week_start: ISODate;
  went_well: string;
  felt_heavy: string;
  learned: string;
  next_week_focus: string;
  created_at: string;
  updated_at: string;
}

export interface AppData {
  profile: Profile;
  preferences: UserPreferences;
  checkins: DailyCheckin[];
  emotions: EmotionEntry[];
  workLogs: WorkLog[];
  wellbeingLogs: WellbeingLog[];
  reflections: WeeklyReflection[];
  /** True while the app is showing generated sample data. */
  isDemo: boolean;
}

export const GENTLE_HABITS = [
  "Balanced meals",
  "Hydration",
  "Gentle movement",
  "Time outdoors",
  "Wind-down routine",
  "Caffeine kept low",
  "Time with my partner",
  "Something just for me",
] as const;
