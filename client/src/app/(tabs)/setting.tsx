import { useAuth, useUser } from "@clerk/expo";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { useApi, useMe, useStats, useUpdateMe } from "@/api/queries";
import type { Settings } from "@/api/types";
import { MeasurementSheet } from "@/components/MeasurementSheet";
import { Sky, SkyScreen } from "@/components/Sky";
import { Card, IconBubble } from "@/components/ui";
import { BRAND_SKY, COLORS, FONTS, withAlpha } from "@/constants/theme";
import {
  getExpoPushToken,
  getNotificationPermission,
  unregisterPushToken,
} from "@/hooks/usePushNotifications";
import {
  displayUnits,
  getMeasurementLabel,
} from "@/utils/measurementUnitsConfig";
import { getUserName } from "@/utils/userUtils";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

type ToggleItem = {
  key: string;
  setting: Exclude<keyof Settings, "units">;
  label: string;
  sub: string;
  icon: IconName;
  iconColor: string;
  iconBg: string;
  defaultOn: boolean;
};

const NOTIFICATIONS: ToggleItem[] = [
  {
    key: "aqi",
    setting: "aqiAlerts",
    label: "AQI Alerts",
    sub: "Instant alerts for poor air quality",
    icon: "weather-windy",
    iconColor: "#dc2626",
    iconBg: "#fee2e2",
    defaultOn: true,
  },
  {
    key: "plant",
    setting: "plantReminders",
    label: "Plant Reminders",
    sub: "Watering and care schedules",
    icon: "sprout",
    iconColor: COLORS.primary,
    iconBg: COLORS.primarySoft,
    defaultOn: false,
  },
];

const PRIVACY: ToggleItem[] = [
  {
    key: "leaderboard",
    setting: "showOnLeaderboard",
    label: "Show Me on Leaderboard",
    sub: "Only your first name and last initial",
    icon: "trophy-outline",
    iconColor: COLORS.amber,
    iconBg: "#fef3c7",
    defaultOn: true,
  },
];

const PUSH_SETTINGS: ToggleItem["setting"][] = ["aqiAlerts", "plantReminders"];

function SettingRow({
  icon,
  iconColor = COLORS.onSurfaceMuted,
  iconBg = COLORS.surfaceLow,
  label,
  sub,
  trailing,
  onPress,
}: {
  icon: IconName;
  iconColor?: string;
  iconBg?: string;
  label: string;
  sub: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
}) {
  const body = (
    <>
      <IconBubble size={40} tint={iconBg}>
        <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
      </IconBubble>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      {trailing}
    </>
  );

  if (!onPress) return <View style={styles.row}>{body}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${sub}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      {body}
    </Pressable>
  );
}

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.group}>
      <Text accessibilityRole="header" style={styles.groupLabel}>
        {label}
      </Text>
      {children}
    </View>
  );
}

const RowDivider = () => <View style={styles.rowDivider} />;

