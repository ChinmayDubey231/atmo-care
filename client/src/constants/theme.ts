// Design tokens. Values mirror the "Breathe" variables in the Figma file.
export const COLORS = {
  primary: "#006944",
  primaryPressed: "#005c3b",
  primarySoft: "#d6efe3",
  onPrimary: "#ffffff",
  surface: "#f3f7f5",
  surfaceLow: "#e9eeec",
  card: "#ffffff",
  onSurface: "#2b302f",
  onSurfaceMuted: "#585c5b",
  placeholder: "#737876",
  border: "#dbe5e1",
  error: "#b31b25",
  errorContainer: "#ffdad6",
  blue: "#006093",
  blueSoft: "#dcecf5",
  amber: "#a16207",
  amberSoft: "#f6ecd0",
};

export const FONTS = {
  display: "PlusJakartaSans-ExtraBold",
  heading: "PlusJakartaSans-Bold",
  body: "BeVietnamPro-Regular",
  medium: "BeVietnamPro-Medium",
  semiBold: "BeVietnamPro-SemiBold",
};

export interface SkyPalette {
  base: string;
  /** Outermost band first, the sun last */
  bands: readonly string[];
  /** Text and icons drawn on the sky */
  mist: string;
}

export const BRAND_SKY: SkyPalette = {
  base: "#002a20",
  bands: ["#00382a", "#004834", "#005c41", "#0c7350", "#3fa97f", "#c9f5de"],
  mist: "#c9f5de",
};

/** "#006944" + 0.2 → "#00694433" */
export const withAlpha = (hex: string, alpha: number) =>
  `${hex}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0")}`;
