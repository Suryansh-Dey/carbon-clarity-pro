// Reference tables for the Cities module of the CliSo climate risk platform.
import type { Country } from "../model";

export const HAZARDS = [
  "Flood",
  "Coastal & sea level",
  "Cyclone & storm",
  "Extreme heat",
  "Drought & water stress",
  "Landslide",
  "Earthquake",
  "Air quality",
];
/** Hazard sensitivity per °C of warming above today. */
export const SENS = [0.25, 0.3, 0.15, 0.35, 0.2, 0.15, 0, 0.1];
export const SSP_NAMES = ["SSP1-2.6", "SSP2-4.5", "SSP5-8.5"];
export const HORIZONS = ["≈2030", "≈2050", "≈2090"];
/** Global warming (°C) by scenario and horizon, IPCC AR6 WG1. */
export const WARMING = [
  [1.5, 1.7, 1.8],
  [1.5, 2, 2.7],
  [1.6, 2.4, 4.4],
];
/** Sea-level rise (m) by scenario and horizon. */
export const SLR = [
  [0.09, 0.19, 0.4],
  [0.09, 0.2, 0.5],
  [0.1, 0.23, 0.68],
];
export const WARMING_NOW = 1.2;
export const SECTORS = [
  "Finance, IT & business services",
  "Trade, transport & logistics",
  "Manufacturing & industry",
  "Construction & real estate",
  "Public services",
  "Tourism & hospitality",
  "Agriculture, forestry & fishing",
];
/** Share of each sector's daily output stopped by an event of each hazard (0–1). */
export const SECTOR_STOP = [
  [0.35, 0.2, 0.3, 0.05, 0.05, 0.05, 0.6, 0.05],
  [0.6, 0.5, 0.6, 0.1, 0.1, 0.2, 0.7, 0.15],
  [0.55, 0.4, 0.5, 0.15, 0.3, 0.1, 0.7, 0.05],
  [0.6, 0.5, 0.6, 0.3, 0.2, 0.3, 0.8, 0.3],
  [0.4, 0.3, 0.5, 0.05, 0.1, 0.1, 0.6, 0.1],
  [0.5, 0.5, 0.7, 0.2, 0.2, 0.3, 0.8, 0.4],
  [0.5, 0.4, 0.6, 0.1, 0.2, 0.3, 0.15, 0.05],
];
/** Event hazards: days of disruption, damage ratio, base probability and growth per score point. */
export const EVENT_PARAMS: Record<number, { d: number; dm: number; pb: number; g: number }> = {
  "0": { d: 4, dm: 0.015, pb: 0.004, g: 2.6 },
  "1": { d: 2, dm: 0.02, pb: 0.003, g: 2.4 },
  "2": { d: 3, dm: 0.015, pb: 0.004, g: 2.6 },
  "5": { d: 1, dm: 0.005, pb: 0.004, g: 2.4 },
  "6": { d: 10, dm: 0.06, pb: 0.0015, g: 2.3 },
};
export const COUNTRIES: Record<Country, { n: string; cur: string; sym: string; fx: number }> = {
  IN: { n: "India", cur: "INR", sym: "₹", fx: 88 },
  NP: { n: "Nepal", cur: "NPR", sym: "NPR ", fx: 141 },
  LK: { n: "Sri Lanka", cur: "LKR", sym: "LKR ", fx: 300 },
  XX: { n: "Other", cur: "USD", sym: "US$ ", fx: 1 },
};
/** Urban systems and their sensitivity (0–3) to each hazard. */
export const SYSTEMS: [string, number[]][] = [
  ["Housing and informal settlements", [3, 3, 3, 3, 2, 3, 3, 2]],
  ["Health care", [3, 2, 2, 3, 2, 1, 3, 3]],
  ["Schools and education", [2, 2, 2, 3, 1, 1, 3, 3]],
  ["Water supply and sanitation", [3, 3, 2, 1, 3, 2, 2, 0]],
  ["Power and digital networks", [2, 2, 3, 3, 1, 2, 2, 0]],
  ["Transport and logistics", [3, 3, 3, 1, 0, 2, 2, 1]],
  ["Markets and commerce", [3, 2, 2, 2, 1, 1, 2, 2]],
  ["Industry and MSMEs", [2, 2, 2, 2, 2, 1, 2, 1]],
  ["Ecosystems and green-blue infrastructure", [2, 3, 2, 2, 3, 2, 1, 1]],
];
export const CLEARANCE: Record<Country, [string, string][]> = {
  IN: [
    [
      "EIA Notification 2006 (MoEFCC)",
      "Prior environmental clearance for listed projects. Category A by MoEFCC with an Expert Appraisal Committee; Category B by the State Environment Impact Assessment Authority (B1 with EIA and public hearing, B2 without).",
    ],
    [
      "Consent to Establish and Consent to Operate",
      "State Pollution Control Board consents under the Water Act 1974 and Air Act 1981, by red, orange, green or white industry category.",
    ],
    [
      "CRZ Notification 2019",
      "Coastal Regulation Zone clearance through the state Coastal Zone Management Authority for activity along the coast and tidal water bodies.",
    ],
    [
      "Eco-sensitive zones and forests",
      "Restrictions around protected areas; forest land diversion under the forest conservation law.",
    ],
    [
      "Wetlands (Conservation and Management) Rules 2017",
      "Restrictions on notified wetlands and Ramsar sites.",
    ],
    [
      "Disaster risk in EIA",
      "EIA reports must include a risk assessment and disaster management plan; NGT and court orders often add floodplain, lake and drain buffers.",
    ],
  ],
  NP: [
    [
      "Environment Protection Act 2019 and Rules 2020",
      "Brief Environmental Study (BES), Initial Environmental Examination (IEE) or full EIA depending on project type and size, approved by the municipality, the line ministry or the Ministry of Forests and Environment.",
    ],
    [
      "National Building Code (NBC 105 and others)",
      "Seismic design enforced through municipal building permits.",
    ],
    [
      "Heritage and river corridors",
      "UNESCO monument zones in the valley; river setbacks on the Bagmati system.",
    ],
    [
      "Local Government Operation Act 2017",
      "Municipalities approve smaller projects and local environmental plans.",
    ],
  ],
  LK: [
    [
      "National Environmental Act 1980 (amended 1988)",
      "Prescribed projects need an IEE or EIA through the designated Project Approving Agency.",
    ],
    [
      "Environmental Protection Licence (EPL)",
      "Central Environmental Authority licence for listed industries (lists A, B and C by pollution potential).",
    ],
    [
      "Coast Conservation and Coastal Resource Management Act",
      "Permit from the Department of Coast Conservation for development in the coastal zone.",
    ],
    [
      "Urban Development Authority",
      "Zoning and development permits; flood-retention and wetland zones in Colombo.",
    ],
  ],
  XX: [
    [
      "National EIA law",
      "Check the national environmental impact assessment law and the agency that approves it.",
    ],
    [
      "Lender standards",
      "IFC Performance Standards and World Bank Environmental and Social Framework for financed projects; Equator Principles for project finance.",
    ],
  ],
};
export const ACTIVITIES = [
  "Building and construction",
  "Township or area development",
  "Manufacturing (high-pollution category)",
  "Port, jetty or coastal infrastructure",
  "Hotel or tourism project",
  "Mining or quarrying",
  "Power plant",
  "Waste treatment or landfill",
];
export const ACTIVITY_ROUTES: Record<Country, string[]> = {
  IN: [
    "EC from SEIAA (Category B) if built-up area is 20,000 m² or more; SPCB consent; CRZ clearance if in the coastal zone",
    "EC (Category B, usually with EIA) for townships of 50 ha or more, or built-up area of 150,000 m² or more",
    "EC from MoEFCC or SEIAA depending on the schedule item and capacity; SPCB Consent to Establish and Operate (red category)",
    "EC (Category A for major ports and harbours) plus CRZ clearance and often forest and wildlife clearances",
    "CRZ clearance if in the coastal zone; EC if built-up area crosses the construction threshold; SPCB consent",
    "EC (Category A or B by lease area and mineral); mining plan approval; forest clearance where forest land is involved",
    "EC (Category A for large thermal plants); SPCB consent; water allocation",
    "EC for common facilities (CETP, TSDF, incinerators) and Solid Waste Management Rules 2016 siting criteria",
  ],
  NP: [
    "Municipal building permit with NBC compliance; BES or IEE for larger buildings",
    "IEE or EIA by plot size and population served",
    "IEE or EIA by industry type; industry registration",
    "EIA for river ports and large infrastructure",
    "IEE or EIA by number of rooms and location, especially in heritage and protected areas",
    "IEE or EIA by scale; strict limits on river-bed extraction",
    "EIA for large hydropower and transmission projects",
    "IEE or EIA for landfill sites",
  ],
  LK: [
    "UDA development permit; IEE or EIA if a prescribed project or in a sensitive area",
    "IEE or EIA as a prescribed project",
    "EPL from the CEA; IEE or EIA for prescribed industries",
    "Coast Conservation permit plus EIA",
    "Coast Conservation permit in the coastal zone; IEE or EIA for large hotels",
    "IEE or EIA; Geological Survey and Mines Bureau licence",
    "EIA for power plants above the prescribed capacity",
    "IEE or EIA; EPL for waste facilities",
  ],
  XX: [
    "Check national EIA law and local permits; apply IFC Performance Standards if lender-financed",
    "Check national EIA law and local permits; apply IFC Performance Standards if lender-financed",
    "Check national EIA law and local permits; apply IFC Performance Standards if lender-financed",
    "Check national EIA law and local permits; apply IFC Performance Standards if lender-financed",
    "Check national EIA law and local permits; apply IFC Performance Standards if lender-financed",
    "Check national EIA law and local permits; apply IFC Performance Standards if lender-financed",
    "Check national EIA law and local permits; apply IFC Performance Standards if lender-financed",
    "Check national EIA law and local permits; apply IFC Performance Standards if lender-financed",
  ],
};
export const CLIMATE_PROOFING: [string, string][] = [
  [
    "Flood",
    "Flood-risk assessment against the highest flood level and the selected scenario; plinth above design flood level; drainage that does not add runoff to neighbours",
  ],
  [
    "Coastal & sea level",
    "Sea-level rise and surge allowance for the asset life; CRZ setback; no reclamation of mangroves or wetlands",
  ],
  [
    "Cyclone & storm",
    "Design wind speed under IS 875-3 (or national code); emergency plan linked to cyclone warnings",
  ],
  [
    "Extreme heat",
    "Worker heat-stress plan; cool roofs and shading; cooling load sized for future temperatures",
  ],
  [
    "Drought & water stress",
    "Water balance; recycling and rainwater storage; no new groundwater stress",
  ],
  ["Landslide", "Geotechnical study and slope stability; no hill cutting without approval"],
  ["Earthquake", "Structural design to the current seismic code; anchoring of hazardous equipment"],
  ["Air quality", "Dust control during construction; emission controls; green belt"],
];
export const SOURCES: Record<"IN" | "NP" | "LK" | "G", [string, string, string][]> = {
  IN: [
    ["Census of India 2011", "Population, slums, age structure", "https://censusindia.gov.in/"],
    [
      "MoSPI and state economic surveys",
      "GSDP, district domestic product",
      "https://mospi.gov.in/",
    ],
    ["IMD", "Climate normals, warnings, heatwave data", "https://mausam.imd.gov.in/"],
    ["NDMA", "Hazard guidelines, heat and flood plans", "https://ndma.gov.in/"],
    ["Central Water Commission", "Floods and reservoirs", "https://cwc.gov.in/"],
    ["CPCB", "Air quality", "https://cpcb.nic.in/"],
    [
      "MoEFCC PARIVESH",
      "Environmental clearance applications and status",
      "https://parivesh.nic.in/",
    ],
    ["MoHUA Climate Smart Cities framework", "City climate assessment", "https://mohua.gov.in/"],
  ],
  NP: [
    [
      "National Statistics Office, Census 2021",
      "Population and housing",
      "https://censusnepal.cbs.gov.np/",
    ],
    ["Department of Hydrology and Meteorology", "Weather, floods", "https://www.dhm.gov.np/"],
    ["BIPAD Portal (NDRRMA)", "Disaster events and losses", "https://bipadportal.gov.np/"],
    [
      "Ministry of Forests and Environment",
      "EIA approvals, national adaptation plan",
      "https://mofe.gov.np/",
    ],
  ],
  LK: [
    [
      "Department of Census and Statistics",
      "Population, GDP by province",
      "https://www.statistics.gov.lk/",
    ],
    ["Department of Meteorology", "Weather and warnings", "https://www.meteo.gov.lk/"],
    ["Disaster Management Centre", "Disaster events and early warning", "https://www.dmc.gov.lk/"],
    ["Central Environmental Authority", "EIA and EPL", "https://www.cea.lk/"],
    ["NBRO", "Landslide hazard maps", "https://www.nbro.gov.lk/"],
  ],
  G: [
    [
      "IPCC AR6 Interactive Atlas",
      "Regional climate projections",
      "https://interactive-atlas.ipcc.ch/",
    ],
    [
      "UN World Urbanization Prospects",
      "City population projections",
      "https://population.un.org/wup/",
    ],
    [
      "UNDRR Disaster Resilience Scorecard for Cities",
      "Ten Essentials self-assessment",
      "https://mcr2030.undrr.org/",
    ],
    ["EM-DAT", "International disaster database", "https://www.emdat.be/"],
    [
      "ILO, Working on a warmer planet (2019)",
      "Heat and lost working hours",
      "https://www.ilo.org/",
    ],
  ],
};

