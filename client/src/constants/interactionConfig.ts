import type { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "./theme";

export type InteractionType = "water" | "sun" | "clean";

export type InteractionConfig = {
  label: string;
  color: string;
  tint: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  sheetTitle: string;
  getDescription: (aqi: number | null) => string;
  actionLabel: string;
};

export const INTERACTION_CONFIG: Record<InteractionType, InteractionConfig> = {
  water: {
    label: "Water",
    color: COLORS.blue,
    tint: COLORS.blueSoft,
    icon: "water",
    sheetTitle: "Water Your Plant",
    getDescription: (aqi) =>
      aqi != null && aqi >= 4
        ? "Air quality is poor — rinse leaves while watering to remove pollutant dust."
        : "Good time to water. Check the soil first — water only when the top inch is dry.",
    actionLabel: "Log Watering",
  },
  sun: {
    label: "Sun",
    color: COLORS.amber,
    tint: COLORS.amberSoft,
    icon: "white-balance-sunny",
    sheetTitle: "Sun Exposure",
    getDescription: (aqi) =>
      aqi != null && aqi >= 4
        ? "Air quality is poor — keep your plant indoors today to avoid pollutant stress."
        : aqi != null && aqi === 3
          ? "Moderate air quality. Limit direct outdoor exposure to a few hours."
          : "Conditions are great! Move your plant to a sunny spot for optimal growth.",
    actionLabel: "Log Sun Time",
  },
  clean: {
    label: "Clean",
    color: COLORS.primary,
    tint: COLORS.primarySoft,
    icon: "broom",
    sheetTitle: "Clean Leaves",
    getDescription: (aqi) =>
      aqi != null && aqi >= 3
        ? "AQI is elevated — dust and pollutants settle on leaves and block photosynthesis. Time to wipe them down."
        : "Leaves look healthy. A gentle wipe every 2 weeks keeps them dust-free.",
    actionLabel: "Log Cleaning",
  },
};
