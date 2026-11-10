/** Site measured from the pincode dataset. */
export interface PinInfo {
  pin: string;
  name: string;
  district: string;
  state: string;
  lat: number;
  lon: number;
  el: number;
  rel: number;
  sl: number;
  rg: number;
  dc: number;
  dr: number;
  nb: number;
  off: number;
  cls: string;
  humid: boolean;
  tmax: number;
  rain: number;
  zone: string;
  haz: number[];
}

export interface Entity {
  name: string;
  sector: string;
  business: string;
  nas?: number;
  /** Physical sensitivity of the business, 0.6–1.4. */
  phys: number;
  /** Share of carbon cost passed to customers, 0–0.7. */
  pass: number;
  /** Policy, technology, market and reputation exposure, 1–5 each. */
  trans: number[];
  /** CBAM exposure: 0 none, 1 direct, 2 indirect. */
  cbam: number;
}

export interface Geo {
  place?: string;
  state?: string;
  country?: string;
  lat?: number;
  lon?: number;
  elev?: string;
  coast?: string;
  topo?: string;
  climate?: string;
  rain?: string;
  tmax?: string;
  seismic?: string;
  water?: string;
  land?: string;
}

/** Hazard: [score 1–5, reason, source]. */
export type HazardScore = [number, string, string?];

export interface Analysis {
  entity: Entity;
  geo: Geo;
  demo: { pop: string; density: string; notes: string };
  haz: HazardScore[];
  conf: string;
  note: string;
  pin?: PinInfo;
  /** Scores estimated before pincode grounding. */
  hai?: (number | null)[];
}

export interface Narrative {
  events: { y: number; t: string; d: string }[];
  ops: string[];
  ext: string[];
  vc: string[];
  risks: { phys: string[]; trans: string[] };
  opps: string[];
}

export interface Coverage {
  media: { t: string; tone: string; d: string; u?: string }[];
  policy: { n: string; l: string; d: string }[];
  practices: { c: string; d: string }[];
  peers: { n: string; d: string }[];
}

export type ProvKey = "rv" | "sit" | "av" | "em" | "vc" | "dd" | "cov";
export interface Prov {
  src: string;
  basis: string;
  conf: string;
}

export interface SiteSize {
  /** Built-up area, m². */
  a: number;
  /** Workers on site. */
  w: number;
}
export type Qty = [number, string];
