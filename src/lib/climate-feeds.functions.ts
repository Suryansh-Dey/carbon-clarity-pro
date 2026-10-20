// Public, server-mediated feeds for the Climate Risk Observatory.
// Upstream services are fetched server-side (no browser CORS issues), validated,
// trimmed and cached briefly. Failures are reported as such — no data is ever
// substituted for an unavailable source.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type FeedStatus = "connected" | "access_required" | "unavailable";

export type FeedResult<T> = {
  status: FeedStatus;
  source: string;
  sourceUrl: string;
  retrievedAt: string;
  cacheState?: "fresh" | "cached";
  httpStatus?: number;
  message?: string;
  data?: T;
};

export type EonetGeometry = {
  date: string | null;
  type: string;
  coordinates: [number, number] | null;
  magnitudeValue: number | null;
  magnitudeUnit: string | null;
};

export type EonetEvent = {
  id: string;
  title: string;
  description: string | null;
  link: string;
  closed: string | null;
  categories: { id: string; title: string }[];
  sources: { id: string; url: string }[];
  /** Most recent geometry only; `geometryCount` records how many NASA supplied. */
  latest: EonetGeometry | null;
  geometryCount: number;
};

export type SachetAlert = {
  id: string;
  title: string;
  author: string;
  category: string;
  published: string;
};

export type CapRecord = {
  identifier: string;
  sender: string;
  sent: string;
  status: string;
  msgType: string;
  references: string;
  language: string;
  event: string;
  severity: string;
  urgency: string;
  certainty: string;
  effective: string;
  onset: string;
  expires: string;
  headline: string;
  description: string;
  instruction: string;
  areaDesc: string;
};

/** IMD records flattened to primitive fields (nested upstream values are dropped). */
export type ImdRecord = Record<string, string | number | boolean | null>;

export const EONET_URL = "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=30";
const SACHET_RSS_URL = "https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml";
const CAP_URL = (id: string) =>
  `https://sachet.ndma.gov.in/cap_public_website/FetchXMLFile?identifier=${encodeURIComponent(id)}`;
const IMD_FORECAST_URL = (id: string) =>
  `https://api.imd.gov.in/api/v1/cityforecast?id=${encodeURIComponent(id)}`;
const IMD_WARNINGS_URL = "https://api.imd.gov.in/api/v1/districtwarning";

const TTL_OK = 15 * 60 * 1000;
const TTL_FAIL = 60 * 1000;
const MAX_ENTRIES = 300;
const cache = new Map<string, { at: number; ttl: number; value: FeedResult<unknown> }>();

async function cached<T>(key: string, load: () => Promise<FeedResult<T>>): Promise<FeedResult<T>> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < hit.ttl) {
    return { ...(hit.value as FeedResult<T>), cacheState: "cached" };
  }
  const value = await load();
  cache.set(key, {
    at: Date.now(),
    ttl: value.status === "connected" ? TTL_OK : TTL_FAIL,
    value,
  });
  if (cache.size > MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  return value;
}

function upstream(url: string, accept: string) {
  return fetch(url, {
    headers: { accept, "user-agent": "CliSoTech-ClimateRiskObservatory/1.0" },
    signal: AbortSignal.timeout(12_000),
    redirect: "follow",
  });
}

function base(source: string, sourceUrl: string) {
  return { source, sourceUrl, retrievedAt: new Date().toISOString() };
}

function failure<T>(source: string, sourceUrl: string, err: unknown, httpStatus?: number) {
  const restricted = httpStatus === 401 || httpStatus === 403;
  return {
    ...base(source, sourceUrl),
    status: restricted ? "access_required" : "unavailable",
    httpStatus,
    message: restricted
      ? "Official API requires authorization or network allowlisting. No substituted data."
      : `Source unavailable${err instanceof Error && err.message ? `: ${err.message}` : ""}. No substituted data.`,
  } satisfies FeedResult<T>;
}

/* ---------- Minimal, dependency-free XML helpers (RSS / CAP) ---------- */

function decodeXml(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

/** First matching element's text, ignoring any namespace prefix. */
function tag(xml: string, name: string): string {
  const m = xml.match(
    new RegExp(`<(?:[\\w-]+:)?${name}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:[\\w-]+:)?${name}>`, "i"),
  );
  return m ? decodeXml(m[1]) : "";
}

function blocks(xml: string, name: string): string[] {
  const re = new RegExp(
    `<(?:[\\w-]+:)?${name}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:[\\w-]+:)?${name}>`,
    "gi",
  );
  return Array.from(xml.matchAll(re), (m) => m[1]);
}

/* ---------- NASA EONET ---------- */

const EonetSchema = z.object({
  events: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().nullable().optional(),
      link: z.string(),
      closed: z.string().nullable().optional(),
      categories: z.array(z.object({ id: z.string(), title: z.string() })),
      sources: z.array(z.object({ id: z.string(), url: z.string() })).optional(),
      geometry: z.array(
        z.object({
          date: z.string().nullable().optional(),
          type: z.string(),
          coordinates: z.unknown(),
          magnitudeValue: z.number().nullable().optional(),
          magnitudeUnit: z.string().nullable().optional(),
        }),
      ),
    }),
  ),
});

