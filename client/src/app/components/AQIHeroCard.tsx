import { Animated, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAQIAnimations } from "@/hooks/useAQIAnimations";

const AQI_LEVELS = {
  1: {
    label: "Excellent",
    desc: "Perfect conditions for everything",
    subtitle: "Favourable for outdoor activity",
    color: "#006944",
    plant: "🌿",
    badge: "THRIVING",
  },
  2: {
    label: "Good",
    desc: "Great air — enjoy the outdoors",
    subtitle: "Favourable for outdoor activity",
    color: "#16a34a",
    plant: "🪴",
    badge: "HEALTHY",
  },
  3: {
    label: "Moderate",
    desc: "Acceptable — limit intense activity",
    subtitle: "Acceptable with minor concerns",
    color: "#ca8a04",
    plant: "🌱",
    badge: "MODERATE",
  },
  4: {
    label: "Poor",
    desc: "Sensitive groups stay indoors",
    subtitle: "Limit prolonged outdoor exposure",
    color: "#ea580c",
    plant: "🍂",
    badge: "STRESSED",
  },
  5: {
    label: "Hazardous",
    desc: "Avoid all outdoor exposure",
    subtitle: "Stay indoors, keep windows closed",
    color: "#b91c1c",
    plant: "🥀",
    badge: "CRITICAL",
  },
} as const;

type AQILevel = keyof typeof AQI_LEVELS;

interface Props {
  aqi: number | null;
  pm25: number | null;
  pm10: number | null;
}

export function AQIHeroCard({ aqi, pm25, pm10 }: Props) {
  const level = Math.min(Math.max(Math.round(aqi ?? 1), 1), 5) as AQILevel;
  const info = AQI_LEVELS[level];
  const gaugePercent = ((level - 1) / 4) * 88;

  // Use the custom hook to grab all animation values
  const { gaugeAnim, fadeAnim, scaleAnim, plantBounce } = useAQIAnimations(
    aqi,
    gaugePercent,
  );

  const gaugeLeft = gaugeAnim.interpolate({
    inputRange: [0, 88],
    outputRange: ["0%", "88%"],
  });

  if (aqi == null) {
    return (
      <View style={styles.skeleton}>
        <View style={styles.skeletonBar} />
        <View style={[styles.skeletonBar, { width: "60%", marginTop: 10 }]} />
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.card,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View style={[styles.glowBlob, { backgroundColor: info.color + "15" }]} />

      <View style={styles.topRow}>
        <View style={styles.topLeft}>
          <Text style={[styles.contextGreeting, { color: info.color }]}>
            Your Air Today
          </Text>
          <Text style={[styles.contextSubtitle, { color: info.color + "99" }]}>
            {info.subtitle}
          </Text>
          <Text style={styles.indexLabel}>AIR QUALITY INDEX</Text>
        </View>
        <Text style={[styles.aqiNumber, { color: info.color }]}>{aqi}</Text>
      </View>

      <View style={styles.gaugeWrapper}>
        <LinearGradient
          colors={["#6decae", "#5cb8fd", "#f97316", "#b91c1c"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.gaugeTrack}
        />
        <Animated.View style={[styles.gaugeDot, { left: gaugeLeft }]}>
          <View
            style={[styles.gaugeDotInner, { backgroundColor: info.color }]}
          />
        </Animated.View>
      </View>

      <Text style={[styles.statusLabel, { color: info.color }]}>
        {info.label}
      </Text>
      <Text style={styles.statusDesc}>{info.desc}</Text>

      <View style={styles.plantRow}>
        <Animated.Text
          style={[
            styles.plantEmoji,
            { transform: [{ translateY: plantBounce }] },
          ]}
        >
          {info.plant}
        </Animated.Text>

        <View
          style={[
            styles.badge,
            {
              borderColor: info.color + "30",
              backgroundColor: info.color + "12",
            },
          ]}
        >
          <MaterialCommunityIcons
            name="water-outline"
            size={12}
            color={info.color}
          />
          <Text style={[styles.badgeText, { color: info.color }]}>
            {info.badge}
          </Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        {/* Restored to your original specific colors */}
        <MetricChip label="PM2.5" value={pm25} unit="µg/m³" accent="#006944" />
        <View style={styles.metricDivider} />
        <MetricChip label="PM10" value={pm10} unit="µg/m³" accent="#006093" />
      </View>
    </Animated.View>
  );
}

// ── Small reusable metric chip ────────────────────────────────────────────────
function MetricChip({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: number | null;
  unit: string;
  accent: string;
}) {
  return (
    <View style={styles.chip}>
      <Text style={[styles.chipLabel, { color: accent + "90" }]}>{label}</Text>
      <Text style={[styles.chipValue, { color: accent }]}>
        {value != null ? value.toFixed(1) : "—"}
      </Text>
      <Text style={[styles.chipUnit, { color: accent + "80" }]}>{unit}</Text>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  glowBlob: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -70,
    right: -70,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    zIndex: 1,
  },
  topLeft: {
    flex: 1,
    paddingRight: 8,
  },
  contextGreeting: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  contextSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    marginBottom: 12,
  },
  indexLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#9aa09e",
    textTransform: "uppercase",
  },
  aqiNumber: {
    fontSize: 64,
    fontWeight: "900",
    lineHeight: 70,
    letterSpacing: -1.5,
    zIndex: 1,
  },
  gaugeWrapper: {
    height: 24,
    justifyContent: "center",
    marginBottom: 16,
  },
  gaugeTrack: {
    height: 10,
    borderRadius: 10,
  },
  gaugeDot: {
    position: "absolute",
    top: "50%",
    marginTop: -11,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e4e9e7",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  gaugeDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusLabel: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  statusDesc: {
    fontSize: 16,
    color: "#585c5b",
    marginBottom: 24,
    fontWeight: "500",
  },
  plantRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  plantEmoji: {
    fontSize: 64,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  metricsRow: {
    flexDirection: "row",
    backgroundColor: "#fafafa",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  metricDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 4,
    marginHorizontal: 16,
  },
  chip: {
    flex: 1,
    alignItems: "center",
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  chipValue: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  chipUnit: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  skeleton: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 24,
    backgroundColor: "#f5f7f6",
    padding: 24,
    height: 320,
    justifyContent: "center",
    alignItems: "center",
  },
  skeletonBar: {
    height: 14,
    width: "80%",
    borderRadius: 8,
    backgroundColor: "#e4e9e7",
  },
});
