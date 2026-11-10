// Calculation model for the Cities module, ported from the CliSo climate risk platform.
// Every formula matches the original; "c" is the selected city or district.
import { fmt } from "../format";
import { CITY_PROFILES, GDP_BASE, GDP_GROWTH, NOWCAST } from "./data/cities";
import {
  COUNTRIES,
  CROPS,
  EVENT_PARAMS,
  HAZARDS,
  SECTOR_STOP,
  SENS,
  SLR,
  STATE_AGRI,
  WARMING,
  WARMING_NOW,
  ZONES,
} from "./data/content";

export type Country = "IN" | "NP" | "LK" | "XX";
export type Currency = "L" | "U";

export interface CityProfile {
  id: string;
  name: string;
  country: Country;
  region: string;
  lat: number;
  lon: number;
  elev: string;
  coast: string;
  rivers: string;
  popM: number;
  popBasis: string;
  area: number;
  areaBasis: string;
  slum: number;
  slumBasis: string;
  age65: number;
  age14: number;
  informal: number;
  gdp: number;
  gdpBasis: string;
  sec: number[];
  liv: string[];
  pot: string[];
  plans: [string, string, string][];
  ev: [number, string, string][];
  haz: number[];
  hn: string[];
  ec: string[];
  conf: string;
}

export interface NowcastInput {
  b: number;
  bd: string;
  bs: string;
  r: number;
  r2?: number;
  rs: string;
  core: [number, number, string];
  age: [number, number];
}

/** Census 2011 district indicators, as shares (0–1). */
export interface Census {
  lit: number;
  sc: number;
  st: number;
  work: number;
  agri: number;
  hhi: number;
  oth: number;
  marg: number;
  urb: number;
  elec: number;
  lpg: number;
  net: number;
  car: number;
  comp: number;
  lat: number;
  tap: number;
  dil: number;
  grad: number;
  a029: number;
  a50: number;
  fem: number;
}

export interface DistrictInfo {
  dname: string;
  I: Census;
  vi: number;
  par: [string, number][];
  aka: string[];
  dc: number;
  sl: number;
  pins: number;
  offs: number;
  urb: number;
  agri: number;
}

export interface City extends CityProfile {
  nc?: NowcastInput;
  /** Profile values before the nowcast was applied. */
  base?: { pop: number; a65: number; a14: number; gdp: number };
  district?: DistrictInfo;
}

export interface Inputs {
  pop: number;
  gdp: number;
  slum: number;
  a65: number;
  a14: number;
  inf: number;
}
export type RawInputs = Record<keyof Inputs | "fx", string>;

const YR = 365.2425 * 864e5;

export function grow(n: NowcastInput, y: number) {
  return n.r2 == null
    ? Math.pow(1 + n.r, y)
    : Math.pow(1 + n.r, Math.min(y, 10)) * Math.pow(1 + n.r2, Math.max(0, y - 10));
}

export function yearsSince(date: string, t: number) {
  return (t - Date.parse(date)) / YR;
}

export function nowcast(c: City, t: number) {
  const n = c.nc;
  if (!n || !c.base) return null;
  const y = yearsSince(n.bd, t),
    gr = grow(n, y),
    gy = yearsSince(GDP_BASE, t);
  return {
    y,
    pop: n.b * gr,
    core: n.core[0] * gr,
    dens: (n.core[0] * gr * 1e6) / n.core[1],
    unc: Math.min(0.25, 0.007 * y),
    a65: Math.max(0.02, c.base.a65 + (n.age[0] / 100) * y),
    a14: Math.max(0.1, c.base.a14 + (n.age[1] / 100) * y),
    gdp: c.base.gdp * Math.pow(1 + (GDP_GROWTH[c.country] ?? 0.04), gy),
    n,
  };
}

