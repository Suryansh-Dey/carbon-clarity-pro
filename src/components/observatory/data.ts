// Static reference data for the Climate Risk Observatory.

export const SSP_OPTIONS = [
  "SSP1-2.6 · Low emissions",
  "SSP2-4.5 · Intermediate",
  "SSP5-8.5 · Very high emissions",
] as const;
export const SSP_SHORT = ["SSP1-2.6", "SSP2-4.5", "SSP5-8.5"] as const;
export const HORIZON_OPTIONS = [
  "2030 · 2021–2040 average",
  "2050 · 2041–2060 average",
  "2090 · 2081–2100 average",
] as const;
export const HORIZON_YEARS = [2030, 2050, 2090] as const;

/** IPCC AR6 WGI Table 4.5 — best estimates [ssp][horizon], °C vs 1850–1900. */
export const TEMPS = [
  [1.5, 1.7, 1.8],
  [1.5, 2.0, 2.7],
  [1.6, 2.4, 4.4],
];
/** Very likely (5–95%) ranges [ssp][horizon]. */
export const RANGES = [
  ["1.2–1.8", "1.3–2.2", "1.3–2.4"],
  ["1.2–1.8", "1.6–2.5", "2.1–3.5"],
  ["1.3–1.9", "1.9–3.0", "3.3–5.7"],
];

export const GEOGRAPHIES = [
  "World",
  "India",
  "Bangladesh",
  "United States",
  "Brazil",
  "Nigeria",
  "Indonesia",
] as const;

export const HAZARDS = [
  "Extreme heat",
  "Flood",
  "Drought",
  "Cyclone",
  "Sea-level rise",
  "Wildfire",
  "Landslide",
] as const;
export const ALL_HAZARDS = "All climate hazards";

/** Illustrative 1–5 sensitivity per hazard (order of HAZARDS). */
export const SECTORS: [string, number[]][] = [
  ["Agriculture", [5, 4, 5, 3, 3, 3, 2]],
  ["Power & energy", [4, 4, 4, 4, 3, 3, 3]],
  ["Transport & logistics", [4, 5, 2, 5, 4, 3, 4]],
  ["Buildings & real estate", [3, 5, 2, 4, 5, 4, 4]],
  ["Health & livelihoods", [5, 5, 4, 4, 4, 4, 4]],
];

export const IMPACTS = [
  [
    "Extreme heat",
    "Farms, cities, outdoor workers",
    "Labor productivity, cooling demand, crop stress",
    "Heat illness; outdoor worker income",
  ],
  [
    "Flood",
    "Settlements, farms, transport",
    "Asset damage, business interruption, crop losses",
    "Displacement; waterborne disease",
  ],
  [
    "Drought",
    "Agriculture, reservoirs, power",
    "Yield losses, water scarcity, generation constraints",
    "Food insecurity; livelihood pressure",
  ],
  [
    "Cyclone",
    "Coastal cities, ports, fisheries",
    "Wind and surge damage; disrupted trade",
    "Evacuation; injury; fishing income",
  ],
  [
    "Sea-level rise",
    "Coastal assets and deltas",
    "Chronic inundation, salinity, adaptation costs",
    "Housing insecurity; water salinization",
  ],
  [
    "Wildfire",
    "Forests, buildings, utilities",
    "Asset loss; interrupted power and tourism",
    "Smoke exposure; evacuation",
  ],
  [
    "Landslide",
    "Hill roads, settlements, hydro",
    "Infrastructure damage; access disruption",
    "Injury; isolated communities",
  ],
];

/** [name, lon, lat, qualitative profile] */
export const COUNTRIES: [string, number, number, string][] = [
  [
    "India",
    78,
    22,
    "Investigate monsoon flooding, extreme heat, drought and coastal cyclone exposure. Prioritize outdoor workers, farming livelihoods and critical infrastructure.",
  ],
  [
    "Bangladesh",
    90,
    24,
    "Investigate delta flooding, coastal inundation, cyclone and heat exposure; focus on settlements, agriculture and garment supply chains.",
  ],
  [
    "United States",
    -100,
    38,
    "Investigate regional heat, wildfire, inland flooding and coastal storm exposure; risk varies strongly by county and asset.",
  ],
  [
    "Brazil",
    -52,
    -13,
    "Investigate drought, heat, wildfire and flood exposure across agricultural, hydropower and urban systems.",
  ],
  [
    "Nigeria",
    8,
    9,
    "Investigate river and urban flooding, heat and water stress affecting livelihoods, health and power systems.",
  ],
  [
    "Indonesia",
    118,
    -3,
    "Investigate coastal flooding, extreme rainfall, landslides and heat. Assess geophysical hazards separately.",
  ],
];

