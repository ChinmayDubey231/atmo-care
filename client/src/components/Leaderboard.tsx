import { Image } from "expo-image";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useLeaderboard } from "@/api/queries";
import type { LeaderboardEntry, LeaderboardPeriod } from "@/api/types";
import { Card, Section } from "@/components/ui";
import { COLORS, FONTS } from "@/constants/theme";

const MEDALS = [
  { background: "#f5e3a3", color: "#7a5600" },
  { background: "#e3e7ea", color: "#46545d" },
  { background: "#f1d8c2", color: "#83460f" },
];

function Row({ entry }: { entry: LeaderboardEntry }) {
  const medal = MEDALS[entry.rank - 1];
  return (
    <View style={[styles.row, entry.isMe && styles.rowMe]}>
      <View
        style={[styles.rank, medal && { backgroundColor: medal.background }]}
      >
        <Text style={[styles.rankText, medal && { color: medal.color }]}>
          {entry.rank}
        </Text>
      </View>
      {entry.imageUrl ? (
        <Image source={{ uri: entry.imageUrl }} style={styles.avatar} />
      ) : (
        <View
          style={[
            styles.avatar,
            styles.avatarFallback,
            entry.isMe && styles.avatarFallbackMe,
          ]}
        >
          <Text style={styles.avatarInitial}>
            {entry.displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <Text style={styles.name} numberOfLines={1}>
        {entry.displayName}
        {entry.isMe ? " (you)" : ""}
      </Text>
      <Text style={styles.points}>{entry.points} pts</Text>
    </View>
  );
}

function PeriodToggle({
  period,
  onChange,
}: {
  period: LeaderboardPeriod;
  onChange: (period: LeaderboardPeriod) => void;
}) {
  return (
    <View style={styles.toggle} accessibilityRole="tablist">
      {(["week", "all"] as const).map((p) => {
        const selected = period === p;
        return (
          <Pressable
            key={p}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            hitSlop={6}
            onPress={() => onChange(p)}
            style={[styles.toggleItem, selected && styles.toggleItemOn]}
          >
            <Text
              style={[styles.toggleText, selected && styles.toggleTextOn]}
            >
              {p === "week" ? "This week" : "All time"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Leaderboard() {
  const [period, setPeriod] = useState<LeaderboardPeriod>("week");
  const { data, isLoading, error } = useLeaderboard(period);

  const meOutsideTop = data?.me && !data.entries.some((e) => e.isMe);

  return (
    <Section
      title="Leaderboard"
      right={<PeriodToggle period={period} onChange={setPeriod} />}
    >
      <Card>
        {isLoading ? (
          <ActivityIndicator style={styles.spinner} color={COLORS.primary} />
        ) : error ? (
          <Text style={styles.empty}>Couldn&apos;t load the leaderboard.</Text>
        ) : !data || data.entries.length === 0 ? (
          <Text style={styles.empty}>
            No points logged {period === "week" ? "this week" : "yet"} — be the
            first!
          </Text>
        ) : (
          <>
            {data.entries.map((entry, i) => (
              <Row key={`${entry.rank}-${i}`} entry={entry} />
            ))}
            {meOutsideTop && data.me ? (
              <>
                <Text style={styles.gap}>···</Text>
                <Row entry={data.me} />
              </>
            ) : null}
          </>
        )}
      </Card>
      {data && !data.me && data.entries.length > 0 ? (
        <Text style={styles.footnote}>
          Log an activity to join the board, or check that &quot;Show me on
          leaderboard&quot; is on in Settings.
        </Text>
      ) : null}
    </Section>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: "row",
    padding: 3,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceLow,
  },
  toggleItem: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 },
  toggleItemOn: { backgroundColor: COLORS.card },
  toggleText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.onSurfaceMuted,
  },
  toggleTextOn: { color: COLORS.primary },

  spinner: { padding: 24 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowMe: { backgroundColor: COLORS.primarySoft },
  rank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surfaceLow,
  },
  rankText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    lineHeight: 16,
    color: COLORS.onSurface,
  },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primarySoft,
  },
  avatarFallbackMe: { backgroundColor: COLORS.card },
  avatarInitial: {
    fontFamily: FONTS.heading,
    fontSize: 15,
    lineHeight: 20,
    color: COLORS.primary,
  },
  name: {
    flex: 1,
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.onSurface,
  },
  points: {
    fontFamily: FONTS.heading,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.primary,
  },
  gap: { textAlign: "center", color: COLORS.onSurfaceMuted, paddingVertical: 2 },
  empty: {
    padding: 20,
    textAlign: "center",
    fontFamily: FONTS.body,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.onSurfaceMuted,
  },
  footnote: {
    fontFamily: FONTS.body,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.onSurfaceMuted,
  },
});
