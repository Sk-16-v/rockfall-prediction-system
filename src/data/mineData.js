// Open-Pit Mine Landform Sectors Data & AI Prediction Engine

export const MINE_METADATA = {
  name: "Apex Open-Pit Copper & Iron Mine - Sector A",
  location: "Singhbhum Shear Zone, Jharkhand, India",
  baseLat: 22.5726,
  baseLng: 85.4312,
  elevationRange: "240m - 580m MSL",
  operator: "National Mineral & Mining Development Corp",
  activeSensors: 42,
  insarSatellite: "Sentinel-1B / TerraSAR-X Sync Active"
};

export const MINE_SECTORS = [
  {
    id: "sec-nw-04",
    name: "North Wall Bench 4 (Highwall)",
    type: "Steep Sandstone & Shale Intercalation Highwall",
    lat: 22.5784,
    lng: 85.4351,
    elevation: 480, // meters
    slopeAngle: 72.4, // degrees
    riskLevel: "CRITICAL",
    probability: 88.5, // %
    displacementRate: 16.8, // mm/hr
    porePressure: 195, // kPa
    acousticEmission: 420, // events/min
    rmr: 34, // Rock Mass Rating (0-100)
    weatherImpact: "Heavy Monsoon Saturation (+42% pore pressure)",
    statusDescription: "Severe joint fracturing with accelerating shear creep. Failure envelope active along planar structural bedding.",
    recommendedAction: "IMMEDIATE EVACUATION of Bench 4. Halt haul truck passage on Ramp B. Deploy automated slope stabilization anchors.",
    historicalFailures: 3,
    lastScanTime: "Just now",
    coordinates: { lat: 22.5784, lng: 85.4351 }
  },
  {
    id: "sec-eh-02",
    name: "East Haul Road Slope B",
    type: "Undercut Quartzite Ramp Slope",
    lat: 22.5752,
    lng: 85.4398,
    elevation: 360,
    slopeAngle: 58.2,
    riskLevel: "WARNING",
    probability: 64.2,
    displacementRate: 6.4,
    porePressure: 110,
    acousticEmission: 185,
    rmr: 52,
    weatherImpact: "Moderate Surface Runoff",
    statusDescription: "Minor block displacement along upper bench toe. Tension cracks expanding at 0.4 mm/hour.",
    recommendedAction: "Restrict speed to 15 km/h for heavy vehicles. Increase LiDAR scanner frequency to 5-minute intervals.",
    historicalFailures: 1,
    lastScanTime: "3 mins ago",
    coordinates: { lat: 22.5752, lng: 85.4398 }
  },
  {
    id: "sec-sr-12",
    name: "South Ridge Slope 12",
    type: "Weathered Phyllite & Schist Formation",
    lat: 22.5695,
    lng: 85.4284,
    elevation: 520,
    slopeAngle: 45.0,
    riskLevel: "STABLE",
    probability: 14.8,
    displacementRate: 0.8,
    porePressure: 45,
    acousticEmission: 22,
    rmr: 78,
    weatherImpact: "Normal Drainage Conditions",
    statusDescription: "High structural integrity. Negligible slope movement recorded over past 72 hours.",
    recommendedAction: "Continue routine satellite InSAR monitoring and weekly manual inspections.",
    historicalFailures: 0,
    lastScanTime: "5 mins ago",
    coordinates: { lat: 22.5695, lng: 85.4284 }
  },
  {
    id: "sec-ob-02",
    name: "Overburden Dump Slope #2",
    type: "Unconsolidated Waste Rock Embankment",
    lat: 22.5710,
    lng: 85.4410,
    elevation: 290,
    slopeAngle: 38.5,
    riskLevel: "WARNING",
    probability: 58.0,
    displacementRate: 4.9,
    porePressure: 140,
    acousticEmission: 110,
    rmr: 44,
    weatherImpact: "High Water Accumulation at Toe",
    statusDescription: "Toe saturation induced slumping. Circular shear failure tendency observed near eastern flank.",
    recommendedAction: "Construct toe drainage trench immediately and halt further waste dumping on top crest.",
    historicalFailures: 2,
    lastScanTime: "1 min ago",
    coordinates: { lat: 22.5710, lng: 85.4410 }
  },
  {
    id: "sec-wp-01",
    name: "West Pit Drainage Bench",
    type: "Banded Iron Formation (BIF) Wall",
    lat: 22.5740,
    lng: 85.4250,
    elevation: 250,
    slopeAngle: 62.0,
    riskLevel: "STABLE",
    probability: 22.1,
    displacementRate: 1.2,
    porePressure: 60,
    acousticEmission: 35,
    rmr: 82,
    weatherImpact: "Active Pumping System Operational",
    statusDescription: "Massive rock strata with low joint density. Stable drainage channels preventing pore pressure buildup.",
    recommendedAction: "Maintain sump pump operations and inspect rock bolt tension monthly.",
    historicalFailures: 0,
    lastScanTime: "8 mins ago",
    coordinates: { lat: 22.5740, lng: 85.4250 }
  }
];