export const getEonetEvents = createServerFn({ method: "GET" }).handler(
  (): Promise<FeedResult<EonetEvent[]>> =>
    cached("nasa", async () => {
      try {
        const res = await upstream(EONET_URL, "application/json");
        if (!res.ok) return failure("nasa", EONET_URL, null, res.status);
        const parsed = EonetSchema.parse(await res.json());
        const events: EonetEvent[] = parsed.events.map((e) => {
          const latest = [...e.geometry].sort(
            (a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime(),
          )[0];
          const c = latest?.coordinates;
          const point =
            latest?.type === "Point" &&
            Array.isArray(c) &&
            typeof c[0] === "number" &&
            typeof c[1] === "number"
              ? ([c[0], c[1]] as [number, number])
              : null;
          return {
            id: e.id,
            title: e.title,
            description: e.description ?? null,
            link: e.link,
            closed: e.closed ?? null,
            categories: e.categories,
            sources: e.sources ?? [],
            latest: latest
              ? {
                  date: latest.date ?? null,
                  type: latest.type,
                  coordinates: point,
                  magnitudeValue: latest.magnitudeValue ?? null,
                  magnitudeUnit: latest.magnitudeUnit ?? null,
                }
              : null,
            geometryCount: e.geometry.length,
          };
        });
        return {
          ...base("nasa", EONET_URL),
          status: "connected",
          cacheState: "fresh",
          data: events,
        };
      } catch (err) {
        return failure("nasa", EONET_URL, err);
      }
    }),
);

/* ---------- NDMA SACHET ---------- */

export const getSachetAlerts = createServerFn({ method: "GET" }).handler(
  (): Promise<FeedResult<SachetAlert[]>> =>
    cached("sachet", async () => {
      try {
        const res = await upstream(SACHET_RSS_URL, "application/rss+xml, application/xml");
        if (!res.ok) return failure("sachet", SACHET_RSS_URL, null, res.status);
        const xml = await res.text();
        if (!/<rss[\s>]/i.test(xml)) throw new Error("Unexpected RSS format");
        const alerts = blocks(xml, "item")
          .map((item) => ({
            id: tag(item, "guid"),
            title: tag(item, "title"),
            author: tag(item, "author"),
            category: tag(item, "category"),
            published: tag(item, "pubDate"),
          }))
          .filter((a) => /^\d{1,40}$/.test(a.id));
        return {
          ...base("sachet", SACHET_RSS_URL),
          status: "connected",
          cacheState: "fresh",
          data: alerts,
        };
      } catch (err) {
        return failure("sachet", SACHET_RSS_URL, err);
      }
    }),
);

export const getCapRecord = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.object({ id: z.string().regex(/^\d{1,40}$/) }).parse(d))
  .handler(({ data }): Promise<FeedResult<CapRecord>> => {
    const url = CAP_URL(data.id);
    return cached(`cap:${data.id}`, async () => {
      try {
        const res = await upstream(url, "application/xml, text/xml");
        if (!res.ok) return failure("cap", url, null, res.status);
        const xml = await res.text();
        if (!/<(?:[\w-]+:)?alert[\s>]/i.test(xml)) throw new Error("Unexpected CAP format");
        const infos = blocks(xml, "info");
        const info =
          infos.find((i) => tag(i, "language").toLowerCase().startsWith("en")) ?? infos[0];
        if (!info) throw new Error("CAP info unavailable");
        const record: CapRecord = {
          identifier: tag(xml, "identifier"),
          sender: tag(xml, "sender"),
          sent: tag(xml, "sent"),
          status: tag(xml, "status"),
          msgType: tag(xml, "msgType"),
          references: tag(xml, "references"),
          language: tag(info, "language"),
          event: tag(info, "event"),
          severity: tag(info, "severity"),
          urgency: tag(info, "urgency"),
          certainty: tag(info, "certainty"),
          effective: tag(info, "effective"),
          onset: tag(info, "onset"),
          expires: tag(info, "expires"),
          headline: tag(info, "headline"),
          description: tag(info, "description"),
          instruction: tag(info, "instruction"),
          areaDesc: tag(info, "areaDesc"),
        };
        return { ...base("cap", url), status: "connected", cacheState: "fresh", data: record };
      } catch (err) {
        return failure("cap", url, err);
      }
    });
  });

/* ---------- IMD (authorization / allowlisting required) ---------- */

function flatRecord(r: unknown): ImdRecord {
  if (!r || typeof r !== "object") return {};
  return Object.fromEntries(
    Object.entries(r).filter(
      ([, v]) => v === null || ["string", "number", "boolean"].includes(typeof v),
    ),
  ) as ImdRecord;
}

async function imd(source: string, url: string): Promise<FeedResult<ImdRecord[]>> {
  try {
    const res = await upstream(url, "application/json");
    if (!res.ok) return failure(source, url, null, res.status);
    const body: unknown = await res.json();
    const records = Array.isArray(body)
      ? body
      : body && typeof body === "object" && Array.isArray((body as { data?: unknown }).data)
        ? (body as { data: unknown[] }).data
        : [body];
    return {
      ...base(source, url),
      status: "connected",
      cacheState: "fresh",
      data: records.slice(0, 1000).map(flatRecord),
    };
  } catch (err) {
    return failure(source, url, err);
  }
}

export const getImdForecast = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.object({ id: z.string().regex(/^\d{1,8}$/) }).parse(d))
  .handler(({ data }) =>
    cached(`imd-forecast:${data.id}`, () => imd("forecast", IMD_FORECAST_URL(data.id))),
  );

export const getImdWarnings = createServerFn({ method: "GET" }).handler(() =>
  cached("imd-warnings", () => imd("warnings", IMD_WARNINGS_URL)),
);
