// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface ActivityDetails {
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

interface HistoryItem {
  id: string;
  title: string;
  emoji: string;
  points: number;
  date: string;
  aqi: string;
  aqiColor: string;
}

interface DailyRecommendations {
  primary: ActivityDetails;
  secondary1: ActivityDetails;
  secondary2: ActivityDetails;
}

export { ActivityDetails, AqiMeta, HistoryItem, DailyRecommendations };
