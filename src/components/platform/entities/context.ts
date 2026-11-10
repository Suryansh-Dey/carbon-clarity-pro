import type { City } from "../cities/model";
import type { CityVals, Horizon, Plan, Site } from "./model";
import type { Analysis, Coverage, Narrative } from "./types";

export type EntTab =
  | "site"
  | "chain"
  | "risks"
  | "media"
  | "policy"
  | "finance"
  | "resilience"
  | "report"
  | "slides"
  | "city"
  | "live"
  | "dict";

/** Everything an Entities tab needs to render. */
export interface EntCtx {
  A: Analysis;
  B?: Narrative;
  C?: Coverage;
  /** Showing the built-in example. */
  demo: boolean;
  S: Site;
  /** Scenario case and horizon. */
  ci: number;
  hv: number;
  /** Costs for the selected case at each horizon. */
  o: Horizon[];
  hs: number[];
  city: boolean;
  /** Entity type for the regulation card. */
  et: string;
  plan: Plan;
  /** City or district around the site; undefined while districts load. */
  nearby: { c: City; d: number } | null | undefined;
  openCity: (id: string) => void;
  goTab: (t: EntTab) => void;
  ui: EntUi;
  setUi: (patch: Partial<EntUi>) => void;
}

/** Tab state that outlives tab switches. */
export interface EntUi {
  /** Hazard selected on the site tab (7 = follow the top hazard). */
  sel: number;
  /** Resilience maturity, 0–4 for each of eight areas. */
  rs: number[];
  slide: number;
  cityVals: CityVals;
  /** Monitoring readings. */
  monv: number[];
  /** Climate-smart city scorecard, 0–4 for five themes. */
  cs5: number[];
}
