import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import React from "react";
import { Image } from "expo-image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Plant } from "../../utils/plant-wikiConfig";

interface Props {
  plant: Plant | null;
  visible: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFav: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const LEVEL_COLOR: Record<string, { bg: string; text: string }> = {
  Beginner: { bg: "#dcfce7", text: "#15803d" },
  Moderate: { bg: "#fef9c3", text: "#a16207" },
  Advanced: { bg: "#fee2e2", text: "#b91c1c" },
  Sage: { bg: "#ede9fe", text: "#6d28d9" },
};

const LIGHT_ICON: Record<string, string> = {
  Low: "weather-night",
  Indirect: "weather-partly-cloudy",
  "Full Sun": "weather-sunny",
};

const WATER_ICON: Record<string, string> = {
  Low: "water-outline",
  Moderate: "water-check",
  High: "water-plus",
};

const PlantDetailModal = ({
  plant,
  visible,
  onClose,
  isFavorite,
  onToggleFav,
}: Props) => {
  const insets = useSafeAreaInsets();

  if (!plant) return null;

  const level = LEVEL_COLOR[plant.level] ?? LEVEL_COLOR.Beginner;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View
        style={[
          styles.sheet,
          { paddingBottom: 0, maxHeight: SCREEN_HEIGHT * 0.88 },
        ]}
      >
        {/* Drag handle */}
        <View style={styles.handle} />

        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {/* ── Hero Image ── */}
          <View style={styles.heroWrap}>
            <Image
              source={{ uri: plant.image }}
              style={styles.heroImage}
              contentFit="cover"
            />
            <View style={styles.heroOverlay} />

            {/* Close + Fav buttons */}
            <View style={styles.heroActions}>
              <TouchableOpacity style={styles.heroBtn} onPress={onClose}>
                <Ionicons name="close" size={20} color="#2b302f" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroBtn} onPress={onToggleFav}>
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={20}
                  color={isFavorite ? "#ef4444" : "#2b302f"}
                />
              </TouchableOpacity>
            </View>

            {/* Badge on image */}
            <View style={styles.heroBadgeWrap}>
              <MaterialCommunityIcons
                name={plant.badgeIcon}
                size={11}
                color={plant.badgeIconColor}
              />
              <Text style={styles.heroBadgeText}>{plant.badge}</Text>
            </View>
          </View>

          <View style={styles.body}>
            {/* ── Title ── */}
            <View style={styles.titleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.plantName}>{plant.name}</Text>
                <Text style={styles.scientificName}>
                  {plant.scientificName}
                </Text>
              </View>
              <View style={[styles.levelBadge, { backgroundColor: level.bg }]}>
                <Text style={[styles.levelText, { color: level.text }]}>
                  {plant.level}
                </Text>
              </View>
            </View>

            {/* ── Description ── */}
            <Text style={styles.desc}>{plant.desc}</Text>

            {/* ── Care Requirements ── */}
            <Text style={styles.sectionLabel}>Care Requirements</Text>
            <View style={styles.careRow}>
              <View style={styles.careCard}>
                <MaterialCommunityIcons
                  name={LIGHT_ICON[plant.requirements.light] as any}
                  size={24}
                  color="#f59e0b"
                />
                <Text style={styles.careValue}>{plant.requirements.light}</Text>
                <Text style={styles.careKey}>Light</Text>
              </View>
              <View style={styles.careCard}>
                <MaterialCommunityIcons
                  name={WATER_ICON[plant.requirements.water] as any}
                  size={24}
                  color="#0ea5e9"
                />
                <Text style={styles.careValue}>{plant.requirements.water}</Text>
                <Text style={styles.careKey}>Water</Text>
              </View>
              <View style={styles.careCard}>
                <MaterialCommunityIcons
                  name="water-percent"
                  size={24}
                  color="#6366f1"
                />
                <Text style={styles.careValue}>
                  {plant.requirements.humidity}
                </Text>
                <Text style={styles.careKey}>Humidity</Text>
              </View>
            </View>

            {/* ── Filters ── */}
            <Text style={styles.sectionLabel}>Filters from Air</Text>
            <View style={styles.filterWrap}>
              {plant.filters.map((f) => (
                <View key={f} style={styles.filterChip}>
                  <MaterialCommunityIcons
                    name="air-filter"
                    size={12}
                    color="#006944"
                  />
                  <Text style={styles.filterText}>{f}</Text>
                </View>
              ))}
            </View>

            {/* ── Pet Safety ── */}
            <Text style={styles.sectionLabel}>Pet Safety</Text>
            <View
              style={[
                styles.petRow,
                {
                  backgroundColor: plant.petSafe ? "#dcfce7" : "#fee2e2",
                  borderColor: plant.petSafe ? "#86efac" : "#fca5a5",
                },
              ]}
            >
              <MaterialCommunityIcons
                name={plant.petSafe ? "paw" : "paw-off"}
                size={22}
                color={plant.petSafe ? "#15803d" : "#b91c1c"}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.petTitle,
                    { color: plant.petSafe ? "#15803d" : "#b91c1c" },
                  ]}
                >
                  {plant.petSafe ? "Pet Friendly" : "Toxic to Pets"}
                </Text>
                <Text style={styles.petSub}>
                  {plant.petSafe
                    ? "Safe around cats and dogs."
                    : "Keep away from cats and dogs."}
                </Text>
              </View>
              <Ionicons
                name={plant.petSafe ? "checkmark-circle" : "warning"}
                size={20}
                color={plant.petSafe ? "#15803d" : "#b91c1c"}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d7dedc",
    alignSelf: "center",
    marginVertical: 12,
  },

  // Hero
  heroWrap: {
    height: 240,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: "hidden",
  },
  heroImage: { width: "100%", height: "100%" },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,20,10,0.25)",
  },
  heroActions: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroBadgeWrap: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 50,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#2b302f",
  },

  // Body
  body: { padding: 20, gap: 4 },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  plantName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2b302f",
    letterSpacing: -0.4,
  },
  scientificName: {
    fontSize: 13,
    color: "#737876",
    fontStyle: "italic",
    marginTop: 2,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 50,
    marginTop: 4,
  },
  levelText: { fontSize: 11, fontWeight: "700" },
  desc: {
    fontSize: 14,
    color: "#585c5b",
    lineHeight: 22,
    marginBottom: 20,
  },

  // Section
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#737876",
    marginBottom: 10,
    marginTop: 4,
  },

  // Care cards
  careRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  careCard: {
    flex: 1,
    backgroundColor: "#f3f7f5",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  careValue: { fontSize: 13, fontWeight: "700", color: "#2b302f" },
  careKey: { fontSize: 10, color: "#737876", textTransform: "uppercase" },

  // Filters
  filterWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#edf2f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
  },
  filterText: { fontSize: 12, fontWeight: "600", color: "#2b302f" },

  // Pet row
  petRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  petTitle: { fontSize: 14, fontWeight: "700" },
  petSub: { fontSize: 12, color: "#585c5b", marginTop: 2 },
});

export default PlantDetailModal;
