import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
} from "recharts";
import { formatCurrency } from "../i18n";
import { CHART_COLORS, AXIS_LABEL_STYLE, TOOLTIP_STYLE } from "../theme";

// Wrap long category names onto multiple lines so nothing overlaps or clips,
// in English or (longer) French. Splits on spaces and stacks the words.
function CategoryTick({ x, y, payload }) {
  const words = String(payload.value).split(" ");
  return (
    <g transform={`translate(${x}, ${y + 12})`}>
      {words.map((word, i) => (
        <text
          key={i}
          x={0}
          y={i * 13}
          textAnchor="middle"
          fontSize={11}
          fill={CHART_COLORS.axis}
        >
          {word}
        </text>
      ))}
    </g>
  );
}

export default function MaintenanceBarChart({ data, maxId, t, lang, reduceMotion }) {
  if (!data || data.length === 0) {
    return <p className="vm-empty">{t.empty}</p>;
  }

  const money = (value) => formatCurrency(value, lang);

  return (
    <ResponsiveContainer width="100%" height={330}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 30, left: 20 }}>
        <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis
          dataKey="name"
          interval={0}
          height={52}
          tickLine={false}
          axisLine={{ stroke: CHART_COLORS.grid }}
          tick={<CategoryTick />}
        >
          <Label value={t.bar.xAxis} position="insideBottom" offset={-2} style={AXIS_LABEL_STYLE} />
        </XAxis>
        <YAxis
          width={78}
          tickFormatter={money}
          tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
          tickLine={false}
          axisLine={{ stroke: CHART_COLORS.grid }}
        >
          <Label
            value={t.bar.yAxis}
            angle={-90}
            position="insideLeft"
            style={{ ...AXIS_LABEL_STYLE, textAnchor: "middle" }}
          />
        </YAxis>
        <Tooltip
          cursor={{ fill: CHART_COLORS.cursor }}
          contentStyle={TOOLTIP_STYLE}
          formatter={(value) => [money(value), t.bar.seriesName]}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive={!reduceMotion}>
          {data.map((entry) => (
            <Cell
              key={entry.id}
              fill={entry.id === maxId ? CHART_COLORS.highlight : CHART_COLORS.accent}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
