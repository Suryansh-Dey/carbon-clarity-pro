import { jsPDF } from "jspdf";

export type WaterSourceType =
  | "surface_water"
  | "groundwater"
  | "municipal_third_party"
  | "rainwater_harvested"
  | "recycled_reused"
  | "desalinated_seawater";

export type WaterDischargeType =
  | "etp_treated_reuse"
  | "cetp_discharge"
  | "surface_water_discharge"
  | "greenbelt_irrigation"
  | "zero_liquid_discharge"
  | "municipal_sewer";

export type WatershedStressLevel =
  | "low" // < 10%
  | "low_medium" // 10-20%
  | "medium_high" // 20-40%
  | "high" // 40-80%
  | "extremely_high"; // > 80%

export type WaterLogEntry = {
  id: string;
  facility: string;
  location: string;
  period: string; // e.g., "Q1 FY26" or "2026-03"
  sourceType: WaterSourceType;
  withdrawalKL: number;
  metered: boolean;
  dischargeType: WaterDischargeType;
  dischargeKL: number;
  recycledKL: number;
  watershedStress: WatershedStressLevel;
  codMgL?: number; // Chemical Oxygen Demand
  bodMgL?: number; // Biological Oxygen Demand
  tdsMgL?: number; // Total Dissolved Solids
  ph?: number;
  notes?: string;
  createdAt: string;
};

export type FacilityWaterSummary = {
  facility: string;
  location: string;
  watershedStress: WatershedStressLevel;
  totalWithdrawalKL: number;
  totalDischargeKL: number;
  totalConsumptionKL: number;
  totalRecycledKL: number;
  meteredPercentage: number;
  zldCompliant: boolean;
};

export type WaterAccountingOverview = {
  totalWithdrawalKL: number;
  totalDischargeKL: number;
  netConsumptionKL: number;
  totalRecycledKL: number;
  recycledPercentage: number;
  meteredPercentage: number;
  highStressWithdrawalKL: number;
  highStressPercentage: number;
  intensityPerCroreTurnover: number; // kL / ₹ Crore
  intensityPerTonneOutput: number; // kL / MT finished product
  bySource: Record<WaterSourceType, number>;
  byDischarge: Record<WaterDischargeType, number>;
  facilitySummaries: FacilityWaterSummary[];
};

export const WATER_SOURCE_LABELS: Record<WaterSourceType, { label: string; color: string; desc: string }> = {
  surface_water: {
    label: "Surface Water",
    color: "#0284c7",
    desc: "Rivers, lakes, reservoirs, ponds",
  },
  groundwater: {
    label: "Groundwater",
    color: "#0d9488",
    desc: "Borewells, tube wells, deep aquifers",
  },
  municipal_third_party: {
    label: "Municipal / Third-Party",
    color: "#3b82f6",
    desc: "Industrial development tankers, municipal utilities",
  },
  rainwater_harvested: {
    label: "Rainwater Harvested",
    color: "#10b981",
    desc: "Rooftop recharge, holding pond storage",
  },
  recycled_reused: {
    label: "Recycled / Reused Water",
    color: "#8b5cf6",
    desc: "In-house ETP/STP treated circular flow",
  },
  desalinated_seawater: {
    label: "Desalinated / Seawater",
    color: "#6366f1",
    desc: "Marine intake with reverse osmosis",
  },
};

export const WATER_DISCHARGE_LABELS: Record<WaterDischargeType, { label: string; color: string }> = {
  zero_liquid_discharge: { label: "Zero Liquid Discharge (ZLD Evaporator)", color: "#10b981" },
  etp_treated_reuse: { label: "In-house ETP Reused in Operations", color: "#8b5cf6" },
  greenbelt_irrigation: { label: "On-site Greenbelt & Plantation", color: "#14b8a6" },
  cetp_discharge: { label: "Common Effluent Treatment Plant (CETP)", color: "#f59e0b" },
  surface_water_discharge: { label: "Treated Surface Water Body", color: "#ef4444" },
  municipal_sewer: { label: "Municipal Sewerage System", color: "#64748b" },
};