function applyNow(c: City, t: number) {
  const n = c.nc;
  if (!n) return;
  if (!c.base) c.base = { pop: c.popM, a65: c.age65, a14: c.age14, gdp: c.gdp };
  const k = nowcast(c, t)!;
  c.popM = +k.pop.toFixed(4);
  c.age65 = +k.a65.toFixed(3);
  c.age14 = +k.a14.toFixed(3);
  c.gdp = +k.gdp.toFixed(3);
  c.area = n.core[1];
  c.areaBasis = n.core[2] + " (core municipal area, used for density)";
  c.popBasis =
    "Nowcast for today: " +
    n.bs +
    ", grown at " +
    (n.r * 100).toFixed(2) +
    "% a year (" +
    n.rs +
    ")";
  c.gdpBasis =
    "Nowcast for today at " +
    ((GDP_GROWTH[c.country] ?? 0.04) * 100).toFixed(1) +
    "% nominal US$ growth a year from mid-2024; base: " +
    c.gdpBasis;
}

export function buildCities(t: number): City[] {
  return CITY_PROFILES.map((p) => {
    const c: City = { ...p, nc: NOWCAST[p.id] };
    applyNow(c, t);
    return c;
  });
}

export function dens(c: City, I: Inputs, t: number) {
  const k = nowcast(c, t);
  return k ? k.dens * (I.pop / c.popM) : (I.pop * 1e6) / (c.area || 1);
}

export function country(c: City) {
  return COUNTRIES[c.country] ?? COUNTRIES.XX;
}

/** Formats US$ billion in the city's currency, as lakh crore / crore for India. */
export function makeMoney(c: Pick<City, "country">, currency: Currency, fxInput: number) {
  const cty = COUNTRIES[c.country] ?? COUNTRIES.XX,
    fx = fxInput || cty.fx;
  return (usdBn: number, dp?: number) => {
    if (currency === "U" || cty.cur === "USD") return "US$ " + fmt(usdBn * 1000, dp ?? 0) + " m";
    if (c.country === "IN") {
      const cr = usdBn * fx * 100;
      return cr >= 1e5 ? "₹ " + fmt(cr / 1e5, 2) + " lakh crore" : "₹ " + fmt(cr, 0) + " crore";
    }
    return cty.sym + fmt(usdBn * fx, 1) + " bn";
  };
}
export type Money = ReturnType<typeof makeMoney>;

const num = (s: string) => {
  const v = parseFloat(s);
  return isFinite(v) ? v : 0;
};

export function rawInputs(c: City): RawInputs {
  return {
    pop: String(c.popM),
    gdp: String(c.gdp),
    slum: String(Math.round(c.slum * 100)),
    a65: String(Math.round(c.age65 * 100)),
    a14: String(Math.round(c.age14 * 100)),
    inf: String(Math.round(c.informal * 100)),
    fx: String(country(c).fx),
  };
}

export function readInputs(c: City, raw: RawInputs): Inputs {
  return {
    pop: num(raw.pop) || c.popM,
    gdp: num(raw.gdp) || c.gdp,
    slum: num(raw.slum) / 100,
    a65: num(raw.a65) / 100,
    a14: num(raw.a14) / 100,
    inf: num(raw.inf) / 100,
  };
}

export function profileInputs(c: City): Inputs {
  return {
    pop: c.popM,
    gdp: c.gdp,
    slum: c.slum,
    a65: c.age65,
    a14: c.age14,
    inf: c.informal,
  };
}

/** Hazard scores (1–5) for a scenario and horizon. */
export function scen(c: City, si: number, hi: number) {
  const dT = Math.max(0, WARMING[si][hi] - WARMING_NOW);
  return c.haz.map((s, i) =>
    Math.min(5, s * (1 + SENS[i] * dT * (i == 1 ? 1 + SLR[si][hi] * 2 : 1))),
  );
}

/** Share of residents in the hazard footprint. */
export const expShare = (i: number, s: number) =>
  i == 3 || i == 7 ? (s >= 2.5 ? 1 : 0.5) : Math.min(0.85, 0.025 * s * s);

