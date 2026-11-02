import { jsPDF } from "jspdf";

export type CctsSector =
  | "thermal_power"
  | "iron_steel"
  | "cement"
  | "aluminium"
  | "fertilizers"
  | "chlor_alkali"
  | "textiles"
  | "pulp_paper"
  | "refineries";

export type RegionalCeaGrid = {
  region: string;
  gridFactorKgPerKwh: number; // kg CO2 / kWh
  states: string[];
};

export const CEA_REGIONAL_GRIDS: Record<string, RegionalCeaGrid> = {
  national_avg: {
    region: "National Grid Average (India)",
    gridFactorKgPerKwh: 0.675,
    states: ["All India Consolidated Average"],
  },
  western_grid: {
    region: "Western Regional Grid",
    gridFactorKgPerKwh: 0.702,
    states: ["Maharashtra", "Gujarat", "Madhya Pradesh", "Chhattisgarh", "Goa"],
  },
  northern_grid: {
    region: "Northern Regional Grid",
    gridFactorKgPerKwh: 0.688,
    states: ["Delhi", "Haryana", "Punjab", "Uttar Pradesh", "Rajasthan", "Himachal Pradesh"],
  },
  southern_grid: {
    region: "Southern Regional Grid",
    gridFactorKgPerKwh: 0.651,
    states: ["Karnataka", "Tamil Nadu", "Andhra Pradesh", "Telangana", "Kerala"],
  },
  eastern_grid: {
    region: "Eastern Regional Grid",
    gridFactorKgPerKwh: 0.764,
    states: ["West Bengal", "Odisha", "Jharkhand", "Bihar"],
  },
  northeastern_grid: {
    region: "North-Eastern Regional Grid",
    gridFactorKgPerKwh: 0.490,
    states: ["Assam", "Meghalaya", "Tripura", "Arunachal Pradesh"],
  },
};

export type CctsEntityRecord = {
  id: string;
  facilityName: string;
  dcCode: string; // BEE Designated Consumer (DC) Code, e.g. "DC-ST-042"
  sector: CctsSector;
  region: string;
  complianceYear: string; // e.g. "2025-26"
  baselineEmissionIntensity: number; // tCO2e / tonne product
  targetEmissionIntensity: number; // tCO2e / tonne product set by BEE
  actualVerifiedIntensity: number; // tCO2e / tonne product achieved
  annualProductionTonnes: number; // Production MT
  carbonCreditsEarned: number; // Surplus CCC (tCO2e)
  complianceStatus: "SURPLUS_EARNED" | "TARGET_ACHIEVED" | "DEFICIT_SHORTFALL";
  estimatedMarketValueInr: number; // Valued at prevailing IEX carbon price
  auditAgency: string;
  verifiedDate: string;
};

export const SAMPLE_CCTS_RECORDS: CctsEntityRecord[] = [
  {
    id: "ccts-dc-01",
    facilityName: "Raigad Integrated Blast Furnace",
    dcCode: "DC-MH-ST-108",
    sector: "iron_steel",
    region: "western_grid",
    complianceYear: "FY 2025-26",
    baselineEmissionIntensity: 2.10,
    targetEmissionIntensity: 1.95,
    actualVerifiedIntensity: 1.82,
    annualProductionTonnes: 120000,
    carbonCreditsEarned: 15600, // (1.95 - 1.82) * 120000 = 15600 CCCs
    complianceStatus: "SURPLUS_EARNED",
    estimatedMarketValueInr: 28080000, // @ ₹1,800 / CCC
    auditAgency: "Bureau of Energy Efficiency (BEE) Accredited Energy Auditor",
    verifiedDate: "2026-03-30",
  },
  {
    id: "ccts-dc-02",
    facilityName: "Pune Precision Metallurgy Rolling Mill",
    dcCode: "DC-MH-ST-142",
    sector: "iron_steel",
    region: "western_grid",
    complianceYear: "FY 2025-26",
    baselineEmissionIntensity: 0.85,
    targetEmissionIntensity: 0.78,
    actualVerifiedIntensity: 0.72,
    annualProductionTonnes: 45000,
    carbonCreditsEarned: 2700, // (0.78 - 0.72) * 45000 = 2700 CCCs
    complianceStatus: "SURPLUS_EARNED",
    estimatedMarketValueInr: 4860000, // @ ₹1,800 / CCC
    auditAgency: "National Productivity Council (NPC) Carbon Verifier",
    verifiedDate: "2026-04-12",
  },
];

/**
 * Calculates CCTS Carbon Credit Certificates (CCC) and Indian Carbon Market valuation
 */
export function calculateCctsMetrics(params: {
  targetIntensity: number;
  actualIntensity: number;
  annualProductionTonnes: number;
  cccMarketPriceInr?: number;
}) {
  const { targetIntensity, actualIntensity, annualProductionTonnes, cccMarketPriceInr = 1800 } = params;

  const deltaIntensity = targetIntensity - actualIntensity;
  const netCcc = deltaIntensity * annualProductionTonnes;
  const isSurplus = netCcc > 0;
  const estimatedMarketValueInr = Math.abs(netCcc) * cccMarketPriceInr;

  return {
    deltaIntensity: Number(deltaIntensity.toFixed(3)),
    netCcc: Math.round(netCcc),
    isSurplus,
    complianceStatus: isSurplus ? ("SURPLUS_EARNED" as const) : ("DEFICIT_SHORTFALL" as const),
    estimatedMarketValueInr: Math.round(estimatedMarketValueInr),
  };
}

/**
 * Exports an official CCTS BEE Compliance Statement PDF
 */
