import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { users } from "../src/db/schema.js";
import { as, db, fakeAirQuality, insertLog, makeApp, pool, resetDb } from "./helpers.js";

const TOKEN_A = "ExponentPushToken[aaaaaaaaaaaaaaaaaaaaaa]";

let app: ReturnType<typeof makeApp>;

beforeEach(async () => {
  await resetDb();
  app = makeApp();
});

afterAll(async () => {
  await pool.end();
});

describe("auth", () => {
  it("rejects requests without a signed-in user", async () => {
    const res = await request(app).get("/api/me");
    expect(res.status).toBe(401);
  });

  it("serves the health check without auth", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
  });
});

describe("/api/me", () => {
  it("creates the user on first request with default settings", async () => {
    const res = await as(app, "user_1").get("/api/me");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: "user_1",
      timezone: "UTC",
      settings: { units: "metric", aqiAlerts: true, plantReminders: false, showOnLeaderboard: true },
    });
  });

  it("updates profile and settings", async () => {
    const res = await as(app, "user_1").patch("/api/me").send({
      displayName: "Chinmay Dubey",
      timezone: "Asia/Kolkata",
      units: "us",
      plantReminders: true,
    });
    expect(res.status).toBe(200);
    expect(res.body.displayName).toBe("Chinmay Dubey");
    expect(res.body.timezone).toBe("Asia/Kolkata");
    expect(res.body.settings).toMatchObject({ units: "us", plantReminders: true });
  });

  it("rejects unknown timezones, units and fields", async () => {
    const api = as(app, "user_1");
    expect((await api.patch("/api/me").send({ timezone: "Mars/Olympus" })).status).toBe(400);
    expect((await api.patch("/api/me").send({ units: "furlongs" })).status).toBe(400);
    expect((await api.patch("/api/me").send({ lastLat: 1 })).status).toBe(400);
    expect((await api.patch("/api/me").send({ imageUrl: "http://insecure.example" })).status).toBe(400);
  });

  it("forgets the stored location when AQI alerts are turned off", async () => {
    const api = as(app, "user_1");
    await api.get("/api/aqi?lat=19.076&lon=72.8777");
    let [row] = await db.select().from(users).where(eq(users.id, "user_1"));
    expect(row.lastLat).toBe(19.08);

    await api.patch("/api/me").send({ aqiAlerts: false });
    [row] = await db.select().from(users).where(eq(users.id, "user_1"));
    expect(row.lastLat).toBeNull();

    await api.get("/api/aqi?lat=19.076&lon=72.8777");
    [row] = await db.select().from(users).where(eq(users.id, "user_1"));
    expect(row.lastLat).toBeNull();
  });
});

