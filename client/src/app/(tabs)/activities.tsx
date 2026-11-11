import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useLogs, useStats } from "@/api/queries";
import type { LogItem } from "@/api/types";
import { ActivityPhotoCard, ActivityTile } from "@/components/ActivityCards";
import { Leaderboard } from "@/components/Leaderboard";
import { PrepSheet } from "@/components/PrepSheet";
import { SkyScreen } from "@/components/Sky";
import { Card, IconBubble, Section } from "@/components/ui";
import { AIR_LEVELS, getAirLevel } from "@/constants/air";
import { COLORS, FONTS, withAlpha } from "@/constants/theme";
import { useAirQuality } from "@/hooks/useAirQuality";
import type { ActivityDetails } from "@/types/activities_type";
import {
  formatLogDate,
  getRecommendedActivities,
  iconForLog,
} from "@/utils/activityRecommendations";

function timeOfDay(hour: number): string {
  if (hour >= 12 && hour < 17) return "Afternoon";
  if (hour >= 17 && hour < 21) return "Evening";
  if (hour >= 21 || hour < 5) return "Night";
  return "Morning";
}

function HistoryRow({ item }: { item: LogItem }) {
  const air = item.aqiLevel != null ? getAirLevel(item.aqiLevel) : null;
  return (
    <View style={styles.logRow}>
      <View style={styles.logIcon}>
        <MaterialCommunityIcons
          name={iconForLog(item.key)}
          size={22}
          color={COLORS.primary}
        />
      </View>
      <View style={styles.logText}>
        <Text style={styles.logTitle}>{item.title}</Text>
        <Text style={styles.logDate}>{formatLogDate(item.loggedAt)}</Text>
      </View>
      <View style={styles.logRight}>
        {air ? (
          <View style={[styles.logTag, { backgroundColor: air.tint }]}>
            <Text style={[styles.logTagText, { color: air.accent }]}>
              {air.label}
            </Text>
          </View>
        ) : null}
        <Text style={styles.logPoints}>+{item.points}</Text>
      </View>
    </View>
  );
}

