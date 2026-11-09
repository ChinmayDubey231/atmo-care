import { sql } from "drizzle-orm";
import request from "supertest";
import { createApp } from "../src/app.js";
import type { AuthProvider } from "../src/auth.js";
import { createDb } from "../src/db/client.js";
import { logs, users } from "../src/db/schema.js";
import { addDays, localDate } from "../src/lib/dates.js";
import type { FetchAirQuality } from "../src/services/openWeather.js";

export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgres://atmo:atmo@localhost:5433/atmocare_test";

export const { db, pool } = createDb(TEST_DATABASE_URL);

/** Stand-in for Clerk: the caller's user id comes from a header. */
export const testAuth: AuthProvider = {
  middleware: (_req, _res, next) => next(),
  getUserId: (req) => req.header("x-test-user") ?? null,
};

export const fakeAirQuality = (aqi = 2): FetchAirQuality => async () => ({
  aqi,
  pm25: 8.5,
  pm10: 14.2,
  fetchedAt: new Date().toISOString(),
});

export function makeApp(fetchAirQuality: FetchAirQuality = fakeAirQuality()) {
  return createApp({ db, auth: testAuth, fetchAirQuality });
}

/** supertest helpers that send requests as `userId` */
export function as(app: ReturnType<typeof makeApp>, userId: string) {
  const agent = request(app);
  return {
    get: (url: string) => agent.get(url).set("x-test-user", userId),
    post: (url: string) => agent.post(url).set("x-test-user", userId),
    patch: (url: string) => agent.patch(url).set("x-test-user", userId),
    put: (url: string) => agent.put(url).set("x-test-user", userId),
    delete: (url: string) => agent.delete(url).set("x-test-user", userId),
  };
}

export async function resetDb() {
  await db.execute(sql`TRUNCATE users, logs, favorites, push_tokens CASCADE`);
}

/** Insert a log `daysAgo` days back (UTC users), bypassing the API. */
export async function insertLog(
  userId: string,
  {
    daysAgo = 0,
    key = "morning-jog",
    points = 80,
    kind = "activity",
  }: { daysAgo?: number; key?: string; points?: number; kind?: "activity" | "care" } = {},
) {
  const today = localDate("UTC");
  await db.insert(users).values({ id: userId }).onConflictDoNothing();
  await db.insert(logs).values({
    userId,
    kind,
    key,
    title: key,
    emoji: "✨",
    points,
    localDate: addDays(today, -daysAgo),
    loggedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60_000),
  });
}
