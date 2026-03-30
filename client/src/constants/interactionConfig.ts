export type InteractionType = "water" | "sun" | "clean";

export type InteractionConfig = {
  label: string;
  color: string;
  icon: string;
  iconLib: "material" | "ionicon";
  sheetTitle: string;
  getDescription: (aqi: number | null) => string;
  actionLabel: string;
  emoji: string;
};

const COLORS = {
  primary: "#006944",
  tertiary: "#006093",
  secondary: "#006a35",
};

export const INTERACTION_CONFIG: Record<InteractionType, InteractionConfig> = {
  water: {
    label: "Water",
    color: COLORS.primary,
    icon: "water-opacity",
    iconLib: "material",
    sheetTitle: "Water Your Plant",
    getDescription: (aqi) =>
      aqi != null && aqi >= 4
        ? "Air quality is poor — rinse leaves while watering to remove pollutant dust."
        : "Good time to water. Check the soil first — water only when the top inch is dry.",
    actionLabel: "Log Watering",
    emoji: "💧",
  },
  sun: {
    label: "Sun",
    color: COLORS.tertiary,
    icon: "sunny",
    iconLib: "ionicon",
    sheetTitle: "Sun Exposure",
    getDescription: (aqi) =>
      aqi != null && aqi >= 4
        ? "Air quality is poor — keep your plant indoors today to avoid pollutant stress."
        : aqi != null && aqi === 3
          ? "Moderate air quality. Limit direct outdoor exposure to a few hours."
          : "Conditions are great! Move your plant to a sunny spot for optimal growth.",
    actionLabel: "Log Sun Time",
    emoji: "☀️",
  },
  clean: {
    label: "Clean",
    color: COLORS.secondary,
    icon: "broom",
    iconLib: "material",
    sheetTitle: "Clean Leaves",
    getDescription: (aqi) =>
      aqi != null && aqi >= 3
        ? "AQI is elevated — dust and pollutants settle on leaves and block photosynthesis. Time to wipe them down."
        : "Leaves look healthy. A gentle wipe every 2 weeks keeps them dust-free.",
    actionLabel: "Log Cleaning",
    emoji: "🧹",
  },
};
