export const theme = {
  colors: {
    // Surfaces (The Layering Principle)
    surface: "#f3f7f5",
    surfaceContainerLowest: "#ffffff",
    surfaceContainerLow: "#edf2f0",
    surfaceContainer: "#e9eeec",
    surfaceContainerHigh: "#e0e6e4",
    surfaceContainerHighest: "#d7dedc",
    surfaceVariant: "#dbe5e1",

    // Core Palette
    primary: "#2d5d4b", // Forest Growth (approximate hex)
    onPrimary: "#ffffff",
    primaryContainer: "#bdf0d4", // Healthy AQI
    primaryFixedDim: "#8dd4a8",

    secondary: "#a3c2b5", // Meadow Mist (approximate hex)
    secondaryFixed: "#cce8e0", // Progress track

    tertiary: "#006093", // Sky Clarity

    errorContainer: "#ffdad6", // Poor AQI

    // Text & Lines
    onSurface: "#2b302f", // Strictly no pure black
    outlineVariant: "#aaaeac",

    // Special Utilities
    transparentSurface: "rgba(243, 247, 245, 0.8)", // For 80% backdrop blur
    ghostBorder: "rgba(170, 174, 172, 0.15)", // outline_variant at 15% opacity
  },

  typography: {
    // High-Energy Engine (Display & Headlines)
    displayLg: {
      fontFamily: "PlusJakartaSans-Bold",
      fontSize: 64,
      color: "#2b302f",
    },
    headlineMd: {
      fontFamily: "PlusJakartaSans-SemiBold",
      fontSize: 28,
      color: "#2b302f",
    },
    // Friendly Grounding (Body & Labels)
    labelMd: {
      fontFamily: "BeVietnamPro-Medium",
      fontSize: 12,
      textTransform: "uppercase" as const,
      color: "#2b302f",
    },
    labelSm: {
      fontFamily: "BeVietnamPro-Regular",
      fontSize: 10,
      color: "#2b302f",
    },
  },

  spacing: {
    spacing4: 22, // ~1.4rem
    spacing5: 28,
    spacing6: 32, // ~2.0rem (Divider replacement)
    spacing8: 48,
  },

  radii: {
    md: 16,
    lg: 32, // 2rem
    xl: 48,
    full: 9999,
  },

  shadows: {
    ambient: {
      shadowColor: "#2b302f",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.06,
      shadowRadius: 24,
      elevation: 8,
    },
  },

  animation: {
    bouncyEasing: [0.34, 1.56, 0.64, 1], // Array format for React Native Reanimated
  },
};

export type Theme = typeof theme;