export interface Crop {
  n: string;
  /** % yield change per °C of further warming when rainfed. */
  s: number;
  /** Same when irrigated; null means the same as rainfed. */
  si: number | null;
  /** Drought sensitivity (0–1). */
  w: number;
  /** Flood sensitivity (0–1). */
  fl: number;
  ad: string;
  mi: string;
  en: string;
}
// Anchors: ICAR-NICRA projections reported to Parliament, scaled per °C of warming above today;
// other crops from IPCC AR6 WGII ch.5 and ICAR literature ranges.
export const CROPS: Record<string, Crop> = {
  rice: {
    n: "Rice (paddy)",
    s: 25,
    si: 4,
    w: 0.8,
    fl: 0.5,
    ad: "Flood-tolerant (Swarna-Sub1) and drought-tolerant (Sahbhagi Dhan) varieties; direct-seeded rice; shift transplanting with the monsoon onset",
    mi: "Alternate wetting and drying and direct seeding cut paddy methane by 30–50%; stop stubble burning (happy seeder, in-situ decomposers)",
    en: "Rice mills, parboiling, rice-bran oil, husk-fired power, ethanol from broken rice",
  },
  wheat: {
    n: "Wheat",
    s: 24,
    si: 20,
    w: 0.5,
    fl: 0.2,
    ad: "Early sowing, heat-tolerant varieties (for example DBW 187, HD 3385), zero tillage to save 10–15 days, light irrigation at grain filling in heat waves",
    mi: "Zero tillage and residue retention; neem-coated or nano urea to cut nitrous oxide; solar pumps",
    en: "Flour and roller mills, bakeries and biscuits, straw-based packaging and bio-CNG",
  },
  maize: {
    n: "Maize",
    s: 20,
    si: 12,
    w: 0.7,
    fl: 0.4,
    ad: "Short-duration hybrids, ridge-furrow sowing, staggered sowing dates, fall armyworm surveillance",
    mi: "Precision nitrogen; residue to bioenergy",
    en: "Poultry and cattle feed mills, starch, ethanol distilleries (E20 programme)",
  },
  millets: {
    n: "Millets (bajra, jowar, ragi)",
    s: 6,
    si: null,
    w: 0.3,
    fl: 0.3,
    ad: "Bio-fortified and short-duration varieties; millets fit hotter, drier years and the Shree Anna mission",
    mi: "Low input crop: little irrigation or fertiliser, so low emissions per hectare",
    en: "Millet flour, ready-to-eat foods and snacks (PLI for food processing), procurement for public distribution",
  },
  pulses: {
    n: "Pulses (gram, tur, moong, urad)",
    s: 12,
    si: 8,
    w: 0.6,
    fl: 0.5,
    ad: "Wilt- and heat-tolerant varieties, raised beds, intercropping with cereals, seed hubs",
    mi: "Fix their own nitrogen, so less fertiliser; good rotation crop to cut emissions",
    en: "Dal mills, sorting and grading, plant-protein and snack makers",
  },
  sugarcane: {
    n: "Sugarcane",
    s: 7,
    si: 5,
    w: 0.8,
    fl: 0.3,
    ad: "Drip irrigation and fertigation, trash mulching, water-efficient varieties (Co 0238 successors)",
    mi: "Bagasse cogeneration, press-mud bio-CNG (SATAT), drip cuts pumping energy",
    en: "Sugar mills, jaggery units, ethanol (E20), bagasse power and paper",
  },
  cotton: {
    n: "Cotton",
    s: 9,
    si: 6,
    w: 0.6,
    fl: 0.5,
    ad: "High-density planting, pink bollworm management, drip irrigation, crop insurance",
    mi: "Lower pesticide and fertiliser use; solar-powered ginning",
    en: "Ginning and pressing, spinning and textiles (PM MITRA parks), cottonseed oil",
  },
  soybean: {
    n: "Soybean",
    s: 10,
    si: null,
    w: 0.6,
    fl: 0.6,
    ad: "Broad-bed furrow sowing to drain excess rain and keep moisture; early varieties; intercropping with tur",
    mi: "Biological nitrogen fixation; less tillage",
    en: "Solvent extraction and soy meal, edible oil, soy foods, poultry feed",
  },
  groundnut: {
    n: "Groundnut and oilseeds",
    s: 9,
    si: 5,
    w: 0.6,
    fl: 0.4,
    ad: "Drought-tolerant varieties, farm ponds for protective irrigation, gypsum and mulching",
    mi: "Low input oilseed; residue to compost",
    en: "Oil mills, groundnut processing and export, peanut products",
  },
  mustard: {
    n: "Rapeseed-mustard",
    s: 10,
    si: 6,
    w: 0.4,
    fl: 0.2,
    ad: "Timely sowing, frost and heat-tolerant varieties, sprinkler irrigation",
    mi: "Efficient nitrogen; reduce diesel pumping",
    en: "Kachi ghani oil mills, oil-cake for feed, honey (bee-keeping alongside mustard)",
  },
  potato: {
    n: "Potato",
    s: 12,
    si: 10,
    w: 0.4,
    fl: 0.5,
    ad: "Heat-tolerant varieties (Kufri), drip and mulching, cold storage on solar power",
    mi: "Solar and efficient cold storage; lower nitrogen",
    en: "Cold storage, chips and flakes processing, seed potato production",
  },
  vegetables: {
    n: "Vegetables",
    s: 10,
    si: 7,
    w: 0.6,
    fl: 0.6,
    ad: "Protected cultivation (net and poly houses), drip, raised beds, short-cycle crops",
    mi: "Solar cold rooms cut food loss; organic inputs",
    en: "Cold chains, processing and pickles, farm-to-retail logistics, agri start-ups",
  },
  fruits: {
    n: "Fruits and horticulture",
    s: 8,
    si: 6,
    w: 0.5,
    fl: 0.4,
    ad: "Shift orchards uphill or to tolerant varieties, hail nets, drip, high-density planting",
    mi: "Perennial trees store carbon; agroforestry credits",
    en: "Pulping, juices and dehydrated fruit, packhouses, exports (APEDA clusters)",
  },
  tea: {
    n: "Tea",
    s: 8,
    si: null,
    w: 0.6,
    fl: 0.3,
    ad: "Shade trees, drought-tolerant clones, rainwater harvesting in estates",
    mi: "Shade trees store carbon; solar and biomass in factory dryers",
    en: "Tea processing and packaging, estate tourism, specialty and organic tea",
  },
  coffee: {
    n: "Coffee",
    s: 12,
    si: null,
    w: 0.6,
    fl: 0.3,
    ad: "Shade management, sprinkler blossom irrigation, berry borer control",
    mi: "Agroforestry under shade stores carbon",
    en: "Curing works, roasting, specialty coffee and cafés",
  },
  coconut: {
    n: "Coconut and plantation crops",
    s: 5,
    si: null,
    w: 0.5,
    fl: 0.4,
    ad: "Basin irrigation and mulching, drought-tolerant hybrids, salinity-tolerant varieties near the coast",
    mi: "Perennial cover; husk and shell to coir and charcoal",
    en: "Coir units, copra and oil, virgin coconut oil, activated carbon",
  },
  spices: {
    n: "Spices (pepper, cardamom, ginger, turmeric)",
    s: 9,
    si: null,
    w: 0.6,
    fl: 0.5,
    ad: "Shade and mulching, disease-tolerant varieties, rain shelters for drying",
    mi: "Agroforestry systems store carbon",
    en: "Spice grading, grinding and extraction (oleoresins), exports",
  },
  jute: {
    n: "Jute",
    s: 6,
    si: null,
    w: 0.4,
    fl: 0.4,
    ad: "Improved retting (microbial), short-duration varieties",
    mi: "Jute replaces plastic packaging",
    en: "Jute mills, diversified jute products, bags replacing plastic",
  },
  fish: {
    n: "Fisheries and aquaculture",
    s: 6,
    si: null,
    w: 0.3,
    fl: 0.5,
    ad: "Deeper ponds and aeration in heat, flood-safe pond bunds, cyclone advisories for boats",
    mi: "Solar aerators, mangrove-friendly aquaculture",
    en: "Ice plants, cold chains, fish processing and feed (PM Matsya Sampada Yojana)",
  },
  dairy: {
    n: "Dairy and livestock",
    s: 5,
    si: null,
    w: 0.5,
    fl: 0.4,
    ad: "Shade, sprinklers and fans in sheds, heat-tolerant breeds, fodder banks for drought",
    mi: "Better feed and biogas plants cut methane; Gobardhan bio-CNG",
    en: "Milk chilling and dairy co-operatives, feed mills, biogas and organic manure",
  },
};
/** Agro-climatic zones (Planning Commission): soils, ecosystems, typical crops. */
export const ZONES: Record<string, { n: string; soil: string; eco: string; crops: string[] }> = {
  WH: {
    n: "Western Himalayan region",
    soil: "Mountain and forest soils; alluvial in valleys; thin and erodible on slopes",
    eco: "Temperate forests, glaciers and snow-fed rivers, alpine meadows; fragile slopes",
    crops: ["fruits", "maize", "wheat", "rice", "vegetables"],
  },
  EH: {
    n: "Eastern Himalayan region",
    soil: "Acidic red-loamy and laterite hill soils; alluvial valley floors",
    eco: "Tropical and subtropical forests, a global biodiversity hotspot; shifting cultivation (jhum) areas; Brahmaputra floodplain wetlands",
    crops: ["rice", "tea", "maize", "spices", "fruits"],
  },
  LG: {
    n: "Lower Gangetic plains",
    soil: "Deep fertile alluvium; saline coastal soils in the Sundarbans",
    eco: "Delta, Sundarbans mangroves, ponds and floodplain wetlands",
    crops: ["rice", "jute", "potato", "vegetables", "fish"],
  },
  MG: {
    n: "Middle Gangetic plains",
    soil: "Young alluvium (khadar) and older alluvium (bhangar); flood-renewed soils",
    eco: "River floodplains, oxbow lakes and wetlands (chaurs, maun); Kosi and Gandak flood belts",
    crops: ["rice", "wheat", "maize", "pulses", "vegetables"],
  },
  UG: {
    n: "Upper Gangetic plains",
    soil: "Alluvial loams; sodic patches; falling groundwater",
    eco: "Ganga and Yamuna doabs, tarai wetlands and grasslands at the foothills",
    crops: ["wheat", "sugarcane", "rice", "potato", "mustard"],
  },
  TG: {
    n: "Trans-Gangetic plains",
    soil: "Alluvial loams; heavily irrigated with over-drawn groundwater",
    eco: "Intensive farmland; few remaining wetlands (for example Harike); Shivalik foothill forests",
    crops: ["wheat", "rice", "cotton", "mustard", "dairy"],
  },
  EP: {
    n: "Eastern plateau and hills",
    soil: "Red and yellow soils, laterite; shallow, acidic and low in water holding",
    eco: "Sal forests, tribal forest economies, mineral belts and their mining landscapes",
    crops: ["rice", "pulses", "maize", "millets", "vegetables"],
  },
  CP: {
    n: "Central plateau and hills",
    soil: "Black (regur) soils on the Malwa plateau; mixed red and black soils; ravines along the Chambal",
    eco: "Teak and dry deciduous forests, tiger reserves, Narmada and Chambal valleys",
    crops: ["soybean", "wheat", "pulses", "mustard", "maize"],
  },
  WP: {
    n: "Western plateau and hills",
    soil: "Deep and medium black soils of the Deccan trap",
    eco: "Western Ghats rain-shadow, dry deciduous forests and grasslands; drought-prone",
    crops: ["cotton", "soybean", "sugarcane", "pulses", "millets"],
  },
  SP: {
    n: "Southern plateau and hills",
    soil: "Red loams and red sandy soils; black soils in parts",
    eco: "Dry deciduous forests, tank (lake) irrigation systems, Eastern Ghats",
    crops: ["rice", "millets", "cotton", "groundnut", "pulses"],
  },
  EC: {
    n: "East coast plains and hills",
    soil: "Coastal and deltaic alluvium; saline patches; red soils inland",
    eco: "Deltas of the Mahanadi, Godavari, Krishna and Kaveri; mangroves (Bhitarkanika, Coringa); Chilika and Pulicat lagoons",
    crops: ["rice", "groundnut", "coconut", "fish", "pulses"],
  },
  WC: {
    n: "West coast plains and Ghats",
    soil: "Laterite and coastal alluvium; forest soils in the Ghats",
    eco: "Western Ghats biodiversity hotspot, backwaters, mangroves and estuaries",
    crops: ["rice", "coconut", "spices", "coffee", "fish"],
  },
  GJ: {
    n: "Gujarat plains and hills",
    soil: "Black soils in Saurashtra; alluvial sandy loams in the north; saline in Kutch",
    eco: "Rann of Kutch salt flats, Gir forest, Gulf of Kutch marine park and mangroves",
    crops: ["cotton", "groundnut", "wheat", "millets", "dairy"],
  },
  WD: {
    n: "Western dry region",
    soil: "Desert and sandy soils, low organic matter",
    eco: "Thar desert, oran (sacred groves), grasslands and great Indian bustard habitat",
    crops: ["millets", "pulses", "mustard", "dairy", "groundnut"],
  },
  IS: {
    n: "Island region",
    soil: "Coastal sandy and coral soils; forest soils",
    eco: "Coral reefs, mangroves and tropical rainforests",
    crops: ["coconut", "spices", "rice", "fish", "fruits"],
  },
};
/** State baseline: [zone, annual normal rainfall mm (IMD, approx.), net irrigated share of sown area]. */
export const STATE_AGRI: Record<string, [string, number, number]> = {
  "Andaman and Nicobar Islands": ["IS", 2900, 0.1],
  "Andhra Pradesh": ["SP", 950, 0.5],
  "Arunachal Pradesh": ["EH", 2800, 0.15],
  Assam: ["EH", 2300, 0.1],
  Bihar: ["MG", 1150, 0.63],
  Chandigarh: ["TG", 1100, 0.9],
  Chhattisgarh: ["EP", 1350, 0.35],
  Delhi: ["TG", 650, 0.9],
  Goa: ["WC", 2900, 0.25],
  Gujarat: ["GJ", 800, 0.5],
  Haryana: ["TG", 550, 0.92],
  "Himachal Pradesh": ["WH", 1250, 0.2],
  "Jammu and Kashmir": ["WH", 1000, 0.45],
  Jharkhand: ["EP", 1300, 0.15],
  Karnataka: ["SP", 1150, 0.35],
  Kerala: ["WC", 2900, 0.2],
  Ladakh: ["WH", 100, 0.9],
  Lakshadweep: ["IS", 1600, 0],
  "Madhya Pradesh": ["CP", 1100, 0.5],
  Maharashtra: ["WP", 1150, 0.2],
  Manipur: ["EH", 1450, 0.2],
  Meghalaya: ["EH", 2800, 0.15],
  Mizoram: ["EH", 2400, 0.1],
  Nagaland: ["EH", 1800, 0.1],
  Odisha: ["EP", 1450, 0.35],
  Puducherry: ["EC", 1250, 0.8],
  Punjab: ["TG", 600, 0.99],
  Rajasthan: ["CP", 450, 0.4],
  Sikkim: ["EH", 2700, 0.15],
  "Tamil Nadu": ["SP", 950, 0.58],
  Telangana: ["SP", 900, 0.5],
  "The Dadra and Nagar Haveli and Daman and Diu": ["WC", 2000, 0.3],
  Tripura: ["EH", 2200, 0.15],
  "Uttar Pradesh": ["UG", 900, 0.8],
  Uttarakhand: ["WH", 1500, 0.45],
  "West Bengal": ["LG", 1800, 0.6],
};
