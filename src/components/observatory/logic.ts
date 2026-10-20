// Non-visual helpers and hooks shared by the Climate Risk Observatory tabs.

import { useEffect, useMemo, useState } from "react";
import type { EonetEvent } from "@/lib/climate-feeds.functions";
import {
  ALL_HAZARDS,
  CHECKS,
  CLIMATE_CATEGORIES,
  COUNTRIES,
  ECONOMIC_SURVEY_URL,
  GDP_TOTAL,
  GVA_TOTAL,
  HAZARD_CATEGORY,
  HORIZON_OPTIONS,
  SSP_OPTIONS,
  calculateFinancial,
  type FinanceInputs,
  type FinanceModel,
} from "./data";

const STORAGE_KEY = "climate-checklist";

export type Filters = { geo: string; ssp: number; horizon: number; hazard: string };

/** Climate-related events matching the hazard filter and (for countries) a ±12° window. */
export function filterEvents(events: EonetEvent[], hazard: string, geo: string) {
  let arr = events
    .filter((e) => e.categories.some((c) => CLIMATE_CATEGORIES.includes(c.id)))
    .filter(
      (e) => hazard === ALL_HAZARDS || e.categories.some((c) => c.id === HAZARD_CATEGORY[hazard]),
    );
  if (geo !== "World") {
    const center = COUNTRIES.find((c) => c[0] === geo);
    if (center) {
      arr = arr.filter((e) => {
        const p = e.latest?.coordinates;
        return !!p && Math.abs(p[0] - center[1]) < 12 && Math.abs(p[1] - center[2]) < 12;
      });
    }
  }
  return arr;
}

export type FinancialAssessment = FinanceModel & {
  scenarioContext: string;
  horizonContext: string;
  baseline: Record<string, string | number>;
  model: string;
  limitations: string;
};

/** Run the stress test; returns either the assessment or the validation error. */
export function useFinance(raw: Record<keyof FinanceInputs, string>, ssp: number, horizon: number) {
  return useMemo(() => {
    try {
      const inputs = Object.fromEntries(
        Object.entries(raw).map(([k, v]) => [k, v.trim() === "" ? NaN : Number(v)]),
      ) as FinanceInputs;
      const m = calculateFinancial(inputs);
      const low = calculateFinancial({
        ...inputs,
        damage: Math.max(0, inputs.damage - 10),
      }).residual;
      const high = calculateFinancial({
        ...inputs,
        damage: Math.min(100, inputs.damage + 10),
      }).residual;
      const assessment: FinancialAssessment = {
        ...m,
        scenarioContext: SSP_OPTIONS[ssp],
        horizonContext: HORIZON_OPTIONS[horizon],
        baseline: {
          year: "FY2025–26",
          vintage: "Economic Survey 2025–26, 2011–12 series, first advance estimate",
          priceBasis: "current prices",
          units: "INR crore",
          gva: GVA_TOTAL,
          gdp: GDP_TOTAL,
          source: ECONOMIC_SURVEY_URL,
        },
        model: "GVA × exposure share × duration/365 × productivity reduction × (1 − adaptation)",
        limitations:
          "Conditional foregone-output estimate, not asset damage, observed loss, EAL or future GDP projection. Inputs are uncalibrated scenario assumptions; warnings do not set loss rates.",
      };
      return { assessment, low, high, error: null };
    } catch (e) {
      return { assessment: null, low: 0, high: 0, error: (e as Error).message };
    }
  }, [raw, ssp, horizon]);
}

/** Readiness checklist persisted per browser; falls back to in-memory state. */
export function useChecklist() {
  const [checked, setChecked] = useState<number[]>([]);
  useEffect(() => {
    try {
      const v: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(v)) {
        setChecked(
          v.filter((n): n is number => Number.isInteger(n) && n >= 0 && n < CHECKS.length),
        );
      }
    } catch {
      /* storage unavailable */
    }
  }, []);
  const toggle = (i: number) =>
    setChecked((prev) => {
      const next = prev.includes(i) ? prev.filter((v) => v !== i) : [...prev, i];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  return { checked, toggle };
}

/** Download a JSON document from the browser. */
export function downloadJson(filename: string, doc: unknown) {
  const u = URL.createObjectURL(
    new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = u;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}
