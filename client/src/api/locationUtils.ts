import * as Location from "expo-location";
import { getAQI } from "./getAQI";

export interface LocationData {
  city: string;
  region: string;
  aqi: number | null;
  pm25: number | null;
  pm10: number | null;
}

export const getFullLocationStats = async (
  lat: number,
  lon: number,
): Promise<LocationData | null> => {
  try {
    // 1. Get Readable Address
    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude: lat,
      longitude: lon,
    });

    const address = reverseGeocode[0];
    const city = address?.city || address?.district || "Unknown City";
    const region = address?.region || "";

    // 2. Get AQI Data from your existing API file
    const aqiStats = await getAQI(lat, lon);

    return {
      city,
      region,
      aqi: aqiStats?.aqi ?? null,
      pm25: aqiStats?.pm25 ?? null,
      pm10: aqiStats?.pm10 ?? null,
    };
  } catch (error) {
    console.error("Error fetching location stats:", error);
    return null;
  }
};
