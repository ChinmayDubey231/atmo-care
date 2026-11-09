import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useLeaderboard } from "@/api/queries";
import type { LeaderboardEntry, LeaderboardPeriod } from "@/api/types";
import { T } from "@/constants/theme";
import { SectionHeader } from "./activities-subcomponents";

const MEDALS = ["🥇", "🥈", "🥉"];

function Row({ entry }: { entry: LeaderboardEntry }) {
  return (
    <View style={[styles.row, entry.isMe && styles.rowMe]}>
      <Text style={styles.rank}>
        {entry.rank <= 3 ? MEDALS[entry.rank - 1] : entry.rank}
      </Text>
      {entry.imageUrl ? (
        <Image source={{ uri: entry.imageUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.avatarInitial}>
            {entry.displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <Text style={styles.name} numberOfLines={1}>
        {entry.displayName}
        {entry.isMe ? <Text style={styles.youTag}> (you)</Text> : null}
      </Text>
      <Text style={styles.points}>{entry.points} pts</Text>
    </View>
  );
}

export function Leaderboard() {
  const [period, setPeriod] = useState<LeaderboardPeriod>("week");
  const { data, isLoading, error } = useLeaderboard(period);

  const meOutsideTop = data?.me && !data.entries.some((e) => e.isMe);

  return (
    <View style={{ marginTop: 20 }}>
      <SectionHeader title="Leaderboard" sub="Eco Points from the community" />

      <View style={styles.toggle}>
        {(["week", "all"] as const).map((p) => (
          <Pressable
            key={p}
            onPress={() => setPeriod(p)}
            style={[styles.toggleBtn, period === p && styles.toggleBtnActive]}
          >
            <Text
              style={[
                styles.toggleText,
                period === p && styles.toggleTextActive,
              ]}
            >
              {p === "week" ? "This week" : "All time"}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        {isLoading ? (
          <ActivityIndicator style={{ padding: 24 }} color={T.green} />
        ) : error ? (
          <Text style={styles.empty}>Couldn't load the leaderboard.</Text>
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
      </View>
      {data && !data.me && data.entries.length > 0 ? (
        <Text style={styles.footnote}>
          Log an activity to join the board, or check that "Show me on
          leaderboard" is on in Settings.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: "row",
    backgroundColor: T.border,
    borderRadius: 99,
    padding: 3,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
  },
  toggleBtnActive: { backgroundColor: T.card },
  toggleText: { fontSize: 12, fontWeight: "600", color: T.muted },
  toggleTextActive: { color: T.green },

  card: {
    backgroundColor: T.card,
    borderRadius: T.radius,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  rowMe: { backgroundColor: T.greenLight },
  rank: {
    width: 28,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: T.muted,
  },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarFallback: {
    backgroundColor: T.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { fontSize: 15, fontWeight: "700", color: T.green },
  name: { flex: 1, fontSize: 14, fontWeight: "600", color: T.text },
  youTag: { fontWeight: "400", color: T.muted },
  points: { fontSize: 13, fontWeight: "700", color: T.green },
  gap: { textAlign: "center", color: T.muted, paddingVertical: 2 },
  empty: { padding: 20, textAlign: "center", color: T.muted, fontSize: 13 },
  footnote: { fontSize: 11, color: T.muted, marginTop: 8, marginHorizontal: 4 },
});
