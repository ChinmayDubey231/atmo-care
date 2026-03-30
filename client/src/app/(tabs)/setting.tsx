import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from "react-native";
import React, { useLayoutEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/expo";
import { useNavigation, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import MeasurementModal from "../components/MeasurementModal";
import { getMeasurementLabel } from "../../utils/measurementUnitsConfig";
import { getUserName } from "../../utils/userUtils";

const NOTIFICATIONS = [
  {
    key: "aqi",
    label: "AQI Alerts",
    sub: "Instant alerts for poor air quality",
    icon: "weather-windy" as const,
    iconColor: "#ef4444",
    iconBg: "#fee2e2",
    defaultOn: true,
  },
  {
    key: "plant",
    label: "Plant Reminders",
    sub: "Watering and care schedules",
    icon: "sprout" as const,
    iconColor: "#16a34a",
    iconBg: "#dcfce7",
    defaultOn: false,
  },
  {
    key: "community",
    label: "Community Messages",
    sub: "Updates from local plant enthusiasts",
    icon: "message-text" as const,
    iconColor: "#2563eb",
    iconBg: "#dbeafe",
    defaultOn: true,
  },
];

const Setting = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const navigation = useNavigation();
  const router = useRouter();

  const tabBarHeight = useBottomTabBarHeight();
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATIONS.map((n) => [n.key, n.defaultOn])),
  );

  const [unitsModalVisible, setUnitsModalVisible] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("metric");

  const toggle = (key: string) =>
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <View style={styles.headerLeft}>
          <Ionicons name="location" size={22} color="#16a34a" />
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
      ),
      headerRight: () => (
        <View style={styles.headerRight}>
          <Ionicons name="leaf" size={22} color="#16a34a" />
        </View>
      ),
      headerStyle: { backgroundColor: "#f3f7f5" },
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: tabBarHeight + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── User Card ─────────────────────────────────────────── */}
        <View style={styles.userCard}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: user?.imageUrl }}
              style={styles.userImage}
              contentFit="cover"
            />
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={10} color="#005c2d" />
            </View>
          </View>

          <View style={styles.userDetails}>
            <Text style={styles.userName}>{getUserName(user)}</Text>
            <View style={styles.badge}>
              <MaterialCommunityIcons
                name="pine-tree"
                size={13}
                color="#006944"
              />
              <Text style={styles.badgeText}>Green Level: Sage</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push("/profile/edit-user")}
          >
            <Ionicons name="create-outline" size={18} color="#585c5b" />
          </TouchableOpacity>
        </View>

        {/* ── Notifications ─────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Notifications</Text>
        <View style={styles.card}>
          {NOTIFICATIONS.map((item, idx) => (
            <View
              key={item.key}
              style={[
                styles.row,
                idx < NOTIFICATIONS.length - 1 && styles.rowDivider,
              ]}
            >
              <View
                style={[styles.iconCircle, { backgroundColor: item.iconBg }]}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={22}
                  color={item.iconColor}
                />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Text style={styles.rowSub}>{item.sub}</Text>
              </View>
              <Switch
                value={toggles[item.key]}
                onValueChange={() => toggle(item.key)}
                trackColor={{ false: "#d7dedc", true: "#bbf7d0" }}
                thumbColor={toggles[item.key] ? "#16a34a" : "#f9fafb"}
                ios_backgroundColor="#d7dedc"
              />
            </View>
          ))}
        </View>

        {/* ── App Preferences ───────────────────────────────────── */}
        <Text style={styles.sectionLabel}>App Preferences</Text>
        <View style={styles.prefGrid}>
          <TouchableOpacity key="datasource" style={styles.prefCard}>
            <MaterialCommunityIcons name="database" size={22} color="#006a35" />
            <View style={styles.prefText}>
              <Text style={styles.rowLabel}>Data Source</Text>
              <Text style={styles.rowSub}>Global Monitoring</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#aaaeac" />
          </TouchableOpacity>

          <TouchableOpacity
            key="units"
            style={styles.prefCard}
            onPress={() => setUnitsModalVisible(true)}
          >
            <MaterialCommunityIcons name="ruler" size={22} color="#006a35" />
            <View style={styles.prefText}>
              <Text style={styles.rowLabel}>Measurement Units</Text>
              <Text style={styles.rowSub}>
                {getMeasurementLabel(selectedUnit)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#aaaeac" />
          </TouchableOpacity>
        </View>

        {/* ── Resources ─────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Resources</Text>

        {/* Plant Wiki banner */}
        <TouchableOpacity
          style={styles.wikiBanner}
          activeOpacity={0.85}
          onPress={() => router.push("/wiki/plant-wiki")}
        >
          <View style={styles.wikiBannerOverlay} />
          <View style={styles.wikiBannerContent}>
            <Text style={styles.wikiTitle}>Plant Wiki</Text>
            <Text style={styles.wikiSub}>
              Identify & learn about your greenery
            </Text>
            <View style={styles.wikiCta}>
              <Text style={styles.wikiCtaText}>Explore Now</Text>
              <Ionicons name="arrow-forward" size={13} color="#6bfe9c" />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.helpBtn}>
          <Ionicons name="help-circle-outline" size={22} color="#585c5b" />
          <Text style={styles.helpText}>Help Center & Support</Text>
          <Ionicons
            name="open-outline"
            size={16}
            color="#aaaeac"
            style={{ marginLeft: "auto" }}
          />
        </TouchableOpacity>

        {/* ── Log Out ───────────────────────────────────────────── */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutBtn,
            pressed && styles.logoutBtnPressed,
          ]}
          onPress={() => signOut()}
        >
          <Ionicons name="log-out-outline" size={20} color="#b31b25" />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>

        <Text style={styles.version}>Atmosphere v1.0.0</Text>
      </ScrollView>
      <MeasurementModal
        modalVisible={unitsModalVisible}
        selectedValue={selectedUnit}
        onSelect={(item) => setSelectedUnit(item.value)}
        onClose={() => setUnitsModalVisible(false)}
      />
    </SafeAreaView>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Header
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 14,
    gap: 6,
  },
  headerTitle: {
    fontSize: 20,
    color: "#16a34a",
    fontWeight: "700",
  },
  headerRight: { marginRight: 14 },

  // Screen
  container: { flex: 1, backgroundColor: "#f3f7f5" },
  scroll: { padding: 16, gap: 0 },

  // Section label
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#737876",
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },

  // User Card
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: 14,
    marginTop: 8,
  },
  avatarWrapper: { position: "relative" },
  userImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#d7dedc",
    borderWidth: 3,
    borderColor: "#edf2f0",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#6bfe9c",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  userDetails: { flex: 1, gap: 6 },
  userName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2b302f",
    letterSpacing: -0.3,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "#6decae30",
  },
  badgeText: {
    fontSize: 11,
    color: "#005436",
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#edf2f0",
    alignItems: "center",
    justifyContent: "center",
  },

  // Generic card
  card: {
    borderRadius: 20,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },

  // Row (notification)
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#edf2f0",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: "600", color: "#2b302f" },
  rowSub: { fontSize: 12, color: "#585c5b", marginTop: 2 },

  // Prefs grid
  prefGrid: { gap: 10 },
  prefCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 14,
  },
  prefText: { flex: 1 },

  // Wiki banner
  wikiBanner: {
    height: 120,
    borderRadius: 20,
    backgroundColor: "#064e3b",
    overflow: "hidden",
    justifyContent: "center",
    marginBottom: 10,
  },
  wikiBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,40,20,0.55)",
  },
  wikiBannerContent: { paddingHorizontal: 22 },
  wikiTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  wikiSub: { fontSize: 13, color: "#a7f3d0", marginTop: 2 },
  wikiCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  wikiCtaText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6bfe9c",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },

  // Help button
  helpBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  helpText: { fontSize: 14, fontWeight: "600", color: "#2b302f" },

  // Log out
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 28,
    paddingVertical: 16,
    borderRadius: 50,
    backgroundColor: "#e4e9e7",
  },
  logoutBtnPressed: { backgroundColor: "#fee2e2" },
  logoutText: { fontSize: 15, fontWeight: "700", color: "#b31b25" },

  // Version
  version: {
    textAlign: "center",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#aaaeac",
    marginTop: 16,
  },
});

export default Setting;
