import { Router } from "express";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "../db/client.js";
import { favorites } from "../db/schema.js";
import { userIdOf } from "../lib/http.js";

const plantKey = z.string().regex(/^[a-z0-9_-]{1,64}$/, "Invalid plant key");

export function favoritesRouter(db: Db) {
  const router = Router();

  router.get("/", async (_req, res) => {
    const rows = await db
      .select({ plantKey: favorites.plantKey })
      .from(favorites)
      .where(eq(favorites.userId, userIdOf(res)))
      .orderBy(asc(favorites.createdAt));
    res.json({ plantKeys: rows.map((r) => r.plantKey) });
  });

  router.put("/:plantKey", async (req, res) => {
    const key = plantKey.parse(req.params.plantKey);
    await db
      .insert(favorites)
      .values({ userId: userIdOf(res), plantKey: key })
      .onConflictDoNothing();
    res.status(204).end();
  });

  router.delete("/:plantKey", async (req, res) => {
    const key = plantKey.parse(req.params.plantKey);
    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userIdOf(res)), eq(favorites.plantKey, key)));
    res.status(204).end();
  });

  return router;
}
