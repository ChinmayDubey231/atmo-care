import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { InteractionType } from "@/constants/interactionConfig";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

const COLORS = {
  primary: "#006944",
  tertiary: "#006093",
  secondary: "#006a35",
  surfaceLowest: "#ffffff",
  onSurface: "#2b302f",
  warning: "#ca8a04",
};

interface Props {
  openSheet: (type: InteractionType) => void;
  getStreak: (type: InteractionType) => number;
}

export function InteractionsRow({ openSheet, getStreak }: Props) {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Interactions</Text>
      <View style={styles.interactionsRow}>
        {/* ── 1. Water ──────────────────────────────────────────────────────── */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.interactionCard}
          onPress={() => openSheet("water" as InteractionType)}
        >
          {getStreak("water" as InteractionType) > 0 ? (
            <View style={styles.streakBadge}>
              <MaterialCommunityIcons
                name="fire"
                size={12}
                color={COLORS.warning}
              />
              <Text style={styles.streakText}>
                {getStreak("water" as InteractionType)}
              </Text>
            </View>
          ) : null}

          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: COLORS.primary + "15" },
            ]}
          >
            <MaterialCommunityIcons
              name="water-opacity"
              size={24}
              color={COLORS.primary}
            />
          </View>
          <Text style={styles.interactionLabel}>Water</Text>
        </TouchableOpacity>

        {/* ── 2. Sun ────────────────────────────────────────────────────────── */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.interactionCard}
          onPress={() => openSheet("sun" as InteractionType)}
        >
          {getStreak("sun" as InteractionType) > 0 ? (
            <View style={styles.streakBadge}>
              <MaterialCommunityIcons
                name="fire"
                size={12}
                color={COLORS.warning}
              />
              <Text style={styles.streakText}>
                {getStreak("sun" as InteractionType)}
              </Text>
            </View>
          ) : null}

          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: COLORS.tertiary + "15" },
            ]}
          >
            <Ionicons name="sunny" size={24} color={COLORS.tertiary} />
          </View>
          <Text style={styles.interactionLabel}>Sun</Text>
        </TouchableOpacity>

        {/* ── 3. Clean ──────────────────────────────────────────────────────── */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.interactionCard}
          onPress={() => openSheet("clean" as InteractionType)}
        >
          {getStreak("clean" as InteractionType) > 0 ? (
            <View style={styles.streakBadge}>
              <MaterialCommunityIcons
                name="fire"
                size={12}
                color={COLORS.warning}
              />
              <Text style={styles.streakText}>
                {getStreak("clean" as InteractionType)}
              </Text>
            </View>
          ) : null}

          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: COLORS.secondary + "15" },
            ]}
          >
            <MaterialCommunityIcons
              name="broom"
              size={24}
              color={COLORS.secondary}
            />
          </View>
          <Text style={styles.interactionLabel}>Clean</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.onSurface,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  interactionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  interactionCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceLowest,
    alignItems: "center",
    justifyContent: "flex-start",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 6,
    position: "relative",
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  interactionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.onSurface,
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.onSurface + "80",
    marginTop: 4,
    textAlign: "center",
  },
  streakBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.warning + "20",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  streakText: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.warning,
  },
});