describe("/api/logs", () => {
  it("awards catalog points, ignoring any points the client sends", async () => {
    const res = await as(app, "user_1")
      .post("/api/logs")
      .send({ kind: "activity", key: "morning-jog", aqiLevel: 2, points: 9999 });
    expect(res.status).toBe(201);
    expect(res.body.pointsAwarded).toBe(80);
    expect(res.body.alreadyEarnedToday).toBe(false);
    expect(res.body.log).toMatchObject({ title: "Morning Jog", emoji: "🏃", aqiLevel: 2 });
  });

  it("records repeats on the same day with zero points", async () => {
    const api = as(app, "user_1");
    await api.post("/api/logs").send({ kind: "care", key: "water" });
    const res = await api.post("/api/logs").send({ kind: "care", key: "water" });
    expect(res.status).toBe(201);
    expect(res.body.pointsAwarded).toBe(0);
    expect(res.body.alreadyEarnedToday).toBe(true);

    const stats = await api.get("/api/me/stats");
    expect(stats.body.care.water.todayCount).toBe(2);
    expect(stats.body.totalPoints).toBe(10);
  });

  it("only awards points once even when requests race", async () => {
    const api = as(app, "user_1");
    await api.get("/api/me");
    const results = await Promise.all(
      Array.from({ length: 5 }, () => api.post("/api/logs").send({ kind: "activity", key: "cycling" })),
    );
    const awarded = results.map((r) => r.body.pointsAwarded);
    expect(awarded.filter((p) => p > 0)).toEqual([70]);
  });

  it("rejects unknown activities", async () => {
    const res = await as(app, "user_1").post("/api/logs").send({ kind: "activity", key: "base-jumping" });
    expect(res.status).toBe(400);
    const proto = await as(app, "user_1").post("/api/logs").send({ kind: "care", key: "toString" });
    expect(proto.status).toBe(400);
  });

  it("lists logs newest first with a cursor", async () => {
    await insertLog("user_1", { daysAgo: 2, key: "park-walk" });
    await insertLog("user_1", { daysAgo: 1, key: "cycling" });
    await insertLog("user_1", { daysAgo: 0, key: "hydrate" });
    await insertLog("user_2", { daysAgo: 0, key: "meditation" });

    const first = await as(app, "user_1").get("/api/logs?limit=2");
    expect(first.body.items.map((l: { key: string }) => l.key)).toEqual(["hydrate", "cycling"]);
    expect(first.body.nextCursor).toBeTruthy();

    const second = await as(app, "user_1").get(
      `/api/logs?limit=2&before=${encodeURIComponent(first.body.nextCursor)}`,
    );
    expect(second.body.items.map((l: { key: string }) => l.key)).toEqual(["park-walk"]);
    expect(second.body.nextCursor).toBeNull();
  });
});

describe("/api/me/stats", () => {
  it("counts consecutive days ending today", async () => {
    await as(app, "user_1").get("/api/me");
    for (const daysAgo of [0, 1, 2, 4]) await insertLog("user_1", { daysAgo });
    const res = await as(app, "user_1").get("/api/me/stats");
    expect(res.body.streak).toBe(3);
    expect(res.body.totalLogs).toBe(4);
    expect(res.body.totalPoints).toBe(320);
  });

  it("keeps a streak alive until the user has had a chance to log today", async () => {
    await as(app, "user_1").get("/api/me");
    for (const daysAgo of [1, 2]) await insertLog("user_1", { daysAgo });
    const res = await as(app, "user_1").get("/api/me/stats");
    expect(res.body.streak).toBe(2);
  });

  it("resets the streak after a missed day", async () => {
    await as(app, "user_1").get("/api/me");
    await insertLog("user_1", { daysAgo: 2 });
    const res = await as(app, "user_1").get("/api/me/stats");
    expect(res.body.streak).toBe(0);
  });

  it("reports the green level from total points", async () => {
    await as(app, "user_1").get("/api/me");
    await insertLog("user_1", { points: 450 });
    const res = await as(app, "user_1").get("/api/me/stats");
    expect(res.body.level).toEqual({ name: "Sapling", min: 400, nextName: "Grove", nextMin: 800 });
  });
});

describe("/api/favorites", () => {
  it("adds, lists and removes favorites idempotently", async () => {
    const api = as(app, "user_1");
    expect((await api.put("/api/favorites/monstera")).status).toBe(204);
    expect((await api.put("/api/favorites/monstera")).status).toBe(204);
    await api.put("/api/favorites/aloe");
    expect((await api.get("/api/favorites")).body.plantKeys).toEqual(["monstera", "aloe"]);

    await api.delete("/api/favorites/monstera");
    expect((await api.get("/api/favorites")).body.plantKeys).toEqual(["aloe"]);
    expect((await as(app, "user_2").get("/api/favorites")).body.plantKeys).toEqual([]);
  });

  it("rejects malformed plant keys", async () => {
    expect((await as(app, "user_1").put("/api/favorites/DROP%20TABLE")).status).toBe(400);
  });
});

