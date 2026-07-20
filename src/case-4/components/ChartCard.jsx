import React from "react";

// A titled card that holds one chart. It shows the chart title, a one/two
// sentence explanation, the controls that affect this chart (grouped right
// above it), and the chart itself. The chart wrapper is exposed to assistive
// tech as an image with a full text description (title + non-visual summary)
// so the information is not locked inside the SVG.
export default function ChartCard({ title, explain, controls, chartAria, children }) {
  return (
    <section className="vm-card">
      <div className="vm-card-head">
        <h2 className="vm-card-title">{title}</h2>
        <p className="vm-card-explain">{explain}</p>
      </div>
      {controls}
      <div className="vm-chart" role="img" aria-label={chartAria}>
        {children}
      </div>
    </section>
  );
}
