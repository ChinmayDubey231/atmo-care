import { Expo } from "expo-server-sdk";
import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "../db/client.js";
import { pushTokens, users, type User } from "../db/schema.js";
import { isValidTimeZone } from "../lib/dates.js";
import { HttpError, userIdOf } from "../lib/http.js";
import { getStats } from "../services/stats.js";

const UNITS = ["metric", "imperial", "us"] as const;

const updateSchema = z
  .object({
    displayName: z.string().trim().min(1).max(60),
    imageUrl: z.url({ protocol: /^https$/ }).max(2048).nullable(),
    timezone: z.string().refine(isValidTimeZone, "Unknown timezone"),
    units: z.enum(UNITS),
    aqiAlerts: z.boolean(),
    plantReminders: z.boolean(),
    communityMessages: z.boolean(),
    showOnLeaderboard: z.boolean(),
  })
  .partial()
  .strict();

const pushTokenSchema = z.object({
  token: z.string().refine((t) => Expo.isExpoPushToken(t), "Not an Expo push token"),
});

export function toProfile(u: User) {
  return {
    id: u.id,
    displayName: u.displayName,
    imageUrl: u.imageUrl,
    timezone: u.timezone,
    settings: {
      units: u.units,
      aqiAlerts: u.aqiAlerts,
      plantReminders: u.plantReminders,
      communityMessages: u.communityMessages,
      showOnLeaderboard: u.showOnLeaderboard,
    },
  };
}

export async function getUser(db: Db, userId: string): Promise<User> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) throw new HttpError(404, "User not found");
  return user;
}

export function meRouter(db: Db) {
  const router = Router();

  router.get("/", async (_req, res) => {
    res.json(toProfile(await getUser(db, userIdOf(res))));
  });

  router.patch("/", async (req, res) => {
    const body = updateSchema.parse(req.body ?? {});
    const changes: Partial<User> = { ...body, updatedAt: new Date() };
    // Location is only stored to send AQI alerts; forget it when they're off.
    if (body.aqiAlerts === false) {
      changes.lastLat = null;
      changes.lastLon = null;
    }
    const [user] = await db
      .update(users)
      .set(changes)
      .where(eq(users.id, userIdOf(res)))
      .returning();
    res.json(toProfile(user));
  });

  router.get("/stats", async (_req, res) => {
    const user = await getUser(db, userIdOf(res));
    res.json(await getStats(db, user.id, user.timezone));
  });

  router.put("/push-token", async (req, res) => {
    const { token } = pushTokenSchema.parse(req.body ?? {});
    await db
      .insert(pushTokens)
      .values({ token, userId: userIdOf(res) })
      .onConflictDoUpdate({ target: pushTokens.token, set: { userId: userIdOf(res) } });
    res.status(204).end();
  });

  router.delete("/push-token", async (req, res) => {
    const { token } = pushTokenSchema.parse(req.body ?? {});
    await db
      .delete(pushTokens)
      .where(and(eq(pushTokens.token, token), eq(pushTokens.userId, userIdOf(res))));
    res.status(204).end();
  });

  return router;
}