export function vulnShare(I: Inputs) {
  return Math.min(0.9, I.slum + 0.5 * (I.a65 + I.a14) + 0.3 * I.inf * (1 - I.slum));
}

export function people(hs: number[], I: Inputs) {
  const V = vulnShare(I);
  return hs.map((s, i) => {
    const e = I.pop * expShare(i, s),
      over = i == 0 || i == 1 || i == 5 ? 1.3 : 1,
      v = Math.min(e, e * Math.min(0.95, V * over));
    return { e, v };
  });
}

export type EconRow =
  | {
      i: number;
      type: "event";
      p: number;
      days: number;
      ev: number;
      outL: number;
      dmg: number;
      eal: number;
    }
  | { i: number; type: "chronic"; pct: number; eal: number };

export function econ(c: City, hs: number[], I: Inputs) {
  const day = I.gdp / 365,
    assets = I.gdp * 2.5,
    sec = c.sec.map((x) => x / 100),
    rows: EconRow[] = [],
    bySec = sec.map(() => 0);
  hs.forEach((s, i) => {
    const e = EVENT_PARAMS[i];
    if (e) {
      const p = Math.min(0.5, e.pb * Math.pow(e.g, s - 1)),
        days = e.d * (s / 3),
        stop = sec.reduce((a, w, k) => a + w * SECTOR_STOP[k][i], 0),
        outL = day * days * stop * (s >= 1.5 ? 1 : 0.3),
        dmg = assets * expShare(i, s) * e.dm * (s / 3),
        ev = outL + dmg;
      sec.forEach((w, k) => (bySec[k] += p * day * days * w * SECTOR_STOP[k][i]));
      rows.push({ i, type: "event", p, days, ev, outL, dmg, eal: p * ev });
    } else {
      let pct = 0;
      if (i == 3) {
        const outdoor = sec[1] * 0.5 + sec[2] + sec[3] + sec[5] * 0.5 + (sec[6] || 0);
        pct = outdoor * 0.006 * Math.max(0, s - 1);
        sec.forEach(
          (w, k) =>
            (bySec[k] += I.gdp * w * 0.006 * Math.max(0, s - 1) * [0.1, 0.5, 1, 1, 0.2, 0.5, 1][k]),
        );
      }
      if (i == 4) {
        pct =
          0.0025 *
          Math.max(0, s - 1) *
          (sec[2] + sec[5] + 0.3 * sec[4] + 0.2 + 1.5 * (sec[6] || 0));
        sec.forEach(
          (w, k) =>
            (bySec[k] +=
              I.gdp * w * 0.0025 * Math.max(0, s - 1) * [0.2, 0.2, 1, 0.4, 0.3, 1, 1.5][k]),
        );
      }
      if (i == 7) {
        pct = 0.002 * Math.max(0, s - 1);
        sec.forEach(
          (w, k) =>
            (bySec[k] +=
              I.gdp * w * 0.002 * Math.max(0, s - 1) * [0.6, 1.2, 0.8, 1.4, 0.8, 1.4, 0.6][k]),
        );
      }
      rows.push({ i, type: "chronic", pct, eal: I.gdp * pct });
    }
  });
  const tot = rows.reduce((a, x) => a + x.eal, 0);
  return { rows, tot, pct: (tot / I.gdp) * 100, bySec };
}

/** Hazard indices ordered by score, highest first. */
export function ranked(hs: number[]) {
  return HAZARDS.map((_, i) => i).sort((a, b) => hs[b] - hs[a]);
}

/** Urban area used to size measures: districts count only their built-up share. */
export const urbanArea = (c: City) =>
  c.district ? c.area * Math.min(1, 0.03 + 0.2 * c.district.urb) : c.area;

/** 20-year annuity factor. */
export const annuity = (r: number, n: number) => (1 - Math.pow(1 + r, -n)) / r;

