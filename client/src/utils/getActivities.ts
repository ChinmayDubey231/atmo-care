import { DailyRecommendations } from "@/types/activities_type";

function getRecommendedActivities(
  aqiLevel: number,
  currentHour: number,
): DailyRecommendations {
  const level = Math.min(Math.max(Math.round(aqiLevel ?? 1), 1), 5);
  const isPoor = level >= 4;
  const isModerate = level === 3;

  let tod = "Morning";
  if (currentHour >= 12 && currentHour < 17) tod = "Afternoon";
  else if (currentHour >= 17 && currentHour < 21) tod = "Evening";
  else if (currentHour >= 21 || currentHour < 5) tod = "Night";

  if (isPoor || isModerate) {
    if (tod === "Morning")
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
    if (tod === "Afternoon")
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
            "Wipe dust off broad leaves",
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
    return {
      primary: {
        title: "Movie Marathon",
        subtitle: "Perfect excuse to stay in and avoid the night smog.",
        badge: "RELAXING",
        image:
          "https://images.unsplash.com/photo-1585647347384-2593bc35786b?q=80&w=800&auto=format&fit=crop",
        points: 30,
        prepTips: [
          "Dim the lights to prepare for sleep",
          "Keep windows sealed against night-time particulates",
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

  if (tod === "Morning")
    return {
      primary: {
        title: "Morning Jog",
        subtitle: "Crisp air! Perfect conditions for a run.",
        badge: "IDEAL CONDITIONS",
        image:
          "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=800&auto=format&fit=crop",
        points: 80,
        prepTips: [
          "Do a 5-minute dynamic warm-up",
          "Lace up your running shoes",
          "Open windows to let fresh air in before you leave",
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
  if (tod === "Afternoon")
    return {
      primary: {
        title: "Park Walk",
        subtitle: "Get some sun and fresh air while the breeze is blowing.",
        badge: "GREAT WEATHER",
        image:
          "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=800&auto=format&fit=crop",
        points: 50,
        prepTips: [
          "Apply SPF 30+ sunscreen",
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
  return {
    primary: {
      title: "Sunset Stroll",
      subtitle: "Wind down your day with excellent evening air quality.",
      badge: "RELAXING",
      image:
        "https://images.unsplash.com/photo-1517400508447-f8dd518b86db?q=80&w=800&auto=format&fit=crop",
      points: 50,
      prepTips: [
        "Wear reflective clothing if getting dark",
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

export default getRecommendedActivities;
