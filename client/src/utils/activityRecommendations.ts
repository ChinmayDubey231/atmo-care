import { T } from "@/constants/theme";
import { AqiMeta, DailyRecommendations } from "@/types/activities_type";

export function getRecommendedActivities(
  aqi: number | null,
  currentHour: number,
): DailyRecommendations {
  // Default fallback if loading
  if (aqi == null) aqi = 1;

  const level = Math.min(Math.max(Math.round(aqi), 1), 5); // 1-5 scale
  const isGoodAir = level <= 2;
  const isModerate = level === 3;
  const isPoorAir = level >= 4;

  let timeOfDay = "Morning";
  if (currentHour >= 12 && currentHour < 17) timeOfDay = "Afternoon";
  else if (currentHour >= 17 && currentHour < 21) timeOfDay = "Evening";
  else if (currentHour >= 21 || currentHour < 5) timeOfDay = "Night";

  // ── SCENARIO 1: POOR / HAZARDOUS AQI (Stay Indoors) ─────────────────────────
  if (isPoorAir || isModerate) {
    if (timeOfDay === "Morning") {
      return {
        primary: {
          key: "indoor-yoga",
          title: "Indoor Yoga Flow",
          subtitle: "Start the day fresh while keeping windows tightly closed.",
          badge: "INDOOR SAFE",
          image:
            "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
          points: 50,
          prepTips: [
            "Ensure all windows are closed",
            "Turn on the HEPA air purifier",
            "Unroll your mat in a clear space",
          ],
        },
        secondary1: {
          key: "read-book",
          title: "Read a Book",
          alert: "STAY INSIDE",
          icon: "book-open-page-variant",
          color: "#006093",
          points: 20,
          prepTips: [
            "Find a comfortable, well-lit corner",
            "Brew some herbal tea for the throat",
          ],
        },
        secondary2: {
          key: "organize-space",
          title: "Organize Space",
          alert: "PRODUCTIVE",
          icon: "archive-outline",
          color: "#ca8a04",
          points: 30,
          prepTips: [
            "Use a damp cloth to avoid kicking up dust",
            "Play an upbeat playlist",
          ],
        },
      };
    } else if (timeOfDay === "Afternoon") {
      return {
        primary: {
          key: "home-hiit",
          title: "Home HIIT Workout",
          subtitle: "Get your heart rate up safely without the outdoor smog.",
          badge: "HIGH ENERGY",
          image:
            "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop",
          points: 60,
          prepTips: [
            "Keep indoor air circulating with a fan",
            "Hydrate frequently",
            "Wear supportive indoor shoes",
          ],
        },
        secondary1: {
          key: "plant-care",
          title: "Plant Care",
          alert: "AIR PURIFIERS",
          icon: "leaf",
          color: "#006944",
          points: 25,
          prepTips: [
            "Wipe dust off broad leaves to help them filter air",
            "Check soil moisture levels",
          ],
        },
        secondary2: {
          key: "meal-prep",
          title: "Meal Prep",
          alert: "HEALTHY",
          icon: "pot-steam-outline",
          color: "#ea580c",
          points: 40,
          prepTips: [
            "Use the exhaust fan if cooking with oil",
            "Focus on antioxidant-rich foods",
          ],
        },
      };
    } else {
      // Evening / Night (Poor AQI)
      return {
        primary: {
          key: "movie-marathon",
          title: "Movie Marathon",
          subtitle:
            "Perfect excuse to stay in, cozy up, and avoid the night smog.",
          badge: "RELAXING",
          image:
            "https://images.unsplash.com/photo-1585647347384-2593bc35786b?q=80&w=800&auto=format&fit=crop",
          points: 30,
          prepTips: [
            "Dim the lights to prepare for sleep",
            "Keep windows sealed against night-time particulate drops",
          ],
        },
        secondary1: {
          key: "meditation",
          title: "Meditation",
          alert: "WIND DOWN",
          icon: "meditation",
          color: "#5433ff",
          points: 40,
          prepTips: [
            "Focus on shallow, controlled breathing",
            "Use a white noise machine",
          ],
        },
        secondary2: {
          key: "light-cleaning",
          title: "Light Cleaning",
          alert: "DUST CONTROL",
          icon: "broom",
          color: "#006a35",
          points: 20,
          prepTips: [
            "Use a wet mop instead of dry sweeping",
            "Clean HVAC filters if due",
          ],
        },
      };
    }
  }

  // ── SCENARIO 2: GOOD AIR (Enjoy the Outdoors) ──────────────────────────────
  if (timeOfDay === "Morning") {
    return {
      primary: {
        key: "morning-jog",
        title: "Morning Jog",
        subtitle:
          "Crisp air! Take advantage of the perfect conditions for a run.",
        badge: "IDEAL CONDITIONS",
        image:
          "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=800&auto=format&fit=crop",
        points: 80,
        prepTips: [
          "Do a 5-minute dynamic warm-up",
          "Lace up your running shoes",
          "Open house windows to let fresh air in before you leave",
        ],
      },
      secondary1: {
        key: "cycling",
        title: "Cycling",
        alert: "LOW TRAFFIC",
        icon: "bike",
        color: "#006093",
        points: 70,
        prepTips: [
          "Check tire pressure",
          "Wear a helmet",
          "Plan a scenic route",
        ],
      },
      secondary2: {
        key: "outdoor-stretch",
        title: "Outdoor Stretch",
        alert: "MODERATE UV",
        icon: "yoga",
        color: "#ca8a04",
        points: 40,
        prepTips: [
          "Find a flat grassy patch",
          "Wear light layers",
          "Apply morning sunscreen",
        ],
      },
    };
  } else if (timeOfDay === "Afternoon") {
    return {
      primary: {
        key: "park-walk",
        title: "Park Walk",
        subtitle: "Get some sun and fresh air while the breeze is blowing.",
        badge: "GREAT WEATHER",
        image:
          "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=800&auto=format&fit=crop",
        points: 50,
        prepTips: [
          "Apply SPF 30+ sunscreen (Peak UV hours)",
          "Bring a reusable water bottle",
          "Wear a hat or sunglasses",
        ],
      },
      secondary1: {
        key: "hydrate",
        title: "Hydrate",
        alert: "PEAK SUN",
        icon: "water-outline",
        color: "#006093",
        points: 10,
        prepTips: [
          "Drink 500ml of water right now",
          "Add a slice of lemon for electrolytes",
        ],
      },
      secondary2: {
        key: "shaded-reading",
        title: "Shaded Reading",
        alert: "RELAXING",
        icon: "tree-outline",
        color: "#006a35",
        points: 30,
        prepTips: [
          "Find a spot under a dense canopy",
          "Bring a physical book to avoid screen glare",
        ],
      },
    };
  } else {
    // Evening / Night (Good AQI)
    return {
      primary: {
        key: "sunset-stroll",
        title: "Sunset Stroll",
        subtitle: "Wind down your day with excellent evening air quality.",
        badge: "RELAXING",
        image:
          "https://images.unsplash.com/photo-1517400508447-f8dd518b86db?q=80&w=800&auto=format&fit=crop",
        points: 50,
        prepTips: [
          "Wear reflective clothing if it's getting dark",
          "Leave your phone on Do Not Disturb",
        ],
      },
      secondary1: {
        key: "star-gazing",
        title: "Star Gazing",
        alert: "CLEAR SKIES",
        icon: "weather-night",
        color: "#5433ff",
        points: 20,
        prepTips: [
          "Bring a warm blanket",
          "Use a stargazing app to find constellations",
        ],
      },
      secondary2: {
        key: "patio-dinner",
        title: "Patio Dinner",
        alert: "FRESH AIR",
        icon: "silverware-fork-knife",
        color: "#006944",
        points: 40,
        prepTips: [
          "Open the patio doors to let a cross-breeze in",
          "Light a citronella candle",
        ],
      },
    };
  }
}

