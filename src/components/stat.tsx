import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  unit,
  hint,
  tone = "default",
}: {
  label: string;
  value: number | string | null;
  unit?: string;
  hint?: string;
  tone?: "default" | "sage" | "clay";
}) {
  return (
    <Card className="surface gap-0 py-4">
      <CardContent className="px-4">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "mt-1.5 font-display text-2xl font-semibold tabular-nums",
            tone === "sage" && "text-sage",
            tone === "clay" && "text-clay",
          )}
        >
          {value === null || value === "" ? (
            <span className="text-base font-normal text-muted-foreground">—</span>
          ) : (
            <>
              {value}
              {unit ? (
                <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>
              ) : null}
            </>
          )}
        </p>
        {hint ? <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="surface flex flex-col items-center gap-3 px-6 py-12 text-center">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{body}</p>
      {action}
    </div>
  );
}

export function DemoBadge() {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-dashed border-border bg-secondary/60 px-2.5 py-1 text-xs text-muted-foreground">
      Demo data
    </span>
  );
}

export function Disclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs leading-relaxed text-muted-foreground", className)}>
      These are patterns in your own notes, described as things that happened together. They aren't
      medical advice, a diagnosis, or a cause-and-effect conclusion.
    </p>
  );
}
