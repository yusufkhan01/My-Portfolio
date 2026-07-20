// ===========================================================================
// Canadian Vehicle Maintenance Dashboard (case-4) — synthetic dataset + calcs
// ===========================================================================
// Everything here is SYNTHETIC and for educational purposes only. Values are
// language-independent (display labels live in ./i18n.js). Costs are annual
// estimates in CAD at the Ontario base; a province preset scales those costs.
// Numbers are chosen to show believable *relative* patterns — pickups cost the
// most, EVs are light on oil/brakes but heavy on tires, tire work spikes in
// spring and fall — not real market figures.

// Canonical (stable) ids. Order here drives the order shown in the UI.
export const CATEGORY_IDS = ["compact", "sedan", "suv", "pickup", "ev"];
export const SERVICE_IDS = ["oil", "brakes", "tires", "inspections", "repairs"];
export const PROVINCE_IDS = ["ON", "QC", "BC", "AB"];
export const COST_VIEW_IDS = ["total", "preventive", "repairs", "tires"];
export const METRIC_IDS = ["visits", "cost"];
export const MONTH_COUNT = 12;

// Which service types roll up into each cost view.
export const COST_VIEW_SERVICES = {
  total: ["oil", "brakes", "tires", "inspections", "repairs"],
  preventive: ["oil", "brakes", "inspections"],
  repairs: ["repairs"],
  tires: ["tires"],
};

// Synthetic province cost presets (multipliers on the Ontario base).
export const PROVINCE_MULTIPLIER = { ON: 1.0, QC: 0.95, BC: 1.08, AB: 1.03 };

// Master dataset: for each category, the annual cost (CAD) and a representative
// service-visit count per service type at the Ontario base, plus two seasonal
// "boost" traits used by the monthly trend model.
export const CATEGORY_DATA = {
  compact: {
    winterBoost: 1.03,
    tireBoost: 1.05,
    services: {
      oil: { cost: 180, visits: 165 },
      brakes: { cost: 220, visits: 70 },
      tires: { cost: 300, visits: 230 },
      inspections: { cost: 90, visits: 120 },
      repairs: { cost: 350, visits: 95 },
    },
  },
  sedan: {
    winterBoost: 1.03,
    tireBoost: 1.05,
    services: {
      oil: { cost: 210, visits: 175 },
      brakes: { cost: 260, visits: 80 },
      tires: { cost: 360, visits: 240 },
      inspections: { cost: 100, visits: 125 },
      repairs: { cost: 430, visits: 110 },
    },
  },
  suv: {
    winterBoost: 1.05,
    tireBoost: 1.1,
    services: {
      oil: { cost: 260, visits: 185 },
      brakes: { cost: 340, visits: 95 },
      tires: { cost: 520, visits: 255 },
      inspections: { cost: 120, visits: 130 },
      repairs: { cost: 560, visits: 125 },
    },
  },
  pickup: {
    winterBoost: 1.06,
    tireBoost: 1.12,
    services: {
      oil: { cost: 300, visits: 195 },
      brakes: { cost: 380, visits: 100 },
      tires: { cost: 620, visits: 265 },
      inspections: { cost: 130, visits: 135 },
      repairs: { cost: 640, visits: 140 },
    },
  },
  ev: {
    winterBoost: 1.18,
    tireBoost: 1.1,
    services: {
      // No engine oil — just coolant/brake/washer fluids. Regen braking means
      // light brake wear, but the extra weight and torque eat tires quickly.
      oil: { cost: 40, visits: 60 },
      brakes: { cost: 120, visits: 40 },
      tires: { cost: 660, visits: 250 },
      inspections: { cost: 110, visits: 125 },
      repairs: { cost: 500, visits: 105 },
    },
  },
};

// --- Seasonal profiles (relative activity by month, Jan..Dec) --------------
// Double peak in spring (Apr) and late fall (Nov) mirrors winter-tire swaps;
// Dec-Feb stays elevated for cold-weather/battery work; a summer bump (Jul)
// covers road-trip maintenance.
const VISIT_SEASON = [1.15, 1.1, 0.95, 1.25, 1.1, 1.05, 1.1, 1.08, 0.95, 1.12, 1.3, 1.05];
const COST_SEASON = [1.18, 1.12, 0.92, 1.2, 1.05, 1.02, 1.08, 1.06, 0.94, 1.1, 1.28, 1.1];
const WINTER_MONTHS = [0, 1, 11]; // Jan, Feb, Dec
const TIRE_MONTHS = [3, 10]; // Apr, Nov

