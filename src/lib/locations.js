/**
 * Suggestion lists only. The Zone table accepts any free-text city/country,
 * so the system is not limited to these values.
 */
export const COUNTRIES = [
  "Bangladesh", "India", "Pakistan", "Nepal", "Sri Lanka",
  "Malaysia", "Singapore", "United Arab Emirates", "United Kingdom",
  "United States", "Canada", "Australia", "Japan", "Germany", "Other",
];

export const BD_CITIES = [
  { city: "Dhaka",        district: "Dhaka" },
  { city: "Chattogram",   district: "Chattogram" },
  { city: "Comilla",      district: "Cumilla" },
  { city: "Sylhet",       district: "Sylhet" },
  { city: "Rajshahi",     district: "Rajshahi" },
  { city: "Khulna",       district: "Khulna" },
  { city: "Barishal",     district: "Barishal" },
  { city: "Rangpur",      district: "Rangpur" },
  { city: "Mymensingh",   district: "Mymensingh" },
  { city: "Narayanganj",  district: "Narayanganj" },
  { city: "Gazipur",      district: "Gazipur" },
  { city: "Cox's Bazar",  district: "Cox's Bazar" },
];

/** Suggests a prefix like DHK, CTG from a city name */
export function suggestAreaPrefix(city) {
  if (!city) return "";
  const clean = city.replace(/[^A-Za-z ]/g, "").trim();
  const words = clean.split(/\s+/);
  if (words.length > 1) {
    return words.map((w) => w[0]).join("").toUpperCase().slice(0, 3);
  }
  return clean.slice(0, 3).toUpperCase();
}