import { Expo, type ExpoPushMessage } from "expo-server-sdk";

export interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

/** Sends messages and reports tokens Expo says are no longer valid. */
export type SendPush = (messages: PushMessage[]) => Promise<{ invalidTokens: string[] }>;

export function createExpoPushSender(accessToken?: string): SendPush {
  const expo = new Expo(accessToken ? { accessToken } : {});

  return async (messages) => {
    const invalidTokens: string[] = [];
    const valid: ExpoPushMessage[] = [];
    for (const m of messages) {
      if (Expo.isExpoPushToken(m.to)) valid.push({ ...m, sound: "default" });
      else invalidTokens.push(m.to);
    }

    for (const chunk of expo.chunkPushNotifications(valid)) {
      try {
        const tickets = await expo.sendPushNotificationsAsync(chunk);
        tickets.forEach((ticket, i) => {
          if (ticket.status === "error" && ticket.details?.error === "DeviceNotRegistered") {
            invalidTokens.push(chunk[i].to as string);
          }
        });
      } catch (err) {
        console.error("Failed to send push chunk", err);
      }
    }
    return { invalidTokens };
  };
}