const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
const VISIT_SEASON_MEAN = mean(VISIT_SEASON);
const COST_SEASON_MEAN = mean(COST_SEASON);

// Fall back to a known id if an unexpected value ever arrives.
const safeCategory = (id) => (CATEGORY_DATA[id] ? id : CATEGORY_IDS[0]);
const servicesForView = (view) => COST_VIEW_SERVICES[view] || COST_VIEW_SERVICES.total;

// Sum annual cost of the service types included in `view` for one category.
function viewCost(catId, view) {
  const cat = CATEGORY_DATA[safeCategory(catId)];
  return servicesForView(view).reduce((sum, s) => sum + (cat.services[s]?.cost || 0), 0);
}

// Sum annual visits of the service types included in `view` for one category.
function viewVisits(catId, view) {
  const cat = CATEGORY_DATA[safeCategory(catId)];
  return servicesForView(view).reduce((sum, s) => sum + (cat.services[s]?.visits || 0), 0);
}

export function provinceMultiplier(province) {
  return PROVINCE_MULTIPLIER[province] ?? 1;
}

// Annual cost for one category, in one province, under the chosen cost view.
export function categoryCost(catId, view, province) {
  return Math.round(viewCost(catId, view) * provinceMultiplier(province));
}

// Bar-chart rows (one per category) plus the id of the most expensive one so
// the chart can highlight it. `labelFor` maps a category id to its localized
// name so the returned rows are ready to render.
export function getBarData(view, province, labelFor) {
  const rows = CATEGORY_IDS.map((id) => ({
    id,
    name: labelFor(id),
    value: categoryCost(id, view, province),
  }));
  const maxId = rows.reduce((top, r) => (r.value > top.value ? r : top), rows[0]).id;
  return { rows, maxId };
}

// Monthly trend rows for one category and metric ("visits" | "cost"). Values
// are normalized so the yearly average lands near annual/12, then nudged up in
// winter and tire-swap months per the category's seasonal traits.
export function getMonthlyData(catId, metric) {
  const cat = CATEGORY_DATA[safeCategory(catId)];
  const isCost = metric === "cost";
  const annual = SERVICE_IDS.reduce(
    (sum, s) => sum + (isCost ? cat.services[s].cost : cat.services[s].visits),
    0
  );
  const base = annual / MONTH_COUNT;
  const season = isCost ? COST_SEASON : VISIT_SEASON;
  const seasonMean = isCost ? COST_SEASON_MEAN : VISIT_SEASON_MEAN;

  return season.map((factor, m) => {
    let value = base * (factor / seasonMean);
    if (WINTER_MONTHS.includes(m)) value *= cat.winterBoost;
    if (TIRE_MONTHS.includes(m)) value *= cat.tireBoost;
    return { month: m, value: Math.round(value) };
  });
}

// KPI summary for the current cost view + province. `labelFor`/`serviceLabel`
// localize the category and service names in the returned object.
export function getKpis(view, province, labelFor, serviceLabel) {
  const costs = CATEGORY_IDS.map((id) => categoryCost(id, view, province));
  const avgAnnualCost = Math.round(costs.reduce((a, b) => a + b, 0) / costs.length);

  // Highest-cost category.
  let highestIndex = 0;
  costs.forEach((c, i) => {
    if (c > costs[highestIndex]) highestIndex = i;
  });
  const highestCategoryId = CATEGORY_IDS[highestIndex];

  // Most common service type among those included in the current view.
  const included = servicesForView(view);
  let mostCommonServiceId = included[0];
  let topVisits = -1;
  included.forEach((s) => {
    const total = CATEGORY_IDS.reduce((sum, id) => sum + CATEGORY_DATA[id].services[s].visits, 0);
    if (total > topVisits) {
      topVisits = total;
      mostCommonServiceId = s;
    }
  });

  // Total services represented across all categories for the current view.
  const totalServices = CATEGORY_IDS.reduce((sum, id) => sum + viewVisits(id, view), 0);

  return {
    avgAnnualCost,
    highestCategoryId,
    highestCategoryLabel: labelFor(highestCategoryId),
    highestCategoryValue: costs[highestIndex],
    mostCommonServiceId,
    mostCommonServiceLabel: serviceLabel(mostCommonServiceId),
    totalServices,
  };
}