export default function ActivitiesScreen() {
  const { stats: air } = useAirQuality();
  const liveLevel = air?.aqi ?? null;
  const [previewLevel, setPreviewLevel] = useState<number | null>(null);
  const aqiLevel = previewLevel ?? liveLevel ?? 1;

  const { data: logs, isLoading: logsLoading, error: logsError } = useLogs();
  const { data: stats } = useStats();
  const [sheetItem, setSheetItem] = useState<ActivityDetails | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const currentHour = new Date().getHours();
  const level = getAirLevel(aqiLevel);
  const history = logs?.items ?? [];
  const recommended = getRecommendedActivities(aqiLevel, currentHour);
  const tod = timeOfDay(currentHour);
  const palette = level.sky;

  const isPreview = previewLevel != null && previewLevel !== liveLevel;
  const hasLive = liveLevel != null;

  const openSheet = (item: ActivityDetails) => {
    setSheetItem(item);
    setSheetVisible(true);
  };

  const show = (n: number | undefined) => (n == null ? "–" : String(n));

  return (
    <>
      <SkyScreen
        tabbed
        palette={palette}
        heroHeight={320}
        skyScale={0.8}
        hero={
          <View style={styles.hero}>
            <View style={styles.copy}>
              <Text accessibilityRole="header" style={styles.title}>
                Activities
              </Text>
              <Text style={[styles.subtitle, { color: palette.mist }]}>
                Picked for {level.label} air this {tod.toLowerCase()}
              </Text>
            </View>

            <View style={styles.picker}>
              <View style={styles.levels} accessibilityRole="radiogroup">
                {AIR_LEVELS.map((item) => {
                  const selected = aqiLevel === item.level;
                  return (
                    <Pressable
                      key={item.level}
                      accessibilityRole="radio"
                      accessibilityLabel={`Preview ${item.label} air`}
                      accessibilityState={{ checked: selected }}
                      hitSlop={4}
                      onPress={() => setPreviewLevel(item.level)}
                      style={[
                        styles.level,
                        {
                          backgroundColor: selected
                            ? palette.mist
                            : withAlpha(palette.mist, 0.2),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.levelText,
                          selected && { color: palette.base },
                        ]}
                      >
                        {item.level}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {isPreview && hasLive ? (
                <View style={styles.hint}>
                  <Text style={[styles.hintText, { color: palette.mist }]}>
                    Previewing {level.label} air
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    hitSlop={10}
                    onPress={() => setPreviewLevel(null)}
                  >
                    <Text style={styles.backToLive}>Back to live</Text>
                  </Pressable>
                </View>
              ) : (
                <Text style={[styles.hintText, { color: palette.mist }]}>
                  {hasLive ? "Live for your location · " : ""}Tap to preview
                </Text>
              )}
            </View>
          </View>
        }
      >
        <Card style={styles.stats}>
          {[
            { value: show(stats?.totalLogs), label: "Logged" },
            { value: show(stats?.totalPoints), label: "Total points" },
            { value: show(stats?.streak), label: "Day streak" },
          ].map(({ value, label }, index) => (
            <React.Fragment key={label}>
              {index > 0 ? <View style={styles.statDivider} /> : null}
              <View style={styles.stat}>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
              </View>
            </React.Fragment>
          ))}
        </Card>

        <Section title="Today's top pick" right={`${level.label} air · ${tod}`}>
          <ActivityPhotoCard
            item={recommended.primary}
            onPress={() => openSheet(recommended.primary)}
          />
        </Section>

        <Section title="Also recommended">
          <View style={styles.tiles}>
            <ActivityTile
              item={recommended.secondary1}
              onPress={() => openSheet(recommended.secondary1)}
            />
            <ActivityTile
              item={recommended.secondary2}
              onPress={() => openSheet(recommended.secondary2)}
            />
          </View>
        </Section>

        <Leaderboard />

        <Section
          title="Activity log"
          right={stats ? `${stats.totalLogs} activities recorded` : undefined}
        >
          <Card>
            {logsLoading ? (
              <ActivityIndicator
                style={styles.spinner}
                color={COLORS.primary}
              />
            ) : logsError ? (
              <Text style={styles.empty}>{logsError.message}</Text>
            ) : history.length === 0 ? (
              <Text style={styles.empty}>
                Nothing logged yet. Pick an activity above to earn your first
                Eco Points!
              </Text>
            ) : (
              history.map((item, i) => (
                <React.Fragment key={item.id}>
                  <HistoryRow item={item} />
                  {i < history.length - 1 ? (
                    <View style={styles.logDivider} />
                  ) : null}
                </React.Fragment>
              ))
            )}
          </Card>
        </Section>
      </SkyScreen>

      <PrepSheet
        visible={sheetVisible}
        item={sheetItem}
        aqiLevel={liveLevel}
        onClose={() => setSheetVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  hero: { gap: 20 },
  copy: { gap: 4 },
  title: {
    fontFamily: FONTS.display,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.8,
    color: COLORS.onPrimary,
  },
  subtitle: { fontFamily: FONTS.body, fontSize: 16, lineHeight: 24 },
  picker: { gap: 8 },
  levels: { flexDirection: "row", gap: 8 },
  level: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  levelText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.onPrimary,
  },
  hint: { flexDirection: "row", alignItems: "center", gap: 6 },
  hintText: { fontFamily: FONTS.body, fontSize: 13, lineHeight: 18 },
  backToLive: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.onPrimary,
  },

  stats: { flexDirection: "row", alignItems: "center", paddingVertical: 16 },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  statValue: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    lineHeight: 28,
    color: COLORS.onSurface,
  },
  statLabel: {
    fontFamily: FONTS.body,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.onSurfaceMuted,
  },
  statDivider: { width: 1, height: 36, backgroundColor: COLORS.border },

  tiles: { flexDirection: "row", gap: 12 },

  spinner: { padding: 24 },
  empty: {
    padding: 20,
    textAlign: "center",
    fontFamily: FONTS.body,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.onSurfaceMuted,
  },
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
  },
  logText: { flex: 1, gap: 2 },
  logTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.onSurface,
  },
  logDate: {
    fontFamily: FONTS.body,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.onSurfaceMuted,
  },
  logRight: { alignItems: "flex-end", gap: 4 },
  logTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  logTagText: { fontFamily: FONTS.semiBold, fontSize: 11, lineHeight: 14 },
  logPoints: {
    fontFamily: FONTS.heading,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.primary,
  },
  logDivider: { height: 1, marginLeft: 72, backgroundColor: COLORS.border },
});
