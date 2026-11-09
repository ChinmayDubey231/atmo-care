import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ── Users ────────────────────────────────────────────────────────────────────
// Keyed by the Clerk user id. Profile fields are synced from the app so the
// leaderboard can show names without calling Clerk for every row.
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull().default("Eco Explorer"),
  imageUrl: text("image_url"),
  timezone: text("timezone").notNull().default("UTC"),

  // Settings
  units: text("units").notNull().default("metric"),
  aqiAlerts: boolean("aqi_alerts").notNull().default(true),
  plantReminders: boolean("plant_reminders").notNull().default(false),
  communityMessages: boolean("community_messages").notNull().default(true),
  showOnLeaderboard: boolean("show_on_leaderboard").notNull().default(true),

  // Last known location, rounded to ~1 km. Only kept while AQI alerts are on.
  lastLat: doublePrecision("last_lat"),
  lastLon: doublePrecision("last_lon"),

  // Notification bookkeeping so jobs don't send duplicates
  lastAqiAlertAt: timestamp("last_aqi_alert_at", { withTimezone: true }),
  lastPlantReminderOn: date("last_plant_reminder_on"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Logs ─────────────────────────────────────────────────────────────────────
// One row per logged activity or plant-care action. `localDate` is the day in
// the user's timezone at the moment of logging; streaks are computed from it.
export const logKind = pgEnum("log_kind", ["activity", "care"]);

export const logs = pgTable(
  "logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: logKind("kind").notNull(),
    key: text("key").notNull(),
    title: text("title").notNull(),
    emoji: text("emoji").notNull(),
    points: integer("points").notNull(),
    aqiLevel: smallint("aqi_level"),
    loggedAt: timestamp("logged_at", { withTimezone: true }).notNull().defaultNow(),
    localDate: date("local_date").notNull(),
  },
  (t) => [
    index("logs_user_logged_at_idx").on(t.userId, t.loggedAt),
    index("logs_logged_at_idx").on(t.loggedAt),
    // Points are earned once per key per day; repeat logs are stored with 0.
    uniqueIndex("logs_points_once_per_day")
      .on(t.userId, t.key, t.localDate)
      .where(sql`${t.points} > 0`),
  ],
);

// ── Plant wiki favorites ─────────────────────────────────────────────────────
export const favorites = pgTable(
  "favorites",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    plantKey: text("plant_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.plantKey] })],
);

// ── Expo push tokens ─────────────────────────────────────────────────────────
// A token identifies one device install; if a different user signs in on that
// device the row is reassigned to them.
export const pushTokens = pgTable(
  "push_tokens",
  {
    token: text("token").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("push_tokens_user_idx").on(t.userId)],
);

export type User = typeof users.$inferSelect;
export type Log = typeof logs.$inferSelect;