// Tangible city measures: hazard, name, specification, quantity, US$ per unit (low, high),
// share of the hazard's expected annual loss avoided, KPI, reference.
export const MEASURES: [
  number,
  string,
  string,
  (c: City, I: Inputs) => [number, string],
  number,
  number,
  number,
  string,
  string,
][] = [
  [
    0,
    "Storm-water drain upgrade",
    "Widen and de-silt primary and secondary drains; remove encroachments at choke points",
    (c) => [Math.round(urbanArea(c) * 0.3), "km"],
    6e5,
    1.5e6,
    0.3,
    "Waterlogging hours; flood spots cleared",
    "NDMA Urban Flooding 2010; CPHEEO manual",
  ],
  [
    0,
    "Lake, wetland and floodplain restoration",
    "Restore storage and connect lakes to drains (sponge city)",
    (c) => [Math.round(urbanArea(c) * 0.4), "ha"],
    1e4,
    3e4,
    0.15,
    "Hectares restored; storage added (m³)",
    "Ramsar; AMRUT 2.0",
  ],
  [
    0,
    "Flood early warning and control room",
    "Rain gauges, river and drain sensors, ward alerts",
    () => [1, "system"],
    1e6,
    3e6,
    0.04,
    "Lead time of warnings; share of wards covered",
    "Sendai Priority 4",
  ],
  [
    1,
    "Mangrove and coastal buffer restoration",
    "Restore and protect mangroves and dunes on the exposed coast",
    () => [300, "ha"],
    5e3,
    1.5e4,
    0.15,
    "Hectares protected; erosion rate",
    "CRZ 2019; MISHTI scheme",
  ],
  [
    1,
    "Coastal protection at critical assets",
    "Sea walls or raised edges only where nature-based options cannot protect critical assets",
    () => [5, "km"],
    4e6,
    1e7,
    0.25,
    "Critical assets above surge level",
    "Coast protection guidelines",
  ],
  [
    2,
    "Cyclone shelters and safe schools",
    "Multi-purpose shelters for exposed vulnerable residents (about 2,000 people each)",
    (_, I) => [Math.max(5, Math.round((I.pop * 1e6 * I.slum * 0.2) / 2000)), "shelters"],
    1.5e5,
    3e5,
    0.2,
    "People within 2.5 km of a shelter",
    "NDMA Cyclone 2008; Odisha model",
  ],
  [
    2,
    "Underground power cabling on critical routes",
    "Move feeder lines to hospitals, pumping and telecoms underground",
    (c) => [Math.round(urbanArea(c) * 0.15), "km"],
    1.5e5,
    4e5,
    0.25,
    "Hours to restore critical feeders",
    "State power utilities",
  ],
  [
    3,
    "Heat action plan",
    "Early warning, cooling centres, hospital readiness, work-hour rules, outreach in local languages",
    (_, I) => [Math.round(I.pop * 1e6), "residents (per year)"],
    0.15,
    0.4,
    0.05,
    "Heat deaths and admissions; alert reach",
    "NDMA Heat Wave 2019; Ahmedabad model",
  ],
  [
    3,
    "Cool roofs for low-income homes",
    "Reflective coating or modular cool roofs for informal settlement homes (about 30% of homes)",
    (_, I) => [Math.round(((I.pop * 1e6 * I.slum) / 4.5) * 0.3), "homes"],
    40,
    120,
    0.15,
    "Homes covered; indoor peak temperature",
    "Mahila Housing Trust and city cool-roof programmes",
  ],
  [
    4,
    "Treated wastewater reuse",
    "Tertiary treatment and reuse for industry and non-potable use (20% of supply)",
    (_, I) => [Math.round((I.pop * 0.135 * 1000 * 0.2) / 1000), "MLD"],
    3e5,
    6e5,
    0.35,
    "MLD reused; freshwater demand",
    "AMRUT 2.0; national reuse framework",
  ],
  [
    4,
    "Leakage and non-revenue water reduction",
    "District metering, pressure management, pipe replacement",
    () => [1, "programme"],
    5e6,
    2e7,
    0.2,
    "Non-revenue water (%)",
    "CPHEEO; IWA methods",
  ],
  [
    5,
    "Slope stabilisation at mapped sites",
    "Drainage, retaining structures and bioengineering at hazard-mapped slopes",
    () => [20, "sites"],
    2e5,
    8e5,
    0.4,
    "Sites treated; landslide incidents",
    "NDMA Landslides 2009; GSI maps",
  ],
  [
    6,
    "Retrofit schools and hospitals",
    "Seismic assessment and retrofit of public schools and hospitals",
    (_, I) => [Math.round((I.pop * 1e6) / 4000), "buildings"],
    5e4,
    1.5e5,
    0.25,
    "Share of critical buildings retrofitted",
    "IS 1893, IS 15988; NBC 105 (Nepal)",
  ],
  [
    6,
    "Building-code enforcement",
    "Plan checks and site inspection capacity in the municipality",
    () => [1, "programme"],
    1e6,
    4e6,
    0.15,
    "Permits checked for seismic compliance",
    "NDMA; national building codes",
  ],
  [
    7,
    "Electric buses",
    "Replace diesel buses and expand public transport",
    (_, I) => [Math.round((I.pop * 1e6) / 10000), "buses"],
    1.5e5,
    2.5e5,
    0.15,
    "Fleet share electric; PM2.5 trend",
    "PM e-Bus Sewa; NCAP",
  ],
  [
    7,
    "Dust and waste-burning control",
    "Mechanised sweeping, construction dust rules, waste collection to stop open burning",
    () => [1, "programme"],
    2e6,
    8e6,
    0.2,
    "Severe-AQI days; PM10 trend",
    "NCAP; GRAP",
  ],
];

