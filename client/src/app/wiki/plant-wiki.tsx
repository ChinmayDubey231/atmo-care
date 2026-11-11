import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { useFavorites, useToggleFavorite } from "@/api/queries";
import { PlantDetailSheet } from "@/components/PlantDetailSheet";
import { SkyScreen } from "@/components/Sky";
import { Section } from "@/components/ui";
import { BRAND_SKY, COLORS, FONTS, withAlpha } from "@/constants/theme";
import {
  CATEGORIES,
  type Plant,
  plantImage,
  PLANTS,
} from "@/utils/plant-wikiConfig";

const FEATURED = PLANTS.find((p) => p.key === "snakeplant");

const SIDE_PADDING = 24;
const COLUMN_GAP = 12;

function PlantCard({
  plant,
  width,
  favorite,
  onOpen,
  onToggleFavorite,
}: {
  plant: Plant;
  width: number;
  favorite: boolean;
  onOpen: () => void;
  onToggleFavorite: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={plant.name}
      onPress={onOpen}
      style={({ pressed }) => [
        styles.card,
        { width },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.cardImage}>
        <Image
          source={plantImage(plant.image)}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.cardBadge}>
          <Text style={styles.cardBadgeText} numberOfLines={1}>
            {plant.badge}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            favorite
              ? `Remove ${plant.name} from favorites`
              : `Add ${plant.name} to favorites`
          }
          hitSlop={8}
          onPress={onToggleFavorite}
          style={styles.heart}
        >
          <MaterialCommunityIcons
            name={favorite ? "heart" : "heart-outline"}
            size={18}
            color={favorite ? "#dc2626" : COLORS.onSurfaceMuted}
          />
        </Pressable>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={2}>
          {plant.name}
        </Text>
        <Text style={styles.cardLevel}>{plant.level} care</Text>
      </View>
    </Pressable>
  );
}

