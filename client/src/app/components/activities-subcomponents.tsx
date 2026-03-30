import { T } from "@/constants/theme";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

function Badge({
  label,
  bg = T.greenLight,
  color = T.green,
  style,
}: {
  label?: string;
  bg?: string;
  color?: string;
  style?: ViewStyle;
}) {
  if (!label) return null;
  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

/** Points pill */
function PointsPill({ points, style }: { points: number; style?: ViewStyle }) {
  return (
    <View style={[styles.pointsPill, style]}>
      <Text style={styles.pointsPillText}>+{points} pts</Text>
    </View>
  );
}

/** Section header */
function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {sub ? <Text style={styles.sectionSub}>{sub}</Text> : null}
    </View>
  );
}

export { Badge, PointsPill, SectionHeader };

const styles = StyleSheet.create({
  // Badge
  badge: {
    alignSelf: "flex-start",
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
  },

  // Points pill
  pointsPill: {
    backgroundColor: T.greenLight,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  pointsPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: T.green,
  },
  // Section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: T.text,
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontSize: 11,
    color: T.muted,
    maxWidth: 160,
    textAlign: "right",
  },
});
