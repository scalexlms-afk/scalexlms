"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card } from "../card";
import {
  CHART_AXIS_COLOR,
  CHART_GRID_COLOR,
  CHART_LINE_COLOR,
  CHART_TOOLTIP_STYLE,
} from "../tokens";

type ChartPoint = {
  label: string;
  value: number;
};

type LineChartCardProps = {
  title: string;
  data: ChartPoint[];
  valuePrefix?: string;
  color?: string;
};

export function LineChartCard({
  title,
  data,
  valuePrefix = "",
  color = CHART_LINE_COLOR,
}: LineChartCardProps) {
  return (
    <Card>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke={CHART_GRID_COLOR} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: CHART_AXIS_COLOR, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: CHART_AXIS_COLOR, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              formatter={(value) => [`${valuePrefix}${value}`, ""]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ r: 3, fill: color }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
