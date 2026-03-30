import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/expo";
import { CATEGORIES, Plant, PLANTS } from "../../utils/plant-wikiConfig";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PlantDetailModal from "../components/PlantDetailModal";

const PlantWikiScreen = () => {
  const router = useRouter();
  const { user } = useUser();
  const insets = useSafeAreaInsets();

  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  const toggleFav = (key: string) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const filtered = PLANTS.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || p.categoryKeys.includes(activeCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView
      style={styles.container}
      edges={["left", "right", "top", "bottom"]}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color="#16a34a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plant Wiki</Text>
        <Image
          source={{ uri: user?.imageUrl }}
          style={styles.headerAvatar}
          contentFit="cover"
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Search ── */}
        <View style={styles.searchWrap}>
          <Ionicons
            name="search"
            size={18}
            color="#006944"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a plant species..."
            placeholderTextColor="#aaaeac"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* ── Category Chips ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          style={styles.chipsScroll}
        >
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c.key}
              style={[
                styles.chip,
                activeCategory === c.key && styles.chipActive,
              ]}
              onPress={() => setActiveCategory(c.key)}
            >
              <Text
                style={[
                  styles.chipText,
                  activeCategory === c.key && styles.chipTextActive,
                ]}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Plant of the Week ── */}
        <Text style={styles.sectionLabel}>Plant of the Week</Text>
        <View style={styles.featured}>
          <Image
            source={{
              uri: "https://plus.unsplash.com/premium_photo-1673969608395-9281e5e4395f?q=80&w=1008&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            }}
            style={styles.featuredImage}
            contentFit="cover"
          />
          <View style={styles.featuredOverlay} />
          <View style={styles.featuredContent}>
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={11} color="#16a34a" />
              <Text style={styles.featuredBadgeText}>Top Purifier</Text>
            </View>
            <Text style={styles.featuredName}>Snake Plant</Text>
            <Text style={styles.featuredDesc}>
              A resilient beauty that works overtime while you sleep, converting
              CO₂ into oxygen at night.
            </Text>
            <View style={styles.featuredStats}>
              <View style={styles.featuredStat}>
                <Ionicons name="moon" size={18} color="#006093" />
                <Text style={styles.featuredStatLabel}>Removes CO₂</Text>
                <Text style={styles.featuredStatSub}>Night-time</Text>
              </View>
              <View style={styles.featuredStatDivider} />
              <View style={styles.featuredStat}>
                <Ionicons name="water" size={18} color="#006944" />
                <Text style={styles.featuredStatLabel}>Low Water</Text>
                <Text style={styles.featuredStatSub}>Easy care</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Plant Library ── */}
        <View style={styles.libraryHeader}>
          <View>
            <Text style={styles.sectionLabel}>Discover</Text>
            <Text style={styles.libraryTitle}>Plant Library</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {filtered.map((plant) => (
            <TouchableOpacity
              key={plant.key}
              style={styles.plantCard}
              activeOpacity={0.88}
              onPress={() => setSelectedPlant(plant)} // ← add this
            >
              <View style={styles.plantImageWrap}>
                <Image
                  source={{ uri: plant.image }}
                  style={styles.plantImage}
                  contentFit="cover"
                />
                <View style={styles.plantBadgeWrap}>
                  <MaterialCommunityIcons
                    name={plant.badgeIcon}
                    size={11}
                    color={plant.badgeIconColor}
                  />
                  <Text style={styles.plantBadgeText}>{plant.badge}</Text>
                </View>
              </View>
              <View style={styles.plantBody}>
                <View style={styles.plantTitleRow}>
                  <Text style={styles.plantName}>{plant.name}</Text>
                  <Pressable onPress={() => toggleFav(plant.key)}>
                    <Ionicons
                      name={
                        favorites.has(plant.key) ? "heart" : "heart-outline"
                      }
                      size={20}
                      color={favorites.has(plant.key) ? "#ef4444" : "#aaaeac"}
                    />
                  </Pressable>
                </View>
                <Text style={styles.plantDesc} numberOfLines={2}>
                  {plant.desc}
                </Text>
                <View style={styles.plantTags}>
                  <View style={styles.plantTag}>
                    <MaterialCommunityIcons
                      name="brain"
                      size={11}
                      color="#006944"
                    />
                    <Text style={styles.plantTagText}>{plant.level}</Text>
                  </View>
                  <View style={styles.plantTag}>
                    <MaterialCommunityIcons
                      name="flower"
                      size={11}
                      color="#006093"
                    />
                    <Text style={styles.plantTagText}>{plant.filters[0]}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <PlantDetailModal
        plant={selectedPlant}
        visible={!!selectedPlant}
        onClose={() => setSelectedPlant(null)}
        isFavorite={favorites.has(selectedPlant?.key ?? "")}
        onToggleFav={() => selectedPlant && toggleFav(selectedPlant.key)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f7f5" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#edf2f0",
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#edf2f0",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#16a34a",
    letterSpacing: -0.3,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#d7dedc",
    borderWidth: 2,
    borderColor: "#6decae",
  },

  scroll: { padding: 16, gap: 0 },

  // Search
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#2b302f",
  },

  // Chips
  chipsScroll: { marginHorizontal: -16, marginBottom: 24 },
  chips: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
    backgroundColor: "#dee4e2",
  },
  chipActive: { backgroundColor: "#006944" },
  chipText: { fontSize: 13, fontWeight: "600", color: "#585c5b" },
  chipTextActive: { color: "#ffffff" },

  // Section label
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#737876",
    marginBottom: 8,
    marginLeft: 2,
  },

  // Featured
  featured: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 28,
    backgroundColor: "#064e3b",
    height: 340,
  },
  featuredImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,30,15,0.62)",
  },
  featuredContent: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 20,
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: "#6bfe9c40",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
    marginBottom: 10,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6bfe9c",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  featuredName: {
    fontSize: 30,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  featuredDesc: {
    fontSize: 13,
    color: "#a7f3d0",
    lineHeight: 20,
    marginBottom: 16,
  },
  featuredStats: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  featuredStat: { flex: 1, gap: 4 },
  featuredStatDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  featuredStatLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 4,
  },
  featuredStatSub: { fontSize: 11, color: "#a7f3d0" },

  // Library
  libraryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 14,
  },
  libraryTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2b302f",
    letterSpacing: -0.3,
  },
  viewAll: { fontSize: 13, fontWeight: "700", color: "#006944" },

  // Grid
  grid: { gap: 16 },
  plantCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  plantImageWrap: { height: 200, position: "relative" },
  plantImage: { width: "100%", height: "100%" },
  plantBadgeWrap: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 50,
  },
  plantBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#2b302f",
  },
  plantBody: { padding: 16 },
  plantTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  plantName: { fontSize: 18, fontWeight: "700", color: "#2b302f" },
  plantDesc: {
    fontSize: 13,
    color: "#585c5b",
    lineHeight: 19,
    marginBottom: 12,
  },
  plantTags: { flexDirection: "row", gap: 8 },
  plantTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#edf2f0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 50,
  },
  plantTagText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#585c5b",
  },
});

export default PlantWikiScreen;