export function exportCctsCompliancePdf(record: CctsEntityRecord) {
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
  doc.text("INDIAN CARBON CREDIT TRADING SCHEME (CCTS) COMPLIANCE CERTIFICATE", 44, 58);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(`Period: ${record.complianceYear}`, W - 140, 40);
  doc.text(`Energy Conservation Act 2001`, W - 140, 55);

  // Metadata block
  doc.setFillColor(245, 248, 246);
  doc.rect(44, 105, W - 88, 65, "F");
  doc.setDrawColor(220, 230, 225);
  doc.rect(44, 105, W - 88, 65, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 45, 30);
  doc.text(`Designated Consumer: ${record.facilityName}`, 58, 125);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(80, 100, 90);
  doc.text(`BEE DC Registration Code: ${record.dcCode} | Sector: ${record.sector.toUpperCase()}`, 58, 142);
  doc.text(`Accredited Verification Body: ${record.auditAgency}`, 58, 158);

  // Key KPI Cards
  const kpis = [
    { label: "BEE Target Intensity", val: `${record.targetEmissionIntensity} t/t`, sub: "Mandated emission cap" },
    { label: "Verified Intensity", val: `${record.actualVerifiedIntensity} t/t`, sub: "Achieved factory performance" },
    { label: "Carbon Credits (CCC)", val: `${record.carbonCreditsEarned.toLocaleString()}`, sub: "1 CCC = 1 tCO2e reduction" },
    { label: "Market Valuation", val: `₹${(record.estimatedMarketValueInr / 100000).toFixed(1)} Lakh`, sub: "@ ₹1,800 / CCC exchange rate" },
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

    doc.setFontSize(12);
    doc.setTextColor(10, 50, 30);
    doc.text(k.val, cardX + 8, cardY + 38);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(120, 135, 125);
    doc.text(k.sub, cardX + 8, cardY + 54);
  });

  // Detailed Ledger Table
  let currentY = 275;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 40, 25);
  doc.text("1. Emission Target vs Verified Production Ledger", 44, currentY);

  currentY += 14;
  doc.setFillColor(235, 243, 238);
  doc.rect(44, currentY, W - 88, 20, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(25, 55, 35);
  doc.text("Parameter", 54, currentY + 13);
  doc.text("Value", 280, currentY + 13);
  doc.text("Unit", 380, currentY + 13);
  doc.text("Compliance Note", 460, currentY + 13);

  currentY += 20;

  const rows = [
    { label: "Annual Production Volume", val: record.annualProductionTonnes.toLocaleString(), unit: "Metric Tonnes", note: "Verified weighbridge records" },
    { label: "BEE Target Specific GHG Intensity", val: record.targetEmissionIntensity.toFixed(3), unit: "tCO2e / MT", note: "Gazette Target Notification" },
    { label: "Verified Specific GHG Intensity", val: record.actualVerifiedIntensity.toFixed(3), unit: "tCO2e / MT", note: "Primary energy meter audit" },
    { label: "Specific Reduction Achieved", val: (record.targetEmissionIntensity - record.actualVerifiedIntensity).toFixed(3), unit: "tCO2e / MT", note: "Over-achievement margin" },
    { label: "TOTAL CARBON CREDIT CERTIFICATES (CCC)", val: record.carbonCreditsEarned.toLocaleString(), unit: "CCC Units", note: "Issued under CCTS Rules 2023" },
    { label: "Tradeable Exchange Value on IEX/PXIL", val: `₹${record.estimatedMarketValueInr.toLocaleString()}`, unit: "INR (₹)", note: "Monetization potential" },
  ];

  rows.forEach((r, idx) => {
    const isTotal = idx === 4;
    doc.setFillColor(isTotal ? 245 : 255, isTotal ? 248 : 255, isTotal ? 246 : 255);
    doc.rect(44, currentY, W - 88, 20, "F");
    doc.setDrawColor(230, 235, 232);
    doc.line(44, currentY + 20, W - 44, currentY + 20);

    doc.setFont("helvetica", isTotal ? "bold" : "normal");
    doc.setFontSize(8);
    doc.setTextColor(isTotal ? 15 : 40, isTotal ? 40 : 55, isTotal ? 25 : 45);
    doc.text(r.label, 54, currentY + 13);
    doc.text(r.val, 280, currentY + 13);
    doc.text(r.unit, 380, currentY + 13);
    doc.setFontSize(7);
    doc.text(r.note, 460, currentY + 13);

    currentY += 20;
  });

  // Signoff Block
  currentY += 30;
  doc.setFillColor(245, 248, 246);
  doc.rect(44, currentY, W - 88, 65, "F");
  doc.setDrawColor(220, 230, 225);
  doc.rect(44, currentY, W - 88, 65, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(20, 45, 30);
  doc.text("Compliance Verdict: APPROVED & ISSUED", 58, currentY + 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 100, 90);
  doc.text("This certificate certifies that the Designated Consumer has surpassed the specified greenhouse gas emission intensity target.", 58, currentY + 36);
  doc.text("The issued Carbon Credit Certificates are eligible for trading on recognized Indian Power Exchanges (IEX/PXIL).", 58, currentY + 50);

  // Footer
  doc.setFillColor(245, 248, 246);
  doc.rect(44, H - 65, W - 88, 35, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 120, 110);
  doc.text("Generated by clisomumbai (Climate Social Mumbai) — National Carbon Market & BEE PAT Compliance Engine.", 54, H - 48);
  doc.text("Aligned with Ministry of Power Notification S.O. 2825(E) and Central Electricity Authority (CEA) baselines.", 54, H - 36);

  doc.save(`clisomumbai-ccts-compliance-${record.dcCode}.pdf`);
}