// ---------- All-India districts ----------

const CENSUS_KEYS: (keyof Census)[] = [
  "lit",
  "sc",
  "st",
  "work",
  "agri",
  "hhi",
  "oth",
  "marg",
  "urb",
  "elec",
  "lpg",
  "net",
  "car",
  "comp",
  "lat",
  "tap",
  "dil",
  "grad",
  "a029",
  "a50",
  "fem",
];

/** One row of districts.json, in this order. */
export type DistrictRow = [
  name: string,
  stateIndex: number,
  lat: number,
  lon: number,
  area: number,
  pop2011: number,
  growth: number,
  stateGrowth: number,
  haz: number[],
  elev: [number, number, number],
  coastKm: number,
  riverKm: number,
  slope: number,
  relief: number,
  tmax: number,
  rain: number,
  zone: string,
  built: number,
  pins: number,
  offices: number,
  census: number[],
  gdp: number,
  vi: number,
  parts: [string, number][],
];

export const kmx = (x: number) =>
  x < 1 ? "under 1" : x < 10 ? x.toFixed(1) : Math.round(x).toLocaleString("en-IN");
export const pctx = (x: number) => fmt(x * 100, 0) + "%";
const slug = (s: string) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function mkDist(r: DistrictRow, states: string[], t: number): City {
  const [, si, lat, lon, area, p11, rr, rs, haz, el, dc, dr, sl, rel, tmax, rain, zone] = r;
  const [pins, offs, iv, gdp, vi, par] = [r[18], r[19], r[20], r[21], r[22], r[23]];
  let name = r[0];
  const I = {} as Census;
  CENSUS_KEYS.forEach((k, j) => (I[k] = iv[j]));
  const st = states[si],
    id = "d-" + slug(st) + "-" + slug(name);
  const cname = name.replace(/\(.*\)/, "").trim(),
    top = par[0];
  if (top && top[1] >= 60 && slug(top[0]) != slug(cname)) name = top[0] + " (" + cname + ")";
  else name = cname;
  const aka = par.map((p) => p[0]).filter((x) => slug(x) != slug(cname));
  const slum = Math.min(
    0.6,
    0.17 * I.urb * (0.6 + (1 - I.tap)) + 0.4 * I.dil + 0.05 * (1 - I.lat) * (1 - I.urb),
  );
  const oth = I.oth,
    raw = [
      oth * (0.04 + 0.25 * I.urb * I.urb + 1.5 * I.comp),
      oth * 0.28,
      I.hhi * 0.5 + oth * (0.12 + 0.15 * I.urb),
      oth * 0.14,
      oth * 0.2,
      oth * 0.04,
      I.agri * 0.22,
    ];
  const rs0 = raw.reduce((a, b) => a + b, 0) || 1;
  const sec = raw.map((x) => Math.round((x / rs0) * 100));
  sec[1] += 100 - sec.reduce((a, b) => a + b, 0);
  const liv = (
    [
      ["Cultivators and farm labourers", I.agri],
      ["Household industry (handloom, crafts, food processing at home)", I.hhi],
      ["Other work: services, factories, trade, construction, transport", I.oth],
    ] as [string, number][]
  )
    .sort((a, b) => b[1] - a[1])
    .map((x) => x[0] + ": " + pctx(x[1]) + " of workers (Census 2011)");
  liv.push(
    "Marginal workers, with under six months of work a year: " + pctx(I.marg) + " of workers",
  );
  liv.push("Work participation: " + pctx(I.work) + " of all residents");
  const pot: string[] = [];
  if (I.agri > 0.4)
    pot.push(
      "Climate-resilient farming: micro-irrigation (PMKSY), crop insurance (PMFBY), heat- and flood-tolerant seed, farmer producer organisations",
    );
  if (I.urb > 0.4)
    pot.push(
      "Urban growth: AMRUT 2.0 water and drainage, metro and e-bus transport, industrial and logistics parks",
    );
  if (dc < 30)
    pot.push(
      "Blue economy: fisheries, ports and coastal tourism, with mangroves as natural protection",
    );
  if (sl > 5)
    pot.push(
      "Hill economy: horticulture, eco-tourism and small hydro, planned around slope and landslide risk",
    );
  pot.push("Rooftop solar (PM Surya Ghar) and solar pumps (PM-KUSUM) for energy security");
  const plans: [string, string, string][] = [
    [
      "District Disaster Management Plan",
      "Updated yearly",
      "Prepared by the District Disaster Management Authority under the Disaster Management Act 2005",
    ],
    [
      "State Action Plan on Climate Change",
      st,
      "State SAPCC (updated SAPCC 2.0 in most states) sets district-relevant adaptation priorities",
    ],
  ];
  if (haz[3] >= 3.3)
    plans.push([
      "Heat Action Plan",
      "NDMA guidelines 2019",
      "States and many districts now issue heat action plans with early warning and cooling centres",
    ]);
  if (I.agri > 0.4)
    plans.push([
      "District Irrigation Plan and District Agriculture Contingency Plan",
      "PMKSY / ICAR-CRIDA",
      "Crop and water plans for weak monsoon, flood and heat years",
    ]);
  if (I.urb > 0.5)
    plans.push([
      "Master plan or development plan",
      "Urban local body",
      "Land use, drainage and transport plans for the urban area",
    ]);
  const ec = [
    "EIA Notification 2006: Category A projects need MoEFCC clearance and Category B projects need the State Environment Impact Assessment Authority (SEIAA)",
    "Consent to Establish and Consent to Operate from the State Pollution Control Board",
  ];
  if (dc < 10)
    ec.unshift(
      "Coastal Regulation Zone Notification 2019 applies near the coast and tidal creeks; clearance via the State Coastal Zone Management Authority",
    );
  if (I.st > 0.25)
    ec.push(
      "Scheduled Tribe population " +
        pctx(I.st) +
        ": Fifth or Sixth Schedule areas may apply; Forest Rights Act 2006 and PESA consent of gram sabhas are needed for forest or tribal land",
    );
  if (sl > 4 || I.st > 0.25)
    ec.push(
      "Forest land diversion needs approval under the Van (Sanrakshan Evam Samvardhan) Adhiniyam 1980, as amended in 2023",
    );
  ec.push(
    "Check eco-sensitive zones around protected areas and wetlands notified under the Wetlands Rules 2017",
  );
  const hn = [
    "Pincode model across " +
      pins +
      " pincodes: lowest ground " +
      el[0] +
      " m, " +
      kmx(dr) +
      " km to a major river, rainfall class " +
      Math.round(rain * 100) +
      "/100",
    dc < 1
      ? "Coastal district; lowest pincode at " + el[0] + " m"
      : kmx(dc) + " km from the sea at the closest pincode; lowest ground " + el[0] + " m",
    st + " cyclone exposure, decaying with distance inland",
    "Estimated summer maximum about " +
      tmax +
      " °C (state value adjusted for elevation and sea breeze), plus urban heat",
    "State rainfall class and heat; check the CGWB groundwater category of each block",
    "Mean slope " + sl + "°, local relief up to " + rel + " m",
    "IS 1893 zone " + zone + " (state-level approximation)",
    "Screening proxy: regional pollution level (highest on the Indo-Gangetic plain) plus urban density; check CPCB AQI and NCAP status",
  ];
  const c: City = {
    id,
    name: name + " district",
    country: "IN",
    region: st,
    lat,
    lon,
    elev: el[0] + "–" + el[2] + " m; median " + el[1] + " m across " + pins + " pincodes",
    coast:
      dc < 5
        ? "Coastal district; the nearest pincode is under 5 km from the sea"
        : "Inland; " + kmx(dc) + " km from the sea at the closest point",
    rivers: kmx(dr) + " km from the nearest major river (Natural Earth 1:10m)",
    popM: p11,
    popBasis: "",
    area,
    areaBasis: "",
    slum,
    slumBasis:
      "Proxy from Census 2011 houselisting (urban share, dilapidated houses, no tap water, no latrine). India publishes no district slum count after 2011",
    age65: 0.35 * I.a50,
    age14: 0.55 * I.a029,
    informal: Math.min(0.95, 0.62 + 0.3 * I.agri + 0.1 * I.marg),
    gdp,
    gdpBasis:
      "Modelled: India GDP 2024-25 (MoSPI, about US$3.9 trillion) shared across states by per-capita NSDP and within the state by census affluence indicators. Most states publish no district GDP",
    sec,
    liv,
    pot,
    plans,
    ev: [],
    haz: haz.slice(),
    hn,
    ec,
    conf: "screening",
    district: { dname: name, I, vi, par, aka, dc, sl, pins, offs, urb: I.urb, agri: I.agri },
    nc: {
      b: p11,
      bd: "2011-03-01",
      bs: "Census of India 2011 district population",
      r: rr,
      rs:
        "state growth of " +
        (rs * 100).toFixed(2) +
        "% a year from Census 2011 to the MoHFW Technical Group projection for 2021, adjusted for the district’s urban share; growth after 2021 slowed by a quarter, matching the Technical Group’s national path (1.19% a year in 2011–21, about 0.89% in 2021–26)",
      r2: 0.75 * rr,
      core: [p11, area, name + " district (2011 boundary)"],
      age: [0.13, -0.4],
    },
  };
  applyNow(c, t);
  c.areaBasis = "District area from 2011 census boundaries (DataMeet)";
  return c;
}

