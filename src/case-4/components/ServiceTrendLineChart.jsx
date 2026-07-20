import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
} from "recharts";
import { formatCurrency, formatNumber } from "../i18n";
import { CHART_COLORS, AXIS_LABEL_STYLE, TOOLTIP_STYLE } from "../theme";

export default function ServiceTrendLineChart({ data, metric, t, lang, reduceMotion }) {
  if (!data || data.length === 0) {
    return <p className="vm-empty">{t.empty}</p>;
  }

  const isCost = metric === "cost";
  const format = (value) =>
    isCost ? formatCurrency(value, lang) : formatNumber(value, lang);

  // Attach localized short + long month names for the axis and tooltip.
  const chartData = data.map((d) => ({
    ...d,
    label: t.months[d.month],
    longLabel: t.monthsLong[d.month],
  }));

  const metricName = isCost ? t.metrics.cost : t.metrics.visits;

  return (
    <ResponsiveContainer width="100%" height={330}>
      <LineChart data={chartData} margin={{ top: 8, right: 20, bottom: 30, left: 20 }}>
        <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis
          dataKey="label"
          interval={0}
          height={44}
          tickMargin={8}
          tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
          tickLine={false}
          axisLine={{ stroke: CHART_COLORS.grid }}
        >
          <Label value={t.line.xAxis} position="insideBottom" offset={-2} style={AXIS_LABEL_STYLE} />
        </XAxis>
        <YAxis
          width={isCost ? 78 : 52}
          tickFormatter={format}
          tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
          tickLine={false}
          axisLine={{ stroke: CHART_COLORS.grid }}
        >
          <Label
            value={isCost ? t.line.yAxisCost : t.line.yAxisVisits}
            angle={-90}
            position="insideLeft"
            style={{ ...AXIS_LABEL_STYLE, textAnchor: "middle" }}
          />
        </YAxis>
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value) => [format(value), metricName]}
          labelFormatter={(_, payload) =>
            payload && payload[0] ? payload[0].payload.longLabel : ""
          }
        />
        <Line
          type="monotone"
          dataKey="value"
          name={metricName}
          stroke={CHART_COLORS.accent}
          strokeWidth={3}
          dot={{ r: 4, fill: CHART_COLORS.accent, strokeWidth: 0 }}
          activeDot={{ r: 6 }}
          isAnimationActive={!reduceMotion}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