// Helper to compute AI prediction for arbitrary user coordinates
export function computeCustomLocationAnalysis(lat, lng) {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return null;
  }

  // Distance from mine center (22.5726, 85.4312)
  const distLat = Math.abs(latitude - 22.5726);
  const distLng = Math.abs(longitude - 85.4312);

  // Deterministic seed generation based on coordinates for realistic consistency
  const seed = Math.abs(Math.sin(latitude * 1000 + longitude * 2000));
  const slopeAngle = parseFloat((35 + seed * 42).toFixed(1));
  
  // Calculate rockfall probability base
  let probability = (seed * 65 + (slopeAngle > 60 ? 25 : 5)).toFixed(1);
  probability = Math.min(96.5, Math.max(8.2, parseFloat(probability)));

  // Risk categorization
  let riskLevel = "STABLE";
  if (probability >= 75) {
    riskLevel = "CRITICAL";
  } else if (probability >= 45) {
    riskLevel = "WARNING";
  }

  // Calculate synthetic geotechnical variables based on risk
  const displacementRate = parseFloat((probability * 0.18 + seed * 2).toFixed(1));
  const acousticEmission = Math.round(probability * 4.5 + seed * 50);
  const porePressure = Math.round(50 + probability * 1.6 + seed * 30);
  const rmr = Math.round(90 - probability * 0.6);
  const elevation = Math.round(220 + seed * 360);

  // Geological landform classification logic
  let landformType = "Jointed Sedimentary Bench Face";
  if (slopeAngle > 65) landformType = "Steep Undercut Highwall Fracture Zone";
  else if (slopeAngle < 45) landformType = "Weathered Overburden Debris Terrace";
  else landformType = "Fractured Quartzite & Shale Structural Slope";

  let statusDescription = "";
  let recommendedAction = "";

  if (riskLevel === "CRITICAL") {
    statusDescription = `Critical shear strain detected at coordinates (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°). Deep micro-seismic acoustic emission spikes indicate impending wedge/rockfall failure within 2-6 hours.`;
    recommendedAction = `IMMEDIATE RED-ZONE EVACUATION. Halt all bench operations within 150m radius. Deploy ground-based synthetic aperture radar (GBSAR) and broadcast emergency sirens.`;
  } else if (riskLevel === "WARNING") {
    statusDescription = `Moderate slope instability detected at coordinates (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°). Tension crack enlargement observed with localized block detachment potential.`;
    recommendedAction = `Issue Yellow Hazard Alert. Restrict machinery movement, install wire netting/catch barriers, and schedule wireline extensometer check.`;
  } else {
    statusDescription = `Geological landform at (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°) exhibits high structural stability. Factor of Safety (FoS) > 1.6 with minimal strain rates.`;
    recommendedAction = `Normal mine operations permitted. Continue standard automated satellite radar surveillance.`;
  }

  return {
    id: `custom-${latitude.toFixed(3)}-${longitude.toFixed(3)}`,
    name: `Custom Landform Zone (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E)`,
    type: landformType,
    lat: latitude,
    lng: longitude,
    elevation,
    slopeAngle,
    riskLevel,
    probability,
    displacementRate,
    porePressure,
    acousticEmission,
    rmr,
    weatherImpact: probability > 60 ? "Heavy Hydrostatic Saturation" : "Standard Pit Drainage",
    statusDescription,
    recommendedAction,
    historicalFailures: Math.floor(seed * 4),
    lastScanTime: "Just analyzed by AI Engine",
    coordinates: { lat: latitude, lng: longitude }
  };
}
