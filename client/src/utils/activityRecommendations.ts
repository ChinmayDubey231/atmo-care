import { T } from "@/constants/theme";
import {
  AqiMeta,
  DailyRecommendations,
  HistoryItem,
} from "@/types/activities_type";

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

export const MOCK_HISTORY: HistoryItem[] = [
  {
    id: "1",
    title: "Morning Jog",
    emoji: "🏃",
    points: 80,
    date: "Today, 7:14 AM",
    aqi: "Good",
    aqiColor: T.green,
  },
  {
    id: "2",
    title: "Outdoor Stretch",
    emoji: "🤸",
    points: 40,
    date: "Today, 8:02 AM",
    aqi: "Good",
    aqiColor: T.green,
  },
  {
    id: "3",
    title: "Park Walk",
    emoji: "🌳",
    points: 50,
    date: "Yesterday, 3:45 PM",
    aqi: "Good",
    aqiColor: T.green,
  },
  {
    id: "4",
    title: "Indoor Yoga Flow",
    emoji: "🧘",
    points: 50,
    date: "Yesterday, 7:30 AM",
    aqi: "Moderate",
    aqiColor: T.amber,
  },
  {
    id: "5",
    title: "Meditation",
    emoji: "🌙",
    points: 40,
    date: "2 days ago, 9:00 PM",
    aqi: "Unhealthy",
    aqiColor: T.red,
  },
  {
    id: "6",
    title: "Home HIIT",
    emoji: "💪",
    points: 60,
    date: "3 days ago, 5:30 PM",
    aqi: "Moderate",
    aqiColor: T.amber,
  },
];

export const TOTAL_POINTS = MOCK_HISTORY.reduce((s, a) => s + a.points, 0);

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
