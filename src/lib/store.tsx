import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./auth";
import { supabase, hasSupabaseConfig } from "./supabase";
import { DEMO_USER_ID, emptyData, generateDemoData, todayISO, uid } from "./demo-data";
import type {
  AppData,
  DailyCheckin,
  EmotionKey,
  EmotionEntry,
  ISODate,
  UserPreferences,
  WeeklyReflection,
  WellbeingLog,
  WorkLog,
} from "./types";

interface StoreValue {
  data: AppData;
  hydrated: boolean;
  saveCheckin: (date: ISODate, patch: Partial<DailyCheckin>, emotions: EmotionKey[]) => void;
  saveWorkLog: (date: ISODate, patch: Partial<WorkLog>) => void;
  saveWellbeingLog: (date: ISODate, patch: Partial<WellbeingLog>) => void;
  saveReflection: (weekStart: ISODate, patch: Partial<WeeklyReflection>) => void;
  updatePreferences: (patch: Partial<UserPreferences>) => void;
  updateProfile: (patch: Partial<AppData["profile"]>) => void;
  loadDemoData: () => void;
  clearAllData: () => void;
  exportJSON: () => string;
}

const StoreContext = createContext<StoreValue | null>(null);
const now = () => new Date().toISOString();
const n = (v: unknown, fallback = 0) => (v === null || v === undefined ? fallback : Number(v));
const clamp10 = (v: number) => Math.min(10, Math.max(1, Math.round(v)));

function emptyProfile(userId: string, displayName: string): AppData["profile"] {
  const timestamp = now();
  return { id: userId, user_id: userId, display_name: displayName, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, created_at: timestamp, updated_at: timestamp };
}

function emptyPreferences(userId: string): UserPreferences {
  const timestamp = now();
  return { id: userId, user_id: userId, hours_format: "decimal", week_starts_on: "monday", fertility_layer_enabled: false, gentle_reminders: true, created_at: timestamp, updated_at: timestamp };
}

function mapCheckin(r: any): DailyCheckin {
  return {
    id: r.id, user_id: r.user_id, date: r.checkin_date,
    mood: clamp10(n(r.mood, 5)), energy: clamp10(n(r.energy, 5)), stress: clamp10(n(r.stress, 5)),
    mental_load: clamp10(n(r.mental_load, 5)), perceived_workload: clamp10(n(r.workload, 5)),
    working_hours: 0, meeting_hours: 0, deep_work_hours: 0,
    sleep_hours: n(r.sleep_duration_hours, 7), sleep_quality: clamp10(n(r.sleep_quality, 5)),
    movement: "none", reflection: r.reflection ?? "", energy_givers: r.gave_energy ?? "",
    energy_drains: r.drained ?? "", needs_tomorrow: r.needs_tomorrow ?? "", intention: r.daily_intention ?? "",
    created_at: r.created_at, updated_at: r.updated_at,
  };
}

function mapWork(r: any): WorkLog {
  return {
    id: r.id, user_id: r.user_id, date: r.log_date, working_hours: n(r.working_hours), meeting_hours: n(r.meeting_hours),
    deep_work_hours: n(r.deep_work_hours), admin_hours: n(r.admin_hours), urgent_unplanned_hours: n(r.urgent_hours),
    tasks_completed: n(r.tasks_completed), tasks_carried_over: n(r.tasks_carried_over), notes: "",
    created_at: r.created_at, updated_at: r.updated_at,
  };
}

function mapWellbeing(r: any): WellbeingLog {
  return {
    id: r.id, user_id: r.user_id, date: r.log_date, recovery: clamp10(n(r.recovery, 5)),
    nourishment: clamp10(n(r.nourishment, 5)), movement: clamp10(n(r.movement_minutes, 0) / 6 || 1),
    sleep: clamp10(n(r.relaxation, 5)), relaxation: clamp10(n(r.relaxation, 5)),
    connection: clamp10(n(r.connection, 5)), feeling_supported: clamp10(n(r.feeling_supported, 5)),
    gentle_habits: [], notes: r.note ?? "", created_at: r.created_at, updated_at: r.updated_at,
  };
}

