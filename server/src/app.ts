import cors from "cors";
import express from "express";
import { requireUser, type AuthProvider } from "./auth.js";
import type { Db } from "./db/client.js";
import { errorHandler } from "./lib/http.js";
import { aqiRouter } from "./routes/aqi.js";
import { favoritesRouter } from "./routes/favorites.js";
import { leaderboardRouter } from "./routes/leaderboard.js";
import { logsRouter } from "./routes/logs.js";
import { meRouter } from "./routes/me.js";
import type { FetchAirQuality } from "./services/openWeather.js";

export interface AppDeps {
  db: Db;
  auth: AuthProvider;
  fetchAirQuality: FetchAirQuality;
}

export function createApp({ db, auth, fetchAirQuality }: AppDeps) {
  const app = express();
  app.disable("x-powered-by");
  // The API uses bearer tokens, not cookies, so allowing any origin is safe;
  // it only matters for the Expo web build anyway.
  app.use(cors());
  app.use(express.json({ limit: "50kb" }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  const api = express.Router();
  api.use(auth.middleware);
  api.use(requireUser(db, auth));
  api.use("/me", meRouter(db));
  api.use("/logs", logsRouter(db));
  api.use("/favorites", favoritesRouter(db));
  api.use("/leaderboard", leaderboardRouter(db));
  api.use("/aqi", aqiRouter(db, fetchAirQuality));
  app.use("/api", api);

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });
  app.use(errorHandler);
  return app;
}
