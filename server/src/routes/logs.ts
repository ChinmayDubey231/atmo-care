import { Router } from "express";
import { and, count, desc, eq, lt, sql } from "drizzle-orm";
import { z } from "zod";
import { lookupCatalog } from "../catalog.js";
import type { Db } from "../db/client.js";
import { logs, type Log } from "../db/schema.js";
import { localDate } from "../lib/dates.js";
import { HttpError, userIdOf } from "../lib/http.js";
import { getUser } from "./me.js";

/** Generous cap that only exists to stop scripted spam. */
const MAX_LOGS_PER_DAY = 100;

const createSchema = z.object({
  kind: z.enum(["activity", "care"]),
  key: z.string().min(1).max(64),
  aqiLevel: z.number().int().min(1).max(5).nullish(),
});

const listSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  before: z.iso.datetime({ offset: true }).optional(),
});

export function serializeLog(l: Log) {
  return {
    id: l.id,
    kind: l.kind,
    key: l.key,
    title: l.title,
    emoji: l.emoji,
    points: l.points,
    aqiLevel: l.aqiLevel,
    loggedAt: l.loggedAt.toISOString(),
  };
}

export function logsRouter(db: Db) {
  const router = Router();

  router.get("/", async (req, res) => {
    const { limit, before } = listSchema.parse(req.query);
    const conditions = [eq(logs.userId, userIdOf(res))];
    if (before) conditions.push(lt(logs.loggedAt, new Date(before)));

    const rows = await db
      .select()
      .from(logs)
      .where(and(...conditions))
      .orderBy(desc(logs.loggedAt))
      .limit(limit + 1);

    const page = rows.slice(0, limit);
    res.json({
      items: page.map(serializeLog),
      nextCursor: rows.length > limit ? page[page.length - 1].loggedAt.toISOString() : null,
    });
  });

  router.post("/", async (req, res) => {
    const { kind, key, aqiLevel } = createSchema.parse(req.body ?? {});
    const entry = lookupCatalog(kind, key);
    if (!entry) throw new HttpError(400, `Unknown ${kind} "${key}"`);

    const user = await getUser(db, userIdOf(res));
    const today = localDate(user.timezone);

    const [{ value: loggedToday }] = await db
      .select({ value: count() })
      .from(logs)
      .where(and(eq(logs.userId, user.id), eq(logs.localDate, today)));
    if (loggedToday >= MAX_LOGS_PER_DAY) {
      throw new HttpError(429, "Daily log limit reached");
    }

    const base = {
      userId: user.id,
      kind,
      key,
      title: entry.title,
      emoji: entry.emoji,
      aqiLevel: aqiLevel ?? null,
      localDate: today,
    };

    // First log of this key today earns points; the partial unique index
    // makes that race-safe. Repeats are still recorded, with 0 points.
    let [row] = await db
      .insert(logs)
      .values({ ...base, points: entry.points })
      .onConflictDoNothing({
        target: [logs.userId, logs.key, logs.localDate],
        where: sql`points > 0`,
      })
      .returning();
    const earned = Boolean(row);
    if (!row) {
      [row] = await db
        .insert(logs)
        .values({ ...base, points: 0 })
        .returning();
    }

    res.status(201).json({
      log: serializeLog(row),
      pointsAwarded: row.points,
      alreadyEarnedToday: !earned,
    });
  });

  return router;
}
