import { annuity } from "../cities/model";
import { fmt } from "../format";
import {
  ACT,
  CAPACITY,
  CASES,
  CITY_EVENTS,
  HZ,
  MATURITY,
  MITIGATION,
  MONITORS,
  SECTORS,
  SENS,
  TANGIBLE,
  WARMING,
  type CityField,
} from "./data";
import type { Analysis } from "./types";

/** Every number the entity model reads, after parsing the form. */
export interface Site {
  av: number;
  rv: number;
  em: number;
  /** Mitigation and adaptation adopted, 0–100. */
  ad: number;
  nas: number;
  ngva: number;
  ssh: number;
  gvr: number;
  sit: number;
  vc: number;
  rmp: number;
  pen: number;
  cov: number;
  sa: number;
  wk: number;
  dd: number[];
  dm: number[];
}

export const sectorDefaults = (n: number) => {
  const s = SECTORS[n >= 0 && n < SECTORS.length ? n : 1];
  return { ssh: s[1], gvr: s[2], vc: s[3] };
};

export const ranked = (hs: number[]) => HZ.map((_, i) => i).sort((a, b) => hs[b] - hs[a]);
export const siteRevenue = (S: Site) => (S.rv * S.sit) / 100;
/** Annual probability of a disruptive event from a hazard score. */
export const prob = (s: number) => 0.004 * Math.pow(2.6, s - 1);

/** Loss from one event of hazard i at score s, ₹ crore. */
export function evl(S: Site, i: number, s: number) {
  const sr = siteRevenue(S),
    d = S.dd[i] + S.rmp * 0.5,
    lr = (sr / 365) * d,
    lc = lr * (1 - S.vc),
    ex = 0.1 * lc,
    pn = (lr * S.pen) / 100,
    pp = ((S.av * S.dm[i]) / 100) * (s / 3),
    np = pp * (1 - S.cov / 100);
  return { d, lr, lc, ex, pn, pp, np, tot: lc + ex + pn + np, gva: ((sr * S.gvr) / 365) * d };
}
export const eal = (S: Site, i: number, s: number) => prob(s) * evl(S, i, s).tot;

export interface Horizon {
  hs: number[];
  phys: number;
  tr: number;
  carbon: number;
  tot: number;
  t: number;
}

/** Physical and transition cost under scenario case ci for each of the three horizons. */
export function calc(S: Site, A: Analysis, ci: number): Horizon[] {
  const e = A.entity,
    cs = CASES[ci],
    rv = siteRevenue(S),
    ad = S.ad / 100,
    ta = (e.trans[1] + e.trans[2]) / 2;
  return [0, 1, 2].map((h) => {
    const dT = Math.max(0, WARMING[cs.s][h] - 1.5),
      hs = A.haz.map((x, i) => Math.min(5, x[0] * (1 + SENS[i] * dT * (i == 6 ? 1 + 0.3 * h : 1))));
    const phys = hs.reduce((a, s, i) => a + eal(S, i, s), 0) * (1 - 0.35 * ad),
      carbon = ((S.em * cs.p[h]) / 1e7) * (1 - e.pass) * (1 - 0.5 * ad),
      mkt = rv * 0.0025 * ta * cs.m[h] * (1 - 0.3 * ad);
    return { hs, phys, tr: carbon + mkt, carbon, tot: phys + carbon + mkt, t: WARMING[cs.s][h] };
  });
}

/** Expected physical loss in today's climate. */
export const baseline = (S: Site, A: Analysis) =>
  A.haz.reduce((a, x, i) => a + eal(S, i, x[0]), 0) * (1 - (0.35 * S.ad) / 100);

/** Economic footprint: national GVA → sector → company → site. */
export function footprint(S: Site) {
  const sec = (S.ngva * 1e5 * S.ssh) / 100,
    out = sec / Math.max(S.gvr, 0.01),
    cr = S.rv,
    sr = siteRevenue(S),
    sg = sr * S.gvr;
  return {
    sec,
    out,
    cr,
    sr,
    sg,
    cs: out > 0 ? (cr / out) * 100 : 0,
    sn: (sg / Math.max(S.ngva * 1e5, 1)) * 100,
    gd: sg / 365,
  };
}