const Setting = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const api = useApi();
  const { data: me } = useMe();
  const { data: stats } = useStats();
  const updateMe = useUpdateMe();

  const [unitsVisible, setUnitsVisible] = useState(false);
  const selectedUnit = me?.settings.units ?? "metric";

  const isOn = (item: ToggleItem) =>
    me?.settings[item.setting] ?? item.defaultOn;

  const saveSettings = (changes: Partial<Settings>) =>
    updateMe.mutate(changes, {
      onError: (e) => Alert.alert("Couldn't save your settings", e.message),
    });

  const toggle = async (item: ToggleItem) => {
    const next = !isOn(item);
    saveSettings({ [item.setting]: next });

    // Turning on an alert: make sure we can actually deliver it
    if (next && PUSH_SETTINGS.includes(item.setting)) {
      const permission = await getNotificationPermission();
      if (!permission) return; // e.g. Expo Go on Android: no push available
      if (permission.status !== "granted" && !permission.canAskAgain) {
        Alert.alert(
          "Notifications are off",
          "Allow notifications for this app in your device settings to receive alerts.",
          [
            { text: "Not now", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }
      const token = await getExpoPushToken({ ask: true });
      if (token) {
        api("/me/push-token", { method: "PUT", body: { token } }).catch(
          () => {},
        );
      }
    }
  };

  const handleLogout = async () => {
    await unregisterPushToken(api);
    await signOut();
  };

  const renderToggles = (items: ToggleItem[]) =>
    items.map((item, index) => (
      <React.Fragment key={item.key}>
        {index > 0 ? <RowDivider /> : null}
        <SettingRow
          icon={item.icon}
          iconColor={item.iconColor}
          iconBg={item.iconBg}
          label={item.label}
          sub={item.sub}
          trailing={
            <Switch
              accessibilityLabel={item.label}
              value={isOn(item)}
              onValueChange={() => toggle(item)}
              disabled={!me}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.card}
              ios_backgroundColor={COLORS.border}
            />
          }
        />
      </React.Fragment>
    ));

  return (
    <>
      <SkyScreen
        tabbed
        heroHeight={236}
        skyScale={0.62}
        sheetStyle={styles.sheet}
        hero={
          <View style={styles.profile}>
            <Image
              source={{ uri: user?.imageUrl }}
              style={styles.avatar}
              contentFit="cover"
            />
            <View style={styles.details}>
              <Text
                accessibilityRole="header"
                style={styles.name}
                numberOfLines={1}
              >
                {getUserName(user)}
              </Text>
              <View style={styles.levelPill}>
                <MaterialCommunityIcons
                  name="pine-tree"
                  size={14}
                  color={BRAND_SKY.mist}
                />
                <Text style={styles.levelText}>
                  Green level: {stats?.level.name ?? "…"}
                </Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
              hitSlop={8}
              onPress={() => router.push("/profile/edit-user")}
              style={styles.edit}
            >
              <MaterialIcons name="edit" size={20} color={COLORS.onPrimary} />
            </Pressable>
          </View>
        }
      >
        <Group label="Notifications">
          <Card>{renderToggles(NOTIFICATIONS)}</Card>
        </Group>

        <Group label="Privacy">
          <Card>{renderToggles(PRIVACY)}</Card>
        </Group>

        <Group label="App preferences">
          <Card>
            <SettingRow
              icon="database"
              label="Data Source"
              sub="OpenWeather"
            />
            <RowDivider />
            <SettingRow
              icon="ruler"
              label="Measurement Units"
              sub={getMeasurementLabel(selectedUnit)}
              onPress={() => setUnitsVisible(true)}
              trailing={
                <MaterialIcons
                  name="chevron-right"
                  size={22}
                  color={COLORS.placeholder}
                />
              }
            />
          </Card>
        </Group>

        <Group label="Resources">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Plant Wiki. Identify and learn about your greenery"
            onPress={() => router.push("/wiki/plant-wiki")}
            style={({ pressed }) => [
              styles.wiki,
              pressed && styles.wikiPressed,
            ]}
          >
            <Sky scale={0.34} frameWidth={width - 48} centerX={0.84} still />
            <Text style={styles.wikiTitle}>Plant Wiki</Text>
            <Text style={styles.wikiSub}>
              Identify & learn about your greenery
            </Text>
          </Pressable>
          <Card>
            <SettingRow
              icon="help-circle-outline"
              label="Help Center & Support"
              sub="Coming soon"
            />
          </Card>
        </Group>

        <Pressable
          accessibilityRole="button"
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logout,
            pressed && styles.logoutPressed,
          ]}
        >
          <MaterialIcons name="logout" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>

        <Text style={styles.version}>Breathe v1.0.0</Text>
      </SkyScreen>

      <MeasurementSheet
        visible={unitsVisible}
        selectedValue={displayUnits(selectedUnit)}
        onSelect={(item) => saveSettings({ units: item.value })}
        onClose={() => setUnitsVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  sheet: { gap: 22 },

  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: withAlpha(BRAND_SKY.mist, 0.5),
    backgroundColor: COLORS.primarySoft,
  },
  details: { flex: 1, gap: 6 },
  name: {
    fontFamily: FONTS.display,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.4,
    color: COLORS.onPrimary,
  },
  levelPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    paddingLeft: 10,
    paddingRight: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: withAlpha(BRAND_SKY.mist, 0.2),
  },
  levelText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.onPrimary,
  },
  edit: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: withAlpha(BRAND_SKY.mist, 0.2),
  },

  group: { gap: 8 },
  groupLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.onSurfaceMuted,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowPressed: { backgroundColor: COLORS.surface },
  rowText: { flex: 1, gap: 2 },
  rowLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: COLORS.onSurface,
  },
  rowSub: {
    fontFamily: FONTS.body,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.onSurfaceMuted,
  },
  rowDivider: { height: 1, marginLeft: 70, backgroundColor: COLORS.border },

  wiki: {
    height: 112,
    justifyContent: "center",
    paddingHorizontal: 20,
    borderRadius: 20,
    overflow: "hidden",
    gap: 2,
  },
  wikiPressed: { transform: [{ scale: 0.98 }] },
  wikiTitle: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
    color: COLORS.onPrimary,
  },
  wikiSub: {
    maxWidth: 230,
    fontFamily: FONTS.body,
    fontSize: 13,
    lineHeight: 18,
    color: BRAND_SKY.mist,
  },

  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  logoutPressed: { backgroundColor: COLORS.errorContainer },
  logoutText: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: COLORS.error,
  },
  version: {
    textAlign: "center",
    fontFamily: FONTS.body,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.onSurfaceMuted,
  },
});

export default Setting;
