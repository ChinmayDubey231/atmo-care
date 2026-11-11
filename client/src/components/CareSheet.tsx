import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useLogActivity } from "@/api/queries";
import {
  BottomSheet,
  FormError,
  IconBubble,
  PrimaryButton,
} from "@/components/ui";
import {
  INTERACTION_CONFIG,
  type InteractionType,
} from "@/constants/interactionConfig";
import { COLORS, FONTS } from "@/constants/theme";

function timeSince(iso: string | null | undefined): string {
  if (!iso) return "Never logged";
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function CareSheet({
  visible,
  type,
  aqi,
  todayCount,
  lastAt,
  onClose,
}: {
  visible: boolean;
  type: InteractionType;
  aqi: number | null;
  todayCount: number;
  lastAt: string | null | undefined;
  onClose: () => void;
}) {
  const logCare = useLogActivity();
  const { reset } = logCare;
  const config = INTERACTION_CONFIG[type];

  // Fresh button state each time the sheet opens
  React.useEffect(() => {
    if (visible) reset();
  }, [visible, type, reset]);

  const logged = logCare.data;

  return (
    <BottomSheet visible={visible} onClose={onClose} style={styles.sheet}>
      <View style={styles.header}>
        <IconBubble size={52} tint={config.tint}>
          <MaterialCommunityIcons
            name={config.icon}
            size={28}
            color={config.color}
          />
        </IconBubble>
        <View style={styles.headerText}>
          <Text accessibilityRole="header" style={styles.title}>
            {config.sheetTitle}
          </Text>
          <Text style={styles.status}>
            {todayCount > 0
              ? `${todayCount}× logged today`
              : "Not logged yet today"}
            {" · "}
            Last: {timeSince(lastAt)}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={8}
          onPress={onClose}
          style={styles.close}
        >
          <MaterialCommunityIcons
            name="close"
            size={20}
            color={COLORS.onSurfaceMuted}
          />
        </Pressable>
      </View>

      <View style={styles.advice}>
        <MaterialCommunityIcons
          name="information-outline"
          size={20}
          color={COLORS.primary}
        />
        <Text style={styles.adviceText}>{config.getDescription(aqi)}</Text>
      </View>

      {logged ? (
        <View style={styles.logged} accessibilityLiveRegion="polite">
          <MaterialCommunityIcons
            name="check-circle"
            size={22}
            color={COLORS.primary}
          />
          <Text style={styles.loggedText}>
            {logged.alreadyEarnedToday
              ? "Logged! Today's points already earned"
              : `Logged! +${logged.pointsAwarded} pts`}
          </Text>
        </View>
      ) : (
        <>
          <FormError message={logCare.error?.message} />
          <PrimaryButton
            label={config.actionLabel}
            loading={logCare.isPending}
            onPress={() =>
              logCare.mutate({ kind: "care", key: type, aqiLevel: aqi })
            }
          />
        </>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: { paddingHorizontal: 24, gap: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerText: { flex: 1, gap: 2 },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
    color: COLORS.onSurface,
  },
  status: {
    fontFamily: FONTS.body,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.onSurfaceMuted,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
  },
  advice: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  adviceText: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.onSurface,
  },
  logged: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 56,
    paddingHorizontal: 16,
    borderRadius: 28,
    backgroundColor: COLORS.primarySoft,
  },
  loggedText: {
    flexShrink: 1,
    fontFamily: FONTS.heading,
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.primary,
  },
});
