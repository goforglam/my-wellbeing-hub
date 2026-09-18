import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Briefcase,
  CalendarCheck,
  Heart,
  Lightbulb,
  Settings as SettingsIcon,
  Sun,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

const NAV = [
  { to: "/", label: "Today", icon: Sun },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/work", label: "Work", icon: Briefcase },
  { to: "/wellbeing", label: "Wellbeing", icon: Heart },
  { to: "/emotions", label: "Emotions", icon: Activity },
  { to: "/weekly-review", label: "Weekly", icon: CalendarCheck },
  { to: "/insights", label: "Insights", icon: Lightbulb },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data } = useStore();

  return (
    <div className="min-h-screen warm-glow">
      <div className="mx-auto flex w-full max-w-7xl gap-8 px-4 pb-28 pt-6 md:px-8 lg:pb-12">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-6">
            <Link to="/" className="flex items-center gap-3 px-2">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
                <Sun className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-display text-base font-semibold">
                  Work &amp; Wellbeing
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  Private to you
                </span>
              </span>
            </Link>
            <nav className="mt-8 space-y-1">
              {NAV.map(({ to, label, icon: Icon }) => {
                const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-secondary font-medium text-foreground"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </nav>
            {data.isDemo ? (
              <p className="mt-8 rounded-xl border border-dashed border-border px-3 py-3 text-xs leading-relaxed text-muted-foreground">
                You're viewing <span className="font-medium text-foreground">demo data</span>. Your
                first check-in replaces it.
              </p>
            ) : null}
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-2xl items-stretch justify-between px-1 py-1.5">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                aria-label={label}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[10px] transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="w-full truncate text-center">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {subtitle ? (
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
