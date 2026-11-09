import { createApp } from "./app.js";
import { clerkAuth } from "./auth.js";
import { createDb } from "./db/client.js";
import { runMigrations } from "./db/migrate.js";
import { loadEnv } from "./env.js";
import { startScheduler } from "./jobs/scheduler.js";
import { createOpenWeatherClient } from "./services/openWeather.js";
import { createExpoPushSender } from "./services/push.js";

const env = loadEnv();
const { db } = createDb(env.DATABASE_URL);
await runMigrations(db);

const fetchAirQuality = createOpenWeatherClient(env.OPENWEATHER_API_KEY);
const app = createApp({
  db,
  auth: clerkAuth({
    publishableKey: env.CLERK_PUBLISHABLE_KEY,
    secretKey: env.CLERK_SECRET_KEY,
  }),
  fetchAirQuality,
});

// 0.0.0.0 so phones on the same Wi-Fi can reach the dev server
app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`Atmo-Care API listening on http://localhost:${env.PORT}`);
});

if (env.JOBS_ENABLED) {
  startScheduler({ db, fetchAirQuality, sendPush: createExpoPushSender(env.EXPO_ACCESS_TOKEN) });
}