/** Resilience, mitigation and adaptation plan for the chosen scenario and horizon. */
export function plan(S: Site, A: Analysis, ci: number, hv: number, rs: number[], city: boolean) {
  const hs = calc(S, A, ci)[hv].hs,
    E = S.em,
    price = CASES[ci].p[1],
    dm = MATURITY[city ? 1 : 0],
    cb = CAPACITY[city ? 1 : 0];
  const ix = (rs.reduce((a, b) => a + b, 0) / 32) * 100,
    band = ix < 35 ? "Emerging" : ix < 60 ? "Developing" : ix < 80 ? "Advanced" : "Leading";
  const M = MITIGATION.map((m) => {
      const t = E * m[1];
      return {
        n: m[0],
        t,
        cap: (t * m[2]) / 1e7,
        mac: m[2] / m[4] - m[3],
        net: (t * (m[3] - m[2] / m[4])) / 1e7,
      };
    }).sort((a, b) => a.mac - b.mac),
    tc = M.reduce((a, m) => a + m.cap, 0),
    tt = M.reduce((a, m) => a + m.t, 0);
  const ord = ranked(hs),
    A4 = ord.slice(0, 4).map((i) => {
      const s = hs[i],
        L = eal(S, i, s),
        sv = L * 0.6,
        cap = S.av * 0.004 * s,
        ox = 0.05 * cap;
      return {
        n: HZ[i],
        m: ACT[HZ[i]][1],
        cap,
        sv,
        bcr: (sv * 9.82) / Math.max(cap + ox * 9.82, 1e-9),
        pb: sv > ox ? cap / (sv - ox) : null,
      };
    });
  const low = dm
    .map((d, i): [string, number] => [d, rs[i]])
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map((x) => x[0]);
  const now = [
    "Fix the weakest areas first: " + low.join(", "),
    "Baseline emissions, exposure and costs with measured data",
  ].concat(M.filter((m) => m.mac < 0).map((m) => m.n + " (pays for itself)"));
  const nxt = A4.filter((x) => x.bcr >= 1).map(
    (x) => `${x.n}: ${x.m} (benefit-cost ${x.bcr.toFixed(1)})`,
  );
  const lat = M.filter((m) => m.mac >= 0)
    .map((m) => `${m.n} (₹ ${fmt(m.mac, 0)}/t${m.mac < price ? ", below carbon price" : ""})`)
    .concat(
      A4.filter((x) => x.bcr < 1).map(
        (x) => x.n + ": reassess; insure or relocate if exposure persists",
      ),
    );
  return { hs, ix, band, M, tc, tt, A4, ord, low, now, nxt, lat, price, dm, cb };
}
export type Plan = ReturnType<typeof plan>;

/** Tangible site measures for the leading hazards, ranked by benefit-cost. */
export function tangible(S: Site, hs: number[]) {
  const site = { a: S.sa || 20000, w: S.wk || 300 };
  const top = ranked(hs)
    .filter((i) => hs[i] >= 1.8)
    .slice(0, 4);
  if (!top.includes(3) && hs[3] >= 2.5) top.push(3);
  const rows = TANGIBLE.filter((m) => top.includes(m[0]))
    .map((m) => {
      const [q, u] = m[3](site),
        lo = (q * m[4]) / 1e7,
        hi = (q * m[5]) / 1e7,
        mid = (lo + hi) / 2,
        av = eal(S, m[0], hs[m[0]]) * m[6],
        ox = mid * m[7],
        net = av - ox,
        pb = net > 0 ? mid / net : null,
        bcr = mid > 0 ? (net * annuity(0.08, m[8])) / mid : 0;
      return { m, q, u, lo, hi, mid, av, ox, pb, bcr };
    })
    .sort((a, b) => b.bcr - a.bcr);
  return { site, top, rows };
}

// ---------- City mode ----------

export type CityVals = Record<CityField, number>;
export const ALERT_LEVELS = ["Normal", "Watch", "Alert", "Emergency"];

/** Alert level 0–3 for a monitoring reading. */
export function alertLevel(i: number, v: number) {
  const m = MONITORS[i];
  return m[4].filter((t) => (m[5] > 0 ? v >= t : v <= t)).length;
}

export function citySystems(c: CityVals, hs: number[]) {
  const ms = [c.m0, c.m1, c.m2, c.m3, c.m4],
    nm = ms.reduce((a, b) => a + b, 0) || 1,
    gd = c.gva / 365;
  const HS = [hs[0], hs[3], hs[2], hs[4], hs[1], 1 + 4 * Math.min(1, c.aqd / 60)];
  const rd = (c.dem * 1000 * c.rsh) / 100,
    avail = c.stor * 1e6 * (1 - (0.8 * c.def) / 100),
    cover = rd > 0 ? avail / rd : 0,
    sh = Math.max(0, 240 - cover),
    vol = (sh * rd) / 1e6,
    prem = (vol * 1e6 * Math.max(0, c.tank - c.tar)) / 1e7,
    aff = (((c.pop * c.rsh) / 100) * sh) / 240,
    aq = (((gd * c.aqd * c.aqs) / 100) * c.aql) / 100;
  const dd = [c.dd0, c.dd1, c.dd2, c.dd3];
  const E = CITY_EVENTS.map((e) => {
    const d = dd[e[2]],
      loss = gd * d * ms.reduce((a, m, k) => a + (m / nm) * e[3][k], 0),
      p = prob(hs[e[1]]);
    return { n: e[0], d, loss, st: (c.stu * 1e5 * d * e[3][3]) / 1e5, p, x: p * loss };
  });
  const ex = (c.pop * c.exp) / 100,
    vp = (ex * c.vul) / 100,
    bd = (c.beds * 1000 * c.hzh) / 100,
    tot = E.reduce((a, x) => a + x.x, 0) + prem + aq;
  return { HS, rd, avail, cover, sh, vol, prem, aff, aq, E, ex, vp, bd, tot };
}
