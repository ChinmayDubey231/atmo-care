import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
} from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PrepSheet from "../components/PrepSheet";
import { ActivityDetails, AqiMeta, HistoryItem } from "@/types/activities_type";
import {
  Badge,
  PointsPill,
  SectionHeader,
} from "../components/activities-subcomponents";
import {
  AQI_META,
  emojiFor,
  getRecommendedActivities,
  MOCK_HISTORY,
} from "@/utils/activityRecommendations";
import StatsBar from "../components/Statbar";
import { T } from "@/constants/theme";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

function AqiHero({
  meta,
  aqiLevel,
  onLevelChange,
}: {
  meta: AqiMeta;
  aqiLevel: number;
  onLevelChange: (level: number) => void;
}) {
  return (
    <LinearGradient
      colors={[meta.gradStart, meta.gradEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <Text style={styles.heroLabel}>AIR QUALITY INDEX</Text>
      <View style={styles.heroRow}>
        <Text style={styles.heroNumber}>{meta.num}</Text>
        <Text style={styles.heroStatus}>{meta.label}</Text>
      </View>
      <Text style={styles.heroDesc}>{meta.desc}</Text>

      {/* AQI level dots */}
      <View style={styles.aqiDots}>
        {AQI_META.map((m) => (
          <TouchableOpacity
            key={m.level}
            onPress={() => onLevelChange(m.level)}
            style={[styles.aqiDot, aqiLevel === m.level && styles.aqiDotActive]}
          >
            <Text style={styles.aqiDotLabel}>{m.label[0]}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.aqiHint}>Tap to preview AQI level</Text>
    </LinearGradient>
  );
}

function PrimaryCard({
  item,
  onPress,
}: {
  item: ActivityDetails;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.95}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        style={styles.primaryCard}
      >
        <Image source={{ uri: item.image }} style={styles.primaryImage} />
        <View style={styles.primaryBody}>
          <Badge label={item.badge} />
          <Text style={styles.primaryTitle}>{item.title}</Text>
          <Text style={styles.primarySubtitle} numberOfLines={2}>
            {item.subtitle}
          </Text>
          <View style={styles.primaryFooter}>
            <PointsPill points={item.points} />
            <View style={styles.seeTipsBtn}>
              <Text style={styles.seeTipsBtnText}>See Tips →</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function SecondaryCard({
  item,
  onPress,
  delay = 0,
}: {
  item: ActivityDetails;
  onPress: () => void;
  delay?: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 400,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  const iconBg = (item.color ?? T.green) + "20";

  return (
    <Animated.View
      style={[styles.secondaryCardWrap, { opacity, transform: [{ scale }] }]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        style={styles.secondaryCard}
      >
        <View style={[styles.secIcon, { backgroundColor: iconBg }]}>
          <Text style={styles.secIconEmoji}>{emojiFor(item.icon)}</Text>
        </View>
        <Text style={styles.secAlert}>{item.alert}</Text>
        <Text style={styles.secTitle}>{item.title}</Text>
        <Text style={styles.secPoints}>+{item.points} pts</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function HistoryRow({ item, index }: { item: HistoryItem; index: number }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 350,
      delay: index * 60,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.historyRow, { opacity }]}>
      <View style={styles.historyEmoji}>
        <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
      </View>
      <View style={styles.historyInfo}>
        <Text style={styles.historyTitle}>{item.title}</Text>
        <Text style={styles.historyDate}>{item.date}</Text>
      </View>
      <View style={styles.historyRight}>
        <View
          style={[styles.aqiTag, { backgroundColor: item.aqiColor + "18" }]}
        >
          <Text style={[styles.aqiTagText, { color: item.aqiColor }]}>
            {item.aqi}
          </Text>
        </View>
        <Text style={styles.historyPoints}>+{item.points}</Text>
      </View>
    </Animated.View>
  );
}

// Main Screen
export default function ActivitiesScreen() {
  const insets = useSafeAreaInsets();
  const now = new Date();
  const currentHour = now.getHours();
  const navigation = useNavigation();

  const [aqiLevel, setAqiLevel] = useState(1);
  const [sheetItem, setSheetItem] = useState<ActivityDetails | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const meta = AQI_META[aqiLevel - 1];
  const recs = getRecommendedActivities(aqiLevel, currentHour);

  const openSheet = useCallback((item: any) => {
    setSheetItem(item);
    setSheetVisible(true);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetVisible(false);
  }, []);

  const todStr = (() => {
    let tod = "Morning";
    if (currentHour >= 12 && currentHour < 17) tod = "Afternoon";
    else if (currentHour >= 17 && currentHour < 21) tod = "Evening";
    else if (currentHour >= 21 || currentHour < 5) tod = "Night";
    return tod;
  })();

  const HeaderLeft = useCallback(
    () => (
      <View style={styles.headerLeft}>
        <Ionicons name="location" size={22} color={T.green} />
        <Text style={styles.headerTitle}>AirWise</Text>
      </View>
    ),
    [],
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
        backgroundColor: T.surface,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: T.border,
      },
      headerShadowVisible: false,
    });
  }, [navigation, HeaderLeft, HeaderRight]);

  return (
    <View style={[styles.root]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── AQI HERO ── */}
        <AqiHero meta={meta} aqiLevel={aqiLevel} onLevelChange={setAqiLevel} />

        {/* ── STATS ── */}
        <StatsBar />

        {/* ── TODAY'S RECOMMENDATIONS ── */}
        <SectionHeader
          title="Today's Top Pick"
          sub={`Based on ${meta.label} AQI · ${todStr}`}
        />
        <PrimaryCard
          item={recs.primary}
          onPress={() => openSheet(recs.primary)}
        />

        <View style={{ marginTop: 20 }}>
          <SectionHeader title="Also Recommended" />
        </View>
        <View style={styles.secondaryGrid}>
          <SecondaryCard
            item={recs.secondary1}
            onPress={() => openSheet(recs.secondary1)}
            delay={60}
          />
          <SecondaryCard
            item={recs.secondary2}
            onPress={() => openSheet(recs.secondary2)}
            delay={120}
          />
        </View>

        {/* ── LOGGED HISTORY ── */}
        <SectionHeader
          title="Activity Log"
          sub={`${MOCK_HISTORY.length} activities recorded`}
        />
        <View style={styles.historyCard}>
          {MOCK_HISTORY.map((item, i) => (
            <React.Fragment key={item.id}>
              <HistoryRow item={item} index={i} />
              {i < MOCK_HISTORY.length - 1 && (
                <View style={styles.historyDivider} />
              )}
            </React.Fragment>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── PREP TIPS SHEET ── */}
      <PrepSheet visible={sheetVisible} item={sheetItem} onClose={closeSheet} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: T.surface,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: T.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: T.border,
  },
  headerTitle: {
    fontWeight: "700",
    fontSize: 22,
    color: "#16a34a",
    letterSpacing: -0.4,
  },
  timeBadge: {
    backgroundColor: T.border,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  timeBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: T.muted,
  },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // AQI Hero
  hero: {
    borderRadius: T.radius,
    padding: 24,
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 6,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginBottom: 10,
  },
  heroNumber: {
    fontSize: 60,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 64,
  },
  heroStatus: {
    fontSize: 22,
    fontWeight: "500",
    color: "rgba(255,255,255,0.85)",
    marginBottom: 6,
  },
  heroDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.72)",
    lineHeight: 20,
    marginBottom: 16,
    maxWidth: 260,
  },
  aqiDots: {
    flexDirection: "row",
    gap: 8,
  },
  aqiDot: {
    width: 32,
    height: 32,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  aqiDotActive: {
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  aqiDotLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  aqiHint: {
    fontSize: 10,
    color: "rgba(255,255,255,0.45)",
    marginTop: 6,
  },

  // Primary card
  primaryCard: {
    backgroundColor: T.card,
    borderRadius: T.radius,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 4,
  },
  primaryImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  primaryBody: {
    padding: 18,
  },
  primaryTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: T.text,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  primarySubtitle: {
    fontSize: 13,
    color: T.muted,
    lineHeight: 20,
    marginBottom: 14,
  },
  primaryFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  seeTipsBtn: {
    backgroundColor: T.green,
    borderRadius: 99,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  seeTipsBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  // Secondary cards
  secondaryGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
  },
  secondaryCardWrap: {
    flex: 1,
  },
  secondaryCard: {
    backgroundColor: T.card,
    borderRadius: T.radius,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 6,
  },
  secIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  secIconEmoji: {
    fontSize: 20,
  },
  secAlert: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: T.muted,
    textTransform: "uppercase",
  },
  secTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: T.text,
    lineHeight: 18,
  },
  secPoints: {
    fontSize: 12,
    fontWeight: "500",
    color: T.muted,
    marginTop: 2,
  },

  // History
  historyCard: {
    backgroundColor: T.card,
    borderRadius: T.radius,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  historyEmoji: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: T.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: T.text,
  },
  historyDate: {
    fontSize: 11,
    color: T.muted,
    marginTop: 2,
  },
  historyRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  aqiTag: {
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  aqiTagText: {
    fontSize: 10,
    fontWeight: "600",
  },
  historyPoints: {
    fontSize: 13,
    fontWeight: "700",
    color: T.green,
  },
  historyDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: T.border,
    marginLeft: 72,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
    gap: 6,
  },
  headerRight: { marginRight: 16 },
});
