export const UNITS = ["kg", "L", "pcs", "ton"];

/** Suggested output products per waste category (SRS §3.2.3) */
export const PRODUCT_SUGGESTIONS = {
  Plastic: [
    "Plastic Pellets",
    "Construction Boards",
    "HDPE Pipes",
    "Polyester Fiber",
    "Recycled Cables",
  ],
  Organic: [
    "Organic Compost",
    "Liquid Fertilizer",
    "Biogas",
    "Soil Conditioner",
  ],
  Metal: [
    "Industrial Steel Ingot",
    "Aluminum Alloy",
    "Copper Wire",
    "Metal Sheets",
  ],
};

/** FR-5.3 — waste-to-product conversion ratio */
export function conversionRatio(produced, collected) {
  if (!collected || collected <= 0) return 0;
  return Number(((produced / collected) * 100).toFixed(2));
}