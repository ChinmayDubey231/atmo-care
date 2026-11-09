import { HttpError } from "../lib/http.js";

export interface AirQuality {
  /** OpenWeather's 1 (Good) – 5 (Very Poor) index */
  aqi: number;
  pm25: number | null;
  pm10: number | null;
  fetchedAt: string;
}

export type FetchAirQuality = (lat: number, lon: number) => Promise<AirQuality>;

const API_URL = "https://api.openweathermap.org/data/2.5/air_pollution";
const MAX_CACHE_ENTRIES = 1000;

/**
 * Proxies OpenWeather so the API key never ships inside the app. Results are
 * cached per ~1 km grid cell; air quality doesn't change minute to minute.
 */
export function createOpenWeatherClient(
  apiKey: string,
  { ttlMs = 10 * 60_000, fetchImpl = fetch }: { ttlMs?: number; fetchImpl?: typeof fetch } = {},
): FetchAirQuality {
  const cache = new Map<string, { value: AirQuality; expires: number }>();

  return async (lat, lon) => {
    const rLat = Math.round(lat * 100) / 100;
    const rLon = Math.round(lon * 100) / 100;
    const cacheKey = `${rLat},${rLon}`;
    const hit = cache.get(cacheKey);
    if (hit && hit.expires > Date.now()) return hit.value;

    const url = `${API_URL}?lat=${rLat}&lon=${rLon}&appid=${encodeURIComponent(apiKey)}`;
    const res = await fetchImpl(url);
    if (!res.ok) {
      console.error("OpenWeather error", res.status, await res.text().catch(() => ""));
      throw new HttpError(502, "Air quality service unavailable");
    }
    const data = (await res.json()) as {
      list?: { main?: { aqi?: number }; components?: { pm2_5?: number; pm10?: number } }[];
    };
    const entry = data.list?.[0];
    if (typeof entry?.main?.aqi !== "number") {
      throw new HttpError(502, "Air quality service returned no data");
    }

    const value: AirQuality = {
      aqi: entry.main.aqi,
      pm25: entry.components?.pm2_5 ?? null,
      pm10: entry.components?.pm10 ?? null,
      fetchedAt: new Date().toISOString(),
    };
    if (cache.size >= MAX_CACHE_ENTRIES) {
      cache.delete(cache.keys().next().value!);
    }
    cache.set(cacheKey, { value, expires: Date.now() + ttlMs });
    return value;
  };
}
