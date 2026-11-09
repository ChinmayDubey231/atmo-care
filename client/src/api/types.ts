// Shapes returned by the Atmo-Care API (server/src/routes)

export type Units = "metric" | "imperial" | "us";

export interface Settings {
  units: Units;
  aqiAlerts: boolean;
  plantReminders: boolean;
  communityMessages: boolean;
  showOnLeaderboard: boolean;
}

export interface Profile {
  id: string;
  displayName: string;
  imageUrl: string | null;
  timezone: string;
  settings: Settings;
}

export type ProfileUpdate = Partial<
  Pick<Profile, "displayName" | "imageUrl" | "timezone"> & Settings
>;

export type CareKey = "water" | "sun" | "clean";

export interface Stats {
  totalLogs: number;
  totalPoints: number;
  weekPoints: number;
  streak: number;
  level: { name: string; min: number; nextName: string | null; nextMin: number | null };
  care: Record<CareKey, { todayCount: number; lastAt: string | null }>;
}

export interface LogItem {
  id: string;
  kind: "activity" | "care";
  key: string;
  title: string;
  emoji: string;
  points: number;
  aqiLevel: number | null;
  loggedAt: string;
}

export interface LogsPage {
  items: LogItem[];
  nextCursor: string | null;
}

export interface NewLog {
  kind: "activity" | "care";
  key: string;
  aqiLevel?: number | null;
}

export interface LogResult {
  log: LogItem;
  pointsAwarded: number;
  alreadyEarnedToday: boolean;
}

export type LeaderboardPeriod = "week" | "all";

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  imageUrl: string | null;
  points: number;
  isMe: boolean;
}

export interface Leaderboard {
  period: LeaderboardPeriod;
  entries: LeaderboardEntry[];
  me: LeaderboardEntry | null;
}

export interface AirQuality {
  aqi: number;
  pm25: number | null;
  pm10: number | null;
  fetchedAt: string;
}