function mapReflection(r: any): WeeklyReflection {
  return {
    id: r.id, user_id: r.user_id, week_start: r.week_start, went_well: r.highlights ?? "",
    felt_heavy: r.drains ?? "", learned: r.patterns_noticed ?? "", next_week_focus: r.next_week_focus ?? "",
    created_at: r.created_at, updated_at: r.updated_at,
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [data, setData] = useState<AppData>(() => emptyData());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!hasSupabaseConfig || !supabase || !session?.user) {
        if (active) {
          setData(generateDemoData());
          setHydrated(true);
        }
        return;
      }

      const userId = session.user.id;
      const displayName = (session.user.user_metadata?.["display_name"] as string | undefined) || session.user.email?.split("@")[0] || "You";

      const [profileRes, prefRes, checkinsRes, emotionsRes, workRes, wellbeingRes, reflectionsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("user_preferences").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("daily_checkins").select("*").eq("user_id", userId).order("checkin_date", { ascending: true }),
        supabase.from("emotions").select("*").eq("user_id", userId).order("emotion_date", { ascending: true }),
        supabase.from("work_logs").select("*").eq("user_id", userId).order("log_date", { ascending: true }),
        supabase.from("wellbeing_logs").select("*").eq("user_id", userId).order("log_date", { ascending: true }),
        supabase.from("weekly_reflections").select("*").eq("user_id", userId).order("week_start", { ascending: true }),
      ]);

      if (!active) return;

      const errors = [profileRes, prefRes, checkinsRes, emotionsRes, workRes, wellbeingRes, reflectionsRes].filter((r) => r.error);
      if (errors.length) {
        console.error("Supabase load error", errors.map((r) => r.error));
      }

      const profileRow = profileRes.data;
      const prefRow = prefRes.data;
      if (!profileRow) await supabase.from("profiles").upsert({ id: userId, display_name: displayName, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
      if (!prefRow) await supabase.from("user_preferences").upsert({ user_id: userId, week_starts_on: 1, theme: "light" });

      const workByDate = new Map((workRes.data ?? []).map((r: any) => [r.log_date, r]));
      const checkins = (checkinsRes.data ?? []).map(mapCheckin).map((c) => {
        const w = workByDate.get(c.date);
        return w ? { ...c, working_hours: n((w as any).working_hours), meeting_hours: n((w as any).meeting_hours), deep_work_hours: n((w as any).deep_work_hours) } : c;
      });

      const mappedEmotions: EmotionEntry[] = (emotionsRes.data ?? []).map((r: any) => ({
        id: r.id, user_id: r.user_id, date: r.emotion_date, emotion: r.emotion as EmotionKey, created_at: r.created_at,
      }));

      setData({
        isDemo: false,
        profile: profileRow
          ? { id: profileRow.id, user_id: profileRow.id, display_name: profileRow.display_name || displayName, timezone: profileRow.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone, created_at: profileRow.created_at, updated_at: profileRow.updated_at }
          : emptyProfile(userId, displayName),
        preferences: prefRow
          ? { id: prefRow.user_id, user_id: prefRow.user_id, hours_format: "decimal", week_starts_on: prefRow.week_starts_on === 0 ? "sunday" : "monday", fertility_layer_enabled: false, gentle_reminders: true, created_at: prefRow.created_at, updated_at: prefRow.updated_at }
          : emptyPreferences(userId),
        checkins,
        emotions: mappedEmotions,
        workLogs: (workRes.data ?? []).map(mapWork),
        wellbeingLogs: (wellbeingRes.data ?? []).map(mapWellbeing),
        reflections: (reflectionsRes.data ?? []).map(mapReflection),
      });
      setHydrated(true);
    }
    void load();
    return () => { active = false; };
  }, [session?.user?.id]);

  const saveCheckin = useCallback<StoreValue["saveCheckin"]>((date, patch, emotions) => {
    const userId = session?.user?.id ?? DEMO_USER_ID;
    const existing = data.checkins.find((c) => c.date === date);
    const base: DailyCheckin = existing ?? {
      id: uid(), user_id: userId, date, mood: 5, energy: 5, stress: 5, mental_load: 5, perceived_workload: 5,
      working_hours: 0, meeting_hours: 0, deep_work_hours: 0, sleep_hours: 7, sleep_quality: 5, movement: "none",
      reflection: "", energy_givers: "", energy_drains: "", needs_tomorrow: "", intention: "", created_at: now(), updated_at: now(),
    };
    const next = { ...base, ...patch, date, user_id: userId, updated_at: now() };
    setData((prev) => ({ ...prev, isDemo: false, checkins: existing ? prev.checkins.map((c) => c.date === date ? next : c) : [...prev.checkins, next] }));
    if (!supabase || !session?.user) return;

    void (async () => {
      const row = {
        user_id: userId, checkin_date: date, mood: next.mood, energy: next.energy, stress: next.stress,
        mental_load: next.mental_load, workload: next.perceived_workload, sleep_duration_hours: next.sleep_hours,
        sleep_quality: next.sleep_quality, daily_intention: next.intention, reflection: next.reflection,
        gave_energy: next.energy_givers, drained: next.energy_drains, needs_tomorrow: next.needs_tomorrow,
      };
      const { error } = await supabase.from("daily_checkins").upsert(row, { onConflict: "user_id,checkin_date" });
      if (error) console.error("Saving check-in failed", error);
      await supabase.from("work_logs").upsert({
        user_id: userId, log_date: date, working_hours: next.working_hours, meeting_hours: next.meeting_hours, deep_work_hours: next.deep_work_hours,
      }, { onConflict: "user_id,log_date" });
      await supabase.from("emotions").delete().eq("user_id", userId).eq("emotion_date", date);
      if (emotions.length) {
        await supabase.from("emotions").insert(emotions.map((emotion) => ({ user_id: userId, emotion_date: date, emotion, intensity: 5 })));
      }
    })();
  }, [data.checkins, session?.user?.id]);

  const saveWorkLog = useCallback<StoreValue["saveWorkLog"]>((date, patch) => {
    const userId = session?.user?.id ?? DEMO_USER_ID;
    const existing = data.workLogs.find((w) => w.date === date);
    const base: WorkLog = existing ?? { id: uid(), user_id: userId, date, working_hours: 0, meeting_hours: 0, deep_work_hours: 0, admin_hours: 0, urgent_unplanned_hours: 0, tasks_completed: 0, tasks_carried_over: 0, notes: "", created_at: now(), updated_at: now() };
    const next = { ...base, ...patch, date, user_id: userId, updated_at: now() };
    setData((prev) => ({ ...prev, isDemo: false, workLogs: existing ? prev.workLogs.map((w) => w.date === date ? next : w) : [...prev.workLogs, next] }));
    if (supabase && session?.user) void supabase.from("work_logs").upsert({
      user_id: userId, log_date: date, working_hours: next.working_hours, meeting_hours: next.meeting_hours,
      deep_work_hours: next.deep_work_hours, admin_hours: next.admin_hours, urgent_hours: next.urgent_unplanned_hours,
      tasks_completed: next.tasks_completed, tasks_carried_over: next.tasks_carried_over,
    }, { onConflict: "user_id,log_date" });
  }, [data.workLogs, session?.user?.id]);

  const saveWellbeingLog = useCallback<StoreValue["saveWellbeingLog"]>((date, patch) => {
    const userId = session?.user?.id ?? DEMO_USER_ID;
    const existing = data.wellbeingLogs.find((w) => w.date === date);
    const base: WellbeingLog = existing ?? { id: uid(), user_id: userId, date, recovery: 5, nourishment: 5, movement: 5, sleep: 5, relaxation: 5, connection: 5, feeling_supported: 5, gentle_habits: [], notes: "", created_at: now(), updated_at: now() };
    const next = { ...base, ...patch, date, user_id: userId, updated_at: now() };
    setData((prev) => ({ ...prev, isDemo: false, wellbeingLogs: existing ? prev.wellbeingLogs.map((w) => w.date === date ? next : w) : [...prev.wellbeingLogs, next] }));
    if (supabase && session?.user) void supabase.from("wellbeing_logs").upsert({
      user_id: userId, log_date: date, movement_minutes: Math.round(next.movement * 6), recovery: next.recovery,
      nourishment: next.nourishment, relaxation: next.relaxation, connection: next.connection,
      feeling_supported: next.feeling_supported, fertility_supportive_focus: next.gentle_habits.length ? 5 : null, note: next.notes,
    }, { onConflict: "user_id,log_date" });
  }, [data.wellbeingLogs, session?.user?.id]);

  const saveReflection = useCallback<StoreValue["saveReflection"]>((weekStart, patch) => {
    const userId = session?.user?.id ?? DEMO_USER_ID;
    const existing = data.reflections.find((r) => r.week_start === weekStart);
    const base: WeeklyReflection = existing ?? { id: uid(), user_id: userId, week_start: weekStart, went_well: "", felt_heavy: "", learned: "", next_week_focus: "", created_at: now(), updated_at: now() };
    const next = { ...base, ...patch, week_start: weekStart, user_id: userId, updated_at: now() };
    setData((prev) => ({ ...prev, reflections: existing ? prev.reflections.map((r) => r.week_start === weekStart ? next : r) : [...prev.reflections, next] }));
    if (supabase && session?.user) void supabase.from("weekly_reflections").upsert({
      user_id: userId, week_start: weekStart, highlights: next.went_well, drains: next.felt_heavy, patterns_noticed: next.learned, next_week_focus: next.next_week_focus,
    }, { onConflict: "user_id,week_start" });
  }, [data.reflections, session?.user?.id]);

  const updatePreferences = useCallback<StoreValue["updatePreferences"]>((patch) => {
    const next = { ...data.preferences, ...patch, updated_at: now() };
    setData((prev) => ({ ...prev, preferences: next }));
    if (supabase && session?.user) void supabase.from("user_preferences").upsert({
      user_id: session.user.id, week_starts_on: next.week_starts_on === "monday" ? 1 : 0, theme: "light",
    }, { onConflict: "user_id" });
  }, [data.preferences, session?.user?.id]);

  const updateProfile = useCallback<StoreValue["updateProfile"]>((patch) => {
    const next = { ...data.profile, ...patch, updated_at: now() };
    setData((prev) => ({ ...prev, profile: next }));
    if (supabase && session?.user) void supabase.from("profiles").upsert({
      id: session.user.id, display_name: next.display_name, timezone: next.timezone,
    }, { onConflict: "id" });
  }, [data.profile, session?.user?.id]);

  const loadDemoData = useCallback(() => setData(generateDemoData()), []);
  const clearAllData = useCallback(() => setData(emptyData()), []);
  const exportJSON = useCallback(() => JSON.stringify(data, null, 2), [data]);

  const value = useMemo<StoreValue>(() => ({
    data, hydrated, saveCheckin, saveWorkLog, saveWellbeingLog, saveReflection,
    updatePreferences, updateProfile, loadDemoData, clearAllData, exportJSON,
  }), [data, hydrated, saveCheckin, saveWorkLog, saveWellbeingLog, saveReflection, updatePreferences, updateProfile, loadDemoData, clearAllData, exportJSON]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function useToday() {
  return todayISO();
}
