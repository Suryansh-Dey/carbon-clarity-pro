import type { City, DistrictData, Inputs, Money } from "./model";

/** Everything a Cities tab needs to render. */
export interface CityCtx {
  c: City;
  I: Inputs;
  /** Hazard scores for the selected scenario and horizon. */
  hs: number[];
  si: number;
  hi: number;
  money: Money;
  /** Formatter for all-India totals, in rupees unless US dollars are chosen. */
  inr: Money;
  now: number;
  cities: City[];
  districts?: DistrictData;
  pick: (id: string) => void;
  /** Tab settings that outlive tab switches. */
  ui: CityUi;
  setUi: (patch: Partial<CityUi>) => void;
}

export interface CityUi {
  /** UNDRR Ten Essentials self-assessment, 0–5 each. */
  essentials: number[];
  /** District map metric and state filter ("" = all India). */
  mapMetric: string;
  mapState: string;
}
