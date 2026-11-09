import { Router } from "express";
import { sql } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "../db/client.js";
import { userIdOf } from "../lib/http.js";

const TOP_N = 20;

const querySchema = z.object({
  period: z.enum(["week", "all"]).default("week"),
});

/** "Chinmay Dubey" -> "Chinmay D." — enough to recognise friends, no more. */
export function shortName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Eco Explorer";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

type Row = {
  id: string;
  display_name: string;
  image_url: string | null;
  points: number;
  rank: number;
  position: number;
};

export function leaderboardRouter(db: Db) {
  const router = Router();

  router.get("/", async (req, res) => {
    const { period } = querySchema.parse(req.query);
    const me = userIdOf(res);
    const since =
      period === "week" ? sql`AND l.logged_at >= now() - interval '7 days'` : sql``;

    const { rows } = await db.execute<Row>(sql`
      WITH totals AS (
        SELECT u.id, u.display_name, u.image_url, SUM(l.points)::int AS points
        FROM users u
        JOIN logs l ON l.user_id = u.id
        WHERE u.show_on_leaderboard ${since}
        GROUP BY u.id
        HAVING SUM(l.points) > 0
      ),
      ranked AS (
        SELECT *,
          RANK() OVER (ORDER BY points DESC)::int AS rank,
          ROW_NUMBER() OVER (ORDER BY points DESC, id)::int AS position
        FROM totals
      )
      SELECT * FROM ranked
      WHERE position <= ${TOP_N} OR id = ${me}
      ORDER BY position
    `);

    const toEntry = (r: Row) => ({
      rank: r.rank,
      displayName: shortName(r.display_name),
      imageUrl: r.image_url,
      points: r.points,
      isMe: r.id === me,
    });

    const mine = rows.find((r) => r.id === me);
    res.json({
      period,
      entries: rows.filter((r) => r.position <= TOP_N).map(toEntry),
      me: mine ? toEntry(mine) : null,
    });
  });

  return router;
}
