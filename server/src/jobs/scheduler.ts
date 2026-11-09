import type { Db } from "../db/client.js";
import type { FetchAirQuality } from "../services/openWeather.js";
import type { SendPush } from "../services/push.js";
import { runAqiAlerts } from "./aqiAlerts.js";
import { runPlantReminders } from "./plantReminders.js";

export interface JobDeps {
  db: Db;
  fetchAirQuality: FetchAirQuality;
  sendPush: SendPush;
}

export async function runAllJobs(deps: JobDeps) {
  const aqi = await runAqiAlerts(deps).catch((err) => {
    console.error("AQI alerts job failed", err);
    return null;
  });
  const plants = await runPlantReminders(deps).catch((err) => {
    console.error("Plant reminders job failed", err);
    return null;
  });
  return { aqi, plants };
}

/**
 * Runs the notification jobs every 15 minutes inside the API process. Plant
 * reminders fire on the hour they're due; running more often than hourly just
 * means users don't wait long past it.
 */
export function startScheduler(deps: JobDeps, intervalMs = 15 * 60_000) {
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      const result = await runAllJobs(deps);
      console.log("Jobs ran", JSON.stringify(result));
    } finally {
      running = false;
    }
  };
  const timer = setInterval(tick, intervalMs);
  timer.unref();
  return () => clearInterval(timer);
}