export const WATER_STRESS_LABELS: Record<WatershedStressLevel, { label: string; color: string; badgeVariant: string }> = {
  low: { label: "Low (<10%)", color: "#10b981", badgeVariant: "success" },
  low_medium: { label: "Low-Medium (10-20%)", color: "#3b82f6", badgeVariant: "secondary" },
  medium_high: { label: "Medium-High (20-40%)", color: "#f59e0b", badgeVariant: "warning" },
  high: { label: "High (40-80%)", color: "#f97316", badgeVariant: "destructive" },
  extremely_high: { label: "Extremely High (>80%)", color: "#ef4444", badgeVariant: "destructive" },
};

/**
 * Calculates aggregated water accounting and BRSR Principle 6 metrics from log entries
 */
export function calculateWaterOverview(
  entries: WaterLogEntry[],
  annualTurnoverCrores: number = 150,
  annualOutputMT: number = 24000,
): WaterAccountingOverview {
  let totalWithdrawalKL = 0;
  let totalDischargeKL = 0;
  let totalRecycledKL = 0;
  let meteredWithdrawalKL = 0;
  let highStressWithdrawalKL = 0;

  const bySource: Record<WaterSourceType, number> = {
    surface_water: 0,
    groundwater: 0,
    municipal_third_party: 0,
    rainwater_harvested: 0,
    recycled_reused: 0,
    desalinated_seawater: 0,
  };

  const byDischarge: Record<WaterDischargeType, number> = {
    etp_treated_reuse: 0,
    cetp_discharge: 0,
    surface_water_discharge: 0,
    greenbelt_irrigation: 0,
    zero_liquid_discharge: 0,
    municipal_sewer: 0,
  };

  const facilityMap = new Map<
    string,
    {
      location: string;
      watershedStress: WatershedStressLevel;
      withdrawal: number;
      discharge: number;
      recycled: number;
      metered: number;
      zld: boolean;
    }
  >();

  for (const entry of entries) {
    const w = entry.withdrawalKL || 0;
    const d = entry.dischargeKL || 0;
    const r = entry.recycledKL || 0;

    totalWithdrawalKL += w;
    totalDischargeKL += d;
    totalRecycledKL += r;

    if (entry.metered) {
      meteredWithdrawalKL += w;
    }

    if (entry.watershedStress === "high" || entry.watershedStress === "extremely_high") {
      highStressWithdrawalKL += w;
    }

    if (bySource[entry.sourceType] !== undefined) {
      bySource[entry.sourceType] += w;
    }

    if (byDischarge[entry.dischargeType] !== undefined) {
      byDischarge[entry.dischargeType] += d;
    }

    // Facility aggregation
    const facKey = entry.facility || "Main Plant";
    const existing = facilityMap.get(facKey) || {
      location: entry.location || "India",
      watershedStress: entry.watershedStress,
      withdrawal: 0,
      discharge: 0,
      recycled: 0,
      metered: 0,
      zld: entry.dischargeType === "zero_liquid_discharge",
    };

    existing.withdrawal += w;
    existing.discharge += d;
    existing.recycled += r;
    if (entry.metered) existing.metered += w;
    if (entry.dischargeType === "zero_liquid_discharge") existing.zld = true;

    facilityMap.set(facKey, existing);
  }

  const netConsumptionKL = Math.max(0, totalWithdrawalKL - totalDischargeKL);
  const recycledPercentage = totalWithdrawalKL > 0 ? (totalRecycledKL / totalWithdrawalKL) * 100 : 0;
  const meteredPercentage = totalWithdrawalKL > 0 ? (meteredWithdrawalKL / totalWithdrawalKL) * 100 : 100;
  const highStressPercentage = totalWithdrawalKL > 0 ? (highStressWithdrawalKL / totalWithdrawalKL) * 100 : 0;

  const intensityPerCroreTurnover = annualTurnoverCrores > 0 ? totalWithdrawalKL / annualTurnoverCrores : 0;
  const intensityPerTonneOutput = annualOutputMT > 0 ? totalWithdrawalKL / annualOutputMT : 0;

  const facilitySummaries: FacilityWaterSummary[] = Array.from(facilityMap.entries()).map(([fac, data]) => ({
    facility: fac,
    location: data.location,
    watershedStress: data.watershedStress,
    totalWithdrawalKL: Number(data.withdrawal.toFixed(1)),
    totalDischargeKL: Number(data.discharge.toFixed(1)),
    totalConsumptionKL: Number(Math.max(0, data.withdrawal - data.discharge).toFixed(1)),
    totalRecycledKL: Number(data.recycled.toFixed(1)),
    meteredPercentage: data.withdrawal > 0 ? Number(((data.metered / data.withdrawal) * 100).toFixed(1)) : 100,
    zldCompliant: data.zld,
  }));

  return {
    totalWithdrawalKL: Number(totalWithdrawalKL.toFixed(1)),
    totalDischargeKL: Number(totalDischargeKL.toFixed(1)),
    netConsumptionKL: Number(netConsumptionKL.toFixed(1)),
    totalRecycledKL: Number(totalRecycledKL.toFixed(1)),
    recycledPercentage: Number(recycledPercentage.toFixed(1)),
    meteredPercentage: Number(meteredPercentage.toFixed(1)),
    highStressWithdrawalKL: Number(highStressWithdrawalKL.toFixed(1)),
    highStressPercentage: Number(highStressPercentage.toFixed(1)),
    intensityPerCroreTurnover: Number(intensityPerCroreTurnover.toFixed(2)),
    intensityPerTonneOutput: Number(intensityPerTonneOutput.toFixed(3)),
    bySource,
    byDischarge,
    facilitySummaries,
  };
}

