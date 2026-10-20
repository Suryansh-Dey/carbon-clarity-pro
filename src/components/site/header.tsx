import { Link, useRouterState, type LinkProps } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calculator,
  ChevronDown,
  CloudLightning,
  Compass,
  Factory,
  Globe2,
  GraduationCap,
  HeartHandshake,
  Landmark,
  Menu,
  Newspaper,
  Scale,
  ShieldCheck,
  Sliders,
  X,
} from "lucide-react";
import { useEffect, useState, type ComponentType } from "react";
import { cn } from "@/lib/utils";

type MenuLink = {
  label: string;
  desc: string;
  to: LinkProps["to"];
  hash?: string;
  icon: ComponentType<{ className?: string }>;
};

type NavItem =
  | { label: string; to: LinkProps["to"]; menu?: undefined }
  | { label: string; to?: undefined; menu: { title: string; links: MenuLink[] }[] };

const NAV: NavItem[] = [
  {
    label: "Products & Services",
    menu: [
      {
        title: "What we do",
        links: [
          {
            label: "ESG & Decarbonization Technology",
            desc: "Scope 1, 2 & 3 accounting and five-level roadmaps",
            to: "/platform",
            icon: BarChart3,
          },
          {
            label: "Environmental & Social Due Diligence",
            desc: "IFC Performance Standards & World Bank ESF",
            to: "/services",
            hash: "esdd",
            icon: Scale,
          },
          {
            label: "Climate & ESG Advisory",
            desc: "Climate risk, disclosures and assurance readiness",
            to: "/services",
            hash: "consulting",
            icon: ShieldCheck,
          },
          {
            label: "Capacity Building",
            desc: "Board-to-field tailored learning",
            to: "/services",
            hash: "consulting",
            icon: GraduationCap,
          },
          {
            label: "CSR & Last-Mile Impact",
            desc: "Programme design to impact assessment",
            to: "/services",
            hash: "consulting",
            icon: HeartHandshake,
          },
        ],
      },
      {
        title: "Tools",
        links: [
          {
            label: "Emissions Calculator",
            desc: "Sign in with Google to open the workspace",
            to: "/calculator",
            icon: Calculator,
          },
          {
            label: "EU CBAM Exposure Screener",
            desc: "Free: check your HSN tariff risk",
            to: "/cbam-checker",
            icon: Globe2,
          },
          {
            label: "ESG & Carbon Liability Estimator",
            desc: "Free: real-time facility simulation",
            to: "/platform",
            hash: "estimator",
            icon: Sliders,
          },
          {
            label: "Climate Risk Observatory",
            desc: "Event evidence and scenario planning",
            to: "/climate-risk/observatory",
            icon: CloudLightning,
          },
        ],
      },
    ],
  },
  { label: "Platform", to: "/platform" },
  { label: "Climate Risk", to: "/climate-risk" },
  {
    label: "Knowledge",
    menu: [
      {
        title: "Official resources",
        links: [
          {
            label: "India Tracker",
            desc: "NAPCC, PARIVESH and CPCB portals",
            to: "/resources",
            hash: "india-tracker",
            icon: Landmark,
          },
          {
            label: "India SDG Tracker",
            desc: "NITI Aayog SDG India Index",
            to: "/resources",
            hash: "sdg",
            icon: Compass,
          },
          {
            label: "UNEP",
            desc: "United Nations Environment Programme",
            to: "/resources",
            hash: "unep",
            icon: Globe2,
          },
          {
            label: "Global Risk Report",
            desc: "WEF Global Risks Report 2026 overview",
            to: "/resources",
            hash: "global-risk",
            icon: Factory,
          },
        ],
      },
      {
        title: "Blog & media",
        links: [
          {
            label: "Climate",
            desc: "Emissions, decarbonization and climate action",
            to: "/insights",
            hash: "climate-stories",
            icon: BookOpen,
          },
          {
            label: "Social",
            desc: "Community voices and responsible development",
            to: "/insights",
            hash: "social-stories",
            icon: HeartHandshake,
          },
          {
            label: "Media & Press",
            desc: "The CliSo Tech newsroom",
            to: "/insights",
            hash: "media",
            icon: Newspaper,
          },
        ],
      },
    ],
  },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("group flex items-center gap-2.5", className)}>
      <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-periwinkle to-indigo-cosmic shadow-[0_0_24px_-4px_rgb(115_108_237/0.9)] transition-transform duration-500 group-hover:rotate-[20deg]">
        <span className="absolute inset-[5px] rounded-full border border-white/70" />
        <span className="absolute h-[2px] w-7 rotate-[-25deg] rounded-full bg-lavender/90" />
        <span className="relative h-2 w-2 rounded-full bg-white" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl tracking-tight text-white">
          CliSo<span className="text-lavender"> Tech</span>
        </span>
        <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          People &amp; Planet
        </span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation
  useEffect(() => {
    setOpen(null);
    setMobile(false);
  }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "relative mx-auto mt-3 flex h-16 max-w-7xl items-center justify-between rounded-2xl px-4 transition-all duration-500 sm:px-6",
          scrolled || open
            ? "glass-strong mx-3 shadow-[0_20px_60px_-30px_rgb(0_0_0/0.9)] sm:mx-6 lg:mx-auto"
            : "border border-transparent",
        )}
        onMouseLeave={() => setOpen(null)}
      >
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            if (!item.menu) {
              const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  onMouseEnter={() => setOpen(null)}
                  className={cn(
                    "relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                    active ? "text-white" : "text-muted-foreground hover:text-white",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-white/[0.07]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {item.label}
                </Link>
              );
            }
            const isOpen = open === item.label;
            return (
              <div key={item.label} className="relative" onMouseEnter={() => setOpen(item.label)}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : item.label)}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                    isOpen ? "text-white" : "text-muted-foreground hover:text-white",
                  )}
                >
                  {item.label}
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-300",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/auth"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-white sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            to="/calculator"
            className="group hidden h-10 items-center gap-2 rounded-full bg-periwinkle px-5 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgb(115_108_237/0.95)] transition-all hover:-translate-y-0.5 hover:bg-[#8580f0] sm:inline-flex"
          >
            <Calculator className="h-4 w-4" />
            Calculator
          </Link>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobile(true)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Desktop mega-menu panel */}
        <AnimatePresence>
          {open && (
            <motion.div
              key={open}
              initial={{ opacity: 0, rotateX: -18, y: -8 }}
              animate={{ opacity: 1, rotateX: 0, y: 0 }}
              exit={{ opacity: 0, rotateX: -12, y: -6 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformPerspective: 1200, transformOrigin: "50% 0%" }}
              className="absolute inset-x-0 top-full hidden pt-3 sm:inset-x-6 lg:inset-x-auto lg:left-1/2 lg:block lg:w-[860px] lg:-translate-x-1/2"
            >
              <MegaPanel item={NAV.find((n) => n.label === open)!} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobile && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-void/70 backdrop-blur-sm"
              onClick={() => setMobile(false)}
            />
            <motion.div
              initial={{ x: "100%", rotateY: -25 }}
              animate={{ x: 0, rotateY: 0 }}
              exit={{ x: "100%", rotateY: -25 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformPerspective: 1200, transformOrigin: "100% 50%" }}
              className="glass-strong absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col overflow-y-auto p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <Logo />
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMobile(false)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 space-y-6">
                {NAV.map((item) =>
                  item.menu ? (
                    <div key={item.label} className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-lavender">
                        {item.label}
                      </p>
                      {item.menu
                        .flatMap((col) => col.links)
                        .map((l) => (
                          <Link
                            key={l.label}
                            to={l.to}
                            hash={l.hash}
                            className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-white"
                          >
                            <l.icon className="h-4 w-4 text-lavender" />
                            {l.label}
                          </Link>
                        ))}
                    </div>
                  ) : (
                    <Link
                      key={item.label}
                      to={item.to}
                      className="block text-lg font-medium text-white"
                    >
                      {item.label}
                    </Link>
                  ),
                )}
              </div>
              <div className="mt-8 grid gap-3">
                <Link
                  to="/calculator"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-periwinkle text-sm font-semibold text-white"
                >
                  <Calculator className="h-4 w-4" /> Open Calculator
                </Link>
                <Link
                  to="/auth"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 text-sm font-semibold text-white"
                >
                  Sign in with Google
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function MegaPanel({ item }: { item: NavItem }) {
  if (!item.menu) return null;
  return (
    <div className="grid gap-6 rounded-3xl border border-white/10 bg-midnight p-6 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.95)] md:grid-cols-[1.25fr_1fr]">
      {item.menu.map((col, ci) => (
        <div key={col.title} className={cn(ci > 0 && "md:border-l md:border-white/10 md:pl-6")}>
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-lavender">
            {col.title}
          </p>
          <div className="space-y-1">
            {col.links.map((l, i) => (
              <motion.div
                key={l.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * i + 0.05 * ci, duration: 0.3 }}
              >
                <Link
                  to={l.to}
                  hash={l.hash}
                  className="group flex items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-white/[0.05]"
                >
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-indigo-cosmic/60 text-lavender transition-all group-hover:border-periwinkle/60 group-hover:text-white group-hover:shadow-[0_0_20px_-4px_rgb(115_108_237/0.9)]">
                    <l.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1 text-sm font-semibold text-white">
                      {l.label}
                      <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </span>
                    <span className="block text-xs text-muted-foreground">{l.desc}</span>
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
