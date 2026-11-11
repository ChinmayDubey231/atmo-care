import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useMe, useStats } from "@/api/queries";
import { ActivityPhotoCard, ActivityTile } from "@/components/ActivityCards";
import { AirCard } from "@/components/AirCard";
import { CareSheet } from "@/components/CareSheet";
import { PrepSheet } from "@/components/PrepSheet";
import { SkyScreen } from "@/components/Sky";
import { IconBubble, Section } from "@/components/ui";
import { getAirLevel } from "@/constants/air";
import {
  INTERACTION_CONFIG,
  type InteractionType,
} from "@/constants/interactionConfig";
import { BRAND_SKY, COLORS, FONTS, withAlpha } from "@/constants/theme";
import { useAirQuality } from "@/hooks/useAirQuality";
import type { ActivityDetails } from "@/types/activities_type";
import { getRecommendedActivities } from "@/utils/activityRecommendations";
import { displayUnits } from "@/utils/measurementUnitsConfig";

const CARE_TYPES: InteractionType[] = ["water", "sun", "clean"];

export default function HomeScreen() {
  const { stats: air, errorMsg, refetch } = useAirQuality();
  const { data: myStats } = useStats();
  const { data: me } = useMe();

  const [careType, setCareType] = useState<InteractionType>("water");
  const [careVisible, setCareVisible] = useState(false);
  const [activity, setActivity] = useState<ActivityDetails | null>(null);
  const [activityVisible, setActivityVisible] = useState(false);

  const aqi = air?.aqi ?? null;
  const level = getAirLevel(aqi);
  const hasReading = aqi != null && !errorMsg;
  const palette = hasReading ? level.sky : BRAND_SKY;
  const recommended = getRecommendedActivities(aqi, new Date().getHours());
  const streak = myStats?.streak ?? 0;

  const place = air
    ? [air.city, air.region].filter(Boolean).join(", ")
    : errorMsg
      ? "Location unavailable"
      : "Finding your location…";

  const openCare = (type: InteractionType) => {
    setCareType(type);
    setCareVisible(true);
  };

  const openActivity = (item: ActivityDetails) => {
    setActivity(item);
    setActivityVisible(true);
  };

  return (
    <>
      <SkyScreen
        tabbed
        palette={palette}
        heroHeight={360}
        skyScale={0.86}
        hero={
          <View style={styles.hero}>
            <View style={styles.heroTop}>
              <View style={styles.place}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={18}
                  color={palette.mist}
                />
                <Text style={styles.placeText} numberOfLines={1}>
                  {place}
                </Text>
              </View>
              {streak > 0 ? (
                <View
                  accessible
                  accessibilityLabel={`${streak} day streak`}
                  style={[
                    styles.streak,
                    { backgroundColor: withAlpha(palette.mist, 0.2) },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="fire"
                    size={14}
                    color={palette.mist}
                  />
                  <Text style={styles.streakText}>{streak}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.copy}>
              <Text style={[styles.eyebrow, { color: palette.mist }]}>
                Air right now
              </Text>
              {hasReading ? (
                <Text
                  accessibilityRole="header"
                  style={styles.airLabel}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {level.label}
                </Text>
              ) : (
                <Text accessibilityRole="header" style={styles.pendingLabel}>
                  {errorMsg ? "No reading yet" : "Reading the air…"}
                </Text>
              )}
              <Text style={[styles.summary, { color: palette.mist }]}>
                {errorMsg ?? (hasReading ? level.summary : "")}
              </Text>
              {errorMsg ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => refetch()}
                  style={styles.retry}
                >
                  <Text style={styles.retryText}>Try again</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        }
      >
        {hasReading ? (
          <AirCard
            air={level}
            pm25={air?.pm25 ?? null}
            pm10={air?.pm10 ?? null}
            units={displayUnits(me?.settings.units)}
          />
        ) : null}

        <Section title="Plant care">
          <View style={styles.row}>
            {CARE_TYPES.map((type) => {
              const config = INTERACTION_CONFIG[type];
              const count = myStats?.care[type].todayCount ?? 0;
              return (
                <Pressable
                  key={type}
                  accessibilityRole="button"
                  accessibilityLabel={`${config.label}, ${count} logged today`}
                  onPress={() => openCare(type)}
                  style={({ pressed }) => [
                    styles.careTile,
                    pressed && styles.pressed,
                  ]}
                >
                  <IconBubble size={44} tint={config.tint}>
                    <MaterialCommunityIcons
                      name={config.icon}
                      size={24}
                      color={config.color}
                    />
                  </IconBubble>
                  <View style={styles.careText}>
                    <Text style={styles.careLabel}>{config.label}</Text>
                    <Text style={styles.careStatus}>
                      {count > 0 ? `${count}× today` : "Not yet today"}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title="Today's plan">
          <ActivityPhotoCard
            item={recommended.primary}
            onPress={() => openActivity(recommended.primary)}
          />
          <View style={styles.row}>
            <ActivityTile
              item={recommended.secondary1}
              onPress={() => openActivity(recommended.secondary1)}
            />
            <ActivityTile
              item={recommended.secondary2}
              onPress={() => openActivity(recommended.secondary2)}
            />
          </View>
        </Section>
      </SkyScreen>

      <CareSheet
        visible={careVisible}
        type={careType}
        aqi={aqi}
        todayCount={myStats?.care[careType].todayCount ?? 0}
        lastAt={myStats?.care[careType].lastAt}
        onClose={() => setCareVisible(false)}
      />
      <PrepSheet
        visible={activityVisible}
        item={activity}
        aqiLevel={aqi}
        onClose={() => setActivityVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  hero: { gap: 28 },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  place: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  placeText: {
    flexShrink: 1,
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: COLORS.onPrimary,
  },
  streak: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingLeft: 10,
    paddingRight: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  streakText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.onPrimary,
  },
  copy: { gap: 2 },
  eyebrow: { fontFamily: FONTS.medium, fontSize: 15, lineHeight: 20 },
  airLabel: {
    fontFamily: FONTS.display,
    fontSize: 60,
    lineHeight: 66,
    letterSpacing: -1.5,
    color: COLORS.onPrimary,
  },
  pendingLabel: {
    fontFamily: FONTS.display,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.8,
    color: COLORS.onPrimary,
  },
  summary: {
    maxWidth: 252,
    fontFamily: FONTS.body,
    fontSize: 16,
    lineHeight: 24,
  },
  retry: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: BRAND_SKY.mist,
  },
  retryText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: BRAND_SKY.base,
  },

  row: { flexDirection: "row", gap: 10 },
  pressed: { transform: [{ scale: 0.97 }] },
  careTile: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  careText: { alignItems: "center" },
  careLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.onSurface,
  },
  careStatus: {
    fontFamily: FONTS.body,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.onSurfaceMuted,
  },
});
