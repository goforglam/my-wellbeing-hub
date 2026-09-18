import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function ScaleSlider({
  id,
  label,
  value,
  onChange,
  lowLabel = "Low",
  highLabel = "High",
  hint,
  tone = "clay",
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  lowLabel?: string;
  highLabel?: string;
  hint?: string;
  tone?: "clay" | "sage" | "sky" | "bloom";
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-sm font-semibold tabular-nums",
            tone === "clay" && "bg-secondary text-foreground",
            tone === "sage" && "bg-accent text-accent-foreground",
            tone === "sky" && "bg-secondary text-foreground",
            tone === "bloom" && "bg-secondary text-foreground",
          )}
        >
          {value}
        </span>
      </div>
      <Slider
        id={id}
        min={1}
        max={10}
        step={1}
        value={[value]}
        onValueChange={([v]) => onChange(v ?? value)}
        aria-label={label}
        aria-valuetext={`${value} out of 10`}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{lowLabel}</span>
        {hint ? <span className="hidden sm:inline">{hint}</span> : null}
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  step = 0.5,
  max = 24,
  suffix,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm tabular-nums outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring"
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}
