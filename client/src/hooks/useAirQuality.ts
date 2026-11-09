import { useQuery } from "@tanstack/react-query";
import * as Device from "expo-device";
import * as Location from "expo-location";
import { Platform } from "react-native";
import type { LocationData } from "@/api/locationUtils";
import { useApi } from "@/api/queries";
import type { AirQuality } from "@/api/types";

const TEN_MINUTES = 10 * 60_000;

interface DevicePlace {
  lat: number;
  lon: number;
  city: string;
  region: string;
}

async function getDevicePlace(): Promise<DevicePlace> {
  if (Platform.OS === "android" && !Device.isDevice) {
    throw new Error("This won't work on an Android Emulator. Try a real device!");
  }
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Permission to access location was denied");
  }
  const { coords } = await Location.getCurrentPositionAsync({});
  const [address] = await Location.reverseGeocodeAsync({
    latitude: coords.latitude,
    longitude: coords.longitude,
  });
  return {
    lat: coords.latitude,
    lon: coords.longitude,
    city: address?.city || address?.district || "Unknown City",
    region: address?.region || "",
  };
}

/**
 * Device location + current air quality, shared by every screen that needs
 * it (React Query de-duplicates the requests and caches for 10 minutes).
 */
export function useAirQuality() {
  const api = useApi();

  const place = useQuery({
    queryKey: ["device-place"],
    queryFn: getDevicePlace,
    staleTime: TEN_MINUTES,
    retry: false,
  });

  const coords = place.data;
  const air = useQuery({
    queryKey: ["aqi", coords?.lat.toFixed(2), coords?.lon.toFixed(2)],
    queryFn: () => api<AirQuality>(`/aqi?lat=${coords!.lat}&lon=${coords!.lon}`),
    enabled: !!coords,
    staleTime: TEN_MINUTES,
  });

  const stats: LocationData | null = coords
    ? {
        city: coords.city,
        region: coords.region,
        aqi: air.data?.aqi ?? null,
        pm25: air.data?.pm25 ?? null,
        pm10: air.data?.pm10 ?? null,
      }
    : null;

  return {
    stats,
    errorMsg: place.error?.message ?? air.error?.message ?? null,
    refetch: () => Promise.all([place.refetch(), air.refetch()]),
  };
}
