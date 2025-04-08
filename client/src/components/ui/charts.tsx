import React from "react";
import {
  Area,
  AreaChart as RechartsAreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = {
  blue: "#3b82f6",
  indigo: "#6366f1",
  purple: "#8b5cf6",
  pink: "#ec4899",
  red: "#ef4444",
  orange: "#f97316",
  yellow: "#eab308",
  green: "#22c55e",
  teal: "#14b8a6",
  cyan: "#06b6d4",
  sky: "#0ea5e9",
  violet: "#8b5cf6",
  fuchsia: "#d946ef",
  rose: "#f43f5e",
  slate: "#64748b",
  gray: "#6b7280",
};

type ChartColor = keyof typeof COLORS;

interface BaseChartProps {
  data: any[];
  index: string;
  colors?: ChartColor[];
  valueFormatter?: (value: number, category?: string) => string;
  showLegend?: boolean;
  showAnimation?: boolean;
}

interface CartesianChartProps extends BaseChartProps {
  categories: string[];
  stack?: boolean;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showTooltip?: boolean;
}

interface AreaChartProps extends CartesianChartProps {
  showGradient?: boolean;
  curveType?: "linear" | "monotone" | "natural" | "step";
}

export function AreaChart({
  data,
  index,
  categories,
  colors = ["blue", "indigo", "violet", "purple"],
  valueFormatter = (value) => value.toString(),
  showLegend = true,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  showTooltip = true,
  showAnimation = false,
  showGradient = false,
  curveType = "linear",
}: AreaChartProps) {
  const mappedColors = colors.map((color) => COLORS[color] || COLORS.blue);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsAreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.2} />}
        {showXAxis && (
          <XAxis
            dataKey={index}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
        )}
        {showYAxis && (
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            tickMargin={10}
            tickFormatter={valueFormatter}
          />
        )}
        {showTooltip && (
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="font-medium">{label}</div>
                    <div className="grid gap-2 pt-2">
                      {payload.map((entry, index) => (
                        <div
                          key={`item-${index}`}
                          className="flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-1">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm font-medium text-muted-foreground">
                              {entry.name}:
                            </span>
                          </div>
                          <div className="text-right text-sm font-medium">
                            {valueFormatter(entry.value as number)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
        )}
        {showLegend && (
          <Legend
            content={({ payload }) => {
              if (payload && payload.length) {
                return (
                  <div className="flex justify-center gap-4 text-sm">
                    {payload.map((entry, index) => (
                      <div key={`item-${index}`} className="flex items-center gap-1">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-muted-foreground">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
        )}
        {categories.map((category, index) => (
          <Area
            key={category}
            type={curveType}
            dataKey={category}
            stackId={showGradient ? "stack" : undefined}
            stroke={mappedColors[index % mappedColors.length]}
            fill={mappedColors[index % mappedColors.length]}
            fillOpacity={showGradient ? 0.1 : 0}
            isAnimationActive={showAnimation}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}

export function BarChart({
  data,
  index,
  categories,
  colors = ["blue", "indigo", "violet", "purple"],
  valueFormatter = (value) => value.toString(),
  showLegend = true,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  showTooltip = true,
  showAnimation = false,
  stack = false,
}: CartesianChartProps) {
  const mappedColors = colors.map((color) => COLORS[color] || COLORS.blue);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={data}
        margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.2} />}
        {showXAxis && (
          <XAxis
            dataKey={index}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
        )}
        {showYAxis && (
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            tickMargin={10}
            tickFormatter={valueFormatter}
          />
        )}
        {showTooltip && (
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="font-medium">{label}</div>
                    <div className="grid gap-2 pt-2">
                      {payload.map((entry, index) => (
                        <div
                          key={`item-${index}`}
                          className="flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-1">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm font-medium text-muted-foreground">
                              {entry.name}:
                            </span>
                          </div>
                          <div className="text-right text-sm font-medium">
                            {valueFormatter(entry.value as number, entry.name)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
        )}
        {showLegend && (
          <Legend
            content={({ payload }) => {
              if (payload && payload.length) {
                return (
                  <div className="flex justify-center gap-4 text-sm">
                    {payload.map((entry, index) => (
                      <div key={`item-${index}`} className="flex items-center gap-1">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-muted-foreground">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
        )}
        {categories.map((category, index) => (
          <Bar
            key={category}
            dataKey={category}
            stackId={stack ? "stack" : undefined}
            fill={mappedColors[index % mappedColors.length]}
            isAnimationActive={showAnimation}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

export function LineChart({
  data,
  index,
  categories,
  colors = ["blue", "indigo", "violet", "purple"],
  valueFormatter = (value) => value.toString(),
  showLegend = true,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  showTooltip = true,
  showAnimation = false,
}: CartesianChartProps) {
  const mappedColors = colors.map((color) => COLORS[color] || COLORS.blue);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
        data={data}
        margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.2} />}
        {showXAxis && (
          <XAxis
            dataKey={index}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
        )}
        {showYAxis && (
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            tickMargin={10}
            tickFormatter={valueFormatter}
          />
        )}
        {showTooltip && (
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="font-medium">{label}</div>
                    <div className="grid gap-2 pt-2">
                      {payload.map((entry, index) => (
                        <div
                          key={`item-${index}`}
                          className="flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-1">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm font-medium text-muted-foreground">
                              {entry.name}:
                            </span>
                          </div>
                          <div className="text-right text-sm font-medium">
                            {valueFormatter(entry.value as number, entry.name)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
        )}
        {showLegend && (
          <Legend
            content={({ payload }) => {
              if (payload && payload.length) {
                return (
                  <div className="flex justify-center gap-4 text-sm">
                    {payload.map((entry, index) => (
                      <div key={`item-${index}`} className="flex items-center gap-1">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-muted-foreground">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
        )}
        {categories.map((category, index) => (
          <Line
            key={category}
            dataKey={category}
            stroke={mappedColors[index % mappedColors.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            isAnimationActive={showAnimation}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

interface DonutChartProps extends BaseChartProps {
  category: string;
  showTooltip?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

export function DonutChart({
  data,
  index,
  category,
  colors = ["blue", "indigo", "violet", "purple"],
  valueFormatter = (value) => value.toString(),
  showLegend = true,
  showTooltip = true,
  showAnimation = false,
  innerRadius = 50,
  outerRadius = 80,
}: DonutChartProps) {
  const mappedColors = colors.map((color) => COLORS[color] || COLORS.blue);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey={category}
          nameKey={index}
          isAnimationActive={showAnimation}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={mappedColors[index % mappedColors.length]}
            />
          ))}
        </Pie>
        {showTooltip && (
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const entry = payload[0];
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="font-medium">{entry.name}</div>
                    <div className="grid gap-2 pt-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-sm font-medium text-muted-foreground">
                            Valor:
                          </span>
                        </div>
                        <div className="text-right text-sm font-medium">
                          {valueFormatter(entry.value as number)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
        )}
        {showLegend && (
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            content={({ payload }) => {
              if (payload && payload.length) {
                return (
                  <div className="flex flex-wrap justify-center gap-4 text-sm">
                    {payload.map((entry, index) => (
                      <div key={`item-${index}`} className="flex items-center gap-1">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-muted-foreground">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
        )}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}