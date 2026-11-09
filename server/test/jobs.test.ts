import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { pushTokens, users } from "../src/db/schema.js";
import { runAqiAlerts } from "../src/jobs/aqiAlerts.js";
import { runPlantReminders } from "../src/jobs/plantReminders.js";
import type { SendPush } from "../src/services/push.js";
import { db, fakeAirQuality, insertLog, pool, resetDb } from "./helpers.js";

const TOKEN = "ExponentPushToken[bbbbbbbbbbbbbbbbbbbbbb]";

async function seedUser(
  id: string,
  fields: Partial<typeof users.$inferInsert> = {},
  token: string | null = TOKEN,
) {
  await db.insert(users).values({ id, timezone: "UTC", ...fields });
  if (token) await db.insert(pushTokens).values({ token, userId: id });
}

function fakeSender(invalidTokens: string[] = []) {
  return vi.fn<SendPush>(async () => ({ invalidTokens }));
}

// 12:00 UTC — outside quiet hours for UTC users
const NOON_UTC = new Date("2026-06-15T12:00:00Z");
const NINE_UTC = new Date("2026-06-15T09:05:00Z");

beforeEach(resetDb);
afterAll(async () => {
  await pool.end();
});

describe("AQI alerts", () => {
  it("alerts users whose area has poor air, once per cooldown", async () => {
    await seedUser("u1", { lastLat: 28.61, lastLon: 77.2 });
    const sendPush = fakeSender();

    const first = await runAqiAlerts({ db, fetchAirQuality: fakeAirQuality(5), sendPush, now: NOON_UTC });
    expect(first.usersAlerted).toBe(1);
    expect(sendPush).toHaveBeenCalledWith([
      expect.objectContaining({ to: TOKEN, title: "Air quality is Hazardous near you" }),
    ]);

    const again = await runAqiAlerts({
      db,
      fetchAirQuality: fakeAirQuality(5),
      sendPush,
      now: new Date(NOON_UTC.getTime() + 60 * 60_000),
    });
    expect(again.usersAlerted).toBe(0);
  });

  it("stays quiet when the air is fine", async () => {
    await seedUser("u1", { lastLat: 28.61, lastLon: 77.2 });
    const sendPush = fakeSender();
    await runAqiAlerts({ db, fetchAirQuality: fakeAirQuality(2), sendPush, now: NOON_UTC });
    expect(sendPush).not.toHaveBeenCalled();
  });

  it("respects quiet hours in the user's timezone", async () => {
    // 12:00 UTC is 21:00 in Tokyo — fine; 14:00 UTC is 23:00 — quiet.
    await seedUser("u1", { lastLat: 35.68, lastLon: 139.69, timezone: "Asia/Tokyo" });
    const sendPush = fakeSender();
    await runAqiAlerts({
      db,
      fetchAirQuality: fakeAirQuality(5),
      sendPush,
      now: new Date("2026-06-15T14:00:00Z"),
    });
    expect(sendPush).not.toHaveBeenCalled();
  });

  it("skips users with alerts off or no known location", async () => {
    await seedUser("off", { aqiAlerts: false, lastLat: 1, lastLon: 1 }, "ExponentPushToken[off]");
    await seedUser("nowhere", {}, "ExponentPushToken[nowhere]");
    const fetchAirQuality = vi.fn(fakeAirQuality(5));
    const sendPush = fakeSender();
    await runAqiAlerts({ db, fetchAirQuality, sendPush, now: NOON_UTC });
    expect(fetchAirQuality).not.toHaveBeenCalled();
    expect(sendPush).not.toHaveBeenCalled();
  });

  it("fetches each location once and drops dead tokens", async () => {
    await seedUser("u1", { lastLat: 28.61, lastLon: 77.2 }, "ExponentPushToken[one]");
    await seedUser("u2", { lastLat: 28.61, lastLon: 77.2 }, "ExponentPushToken[two]");
    const fetchAirQuality = vi.fn(fakeAirQuality(4));
    const sendPush = fakeSender(["ExponentPushToken[two]"]);

    await runAqiAlerts({ db, fetchAirQuality, sendPush, now: NOON_UTC });
    expect(fetchAirQuality).toHaveBeenCalledTimes(1);
    expect(sendPush.mock.calls[0][0]).toHaveLength(2);
    const tokens = await db.select().from(pushTokens);
    expect(tokens.map((t) => t.token)).toEqual(["ExponentPushToken[one]"]);
  });
});

describe("plant reminders", () => {
  it("reminds at the reminder hour when nothing was watered for two days", async () => {
    await seedUser("u1", { plantReminders: true });
    const sendPush = fakeSender();
    const result = await runPlantReminders({ db, sendPush, now: NINE_UTC });
    expect(result.usersReminded).toBe(1);

    const [row] = await db.select().from(users).where(eq(users.id, "u1"));
    expect(row.lastPlantReminderOn).toBe("2026-06-15");

    // Not twice on the same day
    const again = await runPlantReminders({
      db,
      sendPush,
      now: new Date("2026-06-15T09:35:00Z"),
    });
    expect(again.usersReminded).toBe(0);
  });

  it("does nothing outside the reminder hour or with reminders off", async () => {
    await seedUser("u1", { plantReminders: true }, "ExponentPushToken[one]");
    await seedUser("u2", { plantReminders: false }, "ExponentPushToken[two]");
    const sendPush = fakeSender();
    await runPlantReminders({ db, sendPush, now: NOON_UTC });
    expect(sendPush).not.toHaveBeenCalled();

    const result = await runPlantReminders({ db, sendPush, now: NINE_UTC });
    expect(result.usersReminded).toBe(1);
    expect(sendPush.mock.calls[0][0]).toEqual([expect.objectContaining({ to: "ExponentPushToken[one]" })]);
  });

  it("skips users who watered recently", async () => {
    await seedUser("u1", { plantReminders: true });
    // insertLog dates are relative to the real today, so use the real clock here
    await insertLog("u1", { kind: "care", key: "water", points: 10, daysAgo: 1 });
    const now = new Date();
    now.setUTCHours(9, 5, 0, 0);
    const sendPush = fakeSender();
    const result = await runPlantReminders({ db, sendPush, now });
    expect(result.usersReminded).toBe(0);
  });
});
