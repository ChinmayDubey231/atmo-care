import { BRAND_SKY, COLORS, type SkyPalette } from "./theme";

export interface AirLevel {
  level: number;
  label: string;
  summary: string;
  /** How houseplants are coping */
  mood: string;
  accent: string;
  tint: string;
  sky: SkyPalette;
}

// The server reports air quality on a 1-5 scale
export const AIR_LEVELS: AirLevel[] = [
  {
    level: 1,
    label: "Excellent",
    summary: "Perfect conditions for everything",
    mood: "Thriving",
    accent: COLORS.primary,
    tint: COLORS.primarySoft,
    sky: BRAND_SKY,
  },
  {
    level: 2,
    label: "Good",
    summary: "Great air — enjoy the outdoors",
    mood: "Healthy",
    accent: "#0f766e",
    tint: "#d2eeea",
    sky: {
      base: "#00282c",
      bands: ["#00363a", "#00464a", "#005a5a", "#0a7068", "#3ca896", "#c6f2e4"],
      mist: "#c6f2e4",
    },
  },
  {
    level: 3,
    label: "Moderate",
    summary: "Acceptable — limit intense activity",
    mood: "Moderate",
    accent: "#a16207",
    tint: "#f6ecd0",
    sky: {
      base: "#2b2003",
      bands: ["#3a2c05", "#4b3a08", "#614c0c", "#7c6312", "#c8a030", "#fbe7a8"],
      mist: "#fbe7a8",
    },
  },
  {
    level: 4,
    label: "Poor",
    summary: "Sensitive groups stay indoors",
    mood: "Stressed",
    accent: "#c2410c",
    tint: "#fbe3d3",
    sky: {
      base: "#2c1404",
      bands: ["#3c1c06", "#4f2609", "#67320d", "#844213", "#d67a30", "#ffd8b5"],
      mist: "#ffd8b5",
    },
  },
  {
    level: 5,
    label: "Hazardous",
    summary: "Avoid all outdoor exposure",
    mood: "Critical",
    accent: "#b91c1c",
    tint: "#fbdcdc",
    sky: {
      base: "#2a0a10",
      bands: ["#3a0e17", "#4d131f", "#661a29", "#842335", "#cf4a55", "#ffcfd0"],
      mist: "#ffcfd0",
    },
  },
];

export function getAirLevel(aqi: number | null | undefined): AirLevel {
  const level = Math.min(Math.max(Math.round(aqi ?? 1), 1), 5);
  return AIR_LEVELS[level - 1];
}
