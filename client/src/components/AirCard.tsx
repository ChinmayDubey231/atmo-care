import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/ui";
import { AIR_LEVELS, type AirLevel } from "@/constants/air";
import { COLORS, FONTS } from "@/constants/theme";
import type { DisplayUnits } from "@/utils/measurementUnitsConfig";
import { usAqi } from "@/utils/usAqi";

function Metric({
  label,
  value,
  unit,
  wide,
}: {
  label: string;
  value: string;
  unit: string;
  wide?: boolean;
}) {
  return (
    <View style={wide ? styles.metricWide : styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricUnit}>{unit}</Text>
    </View>
  );
}

function reading(
  pollutant: "pm25" | "pm10",
  value: number | null,
  units: DisplayUnits,
): { value: string; unit: string } {
  if (units === "us") {
    return {
      value: value != null ? String(usAqi(pollutant, value)) : "—",
      unit: "US AQI",
    };
  }
  return { value: value != null ? value.toFixed(1) : "—", unit: "µg/m³" };
}

export function AirCard({
  air,
  pm25,
  pm10,
  units,
}: {
  air: AirLevel;
  pm25: number | null;
  pm10: number | null;
  units: DisplayUnits;
}) {
  return (
    <Card style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title}>Air quality</Text>
        <Text style={styles.levelOf}>
          Level {air.level} of {AIR_LEVELS.length}
        </Text>
      </View>

      <View
        accessible
        accessibilityLabel={`Air quality is ${air.label}, level ${air.level} of ${AIR_LEVELS.length}`}
        style={styles.scale}
      >
        <View style={styles.levels}>
          {AIR_LEVELS.map(({ level }) => {
            const current = level === air.level;
            return (
              <View
                key={level}
                style={[
                  styles.level,
                  current && [
                    styles.levelCurrent,
                    { backgroundColor: air.accent },
                  ],
                ]}
              />
            );
          })}
        </View>
        <View style={styles.ends}>
          <Text style={styles.endLabel}>{AIR_LEVELS[0].label}</Text>
          <Text style={styles.endLabel}>
            {AIR_LEVELS[AIR_LEVELS.length - 1].label}
          </Text>
        </View>
      </View>

      <View style={styles.rule} />

      <View style={styles.metrics}>
        <Metric label="PM2.5" {...reading("pm25", pm25, units)} />
        <Metric label="PM10" {...reading("pm10", pm10, units)} />
        <Metric label="Plants" value={air.mood} unit="right now" wide />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, gap: 16, borderRadius: 24 },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: COLORS.onSurface,
  },
  levelOf: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.onSurfaceMuted,
  },
  scale: { gap: 6 },
  levels: { flexDirection: "row", alignItems: "center", gap: 4, height: 12 },
  level: {
    flex: 1,
    height: 8,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceLow,
  },
  levelCurrent: { height: 12 },
  ends: { flexDirection: "row", justifyContent: "space-between" },
  endLabel: {
    fontFamily: FONTS.body,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.onSurfaceMuted,
  },
  rule: { height: 1, backgroundColor: COLORS.border },
  metrics: { flexDirection: "row", gap: 20 },
  metric: { gap: 2, minWidth: 64 },
  metricWide: { flex: 1, gap: 2 },
  metricLabel: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.onSurfaceMuted,
  },
  metricValue: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    lineHeight: 28,
    color: COLORS.onSurface,
  },
  metricUnit: {
    fontFamily: FONTS.body,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.onSurfaceMuted,
  },
});
