import { Link, type LinkProps } from "@tanstack/react-router";
import { SHOW_PRICING } from "./content";
import { Logo } from "./header";

type FooterLink = { label: string; to: LinkProps["to"]; hash?: string };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Products & Services",
    links: [
      { label: "ESG & Decarbonization Technology", to: "/platform" },
      { label: "E&S Due Diligence", to: "/services", hash: "esdd" },
      { label: "Climate & ESG Advisory", to: "/services", hash: "consulting" },
      { label: "Capacity Building", to: "/services", hash: "consulting" },
      { label: "CSR & Last-Mile Impact", to: "/services", hash: "consulting" },
    ],
  },
  {
    title: "Platform & Tools",
    links: [
      { label: "clisomumbai platform", to: "/platform" },
      { label: "Emissions Calculator", to: "/calculator" },
      { label: "EU CBAM Exposure Screener", to: "/cbam-checker" },
      { label: "ESG Liability Estimator", to: "/platform", hash: "estimator" },
      ...(SHOW_PRICING ? [{ label: "Pricing", to: "/platform", hash: "pricing" } as const] : []),
      { label: "Climate Risk Observatory", to: "/climate-risk/observatory" },
    ],
  },
  {
    title: "Knowledge",
    links: [
      { label: "India Tracker", to: "/resources", hash: "india-tracker" },
      { label: "India SDG Tracker", to: "/resources", hash: "sdg" },
      { label: "UNEP", to: "/resources", hash: "unep" },
      { label: "Global Risk Report", to: "/resources", hash: "global-risk" },
      { label: "Blog & Media", to: "/insights" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About CliSo Tech", to: "/about" },
      { label: "Founders & Leadership", to: "/about", hash: "leadership" },
      { label: "Sector Presence", to: "/", hash: "sectors" },
      { label: "Contact us", to: "/contact" },
      { label: "Our policies", to: "/contact", hash: "policies" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-12 overflow-hidden border-t border-white/[0.06]">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/2 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-cosmic/50 blur-[140px]"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div className="space-y-5">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Technology. Sustainability. Shared impact. Helping MSMEs, enterprises and financial
              institutions measure emissions, prioritise decarbonization and create lasting value
              for people and the planet.
            </p>
            <p className="font-display text-sm italic text-lavender">
              Vasudhaiva Kutumbakam — “the world is one family”
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      hash={l.hash}
                      className="text-sm text-muted-foreground transition-colors hover:text-lavender"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/[0.06] pt-8 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© 2026 CliSo Tech Private Limited. All rights reserved.</p>
          <p className="flex flex-wrap gap-x-3 gap-y-1">
            <span>IPCC 2006</span>
            <span aria-hidden>·</span>
            <span>GHG Protocol</span>
            <span aria-hidden>·</span>
            <span>India CEA Baseline v19</span>
            <span aria-hidden>·</span>
            <span>ASSA 5010</span>
            <span aria-hidden>·</span>
            <span>GRI 303</span>
            <span aria-hidden>·</span>
            <span>EU CBAM 2023/956</span>
          </p>
          <p>
            Earth:{" "}
            <a
              href="https://science.nasa.gov/resource/blue-marble-2002/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-white/20 underline-offset-4 hover:text-white"
            >
              Blue Marble
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