export interface DistrictData {
  states: string[];
  list: City[];
}

export async function loadDistricts(t: number): Promise<DistrictData> {
  const m = await import("./data/districts.json");
  const data = m.default as unknown as { DSTATES: string[]; DROWS: DistrictRow[] };
  return { states: data.DSTATES, list: data.DROWS.map((r) => mkDist(r, data.DSTATES, t)) };
}

/** Find a district from typed text: exact, then name, then former names, then prefixes. */
export function findDistrict(list: City[], text: string) {
  const v = text.trim().toLowerCase();
  if (!v) return undefined;
  const v0 = v.split(",")[0].trim();
  const d = (c: City) => c.district!;
  return (
    list.find((c) => (d(c).dname + ", " + c.region).toLowerCase() === v) ||
    list.find((c) => d(c).dname.toLowerCase() === v0) ||
    list.find((c) => d(c).aka.some((a) => a.toLowerCase() === v0)) ||
    list.find((c) => d(c).dname.toLowerCase().startsWith(v0)) ||
    list.find((c) => d(c).aka.some((a) => a.toLowerCase().startsWith(v0)))
  );
}

export function nearestDistrict(list: City[], c: City) {
  let best: { d: City; k: number } | null = null;
  for (const d of list) {
    const k = Math.hypot(d.lat - c.lat, (d.lon - c.lon) * Math.cos((c.lat * Math.PI) / 180));
    if (!best || k < best.k) best = { d, k };
  }
  return best?.d;
}