export type Region = {
  name: string;
  states: string;
  summary: string;
  hazards: string[];
  exposure: string;
  actions: string[];
  evidence: string;
};

export const REGIONS: Region[] = [
  {
    name: "Indo-Gangetic plains",
    states: "Punjab, Haryana, Delhi, Uttar Pradesh and Bihar",
    summary: "Extreme heat, river flooding and water stress warrant local screening.",
    hazards: ["Extreme heat", "Flood", "Drought"],
    exposure:
      "Outdoor workers, dense urban populations, irrigated agriculture, roads and power demand.",
    actions: [
      "Implement heat action plans and shaded work/rest schedules.",
      "Validate floodplain exposure with river-basin inundation maps.",
      "Improve irrigation efficiency and water-demand planning.",
    ],
    evidence: "IMD heat/rainfall warnings; basin flood maps; population and crop grids",
  },
  {
    name: "Northeast & Brahmaputra basin",
    states: "Assam and neighboring northeastern states",
    summary:
      "River flooding, erosion and rainfall-triggered landslides require basin and slope-level analysis.",
    hazards: ["Flood", "Landslide"],
    exposure:
      "Riverine communities, tea and agriculture, roads, bridges and isolated hill settlements.",
    actions: [
      "Plan warning-to-evacuation routes and flood shelters.",
      "Screen bridges, slopes and essential access corridors.",
      "Protect river buffers and monitor erosion locally.",
    ],
    evidence: "NRSC inundation layers; IMD rainfall; elevation and slope data",
  },
  {
    name: "Eastern coast",
    states: "Odisha, West Bengal, Andhra Pradesh and Tamil Nadu",
    summary:
      "Investigate cyclone winds, storm surge, coastal flooding and long-term sea-level exposure.",
    hazards: ["Cyclone", "Sea-level rise", "Flood"],
    exposure:
      "Coastal settlements, fisheries, ports, rice agriculture, industry and power facilities.",
    actions: [
      "Use IMD cyclone warnings with locally approved evacuation triggers.",
      "Assess wind and surge design standards for critical assets.",
      "Restore suitable coastal ecosystems and protect drinking-water systems.",
    ],
    evidence: "IMD cyclone tracks; coastal elevation; surge and salinity studies",
  },
  {
    name: "Western coast & urban corridors",
    states: "Gujarat, Maharashtra, Goa, Karnataka and Kerala",
    summary:
      "Coastal hazards, urban flooding and heat require city-scale drainage and asset studies.",
    hazards: ["Flood", "Extreme heat", "Sea-level rise"],
    exposure: "Urban residents, real estate, ports, logistics, tourism and industrial facilities.",
    actions: [
      "Map drainage bottlenecks and preserve wetlands.",
      "Audit business continuity and power backup for essential services.",
      "Screen coastal assets for future inundation and sea-level rise.",
    ],
    evidence: "IMD rainfall; drainage maps; NRSC flood extent; asset registry",
  },
  {
    name: "Dryland & interior plateau",
    states: "Rajasthan and dryland areas of central and peninsular India",
    summary: "Investigate extreme heat, seasonal drought and water constraints.",
    hazards: ["Drought", "Extreme heat", "Wildfire"],
    exposure:
      "Rainfed farmers, livestock, outdoor workers, reservoirs and water-dependent industry.",
    actions: [
      "Diversify climate-resilient cropping and soil-water retention.",
      "Prepare heat-health plans and drinking-water contingency supplies.",
      "Stress-test water and power availability with drought scenarios.",
    ],
    evidence: "IMD rainfall and temperature; soil moisture; water and crop records",
  },
  {
    name: "Himalayan region",
    states: "Himalayan states and hill districts",
    summary:
      "Investigate intense rainfall, landslides and glacial-lake outburst flood exposure at catchment scale.",
    hazards: ["Landslide", "Flood"],
    exposure: "Mountain communities, roads, hydropower, tourism and downstream settlements.",
    actions: [
      "Inventory unstable slopes and glacial lakes with competent agencies.",
      "Review hydropower and road continuity under compound events.",
      "Develop accessible warnings and safe evacuation routes.",
    ],
    evidence: "NRSC terrain and landslide layers; lake inventories; rainfall and local studies",
  },
];

