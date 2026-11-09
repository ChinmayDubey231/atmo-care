import { useUser } from "@clerk/expo";
import { useEffect, useRef } from "react";
import { useMe, useUpdateMe } from "@/api/queries";
import type { ProfileUpdate } from "@/api/types";
import { getUserName } from "@/utils/userUtils";
import { usePushRegistration } from "./usePushNotifications";

function deviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * Copies the Clerk profile (name, avatar) and the device timezone to the
 * server — the leaderboard shows the name, and streaks are counted in the
 * user's own days — and registers for push notifications.
 */
export function useAccountSync() {
  const { user } = useUser();
  const { data: me } = useMe();
  const { mutate: updateMe } = useUpdateMe();

  const displayName = getUserName(user);
  const imageUrl = user?.imageUrl?.startsWith("https://") ? user.imageUrl : null;
  const timezone = deviceTimeZone();
  // A failed save rolls `me` back, which would re-run the effect forever;
  // only ever try a given set of changes once.
  const attempted = useRef<string | null>(null);

  useEffect(() => {
    if (!user || !me) return;
    const changes: ProfileUpdate = {};
    if (me.displayName !== displayName) changes.displayName = displayName;
    if (me.imageUrl !== imageUrl) changes.imageUrl = imageUrl;
    if (me.timezone !== timezone) changes.timezone = timezone;
    const key = JSON.stringify(changes);
    if (Object.keys(changes).length > 0 && attempted.current !== key) {
      attempted.current = key;
      updateMe(changes);
    }
  }, [user, me, displayName, imageUrl, timezone, updateMe]);

  usePushRegistration();
}
