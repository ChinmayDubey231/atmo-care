import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "../db/client.js";
import { users } from "../db/schema.js";
import { userIdOf } from "../lib/http.js";
import type { FetchAirQuality } from "../services/openWeather.js";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

const round2 = (n: number) => Math.round(n * 100) / 100;

export function aqiRouter(db: Db, fetchAirQuality: FetchAirQuality) {
  const router = Router();

  router.get("/", async (req, res) => {
    const { lat, lon } = querySchema.parse(req.query);
    const result = await fetchAirQuality(lat, lon);

    // Remember a coarse location for background AQI alerts, but only for
    // users who have them switched on.
    await db
      .update(users)
      .set({ lastLat: round2(lat), lastLon: round2(lon) })
      .where(and(eq(users.id, userIdOf(res)), eq(users.aqiAlerts, true)));

    res.json(result);
  });

  return router;
}