export function districtRows(list: City[], si: number, hi: number) {
  return list.map((c) => {
    const I = profileInputs(c),
      hs = scen(c, si, hi),
      E = econ(c, hs, I),
      v = vulnShare(I);
    return {
      c,
      hs,
      E,
      I,
      v,
      eal: E.pct,
      ealv: E.tot,
      hot: hs.filter((x) => x >= 3.5).length,
      vi: c.district!.vi,
      vuln: I.pop * v,
      pop: I.pop,
      dens: (I.pop * 1e6) / c.area,
    };
  });
}
export type DistrictResult = ReturnType<typeof districtRows>[number];

// ---------- Farming, nature and economy ----------

export function zoneOf(c: City) {
  const s = STATE_AGRI[c.region] || ["CP", 1000, 0.4];
  let z = s[0];
  const dc = c.district?.dc ?? Infinity,
    sl = c.district?.sl ?? 0,
    lon = c.lon,
    lat = c.lat;
  if (c.region === "Rajasthan" && lon < 74.6) z = "WD";
  if (c.region === "Uttar Pradesh" && lon > 81.8) z = "MG";
  if (c.region === "Uttar Pradesh" && lat < 26 && lon < 81) z = "CP";
  if (c.region === "West Bengal" && lat > 26.3) z = "EH";
  if (c.region === "Odisha" && dc < 70) z = "EC";
  if ((c.region === "Andhra Pradesh" || c.region === "Tamil Nadu") && dc < 60) z = "EC";
  if ((c.region === "Karnataka" || c.region === "Maharashtra") && dc < 60) z = "WC";
  if (c.region === "Madhya Pradesh" && lon > 80.5) z = "EP";
  if (c.region === "Uttar Pradesh" && sl > 4) z = "WH";
  return z;
}

export function agBase(c: City) {
  const s = STATE_AGRI[c.region] || ["CP", 1000, 0.4],
    zk = c.district ? zoneOf(c) : s[0],
    Z = ZONES[zk];
  return {
    zk,
    Z,
    crops: Z.crops.map((k, i) => ({ k, sh: [35, 25, 18, 12, 10][i] })),
    irr: s[2],
    rain: s[1],
    soil: Z.soil,
    eco: [Z.eco],
    src: "State and agro-climatic zone baseline",
  };
}

/** Yield loss (%) for a crop under warming dT and the scenario's drought, flood and cyclone scores. */
export function cropImpact(k: string, irr: number, dT: number, hs: number[]) {
  const c = CROPS[k];
  if (!c) return 0;
  const s = c.si == null ? c.s * (1 - 0.25 * irr) : irr * c.si + (1 - irr) * c.s;
  const loss =
    s * dT +
    Math.max(0, hs[4] - 2.5) * c.w * 3 * (1 - 0.5 * irr) +
    Math.max(0, hs[0] - 2.5) * c.fl * 2.5 +
    (k === "fish" || k === "coconut" ? Math.max(0, hs[2] - 2.5) * 2 : 0);
  return Math.min(70, Math.max(0, loss));
}
