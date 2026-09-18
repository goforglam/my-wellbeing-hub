import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEMO_USER_ID, emptyData, generateDemoData, todayISO, uid } from "./demo-data";
import type {
  AppData,
  DailyCheckin,
  EmotionKey,
  ISODate,
  UserPreferences,
  WeeklyReflection,
  WellbeingLog,
  WorkLog,
} from "./types";

const STORAGE_KEY = "work-wellbeing:v1";

/**
 * Local-first data layer. Every mutation is shaped like the Supabase row it
 * will become, so swapping this for `createServerFn` + Postgres is a drop-in.
 */
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

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => emptyData());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw) as AppData);
      else setData(generateDemoData());
    } catch {
      setData(generateDemoData());
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage unavailable — stay in memory */
    }
  }, [data, hydrated]);

  const saveCheckin = useCallback<StoreValue["saveCheckin"]>((date, patch, emotions) => {
    setData((prev) => {
      const existing = prev.checkins.find((c) => c.date === date);
      const base: DailyCheckin = existing ?? {
        id: uid(),
        user_id: DEMO_USER_ID,
        date,
        mood: 5,
        energy: 5,
        stress: 5,
        mental_load: 5,
        perceived_workload: 5,
        working_hours: 0,
        meeting_hours: 0,
        deep_work_hours: 0,
        sleep_hours: 7,
        sleep_quality: 5,
        movement: "none",
        reflection: "",
        energy_givers: "",
        energy_drains: "",
        needs_tomorrow: "",
        intention: "",
        created_at: now(),
        updated_at: now(),
      };
      const next = { ...base, ...patch, date, updated_at: now() };
      return {
        ...prev,
        isDemo: false,
        checkins: existing
          ? prev.checkins.map((c) => (c.date === date ? next : c))
          : [...prev.checkins, next],
        emotions: [
          ...prev.emotions.filter((e) => e.date !== date),
          ...emotions.map((emotion) => ({
            id: uid(),
            user_id: DEMO_USER_ID,
            date,
            emotion,
            created_at: now(),
          })),
        ],
      };
    });
  }, []);

  const saveWorkLog = useCallback<StoreValue["saveWorkLog"]>((date, patch) => {
    setData((prev) => {
      const existing = prev.workLogs.find((w) => w.date === date);
      const base: WorkLog = existing ?? {
        id: uid(),
        user_id: DEMO_USER_ID,
        date,
        meeting_hours: 0,
        deep_work_hours: 0,
        admin_hours: 0,
        urgent_unplanned_hours: 0,
        tasks_completed: 0,
        tasks_carried_over: 0,
        notes: "",
        created_at: now(),
        updated_at: now(),
      };
      const next = { ...base, ...patch, date, updated_at: now() };
      return {
        ...prev,
        isDemo: false,
        workLogs: existing
          ? prev.workLogs.map((w) => (w.date === date ? next : w))
          : [...prev.workLogs, next],
      };
    });
  }, []);

  const saveWellbeingLog = useCallback<StoreValue["saveWellbeingLog"]>((date, patch) => {
    setData((prev) => {
      const existing = prev.wellbeingLogs.find((w) => w.date === date);
      const base: WellbeingLog = existing ?? {
        id: uid(),
        user_id: DEMO_USER_ID,
        date,
        recovery: 5,
        nourishment: 5,
        movement: 5,
        sleep: 5,
        relaxation: 5,
        connection: 5,
        feeling_supported: 5,
        gentle_habits: [],
        notes: "",
        created_at: now(),
        updated_at: now(),
      };
      const next = { ...base, ...patch, date, updated_at: now() };
      return {
        ...prev,
        isDemo: false,
        wellbeingLogs: existing
          ? prev.wellbeingLogs.map((w) => (w.date === date ? next : w))
          : [...prev.wellbeingLogs, next],
      };
    });
  }, []);

  const saveReflection = useCallback<StoreValue["saveReflection"]>((weekStart, patch) => {
    setData((prev) => {
      const existing = prev.reflections.find((r) => r.week_start === weekStart);
      const base: WeeklyReflection = existing ?? {
        id: uid(),
        user_id: DEMO_USER_ID,
        week_start: weekStart,
        went_well: "",
        felt_heavy: "",
        learned: "",
        next_week_focus: "",
        created_at: now(),
        updated_at: now(),
      };
      const next = { ...base, ...patch, week_start: weekStart, updated_at: now() };
      return {
        ...prev,
        reflections: existing
          ? prev.reflections.map((r) => (r.week_start === weekStart ? next : r))
          : [...prev.reflections, next],
      };
    });
  }, []);

  const updatePreferences = useCallback<StoreValue["updatePreferences"]>((patch) => {
    setData((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, ...patch, updated_at: now() },
    }));
  }, []);

  const updateProfile = useCallback<StoreValue["updateProfile"]>((patch) => {
    setData((prev) => ({ ...prev, profile: { ...prev.profile, ...patch, updated_at: now() } }));
  }, []);

  const loadDemoData = useCallback(() => setData(generateDemoData()), []);
  const clearAllData = useCallback(() => setData(emptyData()), []);
  const exportJSON = useCallback(() => JSON.stringify(data, null, 2), [data]);

  const value = useMemo<StoreValue>(
    () => ({
      data,
      hydrated,
      saveCheckin,
      saveWorkLog,
      saveWellbeingLog,
      saveReflection,
      updatePreferences,
      updateProfile,
      loadDemoData,
      clearAllData,
      exportJSON,
    }),
    [
      data,
      hydrated,
      saveCheckin,
      saveWorkLog,
      saveWellbeingLog,
      saveReflection,
      updatePreferences,
      updateProfile,
      loadDemoData,
      clearAllData,
      exportJSON,
    ],
  );

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
