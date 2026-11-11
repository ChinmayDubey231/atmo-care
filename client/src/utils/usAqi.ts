// US EPA Air Quality Index for particle pollution. Breakpoints and method are
// from 40 CFR Part 58, Appendix G, including the 2024 PM2.5 update.
// Each row: [concentration low, concentration high, index low, index high]
type Breakpoint = [number, number, number, number];

// PM2.5 in µg/m³
const PM25: Breakpoint[] = [
  [0.0, 9.0, 0, 50],
  [9.1, 35.4, 51, 100],
  [35.5, 55.4, 101, 150],
  [55.5, 125.4, 151, 200],
  [125.5, 225.4, 201, 300],
  [225.5, 325.4, 301, 500],
];

// PM10 in µg/m³
const PM10: Breakpoint[] = [
  [0, 54, 0, 50],
  [55, 154, 51, 100],
  [155, 254, 101, 150],
  [255, 354, 151, 200],
  [355, 424, 201, 300],
  [425, 604, 301, 500],
];

/**
 * Converts a particle concentration to its US AQI value. The EPA index is
 * defined on 24-hour averages, so a single current reading is an estimate.
 */
export function usAqi(pollutant: "pm25" | "pm10", concentration: number): number {
  const table = pollutant === "pm25" ? PM25 : PM10;
  // EPA truncates PM2.5 to one decimal place and PM10 to a whole number
  const c =
    pollutant === "pm25"
      ? Math.floor(concentration * 10 + 1e-9) / 10
      : Math.floor(concentration + 1e-9);
  if (!(c > 0)) return 0;
  // Readings past the top row keep its slope, so the index can pass 500
  const [cLo, cHi, iLo, iHi] =
    table.find(([, hi]) => c <= hi) ?? table[table.length - 1];
  return Math.round(((iHi - iLo) / (cHi - cLo)) * (c - cLo) + iLo);
}
