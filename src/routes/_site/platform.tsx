import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Leaf,
  Droplets,
  Shield,
  Gauge,
  Check,
  ArrowRight,
  Sparkles,
  Zap,
  Lock,
  Building2,
  Sliders,
  ChevronRight,
  TrendingDown,
  FileCheck2,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Factory,
  Globe2,
  Flame,
  Scale,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Layers,
  Award,
  Users,
  Briefcase,
  CheckCircle2,
  ArrowUpRight,
  Calculator,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal, RevealSection, Stagger, StaggerItem, Tilt } from "@/components/site/motion";
import {
  CtaExternal,
  CtaLink,
  Eyebrow,
  GlassCard,
  IndexChip,
  Note,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/site/ui";
import { SMART_DECARB_URL } from "@/components/site/content";

export const Route = createFileRoute("/_site/platform")({
  head: () => ({
    meta: [
      { title: "clisomumbai platform — Carbon & Resource Intelligence | CliSo Tech" },
      {
        name: "description",
        content:
          "Audit-defensible Scope 1-3 GHG calculations, SEBI BRSR Core Principle 6, EU CBAM DG TAXUD XML exports, and GRI 303 Water Stewardship for Indian industrial enterprises.",
      },
      { property: "og:title", content: "clisomumbai — Enterprise Carbon & Resource Intelligence" },
      {
        property: "og:description",
        content:
          "Activity-based GHG Protocol accounting, CEA Grid Baseline v19, EU CBAM XML generation, and cryptographic SHA-256 audit packs.",
      },
    ],
  }),
  component: PlatformPage,
});

const PIPELINE = [
  {
    t: "Collect",
    d: "Bring together electricity bills, fuel records and operational activity data.",
  },
  { t: "Calculate", d: "Organise emissions and resource information into connected ledgers." },
  { t: "Report", d: "Prepare disclosures and supporting evidence for review." },
];

const MODULES = [
  {
    icon: Zap,
    t: "Scope 1, 2 & 3 ledger",
    d: "Track direct emissions, purchased energy and value-chain activity using physical quantities.",
  },
  {
    icon: Globe2,
    t: "EU CBAM reporting",
    d: "Explore exporter reporting workflows and XML preparation within the platform.",
  },
  {
    icon: Droplets,
    t: "Water & resource accounting",
    d: "Organise water-use and recycling information for GRI 303 and ZLD reporting workflows.",
  },
  {
    icon: TrendingDown,
    t: "Decarbonisation planning",
    d: "Explore reduction opportunities and compare actions through marginal abatement cost planning.",
  },
  {
    icon: Lock,
    t: "Audit evidence",
    d: "Connect reported metrics to supporting records and SHA-256 evidence packs.",
  },
];

function PlatformPage() {
  const navigate = useNavigate();

  // Navigation / Interactive Showcase State
  const [activeTab, setActiveTab] = useState<"ledger" | "cbam" | "water" | "decarb" | "audit">(
    "ledger",
  );
  const [solutionsView, setSolutionsView] = useState<"role" | "industry">("role");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  // Interactive Estimator State
  const [sector, setSector] = useState("steel");
  const [turnover, setTurnover] = useState(150);
  const [powerUnitsMWh, setPowerUnitsMWh] = useState(3500);
  const [fuelLitres, setFuelLitres] = useState(48000);
  const [euExportsTonnes, setEuExportsTonnes] = useState(10000);

  // Computed Values for Real-time Estimator
  const scope1Est = useMemo(() => Math.round((fuelLitres * 2.68) / 1000), [fuelLitres]);
  const scope2Est = useMemo(() => Math.round(powerUnitsMWh * 0.716), [powerUnitsMWh]);
  const totalGhg = scope1Est + scope2Est;
  const cbamRiskPenaltyEur = useMemo(
    () => Math.round(euExportsTonnes * 1.8 * 69),
    [euExportsTonnes],
  );
  const brsrScore = useMemo(
    () => Math.min(99, Math.round(78 + (turnover > 100 ? 14 : 8))),
    [turnover],
  );
  const waterEstKL = useMemo(() => Math.round(turnover * 220), [turnover]);

  // Workspace tools are behind Google sign-in; /calculator redirects to /auth when needed.
  const handleLaunchDemo = () => navigate({ to: "/calculator" });

  return (
    <>
      <PageHero
        eyebrow="Featured digital tool / Climate Social Mumbai"
        title="Carbon & resource intelligence."
        accent="One connected platform."
        description={
          <>
            Meet <strong className="font-semibold text-white">clisomumbai</strong> — our digital
            platform for enterprise greenhouse-gas accounting, sustainability reporting and resource
            management.
          </>
        }
      >
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <CtaLink to="/calculator">Open the calculator</CtaLink>
          <CtaExternal href="https://www.clisomumbai.com/" variant="ghost">
            Explore the digital platform
          </CtaExternal>
        </div>
        <Note>
          Opens clisomumbai.com in a new tab. Workspace tools require Google sign-in; everything
          else on this page is free to explore.
        </Note>
      </PageHero>
      {/* 3. HERO SECTION (GROWW + CARBONLY HYBRID) */}
      <RevealSection className="relative py-20 md:py-28 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-subtle" />
              BUILT FOR SEBI BRSR CORE &amp; EU CBAM 2026 MANDATES
            </div>

            {/* Headline */}
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-foreground leading-[1.12]">
              Your Corporate Carbon Reporting. <br />
              <span className="text-gradient italic">Done. Verified. Audit-Proof.</span>
            </h2>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Stop relying on spend-based approximations that fail assurance under{" "}
              <span className="text-foreground font-semibold">ASSA 5010</span>.
              <strong> clisomumbai</strong> automatically converts factory weighbridge slips, fuel
              dockets, electricity bills, and invoices into verifiable Scope 1-3 GHG ledgers, EU
              CBAM XML filings, and GRI 303 water disclosures.
            </p>

            {/* Primary Action Row */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                onClick={handleLaunchDemo}
                size="lg"
                className="w-full sm:w-auto h-12 px-8 font-semibold text-sm gap-2 shadow-md hover:shadow-lg transition-all"
              >
                Open Workspace <ArrowRight className="h-4 w-4" />
              </Button>
              <Link
                to="/cbam-checker"
                className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-6 rounded-xl border border-border glass hover:bg-muted/60 text-sm font-medium transition-all shadow-xs gap-2 text-foreground"
              >
                <Calculator className="h-4 w-4 text-primary" /> Check EU CBAM Exposure
              </Link>
            </div>

            {/* Key Trust Signals Bar */}
            <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
              <div className="p-3.5 rounded-xl border border-border/70 bg-white/[0.03] shadow-xs">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  India CEA v19
                </div>
                <div className="font-display text-xl font-bold text-foreground mt-0.5">
                  0.716 kg
                </div>
                <div className="text-[11px] text-muted-foreground">CO₂e per kWh Grid</div>
              </div>
              <div className="p-3.5 rounded-xl border border-border/70 bg-white/[0.03] shadow-xs">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  EU CBAM Penalty
                </div>
                <div className="font-display text-xl font-bold text-primary mt-0.5">
                  €69 / tonne
                </div>
                <div className="text-[11px] text-muted-foreground">Default Fine Protection</div>
              </div>
              <div className="p-3.5 rounded-xl border border-border/70 bg-white/[0.03] shadow-xs">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Audit Standard
                </div>
                <div className="font-display text-xl font-bold text-foreground mt-0.5">
                  ASSA 5010
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Limited/Reasonable Assurance
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-border/70 bg-white/[0.03] shadow-xs">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Cryptographic Proof
                </div>
                <div className="font-display text-xl font-bold text-emerald-700 mt-0.5">
                  SHA-256
                </div>
                <div className="text-[11px] text-muted-foreground">Tamper-Proof Dossier ZIP</div>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>
      <Section id="modules">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.35fr]">
          <div className="space-y-8 lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              eyebrow="From activity to evidence"
              title="Collect. Calculate."
              accent="Report."
            />
            <Stagger className="space-y-3">
              {PIPELINE.map((step, i) => (
                <StaggerItem key={step.t}>
                  <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-periwinkle text-sm font-semibold text-white shadow-[0_0_24px_-4px_rgb(115_108_237/1)]">
                      {i + 1}
                    </span>
                    <p className="text-sm text-muted-foreground">
                      <strong className="block text-base font-semibold text-white">{step.t}</strong>
                      {step.d}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
            <p className="text-sm text-muted-foreground">
              Built for sustainability teams, finance leaders, ESG consultants and audit committees.
            </p>
            <CtaLink to="/contact" variant="ghost">
              Discuss the platform with us
            </CtaLink>
          </div>

          <Stagger className="grid gap-5 sm:grid-cols-2">
            {MODULES.map((m, i) => (
              <StaggerItem key={m.t} className={i === 0 ? "sm:col-span-2" : undefined}>
                <Tilt className="h-full rounded-3xl">
                  <GlassCard className="flex h-full flex-col gap-5 p-7">
                    <div className="flex items-center justify-between">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-indigo-cosmic/70 text-lavender">
                        <m.icon className="h-5 w-5" />
                      </span>
                      <IndexChip n={i + 1} />
                    </div>
                    <h3 className="font-display text-2xl text-white">{m.t}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{m.d}</p>
                  </GlassCard>
                </Tilt>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      {/* 4. GROWW-STYLE TABBED INTERACTIVE PRODUCT SHOWCASE */}
      <RevealSection id="showcase" className="scroll-mt-24 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-lavender">
              Live Product Capabilities
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-foreground mt-3">
              Everything Your Enterprise Needs in One Ledger
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Explore the five specialized engines that eliminate compliance friction and safeguard
              your balance sheet.
            </p>

            {/* Groww-style Segmented Tabs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl border border-border glass shadow-xs">
              <button
                onClick={() => setActiveTab("ledger")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                  activeTab === "ledger"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Zap className="h-4 w-4" /> Scope 1-2-3 Direct Ledger
              </button>
              <button
                onClick={() => setActiveTab("cbam")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                  activeTab === "cbam"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Globe2 className="h-4 w-4" /> EU CBAM XML Declarant
              </button>
              <button
                onClick={() => setActiveTab("water")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                  activeTab === "water"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Droplets className="h-4 w-4" /> Water &amp; ZLD (GRI 303)
              </button>
              <button
                onClick={() => setActiveTab("decarb")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                  activeTab === "decarb"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <TrendingDown className="h-4 w-4" /> Decarbonization MACC
              </button>
              <button
                onClick={() => setActiveTab("audit")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                  activeTab === "audit"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Lock className="h-4 w-4" /> SHA-256 Audit Evidence
              </button>
            </div>
          </div>

          {/* Tab Content Display Card */}
          <div className="rounded-3xl border border-border glass p-6 lg:p-10 shadow-lg">
            {activeTab === "ledger" && (
              <div className="grid lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 font-mono text-xs"
                  >
                    EMISSION FACTOR ENGINE
                  </Badge>
                  <h3 className="font-display text-2xl sm:text-3xl font-normal text-foreground">
                    Physical activity data, not spend estimates.
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Capture kilowatt-hours, litres of diesel, tonnes of coal, and refrigerant
                    top-ups directly from factory telemetry and invoice lines. Automatically mapped
                    against India CEA Baseline v19 and IPCC 2006 tables.
                  </p>
                  <ul className="space-y-2.5 text-xs text-muted-foreground pt-2">
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Full Scope 1
                      (Stationary, Mobile &amp; Fugitive) calculations
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Scope 2
                      Location-based &amp; Market-based (Green Tariffs)
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Upstream Category
                      1-8 Scope 3 physical material cascade
                    </li>
                  </ul>
                  <div className="pt-3">
                    <Button onClick={handleLaunchDemo} className="gap-2">
                      Open Direct Ledger <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <div className="rounded-2xl border border-border bg-white/[0.03] p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border/80">
                      <span className="text-xs font-semibold text-muted-foreground">
                        INVENTORY LINE ITEMS (FY 2026-27)
                      </span>
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        CEA v19 VERIFIED
                      </Badge>
                    </div>
                    <div className="space-y-2.5 text-xs">
                      <div className="p-3 rounded-xl border border-border glass flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-foreground block">
                            Facility Grid Power (Maharashtra MSEDCL)
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            3,500 MWh × 0.716 kg CO₂/kWh
                          </span>
                        </div>
                        <span className="font-mono font-bold text-foreground text-sm">
                          2,506.0 tCO₂e
                        </span>
                      </div>
                      <div className="p-3 rounded-xl border border-border glass flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-foreground block">
                            Heavy Machinery Diesel (HSD)
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            48,000 Litres × 2.68 kg CO₂/L
                          </span>
                        </div>
                        <span className="font-mono font-bold text-foreground text-sm">
                          128.6 tCO₂e
                        </span>
                      </div>
                      <div className="p-3 rounded-xl border border-border glass flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-foreground block">
                            Chiller Refrigerant Top-up (R-134a)
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            12 kg × 1,430 GWP factor
                          </span>
                        </div>
                        <span className="font-mono font-bold text-foreground text-sm">
                          17.2 tCO₂e
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "cbam" && (
              <div className="grid lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <Badge
                    variant="outline"
                    className="bg-sky-500/10 text-sky-700 border-sky-500/20 font-mono text-xs"
                  >
                    EU REGULATION 2023/956
                  </Badge>
                  <h3 className="font-display text-2xl sm:text-3xl font-normal text-foreground">
                    Automated Indian HSN to EU CN Mapping &amp; XML Export.
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Avoid devastating €69/tonne default carbon tax penalties. Map chapter 72/73
                    steel, aluminium, and fertilizer exports into the official DG TAXUD transitional
                    XML format in 1 click.
                  </p>
                  <ul className="space-y-2.5 text-xs text-muted-foreground pt-2">
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Direct &amp;
                      Indirect specific embedded emissions (SEE) per tonne
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Precursor carbon
                      tracking for billets, blooms, and scrap
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Validated against
                      EU Commission XML Schema XSD v1.2
                    </li>
                  </ul>
                  <div className="pt-3">
                    <Link to="/cbam-checker">
                      <Button className="gap-2">
                        Run CBAM Exposure Test <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <div className="rounded-2xl border border-border bg-white/[0.03] p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border/80">
                      <span className="text-xs font-semibold text-muted-foreground">
                        EU CBAM DG TAXUD DECLARATION
                      </span>
                      <Badge className="bg-emerald-600 text-white font-mono text-[10px]">
                        XML READY
                      </Badge>
                    </div>
                    <div className="p-3.5 rounded-xl border border-border glass space-y-2 text-xs">
                      <div className="flex justify-between font-mono">
                        <span className="text-muted-foreground">
                          HSN 7208.10.00 → CN 7208 10 00
                        </span>
                        <span className="text-primary font-bold">1.82 tCO₂e / t</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground text-[11px]">
                        <span>Direct Embedded: 1.42 t</span>
                        <span>Indirect: 0.40 t</span>
                      </div>
                      <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-sky-600 rounded-full w-[78%]" />
                      </div>
                    </div>
                    <div className="p-3 rounded-xl border border-border/80 bg-white/[0.02] text-xs font-mono text-muted-foreground">
                      &lt;cbam:Declaration
                      xmlns:cbam=&quot;http://ec.europa.eu/taxud/cbam/v1&quot;&gt;
                      <br />
                      &nbsp;&nbsp;&lt;cbam:GoodsItem CNCode=&quot;72081000&quot;
                      NetMassTonnes=&quot;10000&quot; /&gt;
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "water" && (
              <div className="grid lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <Badge
                    variant="outline"
                    className="bg-cyan-500/10 text-cyan-700 border-cyan-500/20 font-mono text-xs"
                  >
                    GRI 303 &amp; SEBI PRINCIPLE 6
                  </Badge>
                  <h3 className="font-display text-2xl sm:text-3xl font-normal text-foreground">
                    Complete Water Circularity &amp; Zero Liquid Discharge.
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Track groundwater withdrawal against Central Ground Water Board (CGWB) aquifer
                    stress categories. Monitor RO recovery, MEE evaporation, and Zero Liquid
                    Discharge (ZLD) ratios.
                  </p>
                  <ul className="space-y-2.5 text-xs text-muted-foreground pt-2">
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Water balance
                      ledger: Intake, Consumption, Recycling &amp; Discharge
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> CGWB
                      critical/over-exploited zone classification
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Effluent quality
                      compliance (BOD, COD, TDS, Heavy Metals)
                    </li>
                  </ul>
                  <div className="pt-3">
                    <Button onClick={handleLaunchDemo} className="gap-2">
                      View Water Accounting <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <div className="rounded-2xl border border-border bg-white/[0.03] p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border/80">
                      <span className="text-xs font-semibold text-muted-foreground">
                        FACILITY WATER BALANCE (kL/yr)
                      </span>
                      <Badge
                        variant="outline"
                        className="text-cyan-700 border-cyan-500/30 text-[10px] font-mono"
                      >
                        ZLD CERTIFIED
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl border border-border glass">
                        <span className="text-muted-foreground text-[11px] block">
                          Freshwater Intake
                        </span>
                        <span className="font-display text-xl font-bold text-foreground mt-0.5 block">
                          33,000 kL
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Borewell + Municipal
                        </span>
                      </div>
                      <div className="p-3 rounded-xl border border-border glass">
                        <span className="text-muted-foreground text-[11px] block">
                          Recycled &amp; Reused
                        </span>
                        <span className="font-display text-xl font-bold text-cyan-700 mt-0.5 block">
                          22,570 kL
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold">
                          68.4% Circularity
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "decarb" && (
              <div className="grid lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 font-mono text-xs"
                  >
                    NET ZERO ROADMAP ENGINE
                  </Badge>
                  <h3 className="font-display text-2xl sm:text-3xl font-normal text-foreground">
                    Marginal Abatement Cost Curves (MACC) &amp; ROI.
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Prioritize capital allocation across rooftop solar, waste heat recovery systems
                    (WHRS), variable frequency drives (VFD), and biomass boilers with precise IRR
                    and payback timelines.
                  </p>
                  <ul className="space-y-2.5 text-xs text-muted-foreground pt-2">
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Net present value
                      (NPV) and cost per tCO₂e abated
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> SBTi 1.5°C
                      science-based target alignment
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Carbon Credit
                      Trading Scheme (CCTS) offset forecasting
                    </li>
                  </ul>
                  <div className="pt-3">
                    <Button onClick={handleLaunchDemo} className="gap-2">
                      Explore Decarbonization Planner <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <div className="rounded-2xl border border-border bg-white/[0.03] p-5 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-border/80">
                      <span className="text-xs font-semibold text-muted-foreground">
                        ABATEMENT INITIATIVES
                      </span>
                      <span className="text-xs text-emerald-700 font-bold">
                        Total Potential: -1,840 tCO₂e
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-3 rounded-xl border border-border glass flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-foreground">
                            Rooftop Solar 1.2 MW PPA
                          </span>
                          <span className="text-[11px] text-muted-foreground block">
                            Capex: ₹4.2 Cr • Payback: 3.4 yrs
                          </span>
                        </div>
                        <Badge variant="secondary" className="font-mono text-emerald-700">
                          -860 tCO₂e
                        </Badge>
                      </div>
                      <div className="p-3 rounded-xl border border-border glass flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-foreground">
                            Waste Heat Recovery (WHRS)
                          </span>
                          <span className="text-[11px] text-muted-foreground block">
                            Capex: ₹2.8 Cr • Payback: 2.1 yrs
                          </span>
                        </div>
                        <Badge variant="secondary" className="font-mono text-emerald-700">
                          -620 tCO₂e
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "audit" && (
              <div className="grid lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <Badge
                    variant="outline"
                    className="bg-amber-500/10 text-amber-700 border-amber-500/20 font-mono text-xs"
                  >
                    ASSA 5010 ASSURANCE
                  </Badge>
                  <h3 className="font-display text-2xl sm:text-3xl font-normal text-foreground">
                    Cryptographic SHA-256 Audit Evidence Pack.
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Download an immutable ZIP bundle containing calculation lineage JSON, raw
                    invoice metadata, verifier certificates, and digital hash signatures ready for
                    Big-4 assurance interviews.
                  </p>
                  <ul className="space-y-2.5 text-xs text-muted-foreground pt-2">
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Zero manual Excel
                      data chasing during auditor sampling
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> SEBI BRSR Principle
                      6 Core compliance sign-off
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> SHA-256 checksum
                      stamped on every output
                    </li>
                  </ul>
                  <div className="pt-3">
                    <Button onClick={handleLaunchDemo} className="gap-2">
                      Generate Audit Pack <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <div className="rounded-2xl border border-border bg-white/[0.03] p-5 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-border/80">
                      <span className="text-muted-foreground">EVIDENCE DOSSIER BUNDLE</span>
                      <span className="text-amber-700 font-bold">SHA-256 VERIFIED</span>
                    </div>
                    <div className="p-3 rounded-xl border border-border glass space-y-1.5 text-[11px]">
                      <div className="flex items-center gap-2 text-foreground">
                        <FileCheck2 className="h-4 w-4 text-primary" /> 01_Executive_Summary.pdf
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <FileSpreadsheet className="h-4 w-4 text-emerald-600" />{" "}
                        02_Scope1_Scope2_Ledger.xlsx
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <Layers className="h-4 w-4 text-sky-600" /> 03_Methodology_and_Lineage.json
                      </div>
                      <div className="text-[10px] text-muted-foreground pt-1 truncate">
                        Checksum: 634fab86e04d7c1a93e8201...
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </RevealSection>

      {/* 5. "HOW IT WORKS" 3-STAGE PIPELINE (INSPIRED BY CARBONLY.AI) */}
      <RevealSection id="how-it-works" className="scroll-mt-24 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-lavender">
              The 3-Step Operating Workflow
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-foreground mt-3">
              The Work is Already Done When You Log In
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              From raw factory receipts to auditor sign-off in three seamless, automated phases.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="rounded-3xl border border-border glass p-8 relative flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
              <div>
                <div className="text-3xl font-display font-bold text-primary/30 mb-4">01</div>
                <h3 className="font-display text-xl font-medium text-foreground">
                  Collect &amp; Ingest
                </h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Fuel receipts, electricity meter logs, weighbridge slips, and ERP records flow in
                  automatically. Zero tedious manual spreadsheet entry from factory floor managers.
                </p>
                <div className="mt-6 pt-4 border-t border-border/70 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-primary" /> Automated ERP &amp; Tally
                    Connectors
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-primary" /> Invoice OCR &amp; Docket
                    Ingestion
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-3xl border border-border glass p-8 relative flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
              <div>
                <div className="text-3xl font-display font-bold text-primary/30 mb-4">02</div>
                <h3 className="font-display text-xl font-medium text-foreground">
                  Verify &amp; Compute
                </h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  5-tier factor matching matches physical quantities (kWh, litres, tonnes) against
                  CEA v19 and IPCC databases. Automated anomaly checks detect data gaps instantly.
                </p>
                <div className="mt-6 pt-4 border-t border-border/70 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-primary" /> CEA 0.716 kg/kWh baseline
                    integration
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-primary" /> Outlier &amp; double-counting
                    detector
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-3xl border-2 border-primary/60 glass p-8 relative flex flex-col justify-between shadow-md">
              <div className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold text-primary-foreground uppercase">
                Audit Ready
              </div>
              <div>
                <div className="text-3xl font-display font-bold text-primary mb-4">03</div>
                <h3 className="font-display text-xl font-medium text-foreground">
                  Assure &amp; Submit
                </h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Pre-populated SEBI BRSR Core tables, EU CBAM XML filings, and cryptographic
                  SHA-256 evidence dossiers ready for board sign-off and assurance interviews.
                </p>
                <div className="mt-6 pt-4 border-t border-border/70 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-primary" /> 1-Click SEBI Principle 6 Export
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-primary" /> DG TAXUD XML Validation
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* 6. SOLUTIONS MATRIX: BY ROLE & BY INDUSTRY */}
      <RevealSection id="solutions" className="scroll-mt-24 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-lavender">
              Tailored Enterprise Solutions
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-foreground mt-3">
              Built for Your Exact Stakeholder Requirements
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose the view tailored to your executive role or specific manufacturing sector.
            </p>

            <div className="mt-6 inline-flex rounded-xl border border-border glass p-1 shadow-xs">
              <button
                onClick={() => setSolutionsView("role")}
                className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all ${
                  solutionsView === "role"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Solutions by Role
              </button>
              <button
                onClick={() => setSolutionsView("industry")}
                className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all ${
                  solutionsView === "industry"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Solutions by Industry
              </button>
            </div>
          </div>

          {solutionsView === "role" ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="rounded-2xl border-border glass p-6 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center mb-4">
                    <Users className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-medium text-foreground">
                    CFOs &amp; Finance
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Personal sign-off under Section 180 requires audit-proof numbers that survive
                    limited and reasonable assurance on Day 1.
                  </p>
                </div>
                <div className="pt-6 border-t border-border/70 mt-6 text-xs text-primary font-semibold flex items-center justify-between">
                  <span>Explore CFO Suite</span> <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Card>

              <Card className="rounded-2xl border-border glass p-6 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 grid place-items-center mb-4">
                    <Factory className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-medium text-foreground">
                    Sustainability Leads
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Reclaim 2 days every week spent chasing plant engineers for meter readings,
                    diesel chits, and waste transfer notes.
                  </p>
                </div>
                <div className="pt-6 border-t border-border/70 mt-6 text-xs text-emerald-700 font-semibold flex items-center justify-between">
                  <span>Explore EHS Suite</span> <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Card>

              <Card className="rounded-2xl border-border glass p-6 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-600 grid place-items-center mb-4">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-medium text-foreground">
                    ESG Consultants
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Scale your advisory practice from 3 clients to 30 with dedicated multi-tenant
                    workspaces and white-label client reports.
                  </p>
                </div>
                <div className="pt-6 border-t border-border/70 mt-6 text-xs text-sky-700 font-semibold flex items-center justify-between">
                  <span>Explore Advisor Hub</span> <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Card>

              <Card className="rounded-2xl border-border glass p-6 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 grid place-items-center mb-4">
                    <Shield className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-medium text-foreground">
                    Audit Committees
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Fulfill governance obligations with complete cryptographic SHA-256 data lineage
                    for every Scope 1-3 metric.
                  </p>
                </div>
                <div className="pt-6 border-t border-border/70 mt-6 text-xs text-amber-700 font-semibold flex items-center justify-between">
                  <span>Explore Governance</span> <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Card>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="rounded-2xl border-border glass p-6 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center mb-4">
                    <Flame className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-medium text-foreground">
                    Steel &amp; Metallurgy
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    BF-BOF, DRI, and electric arc furnace specific carbon intensity with EU CBAM
                    chapter 72 export declarations.
                  </p>
                </div>
                <div className="pt-6 border-t border-border/70 mt-6 text-xs text-primary font-semibold flex items-center justify-between">
                  <span>View Steel Engine</span> <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Card>

              <Card className="rounded-2xl border-border glass p-6 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 grid place-items-center mb-4">
                    <Zap className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-medium text-foreground">
                    Aluminium &amp; Metals
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Electrolytic smelting, direct emissions, and anode PFC tracking for primary
                    ingots and billets under CBAM chapter 76.
                  </p>
                </div>
                <div className="pt-6 border-t border-border/70 mt-6 text-xs text-emerald-700 font-semibold flex items-center justify-between">
                  <span>View Aluminium Engine</span> <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Card>

              <Card className="rounded-2xl border-border glass p-6 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-600 grid place-items-center mb-4">
                    <Droplets className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-medium text-foreground">
                    Chemicals &amp; Pharma
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Process solvents, batch reactor energy, and Zero Liquid Discharge (ZLD) effluent
                    water compliance.
                  </p>
                </div>
                <div className="pt-6 border-t border-border/70 mt-6 text-xs text-sky-700 font-semibold flex items-center justify-between">
                  <span>View Pharma Engine</span> <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Card>

              <Card className="rounded-2xl border-border glass p-6 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-600 grid place-items-center mb-4">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-medium text-foreground">
                    Textiles &amp; Infra
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    High water footprint management, CGWB aquifer stress, green tariff Scope 2 PPA,
                    and supply chain Scope 3.
                  </p>
                </div>
                <div className="pt-6 border-t border-border/70 mt-6 text-xs text-cyan-700 font-semibold flex items-center justify-between">
                  <span>View Textile Engine</span> <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Card>
            </div>
          )}
        </div>
      </RevealSection>

      <Section className="pb-0 sm:pb-0">
        <Reveal>
          <GlassCard className="relative grid items-center gap-8 overflow-hidden p-8 sm:p-12 lg:grid-cols-[1.5fr_1fr]">
            <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-periwinkle/20 blur-[90px]" />
            <div className="relative space-y-4">
              <Eyebrow>Smart Decarbonization</Eyebrow>
              <h3 className="font-display text-3xl text-white sm:text-4xl">
                See decisions change with the data.
              </h3>
              <p className="max-w-xl text-muted-foreground">
                Explore an illustrative multi-location inventory, compare decarbonization actions
                and track projected emissions, investment and savings as you change the plan.
              </p>
              <Note>Interactive illustration. Live company data is not connected.</Note>
            </div>
            <div className="relative flex lg:justify-end">
              <CtaExternal href={SMART_DECARB_URL}>Explore Smart Decarbonization</CtaExternal>
            </div>
          </GlassCard>
        </Reveal>
      </Section>

      {/* 7. REAL-TIME REGULATORY & ESG LIABILITY ESTIMATOR */}
      <RevealSection id="estimator" className="scroll-mt-24 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-lavender">
              Live Estimator
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-foreground mt-3">
              Regulatory Exposure &amp; ESG Estimator
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Adjust facility activity parameters to compute immediate liabilities and BRSR Core
              readiness.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            {/* Input Card */}
            <Card className="lg:col-span-6 rounded-3xl border-border glass shadow-sm flex flex-col justify-between p-6">
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-border/80">
                  <span className="text-sm font-semibold flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-primary" /> Facility Operational Inputs
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    STEP 1 OF 2
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Industry Sector</Label>
                    <Select value={sector} onValueChange={setSector}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="steel">Steel &amp; Metallurgy</SelectItem>
                        <SelectItem value="aluminium">Aluminium Smelters</SelectItem>
                        <SelectItem value="chemicals">Chemicals &amp; Pharma</SelectItem>
                        <SelectItem value="textiles">Textiles &amp; Apparel</SelectItem>
                        <SelectItem value="tech">Corporate Campuses / IT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Annual Turnover (₹ Crore)</Label>
                    <Input
                      type="number"
                      className="bg-background font-mono"
                      value={turnover}
                      onChange={(e) => setTurnover(Number(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Grid Electricity (MWh / yr)</Label>
                    <Input
                      type="number"
                      className="bg-background font-mono"
                      value={powerUnitsMWh}
                      onChange={(e) => setPowerUnitsMWh(Number(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Diesel / Fuel (Litres / yr)</Label>
                    <Input
                      type="number"
                      className="bg-background font-mono"
                      value={fuelLitres}
                      onChange={(e) => setFuelLitres(Number(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">EU Export Volume (Tonnes / yr)</Label>
                  <Input
                    type="number"
                    className="bg-background font-mono"
                    value={euExportsTonnes}
                    onChange={(e) => setEuExportsTonnes(Number(e.target.value) || 0)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Subject to EU Regulation 2023/956 at €69 / tonne default threshold.
                  </p>
                </div>
              </div>
            </Card>

            {/* Calculated Results Card */}
            <Card className="lg:col-span-6 rounded-3xl border-border glass shadow-sm flex flex-col justify-between p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/80">
                  <span className="text-sm font-semibold text-foreground">
                    Estimated Footprint &amp; Liabilities
                  </span>
                  <Badge className="bg-emerald-600 text-white font-mono text-[10px]">
                    REAL-TIME
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl border border-border/80 bg-white/[0.02]">
                    <span className="text-xs text-muted-foreground block">
                      Scope 1 &amp; 2 Footprint
                    </span>
                    <span className="font-display text-2xl font-bold text-foreground mt-1 block">
                      {totalGhg.toLocaleString()}{" "}
                      <span className="text-xs font-normal text-muted-foreground">tCO₂e</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      CEA Factor 0.716 t/MWh
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl border border-border/80 bg-white/[0.02]">
                    <span className="text-xs text-muted-foreground block">
                      EU CBAM Penalty Risk
                    </span>
                    <span className="font-display text-2xl font-bold text-primary mt-1 block">
                      €{cbamRiskPenaltyEur.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Without verified XML filing
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl border border-border/80 bg-white/[0.02]">
                    <span className="text-xs text-muted-foreground block">
                      Estimated Water Intake
                    </span>
                    <span className="font-display text-2xl font-bold text-foreground mt-1 block">
                      {waterEstKL.toLocaleString()}{" "}
                      <span className="text-xs font-normal text-muted-foreground">kL/yr</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground">GRI 303 / Principle 6</span>
                  </div>

                  <div className="p-4 rounded-2xl border border-border/80 bg-white/[0.02]">
                    <span className="text-xs text-muted-foreground block">BRSR Core Readiness</span>
                    <span className="font-display text-2xl font-bold text-emerald-700 mt-1 block">
                      {brsrScore}%
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      9 Essential Attributes
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleLaunchDemo}
                className="w-full h-11 font-semibold text-xs mt-4 gap-2"
              >
                Open Full Audit Dossier in Workspace <ArrowRight className="h-4 w-4" />
              </Button>
            </Card>
          </div>
        </div>
      </RevealSection>

      {/* 8. MARKET BENCHMARK COMPARISON TABLE */}
      <RevealSection id="benchmark" className="scroll-mt-24 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-lavender">
              Market Benchmark
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-foreground mt-3">
              Why Indian Leaders Standardize on clisomumbai
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Comparison across regulatory assurance, CBAM automation, and total cost of ownership.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-border glass shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-white/[0.04] text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-4 pl-6 font-semibold">Capability</th>
                  <th className="p-4 font-bold text-primary bg-primary/10">clisomumbai</th>
                  <th className="p-4 font-medium">NetZerra</th>
                  <th className="p-4 font-medium">Tatva6</th>
                  <th className="p-4 font-medium">Greenio</th>
                  <th className="p-4 pr-6 font-medium">Big-4 Firms</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
                <tr>
                  <td className="p-4 pl-6 font-medium text-foreground">
                    SEBI BRSR Core (Principle 6)
                  </td>
                  <td className="p-4 font-bold text-primary bg-primary/5">✓ Full 9 Attributes</td>
                  <td className="p-4 text-muted-foreground">✗ (CBAM only)</td>
                  <td className="p-4 text-foreground">✓ Partial</td>
                  <td className="p-4 text-foreground">✓ Standard</td>
                  <td className="p-4 text-muted-foreground">Manual Excel</td>
                </tr>
                <tr>
                  <td className="p-4 pl-6 font-medium text-foreground">
                    Water Stewardship (GRI 303 &amp; ZLD)
                  </td>
                  <td className="p-4 font-bold text-primary bg-primary/5">✓ Dedicated Module</td>
                  <td className="p-4 text-muted-foreground">✗ None</td>
                  <td className="p-4 text-foreground">✓ Present</td>
                  <td className="p-4 text-muted-foreground">✗ None</td>
                  <td className="p-4 text-muted-foreground">Manual Excel</td>
                </tr>
                <tr>
                  <td className="p-4 pl-6 font-medium text-foreground">
                    EU CBAM DG TAXUD XML Export
                  </td>
                  <td className="p-4 font-bold text-primary bg-primary/5">✓ Automated + HSN Map</td>
                  <td className="p-4 text-foreground">✓ Automated</td>
                  <td className="p-4 text-muted-foreground">✗ None</td>
                  <td className="p-4 text-muted-foreground">✗ None</td>
                  <td className="p-4 text-muted-foreground">₹5,00,000+</td>
                </tr>
                <tr>
                  <td className="p-4 pl-6 font-medium text-foreground">
                    Kigali ODP / GWP Refrigerants
                  </td>
                  <td className="p-4 font-bold text-primary bg-primary/5">✓ 50+ Substances</td>
                  <td className="p-4 text-muted-foreground">✗ None</td>
                  <td className="p-4 text-muted-foreground">✗ None</td>
                  <td className="p-4 text-muted-foreground">Basic</td>
                  <td className="p-4 text-muted-foreground">Separate fee</td>
                </tr>
                <tr>
                  <td className="p-4 pl-6 font-medium text-foreground">
                    Cryptographic Audit Pack (ZIP)
                  </td>
                  <td className="p-4 font-bold text-primary bg-primary/5">✓ SHA-256 Verified</td>
                  <td className="p-4 text-muted-foreground">XML only</td>
                  <td className="p-4 text-muted-foreground">PDF only</td>
                  <td className="p-4 text-muted-foreground">PDF only</td>
                  <td className="p-4 text-muted-foreground">Paper binders</td>
                </tr>
                <tr>
                  <td className="p-4 pl-6 font-medium text-foreground">Pricing Structure</td>
                  <td className="p-4 font-bold text-primary bg-primary/5">Transparent Tiered</td>
                  <td className="p-4 text-foreground">₹1,50,000 / yr</td>
                  <td className="p-4 text-foreground">Quote-based</td>
                  <td className="p-4 text-foreground">₹2.9k - ₹49.9k/mo</td>
                  <td className="p-4 text-muted-foreground">₹5L - ₹20L+</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </RevealSection>

      {/* 9. TRANSPARENT PRICING GRID */}
      <RevealSection id="pricing" className="scroll-mt-24 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-lavender">
              Pricing Plans
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-foreground mt-3">
              Transparent, Scalable Investment
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Start free on our MSME tier and upgrade seamlessly as your facility compliance scales.
            </p>

            {/* Annual / Monthly Toggle */}
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-border glass p-1 shadow-xs">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`rounded-full px-5 py-1.5 text-xs font-semibold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`rounded-full px-5 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  billingCycle === "annual"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Annual Billing{" "}
                <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-secondary-foreground font-bold">
                  Save 17%
                </span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Starter */}
            <Card className="rounded-3xl border-border glass flex flex-col justify-between p-6 shadow-xs">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Starter / MSME
                </div>
                <div className="mt-4 mb-1">
                  <span className="font-display text-4xl font-bold text-foreground">₹0</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Free forever for single facility
                </div>

                <ul className="space-y-2.5 text-xs text-muted-foreground mt-6">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Scope 1 &amp; Scope 2
                    direct ledger
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> 4 verified PDF
                    reports per year
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> CEA Grid Baseline v19
                    factors
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleLaunchDemo}
                variant="outline"
                className="w-full mt-8 text-xs font-semibold"
              >
                Start Free
              </Button>
            </Card>

            {/* Growth */}
            <Card className="rounded-3xl border-border glass flex flex-col justify-between p-6 shadow-xs">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Growth
                </div>
                <div className="mt-4 mb-1">
                  <span className="font-display text-4xl font-bold text-foreground">
                    {billingCycle === "annual" ? "₹2,499" : "₹2,999"}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">/ month</span>
                </div>
                <div className="text-xs text-muted-foreground">For growing manufacturing units</div>

                <ul className="space-y-2.5 text-xs text-muted-foreground mt-6">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Everything in Starter
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Scope 1, 2 &amp; 3
                    Value Chain
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Water Accounting
                    &amp; GRI 303
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleLaunchDemo}
                variant="outline"
                className="w-full mt-8 text-xs font-semibold"
              >
                Choose Growth
              </Button>
            </Card>

            {/* Pro - Most Popular */}
            <Card className="rounded-3xl border-2 border-primary glass flex flex-col justify-between p-6 relative shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                Most Popular
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-primary">
                  Pro Enterprise
                </div>
                <div className="mt-4 mb-1">
                  <span className="font-display text-4xl font-bold text-foreground">
                    {billingCycle === "annual" ? "₹4,999" : "₹5,999"}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">/ month</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Full SEBI BRSR &amp; Decarbonization
                </div>

                <ul className="space-y-2.5 text-xs text-foreground mt-6">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Everything in Growth
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> SEBI BRSR Principle 6
                    Core exports
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Kigali GWP/ODP
                    Refrigerant Suite
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Decarbonization ROI
                    Roadmaps
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleLaunchDemo}
                className="w-full mt-8 text-xs font-bold shadow-sm"
              >
                Choose Pro
              </Button>
            </Card>

            {/* Enterprise / Exporter */}
            <Card className="rounded-3xl border-border glass flex flex-col justify-between p-6 shadow-xs">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Exporter / Custom
                </div>
                <div className="mt-4 mb-1">
                  <span className="font-display text-4xl font-bold text-foreground">
                    {billingCycle === "annual" ? "₹39,999" : "₹49,999"}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">/ month</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  EU CBAM &amp; Multi-Facility Conglomerates
                </div>

                <ul className="space-y-2.5 text-xs text-muted-foreground mt-6">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Everything in Pro
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> EU CBAM XML Export
                    Engine
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Indian HSN ↔ EU CN
                    Code Engine
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> SHA-256 Audit
                    Evidence Pack ZIP
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleLaunchDemo}
                variant="outline"
                className="w-full mt-8 text-xs font-semibold"
              >
                Talk to Sales
              </Button>
            </Card>
          </div>
        </div>
      </RevealSection>

      {/* 10. ABOUT US & STORY */}
      <RevealSection id="story" className="scroll-mt-24 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <Badge
                variant="outline"
                className="text-primary border-primary/30 text-xs font-bold uppercase tracking-wider"
              >
                OUR STORY &amp; HERITAGE
              </Badge>
              <h2 className="font-display text-3xl sm:text-4xl text-foreground font-normal">
                Born in Mumbai&apos;s Industrial Corridor for Global Compliance.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>clisomumbai (Climate Social Mumbai)</strong> was founded to solve a
                fundamental truth: carbon accounting software built for Silicon Valley SaaS
                companies breaks when dropped onto an Indian factory floor.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Indian heavy industry runs on weighbridge slips, mixed-fuel boilers, and complex
                water recycling setups. We built our engine from the ground up around India CEA grid
                factors, SEBI BRSR Principle 6 Core attributes, and European CBAM tariff rules.
              </p>
              <div className="pt-2 flex items-center gap-6 text-xs text-muted-foreground">
                <div>
                  <div className="font-display text-2xl font-bold text-foreground">15+</div>
                  <div>Years Heavy Industry Domain</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-bold text-foreground">100%</div>
                  <div>Sovereign Data Residency</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-bold text-foreground">ASSA 5010</div>
                  <div>Assurance Standard Built-in</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-3xl border border-border glass p-8 shadow-sm space-y-5">
                <h3 className="font-display text-xl font-medium text-foreground">
                  Our Core Guarantees
                </h3>
                <div className="space-y-4 text-xs text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0 mt-0.5">
                      <Shield className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <strong className="text-foreground block text-sm font-semibold">
                        Zero Spend-Based Guesswork
                      </strong>
                      Every calculation must originate from physical units (litres, kWh, MT) traced
                      to a primary invoice or docket.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-lg bg-emerald-500/10 text-emerald-600 grid place-items-center shrink-0 mt-0.5">
                      <Lock className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <strong className="text-foreground block text-sm font-semibold">
                        Cryptographic Verification
                      </strong>
                      Every audit evidence pack is sealed with a SHA-256 cryptographic checksum for
                      undisputed authenticity.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-lg bg-sky-500/10 text-sky-600 grid place-items-center shrink-0 mt-0.5">
                      <Globe2 className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <strong className="text-foreground block text-sm font-semibold">
                        Global Export Defense
                      </strong>
                      Direct integration with EU DG TAXUD XML formats ensures your export shipments
                      are protected against punitive carbon fines.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* 11. INTERACTIVE FAQ ACCORDION */}
      <RevealSection id="faq" className="scroll-mt-24 py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-lavender">
              Got Questions?
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-foreground mt-3">
              Frequently Asked Questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            <AccordionItem value="item-1" className="border border-border rounded-2xl px-5 glass">
              <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
                Why does spend-based carbon accounting fail SEBI &amp; EU audits?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                The GHG Protocol Scope 3 hierarchy ranks spend-based EEIO data at the lowest level
                of reliability. Under ASSA 5010 assurance standards, auditors require physical
                activity data (such as litres of fuel, kWh, or tonnes of steel) traced to source
                documents, which clisomumbai automates directly.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-border rounded-2xl px-5 glass">
              <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
                How does clisomumbai generate EU CBAM XML filings?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                Our engine automatically maps 8-digit Indian HSN codes to 8-digit European Combined
                Nomenclature (CN) codes, computes direct and indirect specific embedded emissions
                (SEE) per tonne, and outputs compliant DG TAXUD XML files matching official XSD v1.2
                specifications.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-border rounded-2xl px-5 glass">
              <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
                Is our facility data stored within India?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                Yes. All tenant databases and document stores are hosted with 100% sovereign data
                residency in certified Indian cloud data centers with end-to-end AES-256 encryption.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-border rounded-2xl px-5 glass">
              <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
                Can we integrate with our existing ERP (SAP, Oracle, Tally)?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                Yes. We provide pre-built connectors and REST APIs for SAP S/4HANA, TallyPrime,
                Oracle NetSuite, and CSV/Excel batch uploaders for rapid onboarding.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </RevealSection>

      {/* 12. FINAL CALL TO ACTION */}
      <RevealSection className="py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-foreground">
            Ready to Experience Audit-Grade Carbon Intelligence?
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of forward-thinking Indian industrial leaders automating compliance and
            eliminating carbon tariff penalties today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              onClick={handleLaunchDemo}
              size="lg"
              className="h-12 px-8 font-semibold text-sm gap-2 shadow-lg"
            >
              Open Workspace <ArrowRight className="h-4 w-4" />
            </Button>
            <Link
              to="/cbam-checker"
              className="inline-flex items-center justify-center h-12 px-6 rounded-xl border border-border glass hover:bg-muted text-sm font-semibold text-foreground"
            >
              Check CBAM Risk
            </Link>
          </div>
        </div>
      </RevealSection>
    </>
  );
}
