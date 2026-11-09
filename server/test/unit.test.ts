import { describe, expect, it, vi } from "vitest";
import { levelFor } from "../src/catalog.js";
import { addDays, computeStreak, isValidTimeZone, localDate, localHour } from "../src/lib/dates.js";
import { shortName } from "../src/routes/leaderboard.js";
import { createOpenWeatherClient } from "../src/services/openWeather.js";

describe("dates", () => {
  const instant = new Date("2026-03-01T20:30:00Z");

  it("resolves the local calendar day and hour", () => {
    expect(localDate("UTC", instant)).toBe("2026-03-01");
    expect(localDate("Asia/Kolkata", instant)).toBe("2026-03-02"); // 02:00 IST
    expect(localDate("America/Los_Angeles", instant)).toBe("2026-03-01");
    expect(localHour("Asia/Kolkata", instant)).toBe(2);
  });

  it("validates timezones", () => {
    expect(isValidTimeZone("Europe/London")).toBe(true);
    expect(isValidTimeZone("Not/AZone")).toBe(false);
  });

  it("adds days across month boundaries", () => {
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29");
  });

  it("computes streaks", () => {
    const today = "2026-03-10";
    expect(computeStreak([], today)).toBe(0);
    expect(computeStreak(["2026-03-10", "2026-03-09", "2026-03-08"], today)).toBe(3);
    expect(computeStreak(["2026-03-09", "2026-03-08"], today)).toBe(2);
    expect(computeStreak(["2026-03-08"], today)).toBe(0);
    expect(computeStreak(["2026-03-10", "2026-03-08"], today)).toBe(1);
  });
});

describe("levels", () => {
  it("maps points to green levels", () => {
    expect(levelFor(0).name).toBe("Seedling");
    expect(levelFor(149).name).toBe("Seedling");
    expect(levelFor(150).name).toBe("Sprout");
    expect(levelFor(5000)).toEqual({ name: "Sage", min: 1500, nextName: null, nextMin: null });
  });
});

describe("shortName", () => {
  it("keeps the first name and last initial", () => {
    expect(shortName("Chinmay Dubey")).toBe("Chinmay D.");
    expect(shortName("  Ada  ")).toBe("Ada");
    expect(shortName("Mary Jane watson")).toBe("Mary W.");
    expect(shortName("")).toBe("Eco Explorer");
  });
});

describe("OpenWeather client", () => {
  const okResponse = () =>
    new Response(
      JSON.stringify({ list: [{ main: { aqi: 3 }, components: { pm2_5: 21.4, pm10: 40.1 } }] }),
    );

  it("parses the response and caches nearby lookups", async () => {
    const fetchImpl = vi.fn(async () => okResponse());
    const client = createOpenWeatherClient("key", { fetchImpl: fetchImpl as typeof fetch });

    const a = await client(28.6139, 77.209);
    const b = await client(28.6141, 77.2091); // same ~1 km cell
    expect(a).toMatchObject({ aqi: 3, pm25: 21.4, pm10: 40.1 });
    expect(b).toBe(a);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(String((fetchImpl.mock.calls[0] as unknown[])[0])).toContain("lat=28.61&lon=77.21");
  });

  it("turns upstream failures into a 502", async () => {
    const fetchImpl = vi.fn(async () => new Response("nope", { status: 401 }));
    const client = createOpenWeatherClient("bad", { fetchImpl: fetchImpl as typeof fetch });
    vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(client(1, 1)).rejects.toMatchObject({ status: 502 });
  });
});