describe("/api/leaderboard", () => {
  async function seedUser(id: string, name: string, points: number, daysAgo = 0) {
    await as(app, id).patch("/api/me").send({ displayName: name });
    await insertLog(id, { points, daysAgo });
  }

  it("ranks users by points and shortens names", async () => {
    await seedUser("u_a", "Asha Verma", 120);
    await seedUser("u_b", "Ben", 300);
    await seedUser("u_c", "Chinmay Dubey", 200);

    const res = await as(app, "u_c").get("/api/leaderboard?period=week");
    expect(res.status).toBe(200);
    expect(res.body.entries).toEqual([
      { rank: 1, displayName: "Ben", imageUrl: null, points: 300, isMe: false },
      { rank: 2, displayName: "Chinmay D.", imageUrl: null, points: 200, isMe: true },
      { rank: 3, displayName: "Asha V.", imageUrl: null, points: 120, isMe: false },
    ]);
    expect(res.body.me).toMatchObject({ rank: 2, points: 200 });
    expect(JSON.stringify(res.body)).not.toContain("u_a");
  });

  it("only counts the last 7 days for the weekly board", async () => {
    await seedUser("u_a", "Old Timer", 1000, 10);
    await seedUser("u_b", "Newbie", 50);

    const week = await as(app, "u_b").get("/api/leaderboard?period=week");
    expect(week.body.entries.map((e: { displayName: string }) => e.displayName)).toEqual(["Newbie"]);

    const all = await as(app, "u_b").get("/api/leaderboard?period=all");
    expect(all.body.entries.map((e: { displayName: string }) => e.displayName)).toEqual([
      "Old T.",
      "Newbie",
    ]);
  });

  it("hides users who opted out", async () => {
    await seedUser("u_a", "Private Person", 500);
    await seedUser("u_b", "Public Person", 100);
    await as(app, "u_a").patch("/api/me").send({ showOnLeaderboard: false });

    const res = await as(app, "u_a").get("/api/leaderboard");
    expect(res.body.entries).toHaveLength(1);
    expect(res.body.entries[0].displayName).toBe("Public P.");
    expect(res.body.me).toBeNull();
  });

  it("includes the caller's own rank when outside the top 20", async () => {
    for (let i = 0; i < 22; i++) await seedUser(`u_${i}`, `User ${i}`, 1000 - i * 10);
    await seedUser("me", "Me Myself", 5);

    const res = await as(app, "me").get("/api/leaderboard");
    expect(res.body.entries).toHaveLength(20);
    expect(res.body.entries.some((e: { isMe: boolean }) => e.isMe)).toBe(false);
    expect(res.body.me).toMatchObject({ rank: 23, points: 5, isMe: true });
  });
});

describe("/api/aqi", () => {
  it("proxies air quality", async () => {
    const res = await as(makeApp(fakeAirQuality(4)), "user_1").get("/api/aqi?lat=28.61&lon=77.2");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ aqi: 4, pm25: 8.5, pm10: 14.2 });
  });

  it("validates coordinates", async () => {
    expect((await as(app, "user_1").get("/api/aqi?lat=200&lon=0")).status).toBe(400);
    expect((await as(app, "user_1").get("/api/aqi")).status).toBe(400);
  });
});

describe("/api/me/push-token", () => {
  it("stores a token and moves it to whoever signs in on the device next", async () => {
    expect((await as(app, "user_1").put("/api/me/push-token").send({ token: TOKEN_A })).status).toBe(204);
    expect((await as(app, "user_2").put("/api/me/push-token").send({ token: TOKEN_A })).status).toBe(204);

    const rows = await db.query.pushTokens.findMany();
    expect(rows).toHaveLength(1);
    expect(rows[0].userId).toBe("user_2");

    // user_1 can no longer remove it
    await as(app, "user_1").delete("/api/me/push-token").send({ token: TOKEN_A });
    expect(await db.query.pushTokens.findMany()).toHaveLength(1);
    await as(app, "user_2").delete("/api/me/push-token").send({ token: TOKEN_A });
    expect(await db.query.pushTokens.findMany()).toHaveLength(0);
  });

  it("rejects tokens that aren't Expo push tokens", async () => {
    const res = await as(app, "user_1").put("/api/me/push-token").send({ token: "hello" });
    expect(res.status).toBe(400);
  });
});
