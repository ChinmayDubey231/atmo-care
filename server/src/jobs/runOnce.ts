// `npm run jobs:once` — for hosts that prefer an external cron (e.g. a Render
// Cron Job) over the in-process scheduler. Set JOBS_ENABLED=false on the API.
import { createDb } from "../db/client.js";
import { loadEnv } from "../env.js";
import { createOpenWeatherClient } from "../services/openWeather.js";
import { createExpoPushSender } from "../services/push.js";
import { runAllJobs } from "./scheduler.js";

const env = loadEnv();
const { db, pool } = createDb(env.DATABASE_URL);
const result = await runAllJobs({
  db,
  fetchAirQuality: createOpenWeatherClient(env.OPENWEATHER_API_KEY),
  sendPush: createExpoPushSender(env.EXPO_ACCESS_TOKEN),
});
console.log(JSON.stringify(result));
await pool.end();
