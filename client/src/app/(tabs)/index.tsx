import {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
} from "react";
import {
  Platform,
  Text,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import * as Device from "expo-device";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "expo-router";
import { getFullLocationStats, LocationData } from "@/api/locationUtils";
import { AQIHeroCard } from "../components/AQIHeroCard";
import { DailyActivitiesBento } from "../components/DailyActivitiesBento";
import {
  INTERACTION_CONFIG,
  InteractionType,
} from "@/constants/interactionConfig";
import { InteractionsRow } from "@/app/components/InteractionsRow";
// ── Colors ───────────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#006944",
  tertiary: "#006093",
  secondary: "#006a35",
  error: "#b31b25",
  surfaceLowest: "#ffffff",
  surfaceHighest: "#d7dedc",
  onSurface: "#2b302f",
};

type LogEntry = { timestamp: Date; type: InteractionType };

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function App() {
  const navigation = useNavigation();
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stats, setStats] = useState<LocationData | null>(null);
  const [activeInteraction, setActiveInteraction] =
    useState<InteractionType | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [justLogged, setJustLogged] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  // ── Header ──────────────────────────────────────────────────────────────────
  const HeaderLeft = useCallback(
    () => (
      <View style={styles.headerLeft}>
        <Ionicons name="location" size={22} color="#16a34a" />
        <Text style={styles.headerTitle}>
          {stats?.city ? `${stats.city}, ${stats.region}` : "Loading..."}
        </Text>
      </View>
    ),
    [stats],
  );

  const HeaderRight = useCallback(
    () => (
      <View style={styles.headerRight}>
        <Ionicons name="leaf" size={22} color="#16a34a" />
      </View>
    ),
    [],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerShown: true,
      headerLeft: HeaderLeft,
      headerRight: HeaderRight,
      headerStyle: {
        backgroundColor: "#f3f7f5",
        borderBottomWidth: 1,
        borderBottomColor: "#d7dedc",
      },
      headerShadowVisible: true,
    });
  }, [navigation, HeaderLeft, HeaderRight]);

  // ── Location ────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function getCurrentLocation() {
      if (Platform.OS === "android" && !Device.isDevice) {
        setErrorMsg(
          "This won't work on an Android Emulator. Try a real device!",
        );
        return;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    }
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (!location?.coords) return;
    const fetchStats = async () => {
      try {
        const data = await getFullLocationStats(
          location.coords.latitude,
          location.coords.longitude,
        );
        if (data) setStats(data);
      } catch (error) {
        console.error("Failed to fetch location stats:", error);
      }
    };
    fetchStats();
  }, [location]);

  // ── Sheet animations ─────────────────────────────────────────────────────────
  function openSheet(type: InteractionType) {
    setActiveInteraction(type);
    setJustLogged(false);
    setModalVisible(true);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function closeSheet() {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      setActiveInteraction(null);
      setJustLogged(false);
    });
  }

  // ── Log helpers ──────────────────────────────────────────────────────────────
  function handleLogAction() {
    if (!activeInteraction) return;
    setLog((prev) => [
      { timestamp: new Date(), type: activeInteraction },
      ...prev,
    ]);
    setJustLogged(true);
  }

  function getLastLogged(type: InteractionType): string {
    const entry = log.find((l) => l.type === type);
    if (!entry) return "Never logged";
    const diffMs = Date.now() - entry.timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${Math.floor(diffHrs / 24)}d ago`;
  }

  function getStreak(type: InteractionType): number {
    return log.filter((l) => l.type === type).length;
  }

  const activeConfig = activeInteraction
    ? INTERACTION_CONFIG[activeInteraction]
    : null;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f3f7f5" }}
      edges={["left", "right"]}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {errorMsg ? (
          <View style={{ padding: 24 }}>
            <Text style={{ color: COLORS.error, textAlign: "center" }}>
              {errorMsg}
            </Text>
          </View>
        ) : (
          <AQIHeroCard
            aqi={stats?.aqi ?? null}
            pm25={stats?.pm25 ?? null}
            pm10={stats?.pm10 ?? null}
          />
        )}

        {/* ── Interactions ───────────────────────────────────────────────────── */}
        <InteractionsRow openSheet={openSheet} getStreak={getStreak} />

        {/* ── Daily Activities ───────────────────────────────────────────────── */}
        <DailyActivitiesBento aqi={stats?.aqi ?? null} />
      </ScrollView>

      {/* ── Animated Modal Sheet ─────────────────────────────────────────────── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeSheet}
      >
        {/* Dimmed backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
        </Animated.View>

        {/* Sliding sheet panel */}
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.sheetHandle} />

          {activeConfig && activeInteraction && (
            <View style={styles.sheetContent}>
              {/* Title row */}
              <View style={styles.sheetTitleRow}>
                <Text style={styles.sheetEmoji}>{activeConfig.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sheetTitle}>
                      {activeConfig.sheetTitle}
                    </Text>
                    <Text
                      style={[
                        styles.sheetStreak,
                        { color: activeConfig.color },
                      ]}
                    >
                      {getStreak(activeInteraction) > 0
                        ? `${getStreak(activeInteraction)}× logged today`
                        : "Not logged yet today"}
                    </Text>
                    {/* Last logged — updates live since modal re-renders on open */}
                    <Text style={styles.sheetLastLogged}>
                      Last: {getLastLogged(activeInteraction)}
                    </Text>
                  </View>
                </View>
                <Pressable onPress={closeSheet} style={styles.closeBtn}>
                  <Ionicons
                    name="close"
                    size={20}
                    color={COLORS.onSurface + "80"}
                  />
                </Pressable>
              </View>

              {/* AQI-driven advice */}
              <View
                style={[
                  styles.adviceBox,
                  {
                    backgroundColor: activeConfig.color + "10",
                    borderColor: activeConfig.color + "25",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="information-outline"
                  size={16}
                  color={activeConfig.color}
                  style={{ marginTop: 1 }}
                />
                <Text
                  style={[
                    styles.adviceText,
                    { color: activeConfig.color + "cc" },
                  ]}
                >
                  {activeConfig.getDescription(stats?.aqi ?? null)}
                </Text>
              </View>

              {/* Action / confirmation */}
              {justLogged ? (
                <View
                  style={[
                    styles.loggedBadge,
                    {
                      backgroundColor: activeConfig.color + "15",
                      borderColor: activeConfig.color + "30",
                    },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={activeConfig.color}
                  />
                  <Text
                    style={[styles.loggedText, { color: activeConfig.color }]}
                  >
                    Logged successfully!
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    { backgroundColor: activeConfig.color },
                  ]}
                  onPress={handleLogAction}
                  activeOpacity={0.85}
                >
                  <Text style={styles.actionBtnText}>
                    {activeConfig.actionLabel}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Header
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
    gap: 6,
  },
  headerTitle: {
    fontSize: 19,
    color: "#16a34a",
    fontWeight: "800",
    textTransform: "capitalize",
    letterSpacing: 0.5,
    marginLeft: 2,
  },
  headerRight: { marginRight: 16 },

  // Sections
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
    marginTop: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.onSurface,
    marginBottom: 16,
    paddingHorizontal: 4,
  },

  // Interaction cards
  interactionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  interactionCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceLowest,
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  interactionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 3,
  },
  interactionMeta: {
    fontSize: 10,
    fontWeight: "500",
  },

  // Backdrop
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  // Sheet
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 36,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 16,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d7dedc",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  sheetContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 16,
  },
  sheetTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sheetEmoji: {
    fontSize: 36,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.onSurface,
  },
  sheetStreak: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f7f5",
    alignItems: "center",
    justifyContent: "center",
  },
  adviceBox: {
    flexDirection: "row",
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  adviceText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 19,
  },
  actionBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  loggedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 15,
    borderWidth: 1,
  },
  loggedText: {
    fontSize: 15,
    fontWeight: "700",
  },
  sheetLastLogged: {
    fontSize: 11,
    fontWeight: "500",
    color: COLORS.onSurface + "50",
    marginTop: 1,
  },
});
