// Shared chart colours for case-4. Kept in one place so the bar and line
// charts stay visually consistent with the dashboard's design tokens: one
// primary accent (blue) plus one contrasting highlight (amber), on light
// gridlines and muted axes.
export const CHART_COLORS = {
  accent: "#2563eb", // primary blue (matches --vm-accent)
  highlight: "#f59e0b", // amber highlight for the most expensive category
  grid: "#e5e7eb", // light gridlines
  axis: "#6b7280", // muted axis text
  cursor: "rgba(37, 99, 235, 0.06)", // subtle hover band
};

// Axis label style shared by both charts.
export const AXIS_LABEL_STYLE = {
  fill: "#6b7280",
  fontSize: 12,
  fontWeight: 700,
};

// Tooltip container style shared by both charts.
export const TOOLTIP_STYLE = {
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  boxShadow: "0 8px 30px rgba(2, 6, 23, 0.12)",
  fontSize: 13,
};