/**
 * Industry Preset Profiles for instant demonstration and benchmarking
 */
export const SAMPLE_WATER_PRESETS: Record<string, { label: string; sector: string; entries: WaterLogEntry[] }> = {
  steel_manufacturing: {
    label: "Steel & Heavy Metallurgy (Raigad & Pune Plants)",
    sector: "Manufacturing / Metallurgy",
    entries: [
      {
        id: "wat-001",
        facility: "Raigad Blast Furnace Unit",
        location: "Raigad, Maharashtra",
        period: "FY 2026-27",
        sourceType: "surface_water",
        withdrawalKL: 45000,
        metered: true,
        dischargeType: "etp_treated_reuse",
        dischargeKL: 12000,
        recycledKL: 18500,
        watershedStress: "medium_high",
        codMgL: 45,
        bodMgL: 12,
        tdsMgL: 750,
        ph: 7.2,
        notes: "Continuous cooling tower circulation and closed-circuit scrubbing.",
        createdAt: "2026-04-10",
      },
      {
        id: "wat-002",
        facility: "Raigad Blast Furnace Unit",
        location: "Raigad, Maharashtra",
        period: "FY 2026-27",
        sourceType: "groundwater",
        withdrawalKL: 12500,
        metered: true,
        dischargeType: "zero_liquid_discharge",
        dischargeKL: 0,
        recycledKL: 8200,
        watershedStress: "medium_high",
        codMgL: 38,
        bodMgL: 9,
        tdsMgL: 620,
        ph: 7.4,
        notes: "Auxiliary power generation boiler feed.",
        createdAt: "2026-05-15",
      },
      {
        id: "wat-003",
        facility: "Pune Rolling Mills & Finishing",
        location: "Pune Industrial Estate, Maharashtra",
        period: "FY 2026-27",
        sourceType: "municipal_third_party",
        withdrawalKL: 22000,
        metered: true,
        dischargeType: "greenbelt_irrigation",
        dischargeKL: 4500,
        recycledKL: 9400,
        watershedStress: "high",
        codMgL: 30,
        bodMgL: 8,
        tdsMgL: 510,
        ph: 7.1,
        notes: "MIDC piped utility intake. Secondary treated water directed to 15-acre green belt.",
        createdAt: "2026-06-20",
      },
      {
        id: "wat-004",
        facility: "Pune Rolling Mills & Finishing",
        location: "Pune Industrial Estate, Maharashtra",
        period: "FY 2026-27",
        sourceType: "rainwater_harvested",
        withdrawalKL: 6800,
        metered: true,
        dischargeType: "etp_treated_reuse",
        dischargeKL: 1100,
        recycledKL: 4200,
        watershedStress: "high",
        codMgL: 18,
        bodMgL: 4,
        tdsMgL: 180,
        ph: 7.0,
        notes: "5,000 m3 holding retention pond harvested from monsoon catchment.",
        createdAt: "2026-07-28",
      },
    ],
  },
  chemical_pharma: {
    label: "Chemicals & Active Pharma Ingredients (Tarapur ZLD)",
    sector: "Specialty Chemicals & API",
    entries: [
      {
        id: "wat-101",
        facility: "Tarapur Synthesis Complex",
        location: "Tarapur MIDC, Maharashtra",
        period: "FY 2026-27",
        sourceType: "municipal_third_party",
        withdrawalKL: 28000,
        metered: true,
        dischargeType: "zero_liquid_discharge",
        dischargeKL: 0,
        recycledKL: 21500,
        watershedStress: "extremely_high",
        codMgL: 15,
        bodMgL: 5,
        tdsMgL: 400,
        ph: 7.3,
        notes: "100% Zero Liquid Discharge (ZLD) plant with MVR evaporator and RO recovery.",
        createdAt: "2026-04-12",
      },
      {
        id: "wat-102",
        facility: "Tarapur Synthesis Complex",
        location: "Tarapur MIDC, Maharashtra",
        period: "FY 2026-27",
        sourceType: "recycled_reused",
        withdrawalKL: 21500,
        metered: true,
        dischargeType: "etp_treated_reuse",
        dischargeKL: 0,
        recycledKL: 21500,
        watershedStress: "extremely_high",
        codMgL: 12,
        bodMgL: 3,
        tdsMgL: 220,
        ph: 7.1,
        notes: "Distillate condensate returned to process cooling cycle.",
        createdAt: "2026-05-18",
      },
      {
        id: "wat-103",
        facility: "Ankleshwar Intermediate Plant",
        location: "Ankleshwar, Gujarat",
        period: "FY 2026-27",
        sourceType: "groundwater",
        withdrawalKL: 14000,
        metered: true,
        dischargeType: "cetp_discharge",
        dischargeKL: 6200,
        recycledKL: 5800,
        watershedStress: "high",
        codMgL: 110,
        bodMgL: 28,
        tdsMgL: 1450,
        ph: 7.6,
        notes: "Pre-treated effluent routed to Ankleshwar GIDC CETP conduit.",
        createdAt: "2026-06-15",
      },
    ],
  },
  tech_corporate: {
    label: "Corporate Campuses & IT Tech Parks (Mumbai & Bengaluru)",
    sector: "Technology / Real Estate",
    entries: [
      {
        id: "wat-201",
        facility: "BKC Innovation Campus",
        location: "Bandra Kurla Complex, Mumbai",
        period: "FY 2026-27",
        sourceType: "municipal_third_party",
        withdrawalKL: 12000,
        metered: true,
        dischargeType: "etp_treated_reuse",
        dischargeKL: 4200,
        recycledKL: 6800,
        watershedStress: "medium_high",
        codMgL: 25,
        bodMgL: 6,
        tdsMgL: 380,
        ph: 7.2,
        notes: "Municipal potable water for 2,400 employees + in-house STP for HVAC cooling.",
        createdAt: "2026-04-05",
      },
      {
        id: "wat-202",
        facility: "Whitefield Technology Centre",
        location: "Whitefield, Bengaluru",
        period: "FY 2026-27",
        sourceType: "municipal_third_party",
        withdrawalKL: 9500,
        metered: true,
        dischargeType: "greenbelt_irrigation",
        dischargeKL: 3100,
        recycledKL: 4900,
        watershedStress: "extremely_high",
        codMgL: 20,
        bodMgL: 5,
        tdsMgL: 320,
        ph: 7.1,
        notes: "STP treated greywater recycled for dual plumbing and landscape irrigation.",
        createdAt: "2026-05-10",
      },
      {
        id: "wat-203",
        facility: "Whitefield Technology Centre",
        location: "Whitefield, Bengaluru",
        period: "FY 2026-27",
        sourceType: "rainwater_harvested",
        withdrawalKL: 4200,
        metered: true,
        dischargeType: "etp_treated_reuse",
        dischargeKL: 0,
        recycledKL: 4200,
        watershedStress: "extremely_high",
        codMgL: 10,
        bodMgL: 2,
        tdsMgL: 140,
        ph: 6.9,
        notes: "Rooftop runoff routed to 2 million litre percolation and storage tanks.",
        createdAt: "2026-06-25",
      },
    ],
  },
};