/** [name, url, status, description] */
export const SOURCES: [string, string, string, string][] = [
  [
    "World Bank screening tools",
    "https://climatescreeningtools.worldbank.org/",
    "Assessment method",
    "Early-stage climate and disaster screening; not a live hazard API.",
  ],
  [
    "UNEP FI Risk Centre",
    "https://www.unepfi.org/risk-centre/resources/",
    "Methodology library",
    "Physical and transition risk, sector guidance and scenario analysis.",
  ],
  [
    "ThinkHazard! / GFDRR",
    "https://thinkhazard.org/",
    "Screening portal · not ingested",
    "Location-based hazard awareness. Original layer terms vary; not an event forecast.",
  ],
  [
    "Climate TRACE",
    "https://api.climatetrace.org/v7/docs/index.html",
    "Public API documented · not connected",
    "Asset and sector emissions context. Emissions are not a physical damage estimate.",
  ],
  [
    "Google Flood Hub",
    "https://sites.research.google/floods/",
    "Forecast portal · API approval needed",
    "River flood forecasting. API access is limited to approved pilot participants; no feed connected here.",
  ],
  [
    "Esri Living Atlas",
    "https://livingatlas.arcgis.com/en/browse/",
    "Dataset catalog · not ingested",
    "GIS-ready climate and disaster layers. Check each item’s provenance, time stamp and license.",
  ],
  [
    "Oxford Climate Data 111+",
    "https://ora.ox.ac.uk/objects/uuid%3A3beb056d-54c9-46e1-88ea-76214916ca2d",
    "Open catalog · 2024 edition",
    "Catalog of hazard datasets, scenarios, resolutions and update frequencies; not a unified live API.",
  ],
  [
    "ISRO / NRSC Bhuvan",
    "https://bhuvan.nrsc.gov.in/",
    "India geospatial portal · not ingested",
    "Satellite-derived flood, cyclone and other disaster products; check access and service metadata.",
  ],
  [
    "NITI Aayog ICED",
    "https://iced.niti.gov.in/climate-and-environment/environment/natural-disaster",
    "India vulnerability context",
    "Natural-disaster vulnerability mapping; validate underlying dataset dates before use.",
  ],
  [
    "India Meteorological Department",
    "https://mausam.imd.gov.in/",
    "API adapters · access status shown",
    "India weather and cyclone warnings. Authoritative issue and validity times must accompany any integration.",
  ],
  [
    "IPCC AR6 WGI · Table 4.5",
    "https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-4/",
    "Scenario values embedded",
    "Global mean warming under SSP1-2.6, SSP2-4.5 and SSP5-8.5, with very likely ranges.",
  ],
  [
    "NASA EONET v3",
    "https://eonet.gsfc.nasa.gov/docs/v3",
    "Server feed · refresh every 15 min",
    "Curated event metadata. Limited completeness, variable event dates; not a comprehensive early warning service.",
  ],
  [
    "Atlas Bhuvan directory",
    "https://atlas.co/data-portals/bhuvan-isro/",
    "Secondary reference",
    "Discovery reference only. Official NRSC products and metadata take precedence.",
  ],
];

/** [name, description, url, status] */
export const AGENCIES: [string, string, string, string][] = [
  [
    "IMD · MoES",
    "Weather, cyclone, rainfall, heat and nowcast warnings",
    "https://mausam.imd.gov.in/index_en.php",
    "API adapters · access checked at retrieval",
  ],
  [
    "NDMA · SACHET",
    "CAP-based dissemination from authorized warning issuers",
    "https://sachet.ndma.gov.in/",
    "RSS connected · CAP details on demand",
  ],
  [
    "INCOIS · MoES",
    "Tsunami, high-wave, swell-surge and ocean advisories",
    "https://incois.gov.in/",
    "Official portal · no direct feed configured",
  ],
  [
    "CWC · Ministry of Jal Shakti",
    "River flood monitoring, forecasts and reservoir information",
    "https://cwc.gov.in/",
    "Official portal · CWC alerts may appear in SACHET",
  ],
  [
    "FSI · MoEFCC",
    "Near-real-time satellite forest-fire monitoring",
    "https://fsiforestfire.gov.in/",
    "Official portal · direct service access not configured",
  ],
  [
    "IITM / ESSO · Damini",
    "Location-based lightning information and alerts",
    "https://www.tropmet.res.in/28-Thunderstorm%20Dynamics-project",
    "Official app resource · no direct API configured",
  ],
  [
    "IMD geospatial services",
    "Weather maps and district-level geospatial products",
    "https://imdgeospatial.imd.gov.in/",
    "Official portal access",
  ],
  [
    "ISRO / NRSC · Bhuvan",
    "Satellite-derived inundation and disaster footprints",
    "https://bhuvan.nrsc.gov.in/",
    "Official portal · not an impact valuation feed",
  ],
  [
    "NCS · MoES",
    "Earthquake monitoring; separate geophysical risk assessment",
    "https://seismo.gov.in/",
    "Official portal · no SSP scaling",
  ],
];

