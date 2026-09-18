import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { formatDay } from "@/lib/demo-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const axisProps = {
  stroke: "var(--color-muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;

const tooltipStyle = {
  contentStyle: {
    background: "var(--color-popover)",
    border: "1px solid var(--color-border)",
    borderRadius: "12px",
    fontSize: "12px",
    color: "var(--color-popover-foreground)",
  },
  labelStyle: { color: "var(--color-muted-foreground)" },
} as const;

export function ChartCard({
  title,
  description,
  children,
  footnote,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footnote?: string;
}) {
  return (
    <Card className="surface gap-4">
      <CardHeader className="pb-0">
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full">{children}</div>
        {footnote ? (
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{footnote}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export interface LineSpec {
  key: string;
  name: string;
  color: string;
}

export function TrendLines({
  data,
  lines,
  domain = [0, 10],
}: {
  data: Array<Record<string, unknown>>;
  lines: LineSpec[];
  domain?: [number, number];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="date"
          {...axisProps}
          tickFormatter={(d: string) => formatDay(d, { day: "numeric", month: "short" })}
          minTickGap={24}
        />
        <YAxis domain={domain} {...axisProps} width={38} />
        <Tooltip
          {...tooltipStyle}
          labelFormatter={(d: string) => formatDay(d)}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
        {lines.map((l) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.name}
            stroke={l.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function TrendArea({
  data,
  dataKey,
  name,
  color,
  domain = [0, 10],
}: {
  data: Array<Record<string, unknown>>;
  dataKey: string;
  name: string;
  color: string;
  domain?: [number, number];
}) {
  const id = `fill-${dataKey}`;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="date"
          {...axisProps}
          tickFormatter={(d: string) => formatDay(d, { day: "numeric", month: "short" })}
          minTickGap={24}
        />
        <YAxis domain={domain} {...axisProps} width={38} />
        <Tooltip {...tooltipStyle} labelFormatter={(d: string) => formatDay(d)} />
        <Area
          type="monotone"
          dataKey={dataKey}
          name={name}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${id})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RelationScatter({
  data,
  xKey,
  yKey,
  xName,
  yName,
  color,
}: {
  data: Array<Record<string, number | string>>;
  xKey: string;
  yKey: string;
  xName: string;
  yName: string;
  color: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 10, right: 10, left: -22, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis type="number" dataKey={xKey} name={xName} {...axisProps} />
        <YAxis type="number" dataKey={yKey} name={yName} {...axisProps} width={38} />
        <ZAxis range={[60, 60]} />
        <Tooltip {...tooltipStyle} cursor={{ strokeDasharray: "3 3" }} />
        <Scatter data={data} fill={color} fillOpacity={0.7} name={`${xName} vs ${yName}`} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export function StackedBars({
  data,
  bars,
}: {
  data: Array<Record<string, unknown>>;
  bars: LineSpec[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="date"
          {...axisProps}
          tickFormatter={(d: string) => formatDay(d, { day: "numeric", month: "short" })}
          minTickGap={16}
        />
        <YAxis {...axisProps} width={38} />
        <Tooltip {...tooltipStyle} labelFormatter={(d: string) => formatDay(d)} />
        <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
        {bars.map((b) => (
          <Bar key={b.key} dataKey={b.key} name={b.name} stackId="w" fill={b.color} radius={[3, 3, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
