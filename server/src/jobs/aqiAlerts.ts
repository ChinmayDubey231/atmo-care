import { and, eq, inArray, isNotNull, isNull, lt, or } from "drizzle-orm";
import type { Db } from "../db/client.js";
import { pushTokens, users } from "../db/schema.js";
import { localHour } from "../lib/dates.js";
import type { FetchAirQuality } from "../services/openWeather.js";
import type { PushMessage, SendPush } from "../services/push.js";

/** OpenWeather levels 4 (Poor) and 5 (Very Poor). */
const ALERT_THRESHOLD = 4;
const COOLDOWN_MS = 6 * 60 * 60_000;
const QUIET_START = 22;
const QUIET_END = 7;

const LABEL: Record<number, string> = { 4: "Unhealthy", 5: "Hazardous" };

export interface AqiAlertDeps {
  db: Db;
  fetchAirQuality: FetchAirQuality;
  sendPush: SendPush;
  now?: Date;
}

export async function runAqiAlerts({ db, fetchAirQuality, sendPush, now = new Date() }: AqiAlertDeps) {
  const rows = await db
    .select({
      userId: users.id,
      timezone: users.timezone,
      lat: users.lastLat,
      lon: users.lastLon,
      token: pushTokens.token,
    })
    .from(users)
    .innerJoin(pushTokens, eq(pushTokens.userId, users.id))
    .where(
      and(
        eq(users.aqiAlerts, true),
        isNotNull(users.lastLat),
        isNotNull(users.lastLon),
        or(
          isNull(users.lastAqiAlertAt),
          lt(users.lastAqiAlertAt, new Date(now.getTime() - COOLDOWN_MS)),
        ),
      ),
    );

  // Group tokens by location so each grid cell is fetched once.
  const byLocation = new Map<string, { lat: number; lon: number; users: Map<string, string[]> }>();
  for (const r of rows) {
    const hour = localHour(r.timezone, now);
    if (hour >= QUIET_START || hour < QUIET_END) continue;

    const key = `${r.lat},${r.lon}`;
    let loc = byLocation.get(key);
    if (!loc) {
      loc = { lat: r.lat!, lon: r.lon!, users: new Map() };
      byLocation.set(key, loc);
    }
    const tokens = loc.users.get(r.userId) ?? [];
    tokens.push(r.token);
    loc.users.set(r.userId, tokens);
  }

  const messages: PushMessage[] = [];
  const alerted: string[] = [];
  for (const loc of byLocation.values()) {
    let aqi: number;
    try {
      aqi = (await fetchAirQuality(loc.lat, loc.lon)).aqi;
    } catch (err) {
      console.error("AQI alert: lookup failed", err);
      continue;
    }
    if (aqi < ALERT_THRESHOLD) continue;

    for (const [userId, tokens] of loc.users) {
      alerted.push(userId);
      for (const to of tokens) {
        messages.push({
          to,
          title: `Air quality is ${LABEL[aqi] ?? "poor"} near you`,
          body: "Consider moving workouts indoors and keeping windows closed.",
          data: { type: "aqi", aqi },
        });
      }
    }
  }

  if (messages.length > 0) {
    const { invalidTokens } = await sendPush(messages);
    if (invalidTokens.length > 0) {
      await db.delete(pushTokens).where(inArray(pushTokens.token, invalidTokens));
    }
    await db.update(users).set({ lastAqiAlertAt: now }).where(inArray(users.id, alerted));
  }

  return { locationsChecked: byLocation.size, usersAlerted: alerted.length };
}