const PlantWikiScreen = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const { data: favorites = new Set<string>() } = useFavorites();
  const { mutate: setFavorite } = useToggleFavorite();
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const toggleFav = (key: string) =>
    setFavorite({ plantKey: key, favorite: !favorites.has(key) });

  const filtered = PLANTS.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || p.categoryKeys.includes(activeCategory);
    return matchesSearch && matchesCategory;
  });

  const browsing = !search && activeCategory === "all";
  const cardWidth = (width - SIDE_PADDING * 2 - COLUMN_GAP) / 2;

  const openPlant = (plant: Plant) => {
    setSelectedPlant(plant);
    setDetailVisible(true);
  };

  return (
    <>
      <SkyScreen
        heroHeight={252}
        skyScale={0.66}
        sheetStyle={styles.sheet}
        hero={
          <View style={styles.hero}>
            <View style={styles.titleRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                hitSlop={8}
                onPress={() => router.back()}
                style={styles.back}
              >
                <MaterialIcons
                  name="arrow-back"
                  size={20}
                  color={BRAND_SKY.mist}
                />
              </Pressable>
              <Text accessibilityRole="header" style={styles.title}>
                Plant Wiki
              </Text>
            </View>
            <View style={styles.search}>
              <MaterialIcons name="search" size={20} color={COLORS.primary} />
              <TextInput
                accessibilityLabel="Search for a plant species"
                style={styles.searchInput}
                placeholder="Search for a plant species..."
                placeholderTextColor={COLORS.placeholder}
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
              />
            </View>
          </View>
        }
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chips}
        >
          {CATEGORIES.map((c) => {
            const selected = activeCategory === c.key;
            return (
              <Pressable
                key={c.key}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setActiveCategory(c.key)}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text
                  style={[styles.chipText, selected && styles.chipTextSelected]}
                >
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {browsing && FEATURED ? (
          <Section title="Plant of the week">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Plant of the week: Snake Plant"
              onPress={() => openPlant(FEATURED)}
              style={({ pressed }) => [
                styles.featured,
                pressed && styles.pressed,
              ]}
            >
              <Image
                source={plantImage(FEATURED.image)}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                transition={200}
              />
              <LinearGradient
                colors={["rgba(0,20,13,0.1)", "rgba(0,20,13,0.82)"]}
                locations={[0.1, 0.75]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.featuredBody}>
                <View style={styles.featuredBadge}>
                  <MaterialIcons
                    name="star"
                    size={12}
                    color={BRAND_SKY.mist}
                  />
                  <Text style={styles.featuredBadgeText}>Top Purifier</Text>
                </View>
                <Text style={styles.featuredName}>Snake Plant</Text>
                <Text style={styles.featuredDescription}>
                  A resilient beauty that works overtime while you sleep,
                  converting CO₂ into oxygen at night.
                </Text>
                <View style={styles.featuredStats}>
                  {(
                    [
                      ["moon-waning-crescent", "Removes CO₂", "Night-time"],
                      ["water-outline", "Low Water", "Easy care"],
                    ] as const
                  ).map(([icon, label, note]) => (
                    <View key={label} style={styles.featuredStat}>
                      <MaterialCommunityIcons
                        name={icon}
                        size={20}
                        color={BRAND_SKY.mist}
                      />
                      <View>
                        <Text style={styles.featuredStatLabel}>{label}</Text>
                        <Text style={styles.featuredStatNote}>{note}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </Pressable>
          </Section>
        ) : null}

        <Section
          title="Plant library"
          right={`${filtered.length} ${filtered.length === 1 ? "plant" : "plants"}`}
        >
          {filtered.length === 0 ? (
            <Text style={styles.empty}>
              No plants match that search. Try a different name or category.
            </Text>
          ) : (
            <View style={styles.grid}>
              {filtered.map((plant) => (
                <PlantCard
                  key={plant.key}
                  plant={plant}
                  width={cardWidth}
                  favorite={favorites.has(plant.key)}
                  onOpen={() => openPlant(plant)}
                  onToggleFavorite={() => toggleFav(plant.key)}
                />
              ))}
            </View>
          )}
        </Section>
      </SkyScreen>

      <PlantDetailSheet
        plant={selectedPlant}
        visible={detailVisible}
        isFavorite={favorites.has(selectedPlant?.key ?? "")}
        onToggleFav={() => selectedPlant && toggleFav(selectedPlant.key)}
        onClose={() => setDetailVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  hero: { gap: 16 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: withAlpha(BRAND_SKY.mist, 0.28),
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.6,
    color: COLORS.onPrimary,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: COLORS.card,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    ...Platform.select<object>({ web: { outlineStyle: "none" } }),
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.onSurface,
  },

  sheet: { paddingTop: 20, gap: 26 },
  chipsScroll: { marginHorizontal: -SIDE_PADDING, flexGrow: 0 },
  chips: { paddingHorizontal: SIDE_PADDING, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceLow,
  },
  chipSelected: { backgroundColor: COLORS.primary },
  chipText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.onSurfaceMuted,
  },
  chipTextSelected: { color: COLORS.onPrimary },

  featured: {
    height: 330,
    borderRadius: 24,
    overflow: "hidden",
    justifyContent: "flex-end",
    backgroundColor: BRAND_SKY.base,
  },
  featuredBody: { padding: 18, gap: 6 },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    paddingLeft: 8,
    paddingRight: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: withAlpha(BRAND_SKY.mist, 0.25),
  },
  featuredBadgeText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.3,
    color: BRAND_SKY.mist,
  },
  featuredName: {
    fontFamily: FONTS.display,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
    color: COLORS.onPrimary,
  },
  featuredDescription: {
    fontFamily: FONTS.body,
    fontSize: 13,
    lineHeight: 20,
    color: BRAND_SKY.mist,
  },
  featuredStats: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  featuredStat: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  featuredStatLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.onPrimary,
  },
  featuredStatNote: {
    fontFamily: FONTS.body,
    fontSize: 12,
    lineHeight: 16,
    color: BRAND_SKY.mist,
  },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: COLUMN_GAP },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    overflow: "hidden",
  },
  pressed: { transform: [{ scale: 0.98 }] },
  cardImage: { height: 128, backgroundColor: COLORS.primarySoft },
  cardBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    maxWidth: 104,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.94)",
  },
  cardBadgeText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    lineHeight: 14,
    color: COLORS.onSurface,
  },
  heart: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
  },
  cardBody: {
    gap: 2,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  cardName: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: COLORS.onSurface,
  },
  cardLevel: {
    fontFamily: FONTS.body,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.onSurfaceMuted,
  },
  empty: {
    paddingVertical: 24,
    textAlign: "center",
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.onSurfaceMuted,
  },
});

export default PlantWikiScreen;
