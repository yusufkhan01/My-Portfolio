import React, { useState, useMemo, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";

import { translations, formatCurrency, formatNumber, fill } from "./case-4/i18n";
import {
  CATEGORY_IDS,
  PROVINCE_IDS,
  COST_VIEW_IDS,
  METRIC_IDS,
  getBarData,
  getMonthlyData,
  getKpis,
} from "./case-4/data";
import DashboardHeader from "./case-4/components/DashboardHeader";
import SummaryCards from "./case-4/components/SummaryCards";
import ChartCard from "./case-4/components/ChartCard";
import DashboardFilters from "./case-4/components/DashboardFilters";
import MaintenanceBarChart from "./case-4/components/MaintenanceBarChart";
import ServiceTrendLineChart from "./case-4/components/ServiceTrendLineChart";

/*
  Canadian Vehicle Maintenance Dashboard — SEG3125 Assignment 5 (Case 4)
  =====================================================================
  A bilingual (EN/FR) interactive dashboard built with React + Recharts and
  bundled by esbuild — same static-file model as case-1/2/3. It uses a small
  SYNTHETIC dataset (see ./case-4/data.js) to let Canadian drivers explore
  estimated annual maintenance costs (bar chart) and monthly service trends
  (line chart) for five vehicle categories.

  This entry file owns the language + filter state and wires the pieces
  together; data, translations, chart config and presentation live in their
  own modules under ./case-4/.
*/

const DEFAULTS = {
  costView: "total",
  province: "ON",
  lineCategory: "compact",
  lineMetric: "visits",
};

// Read the user's motion preference once so charts can skip entry animations.
const REDUCE_MOTION =
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

function App() {
  const [lang, setLang] = useState("en");
  const [costView, setCostView] = useState(DEFAULTS.costView);
  const [province, setProvince] = useState(DEFAULTS.province);
  const [lineCategory, setLineCategory] = useState(DEFAULTS.lineCategory);
  const [lineMetric, setLineMetric] = useState(DEFAULTS.lineMetric);
  const [status, setStatus] = useState(""); // announced via aria-live

  const t = translations[lang];

  // Keep the document language + title in sync for accessibility / tabs.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.header.title;
  }, [lang, t]);

  const labelFor = useCallback((id) => translations[lang].categories[id], [lang]);
  const serviceLabel = useCallback((id) => translations[lang].services[id], [lang]);

  // Derived chart/KPI data — recomputed only when the inputs change.
  const bar = useMemo(
    () => getBarData(costView, province, labelFor),
    [costView, province, labelFor]
  );
  const kpis = useMemo(
    () => getKpis(costView, province, labelFor, serviceLabel),
    [costView, province, labelFor, serviceLabel]
  );
  const monthly = useMemo(
    () => getMonthlyData(lineCategory, lineMetric),
    [lineCategory, lineMetric]
  );

  // Non-visual summaries (also used as each chart's aria-label).
  const barSummary = useMemo(() => {
    const { rows } = bar;
    const top = rows.reduce((a, b) => (b.value > a.value ? b : a), rows[0]);
    const bottom = rows.reduce((a, b) => (b.value < a.value ? b : a), rows[0]);
    return fill(t.bar.summary, {
      view: t.costViews[costView],
      province: t.provinces[province],
      top: top.name,
      topValue: formatCurrency(top.value, lang),
      bottom: bottom.name,
      bottomValue: formatCurrency(bottom.value, lang),
      avg: formatCurrency(kpis.avgAnnualCost, lang),
    });
  }, [bar, kpis, costView, province, t, lang]);

  const lineSummary = useMemo(() => {
    const peak = monthly.reduce((a, b) => (b.value > a.value ? b : a), monthly[0]);
    const low = monthly.reduce((a, b) => (b.value < a.value ? b : a), monthly[0]);
    const fmt = (v) => (lineMetric === "cost" ? formatCurrency(v, lang) : formatNumber(v, lang));
    return fill(t.line.summary, {
      category: t.categories[lineCategory],
      metric: lineMetric === "cost" ? t.metrics.cost : t.metrics.visits,
      peakMonth: t.monthsLong[peak.month],
      peakValue: fmt(peak.value),
      lowMonth: t.monthsLong[low.month],
      lowValue: fmt(low.value),
    });
  }, [monthly, lineCategory, lineMetric, t, lang]);

  // --- Handlers: update state + announce the change for screen readers ------
  const changeLang = (code) => {
    setLang(code);
    setStatus(translations[code].status.langChanged);
  };
  const changeCostView = (value) => {
    setCostView(value);
    setStatus(`${t.controls.costView}: ${t.costViews[value]}`);
  };
  const changeProvince = (value) => {
    setProvince(value);
    setStatus(`${t.controls.province}: ${t.provinces[value]}`);
  };
  const changeCategory = (value) => {
    setLineCategory(value);
    setStatus(`${t.controls.vehicleCategory}: ${t.categories[value]}`);
  };
  const changeMetric = (value) => {
    setLineMetric(value);
    setStatus(`${t.controls.metric}: ${t.metrics[value]}`);
  };
  const resetFilters = () => {
    setCostView(DEFAULTS.costView);
    setProvince(DEFAULTS.province);
    setLineCategory(DEFAULTS.lineCategory);
    setLineMetric(DEFAULTS.lineMetric);
    setStatus(t.status.updated);
  };

  // Localized option lists for the dropdowns / toggle.
  const costViewOptions = COST_VIEW_IDS.map((id) => ({ value: id, label: t.costViews[id] }));
  const provinceOptions = PROVINCE_IDS.map((id) => ({ value: id, label: t.provinces[id] }));
  const categoryOptions = CATEGORY_IDS.map((id) => ({ value: id, label: t.categories[id] }));
  const metricOptions = METRIC_IDS.map((id) => ({ value: id, label: t.metrics[id] }));

  return (
    <div className="vm-app">
      <DashboardHeader t={t} lang={lang} onLang={changeLang} onReset={resetFilters} />

      <main className="vm-main">
        {/* Polite live region: announces filter / language changes. */}
        <div className="vm-sr-only" aria-live="polite" role="status">
          {status}
        </div>

        <SummaryCards t={t} kpis={kpis} lang={lang} />

        <div className="vm-charts">
          <ChartCard
            title={t.bar.title}
            explain={t.bar.explain}
            chartAria={`${t.bar.ariaLabel} ${barSummary}`}
            controls={
              <DashboardFilters
                ariaLabel={t.bar.title}
                controls={[
                  {
                    type: "select",
                    id: "vm-costview",
                    label: t.controls.costView,
                    value: costView,
                    options: costViewOptions,
                    onChange: changeCostView,
                  },
                  {
                    type: "select",
                    id: "vm-province",
                    label: t.controls.province,
                    value: province,
                    options: provinceOptions,
                    onChange: changeProvince,
                  },
                ]}
              />
            }
          >
            <MaintenanceBarChart
              data={bar.rows}
              maxId={bar.maxId}
              t={t}
              lang={lang}
              reduceMotion={REDUCE_MOTION}
            />
          </ChartCard>

          <ChartCard
            title={t.line.title}
            explain={t.line.explain}
            chartAria={`${t.line.ariaLabel} ${lineSummary}`}
            controls={
              <DashboardFilters
                ariaLabel={t.line.title}
                controls={[
                  {
                    type: "select",
                    id: "vm-category",
                    label: t.controls.vehicleCategory,
                    value: lineCategory,
                    options: categoryOptions,
                    onChange: changeCategory,
                  },
                  {
                    type: "segmented",
                    id: "vm-metric",
                    label: t.controls.metric,
                    value: lineMetric,
                    options: metricOptions,
                    onChange: changeMetric,
                  },
                ]}
              />
            }
          >
            <ServiceTrendLineChart
              data={monthly}
              metric={lineMetric}
              t={t}
              lang={lang}
              reduceMotion={REDUCE_MOTION}
            />
          </ChartCard>
        </div>
      </main>

      <footer className="vm-footer">
        <p>
          {t.header.title} · {t.footer}
        </p>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
