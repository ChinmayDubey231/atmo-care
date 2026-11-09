import { and, count, desc, eq, gte, max, sql, sum } from "drizzle-orm";
import { CARE_KEYS, levelFor } from "../catalog.js";
import type { Db } from "../db/client.js";
import { logs } from "../db/schema.js";
import { computeStreak, localDate } from "../lib/dates.js";

export interface CareStat {
  todayCount: number;
  lastAt: string | null;
}

export interface Stats {
  totalLogs: number;
  totalPoints: number;
  weekPoints: number;
  streak: number;
  level: ReturnType<typeof levelFor>;
  care: Record<(typeof CARE_KEYS)[number], CareStat>;
}

export async function getStats(db: Db, userId: string, timezone: string): Promise<Stats> {
  const today = localDate(timezone);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60_000);

  const [totals, week, days, care] = await Promise.all([
    db
      .select({ logs: count(), points: sum(logs.points).mapWith(Number) })
      .from(logs)
      .where(eq(logs.userId, userId)),
    db
      .select({ points: sum(logs.points).mapWith(Number) })
      .from(logs)
      .where(and(eq(logs.userId, userId), gte(logs.loggedAt, weekAgo))),
    db
      .selectDistinct({ day: logs.localDate })
      .from(logs)
      .where(eq(logs.userId, userId))
      .orderBy(desc(logs.localDate))
      .limit(400),
    db
      .select({
        key: logs.key,
        todayCount: sql<number>`count(*) filter (where ${logs.localDate} = ${today})`.mapWith(Number),
        lastAt: max(logs.loggedAt),
      })
      .from(logs)
      .where(and(eq(logs.userId, userId), eq(logs.kind, "care")))
      .groupBy(logs.key),
  ]);

  const totalPoints = totals[0]?.points ?? 0;
  const careStats = Object.fromEntries(
    CARE_KEYS.map((key) => {
      const row = care.find((c) => c.key === key);
      return [key, { todayCount: row?.todayCount ?? 0, lastAt: row?.lastAt?.toISOString() ?? null }];
    }),
  ) as Stats["care"];

  return {
    totalLogs: totals[0]?.logs ?? 0,
    totalPoints,
    weekPoints: week[0]?.points ?? 0,
    streak: computeStreak(
      days.map((d) => d.day),
      today,
    ),
    level: levelFor(totalPoints),
    care: careStats,
  };
}