/** "Today, 7:14 AM" · "Yesterday, 3:45 PM" · "3 days ago, 5:30 PM" */
export function formatLogDate(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const startOfDay = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);
  if (days <= 0) return `Today, ${time}`;
  if (days === 1) return `Yesterday, ${time}`;
  if (days < 7) return `${days} days ago, ${time}`;
  return `${d.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;
}

/** Label and colour for the AQI tag on an activity-log row */
export function aqiTag(level: number | null): { label: string; color: string } | null {
  if (level == null) return null;
  if (level <= 2) return { label: "Good", color: T.green };
  if (level === 3) return { label: "Moderate", color: T.amber };
  return { label: level === 4 ? "Unhealthy" : "Hazardous", color: T.red };
}

const ICON_MAP: Record<string, string> = {
  "book-open-page-variant": "📖",
  "archive-outline": "🗂️",
  leaf: "🌿",
  "pot-steam-outline": "🍲",
  meditation: "🧘",
  broom: "🧹",
  bike: "🚴",
  yoga: "🤸",
  "water-outline": "💧",
  "tree-outline": "🌳",
  "weather-night": "🌌",
  "silverware-fork-knife": "🍽️",
};

export const emojiFor = (name?: string): string => ICON_MAP[name ?? ""] ?? "✨";

export const AQI_META: AqiMeta[] = [
  {
    level: 1,
    num: 24,
    label: "Good",
    desc: "Perfect conditions. Great day for outdoor activities.",
    gradStart: "#1a6b4a",
    gradEnd: "#2d9968",
  },
  {
    level: 2,
    num: 65,
    label: "Good",
    desc: "Satisfactory air quality. Outdoor activities encouraged.",
    gradStart: "#1a6b4a",
    gradEnd: "#2d9968",
  },
  {
    level: 3,
    num: 105,
    label: "Moderate",
    desc: "Sensitive groups should limit prolonged outdoor exertion.",
    gradStart: "#92400e",
    gradEnd: "#ca8a04",
  },
  {
    level: 4,
    num: 155,
    label: "Unhealthy",
    desc: "Consider staying indoors. Air may irritate respiratory systems.",
    gradStart: "#7f1d1d",
    gradEnd: "#b91c1c",
  },
  {
    level: 5,
    num: 210,
    label: "Hazardous",
    desc: "Avoid all outdoor activity. Keep windows shut.",
    gradStart: "#4c0519",
    gradEnd: "#9f1239",
  },
];
