import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { BottomSheet } from "@/components/ui";
import { COLORS, FONTS } from "@/constants/theme";
import { type Plant, plantImage } from "@/utils/plant-wikiConfig";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const LEVEL_COLOR: Record<string, { background: string; color: string }> = {
  Beginner: { background: COLORS.primarySoft, color: COLORS.primary },
  Moderate: { background: COLORS.amberSoft, color: COLORS.amber },
  Advanced: { background: COLORS.errorContainer, color: COLORS.error },
  Sage: { background: "#ede9fe", color: "#6d28d9" },
};

const LIGHT_ICON: Record<string, IconName> = {
  Low: "weather-night",
  Indirect: "weather-partly-cloudy",
  "Full Sun": "weather-sunny",
};

const WATER_ICON: Record<string, IconName> = {
  Low: "water-outline",
  Moderate: "water-check",
  High: "water-plus",
};

function CareTile({
  icon,
  color,
  value,
  label,
}: {
  icon: IconName;
  color: string;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.careTile}>
      <MaterialCommunityIcons name={icon} size={22} color={color} />
      <Text style={styles.careValue}>{value}</Text>
      <Text style={styles.careLabel}>{label}</Text>
    </View>
  );
}

function ImageButton({
  label,
  icon,
  color,
  onPress,
}: {
  label: string;
  icon: IconName;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={onPress}
      style={styles.imageButton}
    >
      <MaterialCommunityIcons name={icon} size={20} color={color} />
    </Pressable>
  );
}

export function PlantDetailSheet({
  plant,
  visible,
  isFavorite,
  onToggleFav,
  onClose,
}: {
  plant: Plant | null;
  visible: boolean;
  isFavorite: boolean;
  onToggleFav: () => void;
  onClose: () => void;
}) {
  if (!plant) return null;

  const level = LEVEL_COLOR[plant.level] ?? LEVEL_COLOR.Beginner;
  const petColor = plant.petSafe ? COLORS.primary : COLORS.error;

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.imageWrap}>
          <Image
            source={plantImage(plant.image)}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.imageActions}>
            <ImageButton
              label="Close"
              icon="close"
              color={COLORS.onSurface}
              onPress={onClose}
            />
            <ImageButton
              label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              icon={isFavorite ? "heart" : "heart-outline"}
              color={isFavorite ? "#dc2626" : COLORS.onSurface}
              onPress={onToggleFav}
            />
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={styles.names}>
              <Text accessibilityRole="header" style={styles.name}>
                {plant.name}
              </Text>
              <Text style={styles.scientific}>{plant.scientificName}</Text>
            </View>
            <View
              style={[styles.level, { backgroundColor: level.background }]}
            >
              <Text style={[styles.levelText, { color: level.color }]}>
                {plant.level}
              </Text>
            </View>
          </View>

          <Text style={styles.description}>{plant.desc}</Text>

          <View style={styles.block}>
            <Text style={styles.blockLabel}>Care requirements</Text>
            <View style={styles.careRow}>
              <CareTile
                icon={LIGHT_ICON[plant.requirements.light]}
                color={COLORS.amber}
                value={plant.requirements.light}
                label="Light"
              />
              <CareTile
                icon={WATER_ICON[plant.requirements.water]}
                color={COLORS.blue}
                value={plant.requirements.water}
                label="Water"
              />
              <CareTile
                icon="water-percent"
                color={COLORS.primary}
                value={plant.requirements.humidity}
                label="Humidity"
              />
            </View>
          </View>

          <View style={styles.block}>
            <Text style={styles.blockLabel}>Filters from air</Text>
            <View style={styles.filters}>
              {plant.filters.map((filter) => (
                <View key={filter} style={styles.filter}>
                  <MaterialCommunityIcons
                    name="air-filter"
                    size={14}
                    color={COLORS.primary}
                  />
                  <Text style={styles.filterText}>{filter}</Text>
                </View>
              ))}
            </View>
          </View>

          <View
            style={[
              styles.pet,
              {
                backgroundColor: plant.petSafe
                  ? COLORS.primarySoft
                  : COLORS.errorContainer,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={plant.petSafe ? "paw" : "paw-off"}
              size={22}
              color={petColor}
            />
            <View style={styles.petText}>
              <Text style={[styles.petTitle, { color: petColor }]}>
                {plant.petSafe ? "Pet Friendly" : "Toxic to Pets"}
              </Text>
              <Text style={styles.petNote}>
                {plant.petSafe
                  ? "Safe around cats and dogs."
                  : "Keep away from cats and dogs."}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, gap: 14 },
  imageWrap: {
    height: 210,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: COLORS.primarySoft,
  },
  imageActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
  },
  imageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.94)",
  },
  body: { paddingHorizontal: 8, gap: 16 },
  titleRow: { flexDirection: "row", gap: 12 },
  names: { flex: 1 },
  name: {
    fontFamily: FONTS.heading,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.4,
    color: COLORS.onSurface,
  },
  scientific: {
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.onSurfaceMuted,
  },
  level: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  levelText: { fontFamily: FONTS.semiBold, fontSize: 12, lineHeight: 16 },
  description: {
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.onSurfaceMuted,
  },
  block: { gap: 8 },
  blockLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.onSurfaceMuted,
  },
  careRow: { flexDirection: "row", gap: 10 },
  careTile: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  careValue: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    lineHeight: 18,
    color: COLORS.onSurface,
  },
  careLabel: {
    fontFamily: FONTS.body,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.onSurfaceMuted,
  },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingLeft: 10,
    paddingRight: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceLow,
  },
  filterText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.onSurface,
  },
  pet: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
  },
  petText: { flex: 1 },
  petTitle: { fontFamily: FONTS.semiBold, fontSize: 14, lineHeight: 20 },
  petNote: {
    fontFamily: FONTS.body,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.onSurfaceMuted,
  },
});
