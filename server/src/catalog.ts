// Server-side source of truth for what can be logged and how many points it
// earns. The app's recommendation cards carry the same `key`s
// (client/src/utils/activityRecommendations.ts); points shown there are only
// a preview — the value stored here is what gets awarded.

export type LogKind = "activity" | "care";

export interface CatalogEntry {
  title: string;
  emoji: string;
  points: number;
}

export const ACTIVITIES: Record<string, CatalogEntry> = {
  // Poor / moderate air (indoors)
  "indoor-yoga": { title: "Indoor Yoga Flow", emoji: "🧘", points: 50 },
  "read-book": { title: "Read a Book", emoji: "📖", points: 20 },
  "organize-space": { title: "Organize Space", emoji: "🗂️", points: 30 },
  "home-hiit": { title: "Home HIIT Workout", emoji: "💪", points: 60 },
  "plant-care": { title: "Plant Care", emoji: "🌿", points: 25 },
  "meal-prep": { title: "Meal Prep", emoji: "🍲", points: 40 },
  "movie-marathon": { title: "Movie Marathon", emoji: "🎬", points: 30 },
  meditation: { title: "Meditation", emoji: "🌙", points: 40 },
  "light-cleaning": { title: "Light Cleaning", emoji: "🧹", points: 20 },

  // Good air (outdoors)
  "morning-jog": { title: "Morning Jog", emoji: "🏃", points: 80 },
  cycling: { title: "Cycling", emoji: "🚴", points: 70 },
  "outdoor-stretch": { title: "Outdoor Stretch", emoji: "🤸", points: 40 },
  "park-walk": { title: "Park Walk", emoji: "🌳", points: 50 },
  hydrate: { title: "Hydrate", emoji: "💧", points: 10 },
  "shaded-reading": { title: "Shaded Reading", emoji: "📚", points: 30 },
  "sunset-stroll": { title: "Sunset Stroll", emoji: "🌅", points: 50 },
  "star-gazing": { title: "Star Gazing", emoji: "🌌", points: 20 },
  "patio-dinner": { title: "Patio Dinner", emoji: "🍽️", points: 40 },
};

export const CARE: Record<string, CatalogEntry> = {
  water: { title: "Watered plants", emoji: "💧", points: 10 },
  sun: { title: "Plant sun time", emoji: "☀️", points: 10 },
  clean: { title: "Cleaned leaves", emoji: "🧹", points: 10 },
};

export const CARE_KEYS = Object.keys(CARE) as ("water" | "sun" | "clean")[];

export function lookupCatalog(kind: LogKind, key: string): CatalogEntry | null {
  const table = kind === "activity" ? ACTIVITIES : CARE;
  return Object.hasOwn(table, key) ? table[key] : null;
}

// ── Green levels ─────────────────────────────────────────────────────────────
export const LEVELS = [
  { name: "Seedling", min: 0 },
  { name: "Sprout", min: 150 },
  { name: "Sapling", min: 400 },
  { name: "Grove", min: 800 },
  { name: "Sage", min: 1500 },
] as const;

export function levelFor(points: number) {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (points >= LEVELS[i].min) index = i;
  }
  const next = LEVELS[index + 1];
  return {
    name: LEVELS[index].name,
    min: LEVELS[index].min,
    nextName: next?.name ?? null,
    nextMin: next?.min ?? null,
  };
}
