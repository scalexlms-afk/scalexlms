"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card } from "../card";
import {
  CHART_AXIS_COLOR,
  CHART_BAR_COLOR,
  CHART_GRID_COLOR,
  CHART_TOOLTIP_STYLE,
} from "../tokens";

type ChartPoint = {
  label: string;
  value: number;
};

type BarChartCardProps = {
  title: string;
  data: ChartPoint[];
  color?: string;
};

export function BarChartCard({
  title,
  data,
  color = CHART_BAR_COLOR,
}: BarChartCardProps) {
  return (
    <Card>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
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
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
            <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
