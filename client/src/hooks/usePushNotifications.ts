import { isRunningInExpoGo } from "expo";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { useEffect } from "react";
import { Platform } from "react-native";
import { useApi, useMe } from "@/api/queries";

type NotificationsModule = typeof import("expo-notifications");

/**
 * Remote push was removed from Expo Go on Android (SDK 53+), and merely
 * importing expo-notifications there throws — so load it only where it works.
 * Use a development build to test push on Android.
 */
const pushSupported = !(Platform.OS === "android" && isRunningInExpoGo());

const Notifications: NotificationsModule | null = pushSupported
  ? require("expo-notifications")
  : null;

Notifications?.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function easProjectId(): string | undefined {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId
  );
}

/** Current notification permission, or null where push isn't available. */
export async function getNotificationPermission() {
  if (!Notifications) return null;
  const { status, canAskAgain } = await Notifications.getPermissionsAsync();
  return { status, canAskAgain };
}

/**
 * Asks for permission (if needed) and returns this device's Expo push token,
 * or null when notifications aren't possible here.
 */
export async function getExpoPushToken({ ask }: { ask: boolean }): Promise<string | null> {
  if (!Notifications || !Device.isDevice) return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Alerts & reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  let { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted" && ask) {
    ({ status } = await Notifications.requestPermissionsAsync());
  }
  if (status !== "granted") return null;

  const projectId = easProjectId();
  if (!projectId) {
    console.warn(
      "Push notifications need an EAS project id. Run `npx eas init` in client/ once.",
    );
    return null;
  }
  return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
}

/**
 * Keeps the server's copy of this device's push token in step with the
 * user's notification settings.
 */
export function usePushRegistration() {
  const api = useApi();
  const { data: me } = useMe();
  const wantsPush = !!me && (me.settings.aqiAlerts || me.settings.plantReminders);

  useEffect(() => {
    if (!wantsPush) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await getExpoPushToken({ ask: true });
        if (token && !cancelled) {
          await api("/me/push-token", { method: "PUT", body: { token } });
        }
      } catch (e) {
        console.warn("Push registration failed:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [wantsPush, api]);
}

/** Call before signing out so this device stops getting the user's alerts. */
export async function unregisterPushToken(api: ReturnType<typeof useApi>) {
  try {
    const token = await getExpoPushToken({ ask: false });
    if (token) await api("/me/push-token", { method: "DELETE", body: { token } });
  } catch (e) {
    console.warn("Push unregistration failed:", e);
  }
}
