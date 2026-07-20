import React from "react";
import { formatCurrency, formatNumber } from "../i18n";

// Four compact KPI cards. All values are derived from the current cost view +
// province, so they update whenever those filters change. The highest-cost
// card is highlighted in amber for contrast.
export default function SummaryCards({ t, kpis, lang }) {
  const cards = [
    {
      key: "avg",
      label: t.kpis.avgAnnualCost,
      value: formatCurrency(kpis.avgAnnualCost, lang),
      sub: t.kpis.perYear,
    },
    {
      key: "highest",
      label: t.kpis.highestCategory,
      value: kpis.highestCategoryLabel,
      sub: `${formatCurrency(kpis.highestCategoryValue, lang)} ${t.kpis.perYear}`,
      highlight: true,
    },
    {
      key: "common",
      label: t.kpis.mostCommonService,
      value: kpis.mostCommonServiceLabel,
    },
    {
      key: "total",
      label: t.kpis.totalServices,
      value: formatNumber(kpis.totalServices, lang),
      sub: t.kpis.servicesUnit,
    },
  ];

  return (
    <div className="vm-kpis">
      {cards.map((card) => (
        <div
          key={card.key}
          className={"vm-kpi" + (card.highlight ? " vm-kpi--accent" : "")}
        >
          <span className="vm-kpi-label">{card.label}</span>
          <span className="vm-kpi-value">{card.value}</span>
          {card.sub && <span className="vm-kpi-sub">{card.sub}</span>}
        </div>
      ))}
    </div>
  );
}