/** Economic Survey 2025–26, Table 1.4 — FY2025–26 GVA, INR crore, current prices. */
export const GVA_GROUPS: [string, number][] = [
  ["Agriculture, forestry, fishing, mining & quarrying", 5936462],
  ["Manufacturing, construction, electricity, gas & water", 8171692],
  ["Trade, hotels, transport & communication", 5640741],
  ["Financing, real estate & professional services", 7657155],
  ["Public administration, defence & other services", 4941823],
];
export const GVA_TOTAL = 32347873;
export const GDP_TOTAL = 35713886;
export const ECONOMIC_SURVEY_URL =
  "https://www.indiabudget.gov.in/economicsurvey/doc/stat/tab1.4.pdf";

export const CHECKS = [
  "Asset locations and values verified",
  "Population and livelihood exposure dated",
  "Hazard ensembles and SSP coverage documented",
  "Vulnerability functions validated",
  "Compound event and adaptation assumptions recorded",
  "Response owners and warning thresholds assigned",
];

/** NASA EONET category ids per hazard filter. */
export const HAZARD_CATEGORY: Record<string, string> = {
  Flood: "floods",
  Wildfire: "wildfires",
  Cyclone: "severeStorms",
  Landslide: "landslides",
  Drought: "drought",
  "Extreme heat": "temperatureExtremes",
  "Sea-level rise": "none",
};
export const CLIMATE_CATEGORIES = [
  "wildfires",
  "floods",
  "severeStorms",
  "drought",
  "landslides",
  "temperatureExtremes",
];

/** IMD district warning code tables. */
export const IMD_COLORS: Record<string, string> = {
  "1": "Red",
  "2": "Orange",
  "3": "Yellow",
  "4": "Green",
};
export const IMD_WARNINGS: Record<string, string> = {
  "1": "No warning",
  "2": "Heavy rain",
  "3": "Heavy snow",
  "4": "Thunderstorm / lightning / squall",
  "5": "Hailstorm",
  "6": "Dust storm",
  "7": "Dust-raising wind",
  "8": "Strong wind",
  "9": "Heat wave",
  "10": "Hot day",
  "11": "Warm night",
  "12": "Cold wave",
  "13": "Cold day",
  "14": "Ground frost",
  "15": "Fog",
  "16": "Very heavy rain",
  "17": "Extremely heavy rain",
};

/** Equirectangular projection onto the 900×420 map viewBox. */
export const project = (lon: number, lat: number): [number, number] => [
  (lon + 180) * 2.5,
  (90 - lat) * 2.3333,
];

export const crore = (n: number) =>
  "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n) + " crore";

export function safeHttpsUrl(value: string, fallback = "https://eonet.gsfc.nasa.gov/") {
  try {
    const u = new URL(value);
    return u.protocol === "https:" ? u.href : fallback;
  } catch {
    return fallback;
  }
}

export type FinanceInputs = { exposure: number; days: number; damage: number; adaptation: number };

export type FinanceRow = {
  name: string;
  gva: number;
  exposed: number;
  gross: number;
  residual: number;
};

export type FinanceModel = {
  inputs: FinanceInputs;
  rows: FinanceRow[];
  exposed: number;
  gross: number;
  residual: number;
  avoided: number;
};

/** Conditional foregone-output stress test (throws on invalid inputs). */
export function calculateFinancial(inputs: FinanceInputs): FinanceModel {
  for (const [key, n] of Object.entries(inputs)) {
    if (!Number.isFinite(n) || n < 0 || n > (key === "days" ? 365 : 100)) {
      throw new Error(
        "Enter valid non-negative values: percentages 0–100 and duration 0–365 days.",
      );
    }
  }
  const { exposure, days, damage, adaptation } = inputs;
  const rows = GVA_GROUPS.map(([name, gva]) => {
    const exposed = (gva * exposure) / 100;
    const gross = (((exposed * days) / 365) * damage) / 100;
    return { name, gva, exposed, gross, residual: gross * (1 - adaptation / 100) };
  });
  const gross = rows.reduce((a, r) => a + r.gross, 0);
  return {
    inputs,
    rows,
    exposed: (GVA_TOTAL * exposure) / 100,
    gross,
    residual: gross * (1 - adaptation / 100),
    avoided: (gross * adaptation) / 100,
  };
}
