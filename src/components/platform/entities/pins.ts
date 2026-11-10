import { kmx as km } from "../cities/model";
import { PIN_STATES, SETTINGS } from "./data";
import type { Analysis, HazardScore, PinInfo } from "./types";

/** [pin, state, district, place, lat, lon, elevation m, height above low ground m, slope °, relief m,
 * km to coast, km to major river, pincodes within 5 km, post offices]. */
type PinRow = [
  number,
  number,
  number,
  string,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

export interface PinData {
  states: string[];
  districts: string[];
  map: Map<number, PinRow>;
  sorted: number[];
}

export async function loadPins(): Promise<PinData> {
  const r = await fetch("/data/pins.json");
  if (!r.ok) throw new Error("Could not load the pincode dataset (" + r.status + ")");
  const d = (await r.json()) as { states: string[]; districts: string[]; rows: PinRow[] };
  return {
    states: d.states,
    districts: d.districts,
    map: new Map(d.rows.map((x) => [x[0], x])),
    sorted: d.rows.map((x) => x[0]).sort((a, b) => a - b),
  };
}

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const isPin = (s: string) => /^[1-9]\d{5}$/.test(s);

/** Closest pincode in the dataset within the same 3-digit sorting district. */
export function nearestPin(D: PinData, n: number) {
  const P = D.sorted;
  let lo = 0,
    hi = P.length - 1;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (P[m] < n) lo = m + 1;
    else hi = m;
  }
  const c = [P[lo - 1], P[lo]].filter((p) => p && Math.floor(p / 1000) === Math.floor(n / 1000));
  return c.length ? c.sort((a, b) => Math.abs(a - n) - Math.abs(b - n))[0] : null;
}

/** Measured site profile and modelled hazard scores (1–5) for a pincode. */
export function pinInfo(D: PinData, p: string): PinInfo | null {
  const s = String(p || "").replace(/\s/g, "");
  if (!isPin(s)) return null;
  const r = D.map.get(+s);
  if (!r) return null;
  const [, si, di, name, lat, lon, el, rel, sl, rg, dc, dr, nb, off] = r,
    st = PIN_STATES[si];
  const cm = dc < 10 ? 7 : dc < 30 ? 5 : dc < 80 ? 2 : 0,
    tmax = st.heat - (6.5 * el) / 1000 - cm * st.cm;
  let rain = st.rain;
  if (dc < 60 && st.coastRain) rain = Math.max(rain, st.coastRain);
  const cyc = Math.max(st.cyc * Math.exp(-dc / 70), st.cycIn || 0),
    built = clamp(Math.log(1 + nb) / Math.log(26));
  const cls = nb >= 8 ? "Dense urban" : nb >= 3 ? "Urban / peri-urban" : "Rural",
    humid = dc < 60 || st.humid,
    d = SETTINGS[cls];
  let flood =
    (0.32 * clamp(1 - rel / 25) +
      0.22 * Math.exp(-dr / 6) +
      0.12 * clamp(1 - sl / 4) +
      0.14 * built +
      0.2 * rain) *
    (1.15 - 0.4 * d.drain);
  if (dc < 5 && el < 8) flood += 0.1;
  const heat = ((tmax - 30) / 12) * 0.8 + 0.18 * built - 0.12 * d.green + (humid ? 0.08 : 0);
  const slr = Math.exp(-dc / 5) * clamp(1 - el / 12) * 1.1;
  let land =
    0.55 * Math.pow(clamp(sl / 14), 0.8) + 0.25 * clamp(rg / 180) + 0.2 * rain * clamp(sl / 6);
  if (sl < 1.5 && rg < 15) land *= 0.3;
  const drought = (1 - rain) * 0.75 + ((tmax - 34) / 20) * 0.5;
  const t5 = (x: number) => +(1 + 4 * clamp(x)).toFixed(1);
  return {
    pin: s,
    name,
    district: D.districts[di],
    state: D.states[si],
    lat,
    lon,
    el,
    rel,
    sl,
    rg,
    dc,
    dr,
    nb,
    off,
    cls,
    humid,
    tmax: +tmax.toFixed(1),
    rain,
    zone: st.zone,
    haz: [t5(flood), t5(cyc), t5(drought), t5(heat), st.quake, t5(land), t5(slr)],
  };
}

