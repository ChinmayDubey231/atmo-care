import { and, eq, inArray, max } from "drizzle-orm";
import type { Db } from "../db/client.js";
import { logs, pushTokens, users } from "../db/schema.js";
import { addDays, localDate, localHour } from "../lib/dates.js";
import type { PushMessage, SendPush } from "../services/push.js";

export interface PlantReminderDeps {
  db: Db;
  sendPush: SendPush;
  now?: Date;
  /** Local hour of day at which reminders go out */
  reminderHour?: number;
}

/**
 * Once a day at `reminderHour` local time, nudge users who haven't logged a
 * watering today or yesterday.
 */
export async function runPlantReminders({
  db,
  sendPush,
  now = new Date(),
  reminderHour = 9,
}: PlantReminderDeps) {
  const rows = await db
    .select({
      userId: users.id,
      timezone: users.timezone,
      lastReminderOn: users.lastPlantReminderOn,
      token: pushTokens.token,
    })
    .from(users)
    .innerJoin(pushTokens, eq(pushTokens.userId, users.id))
    .where(eq(users.plantReminders, true));

  const due = new Map<string, { today: string; tokens: string[] }>();
  for (const r of rows) {
    if (localHour(r.timezone, now) !== reminderHour) continue;
    const today = localDate(r.timezone, now);
    if (r.lastReminderOn === today) continue;
    const entry = due.get(r.userId) ?? { today, tokens: [] };
    entry.tokens.push(r.token);
    due.set(r.userId, entry);
  }
  if (due.size === 0) return { usersReminded: 0 };

  const lastWatered = await db
    .select({ userId: logs.userId, day: max(logs.localDate) })
    .from(logs)
    .where(
      and(inArray(logs.userId, [...due.keys()]), eq(logs.kind, "care"), eq(logs.key, "water")),
    )
    .groupBy(logs.userId);
  const lastWateredBy = new Map(lastWatered.map((r) => [r.userId, r.day]));

  const messages: PushMessage[] = [];
  const reminded: { userId: string; today: string }[] = [];
  for (const [userId, { today, tokens }] of due) {
    const last = lastWateredBy.get(userId);
    if (last && last >= addDays(today, -1)) continue;
    reminded.push({ userId, today });
    for (const to of tokens) {
      messages.push({
        to,
        title: "Your plants miss you 🌱",
        body: "No watering logged for a couple of days. Check the soil and give them a drink.",
        data: { type: "plant" },
      });
    }
  }

  if (messages.length > 0) {
    const { invalidTokens } = await sendPush(messages);
    if (invalidTokens.length > 0) {
      await db.delete(pushTokens).where(inArray(pushTokens.token, invalidTokens));
    }
    for (const { userId, today } of reminded) {
      await db.update(users).set({ lastPlantReminderOn: today }).where(eq(users.id, userId));
    }
  }

  return { usersReminded: reminded.length };
}
