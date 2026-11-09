// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface ActivityDetails {
  /** Matches the server activity catalog (server/src/catalog.ts) */
  key: string;
  title: string;
  subtitle?: string;
  badge?: string;
  image?: string;
  alert?: string;
  icon?: string;
  color?: string;
  points: number;
  prepTips: string[];
}

interface AqiMeta {
  level: number;
  num: number;
  label: string;
  desc: string;
  gradStart: string;
  gradEnd: string;
}

interface DailyRecommendations {
  primary: ActivityDetails;
  secondary1: ActivityDetails;
  secondary2: ActivityDetails;
}

export { ActivityDetails, AqiMeta, DailyRecommendations };
