import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Globe,
  Shield,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Sliders,
  Sparkles,
  Layers,
  Download,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { HSN_CN_DATABASE, HsnCnMapping } from "@/lib/cbam";

export const Route = createFileRoute("/_site/cbam-checker")({
  head: () => ({
    meta: [
      { title: "Free EU CBAM Exposure & Penalty Calculator — CliSo Tech" },
      {
        name: "description",
        content:
          "Instant EU CBAM liability calculator for Indian exporters. Check your €69/t carbon tariff risk for Steel, Aluminium, Cement, and Fertilizers in 30 seconds.",
      },
      { property: "og:title", content: "Free EU CBAM Exposure & Penalty Calculator" },
    ],
  }),
  component: CbamCheckerPage,
});

const EU_DESTINATIONS = [
  { code: "DE", name: "Germany (Hamburg / Frankfurt)" },
  { code: "NL", name: "Netherlands (Rotterdam)" },
  { code: "BE", name: "Belgium (Antwerp)" },
  { code: "IT", name: "Italy (Genoa / Trieste)" },
  { code: "FR", name: "France (Le Havre / Marseille)" },
  { code: "ES", name: "Spain (Valencia / Barcelona)" },
  { code: "PL", name: "Poland (Gdansk)" },
];

function CbamCheckerPage() {
  const navigate = useNavigate();

  // Calculator inputs
  const [selectedHsn, setSelectedHsn] = useState<string>("7208");
  const [exportVolumeTonnes, setExportVolumeTonnes] = useState<number>(10000);
  const [euDestination, setEuDestination] = useState<string>("DE");
  const [factorySEE, setFactorySEE] = useState<number>(1.85); // Actual factory Specific Embedded Emissions
  const [cctsPaidInr, setCctsPaidInr] = useState<number>(3500000); // Domestic carbon price paid

  const selectedProduct: HsnCnMapping = useMemo(
    () => HSN_CN_DATABASE.find((m) => m.hsnCode === selectedHsn) || HSN_CN_DATABASE[0],
    [selectedHsn],
  );

  // Update default factory SEE when product changes
  const handleProductChange = (hsn: string) => {
    setSelectedHsn(hsn);
    const prod = HSN_CN_DATABASE.find((m) => m.hsnCode === hsn);
    if (prod) {
      setFactorySEE(prod.typicalIndianSEE);
    }
  };

  // Computations
  const cbamPricePerTonneEur = 69;
  const inrToEurRate = 90;

  // 1. Default EU Benchmark Liability (If filing without verified primary data)
  const defaultTotalEmissionsTCO2e = exportVolumeTonnes * selectedProduct.defaultEuBenchmarkSEE;
  const defaultGrossLiabilityEur = defaultTotalEmissionsTCO2e * cbamPricePerTonneEur;
  const defaultLiabilityInr = defaultGrossLiabilityEur * inrToEurRate;

  // 2. Verified Factory Data Liability (With clisomumbai primary ledger)
  const factoryTotalEmissionsTCO2e = exportVolumeTonnes * factorySEE;
  const factoryGrossLiabilityEur = factoryTotalEmissionsTCO2e * cbamPricePerTonneEur;
  const carbonPriceDeductionEur = cctsPaidInr / inrToEurRate;
  const factoryNetLiabilityEur = Math.max(0, factoryGrossLiabilityEur - carbonPriceDeductionEur);
  const factoryNetLiabilityInr = factoryNetLiabilityEur * inrToEurRate;

  // 3. Cost Savings by using clisomumbai verified primary ledger
  const totalSavingsEur = Math.max(0, defaultGrossLiabilityEur - factoryNetLiabilityEur);
  const totalSavingsInr = totalSavingsEur * inrToEurRate;

  // The full CBAM Hub lives in the signed-in workspace.
  const handleLaunchDemo = () => navigate({ to: "/cbam" });

  const handleDownloadRiskBrief = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = 595.28;
    const H = 841.89;

    // Header Banner
    doc.setFillColor(15, 42, 24); // #0F2A18 deep forest
    doc.rect(0, 0, W, 85, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("clisomumbai", 44, 40);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(180, 230, 200);
    doc.text("EXECUTIVE EU CBAM EXPOSURE & TARIFF RISK ASSESSMENT BRIEF", 44, 58);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, W - 140, 40);
    doc.text(`EU Regulation 2023/956`, W - 140, 55);

    // Meta Block
    doc.setFillColor(245, 248, 246);
    doc.rect(44, 105, W - 88, 65, "F");
    doc.setDrawColor(220, 230, 225);
    doc.rect(44, 105, W - 88, 65, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20, 45, 30);
    doc.text(`Assessed Commodity: ${selectedProduct.productName}`, 58, 126);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(80, 100, 90);
    doc.text(
      `Indian HSN: ${selectedProduct.hsnCode} | EU CN Code: ${selectedProduct.cnCode}`,
      58,
      144,
    );
    doc.text(
      `Annual EU Export Volume: ${exportVolumeTonnes.toLocaleString()} MT | Destination: ${euDestination}`,
      58,
      158,
    );

    // Summary Cards
    const kpis = [
      {
        label: "Default Tariff Risk",
        val: `€${Math.round(defaultGrossLiabilityEur).toLocaleString()}`,
        sub: `₹${(defaultLiabilityInr / 10000000).toFixed(2)} Cr`,
      },
      {
        label: "Verified Primary Data",
        val: `€${Math.round(factoryNetLiabilityEur).toLocaleString()}`,
        sub: `₹${(factoryNetLiabilityInr / 10000000).toFixed(2)} Cr`,
      },
      {
        label: "Tariff Savings",
        val: `€${Math.round(totalSavingsEur).toLocaleString()}`,
        sub: `₹${(totalSavingsInr / 10000000).toFixed(2)} Cr Saved`,
      },
      { label: "Penalty Fine Risk", val: `€69 / t`, sub: "Non-compliance rate" },
    ];

    kpis.forEach((k, idx) => {
      const cardW = (W - 88 - 30) / 4;
      const cardX = 44 + idx * (cardW + 10);
      const cardY = 185;

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(225, 235, 230);
      doc.roundedRect(cardX, cardY, cardW, 65, 4, 4, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(90, 110, 100);
      doc.text(k.label.toUpperCase(), cardX + 8, cardY + 18);

      doc.setFontSize(11.5);
      doc.setTextColor(idx === 2 ? 20 : 10, idx === 2 ? 120 : 50, idx === 2 ? 40 : 30);
      doc.text(k.val, cardX + 8, cardY + 38);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(120, 135, 125);
      doc.text(k.sub, cardX + 8, cardY + 54);
    });

    // Breakdown Table
    let currentY = 275;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 40, 25);
    doc.text("1. Default Punitive Benchmark vs Verified Factory Data Comparison", 44, currentY);

    currentY += 14;
    doc.setFillColor(235, 243, 238);
    doc.rect(44, currentY, W - 88, 20, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(25, 55, 35);
    doc.text("Scenario / Factor", 54, currentY + 13);
    doc.text("Specific Intensity (SEE)", 250, currentY + 13);
    doc.text("Total Embedded CO2e", 370, currentY + 13);
    doc.text("Payable Liability (EUR)", 465, currentY + 13);

    currentY += 20;

    const rows = [
      {
        label: "Default EU Benchmark (Worst-case default)",
        see: `${selectedProduct.defaultEuBenchmarkSEE.toFixed(2)} t/t`,
        total: `${Math.round(defaultTotalEmissionsTCO2e).toLocaleString()} t`,
        liability: `€${Math.round(defaultGrossLiabilityEur).toLocaleString()}`,
      },
      {
        label: "Verified Primary Factory Data (Actual ledger)",
        see: `${factorySEE.toFixed(2)} t/t`,
        total: `${Math.round(factoryTotalEmissionsTCO2e).toLocaleString()} t`,
        liability: `€${Math.round(factoryGrossLiabilityEur).toLocaleString()}`,
      },
      {
        label: "Article 9 Deduction (India Domestic CCTS Carbon Price)",
        see: "—",
        total: "—",
        liability: `-€${Math.round(carbonPriceDeductionEur).toLocaleString()}`,
      },
      {
        label: "NET PAYABLE CBAM CERTIFICATE COST",
        see: `${factorySEE.toFixed(2)} t/t`,
        total: `${Math.round(factoryTotalEmissionsTCO2e).toLocaleString()} t`,
        liability: `€${Math.round(factoryNetLiabilityEur).toLocaleString()}`,
      },
    ];

    rows.forEach((r, idx) => {
      const isTotal = idx === rows.length - 1;
      doc.setFillColor(isTotal ? 245 : 255, isTotal ? 248 : 255, isTotal ? 246 : 255);
      doc.rect(44, currentY, W - 88, 20, "F");
      doc.setDrawColor(230, 235, 232);
      doc.line(44, currentY + 20, W - 44, currentY + 20);

      doc.setFont("helvetica", isTotal ? "bold" : "normal");
      doc.setFontSize(8);
      doc.setTextColor(isTotal ? 15 : 40, isTotal ? 40 : 55, isTotal ? 25 : 45);
      doc.text(r.label, 54, currentY + 13);
      doc.text(r.see, 250, currentY + 13);
      doc.text(r.total, 370, currentY + 13);
      doc.text(r.liability, 465, currentY + 13);

      currentY += 20;
    });

    // Executive Recommendation
    currentY += 25;
    doc.setFillColor(245, 248, 246);
    doc.rect(44, currentY, W - 88, 75, "F");
    doc.setDrawColor(220, 230, 225);
    doc.rect(44, currentY, W - 88, 75, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(20, 45, 30);
    doc.text("Strategic Compliance Recommendation", 58, currentY + 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(80, 100, 90);
    doc.text(
      `By replacing default European benchmarks with verified primary plant data via clisomumbai, your enterprise saves`,
      58,
      currentY + 36,
    );
    doc.text(
      `an estimated €${Math.round(totalSavingsEur).toLocaleString()} (~₹${(totalSavingsInr / 10000000).toFixed(2)} Crore) annually and completely eliminates non-compliance penalties.`,
      58,
      currentY + 48,
    );
    doc.text(
      `Generate your official DG TAXUD XML quarterly filing directly at https://clisomumbai.com`,
      58,
      currentY + 62,
    );

    // Footer
    doc.setFillColor(245, 248, 246);
    doc.rect(44, H - 65, W - 88, 35, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 120, 110);
    doc.text(
      "Generated by clisomumbai (Climate Social Mumbai) — Instant EU CBAM Exposure Calculator.",
      54,
      H - 48,
    );
    doc.text(
      "Methodology aligned with EU Regulation 2023/956 & Implementing Regulation 2023/1773.",
      54,
      H - 36,
    );

    doc.save(`clisomumbai-cbam-exposure-brief-${selectedHsn}.pdf`);
    toast.success("Downloaded Executive CBAM Risk Brief PDF.");
  };

  return (
    <div className="pt-24">
      {/* Top Banner */}
      <div className="mx-auto mt-4 w-fit max-w-[92%] rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 text-center text-xs text-muted-foreground backdrop-blur">
        <span className="font-semibold text-foreground">EU CBAM Penalty Alert:</span> Importers
        without verified primary plant data face a{" "}
        <span className="font-semibold text-primary">€69 / tonne penalty fine</span> starting 2026.
      </div>

      {/* Main Content */}
      <main className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border glass px-3.5 py-1 text-xs font-medium text-muted-foreground shadow-xs">
            <Globe className="h-3.5 w-3.5 text-primary" /> Free Interactive Assessment
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-normal tracking-tight text-foreground">
            Is Your Product Subject to{" "}
            <span className="text-gradient italic">EU CBAM Tariffs?</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Select your Indian commodity HSN code and annual European export volume to calculate
            your exact financial liability, penalty risk, and primary data savings in 30 seconds.
          </p>
        </div>

        {/* Interactive Calculator Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Input Form Card */}
          <Card className="lg:col-span-5 rounded-2xl border-border glass shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" /> Step 1: Export Shipment Details
              </CardTitle>
              <CardDescription>Select your commodity and intended EU destination.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <Label className="text-xs">Product &amp; Indian HSN Code *</Label>
                <Select value={selectedHsn} onValueChange={handleProductChange}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HSN_CN_DATABASE.map((m) => (
                      <SelectItem key={m.hsnCode} value={m.hsnCode}>
                        HSN {m.hsnCode} — {m.productName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                  <span>
                    EU CN Code:{" "}
                    <strong className="text-foreground font-mono">{selectedProduct.cnCode}</strong>
                  </span>
                  <span>·</span>
                  <span className="capitalize">{selectedProduct.sector.replace("_", " ")}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Annual Export Volume to EU (Metric Tonnes) *</Label>
                <Input
                  type="number"
                  min="1"
                  className="bg-background font-mono"
                  value={exportVolumeTonnes}
                  onChange={(e) => setExportVolumeTonnes(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Destination EU Member State</Label>
                <Select value={euDestination} onValueChange={setEuDestination}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EU_DESTINATIONS.map((d) => (
                      <SelectItem key={d.code} value={d.code}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3.5 rounded-xl border border-border/80 bg-white/[0.02] space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">
                    Factory Specific Emissions ($SEE$)
                  </Label>
                  <span className="font-mono text-xs text-primary font-medium">
                    {factorySEE} tCO₂e/t
                  </span>
                </div>
                <Input
                  type="number"
                  step="0.05"
                  className="h-8 text-xs font-mono bg-background"
                  value={factorySEE}
                  onChange={(e) => setFactorySEE(Number(e.target.value))}
                />
                <p className="text-[11px] text-muted-foreground">
                  Typical Indian plant achieves {selectedProduct.typicalIndianSEE} t/t vs EU
                  punitive default {selectedProduct.defaultEuBenchmarkSEE} t/t.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Domestic Indian Carbon Price Paid / CCTS (₹)</Label>
                <Input
                  type="number"
                  className="bg-background font-mono text-xs"
                  value={cctsPaidInr}
                  onChange={(e) => setCctsPaidInr(Number(e.target.value))}
                />
                <p className="text-[10px] text-muted-foreground">
                  Eligible for Article 9 credit deduction against EU certificate purchase.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Results Output Card */}
          <Card className="lg:col-span-7 rounded-2xl border-border glass shadow-sm space-y-5 p-6">
            <div>
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Assessment Verdict
                  </span>
                  <h3 className="font-display text-xl font-medium text-foreground mt-0.5">
                    Financial Liability &amp; Tariff Risk Summary
                  </h3>
                </div>
                <Badge className="bg-primary text-primary-foreground text-[10px]">
                  EU ETS @ €69 / t
                </Badge>
              </div>
            </div>

            {/* Savings Hero Banner */}
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
                  Potential Savings with Verified Primary Data
                </span>
                <div className="font-display text-2xl font-bold text-emerald-900 mt-0.5">
                  €{Math.round(totalSavingsEur).toLocaleString()}{" "}
                  <span className="text-xs font-normal font-sans text-emerald-800">
                    (~₹{(totalSavingsInr / 10000000).toFixed(2)} Crore)
                  </span>
                </div>
              </div>
              <CheckCircle2 className="h-7 w-7 text-emerald-700 shrink-0" />
            </div>

            {/* Side by side comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border/80 bg-white/[0.02] space-y-1">
                <span className="text-xs text-muted-foreground block">
                  Worst-Case Default EU Penalty
                </span>
                <span className="font-display text-2xl font-medium text-foreground block">
                  €{Math.round(defaultGrossLiabilityEur).toLocaleString()}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  ₹{(defaultLiabilityInr / 10000000).toFixed(2)} Cr at{" "}
                  {selectedProduct.defaultEuBenchmarkSEE} t/t default
                </span>
              </div>

              <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-1">
                <span className="text-xs text-primary font-medium block">
                  Verified Plant Net Cost
                </span>
                <span className="font-display text-2xl font-medium text-primary block">
                  €{Math.round(factoryNetLiabilityEur).toLocaleString()}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  ₹{(factoryNetLiabilityInr / 10000000).toFixed(2)} Cr after CCTS credit
                </span>
              </div>
            </div>

            {/* Timeline Checklist */}
            <div className="p-4 rounded-xl border border-border/60 bg-white/[0.03] space-y-2 text-xs">
              <span className="font-semibold text-foreground uppercase tracking-wider block text-[11px]">
                EU CBAM Compliance Timeline Requirements
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground pt-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  <span>Quarterly DG TAXUD XML Filings</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  <span>Primary plant fuel &amp; power ledgers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  <span>Precursor supply chain tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  <span>Accredited verification audit report</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button
                onClick={handleDownloadRiskBrief}
                variant="outline"
                className="w-full sm:w-auto h-10 text-xs gap-2"
              >
                <Download className="h-4 w-4" /> Download Executive Risk Brief PDF
              </Button>
              <Button
                onClick={handleLaunchDemo}
                className="w-full sm:flex-1 h-10 text-xs font-medium gap-1.5"
              >
                Generate DG TAXUD XML in Workspace <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