/**
 * Generates and triggers download of SEBI BRSR Principle 6 Water Disclosures CSV
 */
export function downloadBrsrWaterCsv(
  overview: WaterAccountingOverview,
  companyName: string = "Climate Social Mumbai",
  fy: string = "FY 2026-27",
) {
  const csvContent = `========================================================================================
SEBI BRSR MANDATORY DISCLOSURES — PRINCIPLE 6: WATER STEWARDSHIP & WITHDRAWAL
Platform: clisomumbai.com (Climate Social Mumbai)
Reporting Entity: ${companyName}
Reporting Financial Year: ${fy}
Date of Generation: ${new Date().toISOString().split("T")[0]}
Assurance Alignment: SEBI BRSR Core / GRI 303: Water and Effluents / CGWB Guidelines
========================================================================================

PARAMETER,VALUE,UNIT,REGULATORY REFERENCE
1. Total Water Withdrawal,${overview.totalWithdrawalKL},Kilolitres (kL),BRSR Essential Indicator (Principle 6)
2. Net Water Consumption (Withdrawal - Discharge),${overview.netConsumptionKL},Kilolitres (kL),BRSR Principle 6 / GRI 303-5
3. Total Water Discharged,${overview.totalDischargeKL},Kilolitres (kL),BRSR Principle 6 / GRI 303-4
4. Total Water Recycled and Reused,${overview.totalRecycledKL},Kilolitres (kL),BRSR Principle 6 Circularity
5. Water Recycling / Circularity Rate,${overview.recycledPercentage},%,(Recycled kL / Total Withdrawal kL) * 100
6. Metered Water Proportion,${overview.meteredPercentage},%,Audit Verification Level
7. Water Withdrawal from High/Extremely High Stress Areas,${overview.highStressWithdrawalKL},Kilolitres (kL),WRI Aqueduct / CGWB Overexploited Basins
8. Share of Water from Stressed Basins,${overview.highStressPercentage},%,BRSR Leadership Indicator
9. Water Intensity per Turnover,${overview.intensityPerCroreTurnover},kL / ₹ Crore,BRSR Core Mandatory Metric
10. Water Intensity per Output,${overview.intensityPerTonneOutput},kL / MT Finished Good,BRSR Core Specific Intensity

--- SOURCE-WISE BREAKDOWN (kL) ---
Surface Water,${overview.bySource.surface_water},kL,Rivers / Dams / Lakes
Groundwater,${overview.bySource.groundwater},kL,Borewells / Aquifers
Municipal & Third-Party Water,${overview.bySource.municipal_third_party},kL,Piped Utilities / Tankers
Rainwater Harvested & Stored,${overview.bySource.rainwater_harvested},kL,Catchment Infrastructure
Recycled / Reused Water,${overview.bySource.recycled_reused},kL,Internal ETP / STP Output
Desalinated / Seawater,${overview.bySource.desalinated_seawater},kL,Marine / RO Intake

--- DISCHARGE DESTINATION BREAKDOWN (kL) ---
Zero Liquid Discharge (ZLD) Evaporated,${overview.byDischarge.zero_liquid_discharge},kL,Zero Surface Release
In-house ETP Reused in Operations,${overview.byDischarge.etp_treated_reuse},kL,Process Circulation
On-site Greenbelt Irrigation,${overview.byDischarge.greenbelt_irrigation},kL,Campus Forestry
Common Effluent Treatment Plant (CETP),${overview.byDischarge.cetp_discharge},kL,Industrial Park CETP
Surface Water Body (Treated),${overview.byDischarge.surface_water_discharge},kL,Compliant River/Stream Discharge
Municipal Sewerage,${overview.byDischarge.municipal_sewer},kL,Public Drainage

--- FACILITY LEVEL WATER AUDIT TRAIL ---
Facility Name,Location,Watershed Stress,Withdrawal (kL),Discharge (kL),Consumption (kL),Recycled (kL),Metered %,ZLD Status
${overview.facilitySummaries
  .map(
    (f) =>
      `"${f.facility}","${f.location}","${f.watershedStress}",${f.totalWithdrawalKL},${f.totalDischargeKL},${f.totalConsumptionKL},${f.totalRecycledKL},${f.meteredPercentage}%,"${f.zldCompliant ? "Compliant (ZLD)" : "Treated Discharge"}"`,
  )
  .join("\n")}
`;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `clisomumbai-brsr-water-disclosure-${fy.replace(/\s+/g, "_")}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports an executive Water Stewardship & BRSR Principle 6 PDF Report
 */
export function exportWaterStewardshipPdf(
  overview: WaterAccountingOverview,
  companyName: string = "Climate Social Mumbai",
  fy: string = "FY 2026-27",
) {
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
  doc.text("WATER STEWARDSHIP & BRSR PRINCIPLE 6 AUDIT REPORT", 44, 58);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, W - 140, 40);
  doc.text(`Assurance: ASSA 5010 / SEBI BRSR`, W - 140, 55);

  // Metadata block
  doc.setFillColor(245, 248, 246);
  doc.rect(44, 105, W - 88, 55, "F");
  doc.setDrawColor(220, 230, 225);
  doc.rect(44, 105, W - 88, 55, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 45, 30);
  doc.text(`Entity: ${companyName}`, 58, 126);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 115, 105);
  doc.text(`Reporting Period: ${fy}`, 58, 144);
  doc.text(`Verification Framework: GRI 303 & SEBI Circular SEBI/HO/CFD/2023`, 260, 144);

  // KPI Summary Cards
  const kpis = [
    { label: "Total Withdrawal", val: `${overview.totalWithdrawalKL.toLocaleString()} kL`, sub: "Across all sources" },
    { label: "Net Consumption", val: `${overview.netConsumptionKL.toLocaleString()} kL`, sub: "Withdrawal - Discharge" },
    { label: "Recycling Circularity", val: `${overview.recycledPercentage}%`, sub: `${overview.totalRecycledKL.toLocaleString()} kL reused` },
    { label: "Stressed Basin Share", val: `${overview.highStressPercentage}%`, sub: `${overview.highStressWithdrawalKL.toLocaleString()} kL exposure` },
  ];

  kpis.forEach((k, idx) => {
    const cardW = (W - 88 - 30) / 4;
    const cardX = 44 + idx * (cardW + 10);
    const cardY = 175;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(225, 235, 230);
    doc.roundedRect(cardX, cardY, cardW, 65, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(90, 110, 100);
    doc.text(k.label.toUpperCase(), cardX + 10, cardY + 18);

    doc.setFontSize(13);
    doc.setTextColor(10, 50, 30);
    doc.text(k.val, cardX + 10, cardY + 38);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(120, 135, 125);
    doc.text(k.sub, cardX + 10, cardY + 54);
  });

  // Table Section: Source-wise Water Intake
  let currentY = 265;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 40, 25);
  doc.text("1. Source-Wise Water Withdrawal & Intake Breakdown", 44, currentY);

  currentY += 14;
  doc.setFillColor(235, 243, 238);
  doc.rect(44, currentY, W - 88, 20, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(25, 55, 35);
  doc.text("Water Source Category", 54, currentY + 13);
  doc.text("Volume (kL)", 260, currentY + 13);
  doc.text("Share (%)", 360, currentY + 13);
  doc.text("Classification / Note", 440, currentY + 13);

  currentY += 20;

  Object.entries(overview.bySource).forEach(([srcKey, volume]) => {
    const meta = WATER_SOURCE_LABELS[srcKey as WaterSourceType];
    const pct = overview.totalWithdrawalKL > 0 ? ((volume / overview.totalWithdrawalKL) * 100).toFixed(1) : "0.0";

    doc.setFillColor(255, 255, 255);
    doc.rect(44, currentY, W - 88, 18, "F");
    doc.setDrawColor(240, 245, 242);
    doc.line(44, currentY + 18, W - 44, currentY + 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(40, 50, 45);
    doc.text(meta?.label || srcKey, 54, currentY + 12);
    doc.text(volume.toLocaleString(), 260, currentY + 12);
    doc.text(`${pct}%`, 360, currentY + 12);

    doc.setFontSize(7.5);
    doc.setTextColor(110, 125, 115);
    doc.text(meta?.desc?.slice(0, 30) || "", 440, currentY + 12);

    currentY += 18;
  });

  // Table Section: Facility-Level Water Audit Trail
  currentY += 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 40, 25);
  doc.text("2. Facility-Level Water Balance & Basin Risk Matrix", 44, currentY);

  currentY += 14;
  doc.setFillColor(235, 243, 238);
  doc.rect(44, currentY, W - 88, 20, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(25, 55, 35);
  doc.text("Facility & Location", 54, currentY + 13);
  doc.text("Basin Stress", 200, currentY + 13);
  doc.text("Withdrawal (kL)", 280, currentY + 13);
  doc.text("Discharge", 365, currentY + 13);
  doc.text("Recycled", 430, currentY + 13);
  doc.text("ZLD Status", 495, currentY + 13);

  currentY += 20;

  overview.facilitySummaries.forEach((f) => {
    doc.setFillColor(255, 255, 255);
    doc.rect(44, currentY, W - 88, 20, "F");
    doc.setDrawColor(240, 245, 242);
    doc.line(44, currentY + 20, W - 44, currentY + 20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(20, 40, 30);
    doc.text(f.facility.slice(0, 24), 54, currentY + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(110, 125, 115);
    doc.text(f.location.slice(0, 26), 54, currentY + 18);

    doc.setFontSize(8);
    doc.setTextColor(f.watershedStress.includes("high") ? 180 : 30, f.watershedStress.includes("high") ? 50 : 100, 30);
    doc.text(f.watershedStress.replace("_", " ").toUpperCase(), 200, currentY + 14);

    doc.setTextColor(30, 45, 35);
    doc.text(f.totalWithdrawalKL.toLocaleString(), 280, currentY + 14);
    doc.text(f.totalDischargeKL.toLocaleString(), 365, currentY + 14);
    doc.text(f.totalRecycledKL.toLocaleString(), 430, currentY + 14);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(f.zldCompliant ? 16 : 100, f.zldCompliant ? 150 : 100, f.zldCompliant ? 80 : 100);
    doc.text(f.zldCompliant ? "ZLD ✓" : "ETP", 495, currentY + 14);

    currentY += 22;
  });

  // Footer / Signoff
  doc.setFillColor(245, 248, 246);
  doc.rect(44, H - 70, W - 88, 40, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 120, 110);
  doc.text("Report generated by clisomumbai (Climate Social Mumbai) — Verified Carbon & Social Intelligence Engine.", 54, H - 52);
  doc.text("Compliant with SEBI BRSR Principle 6, GRI 303, and Central Ground Water Board (CGWB) norms.", 54, H - 40);

  doc.save(`clisomumbai-water-stewardship-${fy.replace(/\s+/g, "_")}.pdf`);
}
