// ===========================================================================
// Canadian Vehicle Maintenance Dashboard (case-4) — i18n (EN / FR)
// ===========================================================================
// Every user-facing string lives in one place so the whole dashboard can be
// translated from here (no strings scattered through JSX). Locale-aware number
// and currency formatting uses Intl.NumberFormat with en-CA / fr-CA and CAD.

export const LANGS = ["en", "fr"];

// Language selector labels are proper nouns — identical in both languages.
export const LANG_NAMES = { en: "English", fr: "Français" };

export const translations = {
  en: {
    header: {
      eyebrow: "SEG3125 · Assignment 5",
      title: "Canadian Vehicle Maintenance Dashboard",
      description:
        "Explore estimated maintenance costs and service patterns for common vehicle categories.",
      languageLabel: "Language",
      backToPortfolio: "Back to portfolio",
      syntheticNotice:
        "This dashboard uses synthetic data created for educational purposes.",
    },
    controls: {
      reset: "Reset filters",
      costView: "Cost view",
      province: "Province",
      vehicleCategory: "Vehicle category",
      metric: "Metric",
    },
    status: {
      updated: "Filters reset to defaults.",
      langChanged: "Language changed to English.",
    },
    kpis: {
      avgAnnualCost: "Average annual maintenance cost",
      highestCategory: "Highest-cost vehicle category",
      mostCommonService: "Most common service type",
      totalServices: "Total services represented",
      perYear: "per year",
      servicesUnit: "services",
    },
    categories: {
      compact: "Compact Car",
      sedan: "Sedan",
      suv: "SUV",
      pickup: "Pickup Truck",
      ev: "Electric Vehicle",
    },
    services: {
      oil: "Oil and fluids",
      brakes: "Brakes",
      tires: "Tires",
      inspections: "Inspections",
      repairs: "Unexpected repairs",
    },
    provinces: {
      ON: "Ontario",
      QC: "Quebec",
      BC: "British Columbia",
      AB: "Alberta",
    },
    costViews: {
      total: "Total annual maintenance cost",
      preventive: "Preventive maintenance",
      repairs: "Repairs",
      tires: "Tires",
    },
    metrics: {
      visits: "Number of service visits",
      cost: "Average monthly cost",
    },
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    monthsLong: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ],
    bar: {
      title: "Estimated annual maintenance cost by vehicle category",
      explain:
        "Compare estimated annual maintenance expenses across vehicle categories. Change the province and cost type to explore different scenarios.",
      xAxis: "Vehicle category",
      yAxis: "Estimated annual cost (CAD)",
      seriesName: "Annual cost",
      ariaLabel: "Bar chart of estimated annual maintenance cost by vehicle category.",
      summary:
        "For {view} in {province}, {top} has the highest estimated cost at {topValue}, while {bottom} is the lowest at {bottomValue}. The average across all categories is {avg}.",
    },
    line: {
      title: "Estimated monthly service activity",
      explain:
        "See how estimated service activity changes across the year for one vehicle category. Choose a category and switch the metric to compare visits and cost.",
      xAxis: "Month",
      yAxisVisits: "Service visits",
      yAxisCost: "Average monthly cost (CAD)",
      ariaLabel: "Line chart of estimated monthly service activity across the year.",
      summary:
        "For {category}, {metric} peaks in {peakMonth} at {peakValue} and is lowest in {lowMonth} at {lowValue}.",
    },
    empty: "No data available for this selection.",
    footer: "Synthetic data · Designed by Yusuf Khan",
  },

  fr: {
    header: {
      eyebrow: "SEG3125 · Devoir 5",
      title: "Tableau de bord de l'entretien automobile au Canada",
      description:
        "Explorez les coûts d'entretien estimés et les tendances de service pour différentes catégories de véhicules.",
      languageLabel: "Langue",
      backToPortfolio: "Retour au portfolio",
      syntheticNotice:
        "Ce tableau de bord utilise des données synthétiques créées à des fins éducatives.",
    },
    controls: {
      reset: "Réinitialiser les filtres",
      costView: "Type de coût",
      province: "Province",
      vehicleCategory: "Catégorie de véhicule",
      metric: "Mesure",
    },
    status: {
      updated: "Filtres réinitialisés aux valeurs par défaut.",
      langChanged: "Langue changée en français.",
    },
    kpis: {
      avgAnnualCost: "Coût d'entretien annuel moyen",
      highestCategory: "Catégorie de véhicule la plus coûteuse",
      mostCommonService: "Type de service le plus courant",
      totalServices: "Nombre total de services représentés",
      perYear: "par année",
      servicesUnit: "services",
    },
    categories: {
      compact: "Voiture compacte",
      sedan: "Berline",
      suv: "VUS",
      pickup: "Camionnette",
      ev: "Véhicule électrique",
    },
    services: {
      oil: "Huile et fluides",
      brakes: "Freins",
      tires: "Pneus",
      inspections: "Inspections",
      repairs: "Réparations imprévues",
    },
    provinces: {
      ON: "Ontario",
      QC: "Québec",
      BC: "Colombie-Britannique",
      AB: "Alberta",
    },
    costViews: {
      total: "Coût d'entretien annuel total",
      preventive: "Entretien préventif",
      repairs: "Réparations",
      tires: "Pneus",
    },
    metrics: {
      visits: "Nombre de visites d'entretien",
      cost: "Coût mensuel moyen",
    },
    months: [
      "janv.", "févr.", "mars", "avr.", "mai", "juin",
      "juil.", "août", "sept.", "oct.", "nov.", "déc.",
    ],
    monthsLong: [
      "janvier", "février", "mars", "avril", "mai", "juin",
      "juillet", "août", "septembre", "octobre", "novembre", "décembre",
    ],
    bar: {
      title: "Coût d'entretien annuel estimé par catégorie de véhicule",
      explain:
        "Comparez les dépenses annuelles d'entretien estimées selon la catégorie de véhicule. Modifiez la province et le type de coût pour explorer différents scénarios.",
      xAxis: "Catégorie de véhicule",
      yAxis: "Coût annuel estimé (CAD)",
      seriesName: "Coût annuel",
      ariaLabel: "Diagramme à barres du coût d'entretien annuel estimé par catégorie de véhicule.",
      summary:
        "Pour {view} en {province}, {top} présente le coût estimé le plus élevé à {topValue}, tandis que {bottom} est le plus bas à {bottomValue}. La moyenne de toutes les catégories est de {avg}.",
    },
    line: {
      title: "Activité de service mensuelle estimée",
      explain:
        "Voyez comment l'activité de service estimée évolue au cours de l'année pour une catégorie de véhicule. Choisissez une catégorie et changez la mesure pour comparer les visites et les coûts.",
      xAxis: "Mois",
      yAxisVisits: "Visites d'entretien",
      yAxisCost: "Coût mensuel moyen (CAD)",
      ariaLabel: "Graphique linéaire de l'activité de service mensuelle estimée sur l'année.",
      summary:
        "Pour {category}, {metric} atteint un sommet en {peakMonth} à {peakValue} et est au plus bas en {lowMonth} à {lowValue}.",
    },
    empty: "Aucune donnée disponible pour cette sélection.",
    footer: "Données synthétiques · Conçu par Yusuf Khan",
  },
};

// Tiny template helper: fill("Hello {name}", { name: "Sam" }) -> "Hello Sam".
export function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? vars[key] : `{${key}}`
  );
}

const locale = (lang) => (lang === "fr" ? "fr-CA" : "en-CA");

export function formatCurrency(value, lang) {
  return new Intl.NumberFormat(locale(lang), {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value, lang) {
  return new Intl.NumberFormat(locale(lang), { maximumFractionDigits: 0 }).format(value);
}