function pinBasis(P: PinInfo) {
  return [
    `elevation ${P.el} m, ${P.rel} m above nearby low ground, ${km(P.dr)} km to a major river, slope ${P.sl}°`,
    `${km(P.dc)} km from the coast, ${P.state} cyclone exposure`,
    `state rainfall class and estimated summer maximum of ${P.tmax} °C`,
    `estimated summer maximum ${P.tmax} °C, ${P.humid ? "humid" : "dry"} heat, ${P.cls.toLowerCase()} setting`,
    `IS 1893 zone ${P.zone} (state-level)`,
    `slope ${P.sl}° and local relief ${P.rg} m`,
    `elevation ${P.el} m and ${km(P.dc)} km from the coast`,
  ];
}

/** Ground an analysis on measured pincode data: site profile, and hazards from the pincode model. */
export function groundA(D: PinData, A: Analysis, p: string) {
  const P = pinInfo(D, p);
  if (!P) return false;
  A.pin = P;
  A.note =
    "Location, elevation and distances come from pincode " +
    P.pin +
    " data; heat, rainfall and seismic inputs are state-level estimates";
  const g = (A.geo = A.geo || {});
  g.lat = P.lat;
  g.lon = P.lon;
  g.elev = `${P.el} m above sea level; ${P.rel} m above nearby low ground (pincode data)`;
  g.coast = `${km(P.dc)} km to the sea (pincode data)`;
  g.topo =
    (P.sl < 1.5 && P.rg < 15
      ? "Flat to gently undulating"
      : P.sl < 5
        ? "Undulating"
        : "Hilly to steep") +
    `; mean slope ${P.sl}°, local relief ${P.rg} m; ${km(P.dr)} km to the nearest major river` +
    (g.topo && !/pincode/.test(g.topo) ? " · " + g.topo : "");
  if (!g.tmax) g.tmax = `About ${P.tmax} °C average summer maximum (estimate)`;
  g.seismic =
    `IS 1893 zone ${P.zone} (state-level approximation)` +
    (g.seismic && !/state-level/.test(g.seismic) ? " · " + g.seismic : "");
  if (!g.place) g.place = P.name + ", " + P.district;
  if (!g.state) g.state = P.state;
  if (!g.country) g.country = "India";
  if (!g.land) g.land = `${P.cls} setting; ${P.nb} other pincodes within 5 km`;
  if (!g.climate)
    g.climate =
      (P.humid ? "Humid" : "Dry") +
      " heat regime; " +
      (P.rain > 0.75 ? "very heavy" : P.rain > 0.5 ? "heavy" : "moderate") +
      " monsoon rainfall (state class)";
  if (!g.rain) g.rain = `State rainfall class ${Math.round(P.rain * 100)}/100 (estimate)`;
  if (!g.water)
    g.water = `${km(P.dr)} km to a major river (Natural Earth); check groundwater status with CGWB`;
  const B = pinBasis(P),
    ai = A.hai || (A.haz || []).map((x) => (x && x[1] ? +x[0] : null));
  A.hai = ai;
  const old = (A.haz || []).map((x) =>
    x && x[1] ? String(x[1]).replace(/ ?Measured basis:.*$/, "") : "",
  );
  A.haz = P.haz.map((m, i): HazardScore => {
    let s = m,
      src = "Pincode model";
    if (i == 2 && ai[2]) {
      s = +((m + ai[2]) / 2).toFixed(1);
      src = "Pincode model + AI";
    }
    if (i == 4) {
      src = "State seismic table";
      if (ai[4]) {
        s = Math.max(m, ai[4]);
        if (ai[4] > m) src = "AI (local zone)";
      }
    }
    return [s, (old[i] ? old[i] + " " : "") + "Measured basis: " + B[i] + ".", src];
  });
  return true;
}

/** Pincode-only analysis of a site: no company narrative, everything else from measured data. */
export function baseA(D: PinData, p: string, name: string, nas: number): Analysis | null {
  const P = pinInfo(D, p);
  if (!P) return null;
  const A: Analysis = {
    entity: {
      name: name || "Site at pincode " + P.pin,
      sector: "Not specified",
      nas: nas || 1,
      business: `Pincode-only screening of the site at ${P.name}, ${P.district}.`,
      phys: 1,
      pass: 0.4,
      trans: [3, 3, 3, 3],
      cbam: 0,
    },
    geo: {},
    demo: {
      pop: "Census figures not loaded",
      density: `${P.cls} (${P.nb} other pincodes within 5 km)`,
      notes: "Add ward or tehsil census data on population, vulnerable groups and workforce.",
    },
    haz: [],
    conf: "medium (measured terrain, modelled climate)",
    note: "Hazards come from the pincode model.",
  };
  groundA(D, A, p);
  return A;
}
