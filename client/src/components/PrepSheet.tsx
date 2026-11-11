import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useLogActivity } from "@/api/queries";
import {
  BottomSheet,
  FormError,
  PrimaryButton,
  TextLink,
} from "@/components/ui";
import { COLORS, FONTS } from "@/constants/theme";
import type { ActivityDetails } from "@/types/activities_type";

/** Prep tips for an activity, and the button that logs it. */
export function PrepSheet({
  visible,
  item,
  aqiLevel,
  onClose,
}: {
  visible: boolean;
  item: ActivityDetails | null;
  /** Live AQI level recorded with the log */
  aqiLevel: number | null;
  onClose: () => void;
}) {
  const logActivity = useLogActivity();
  const { reset } = logActivity;

  // Fresh button state each time the sheet opens
  React.useEffect(() => {
    if (visible) reset();
  }, [visible, item, reset]);

  if (!item) return null;

  const badge = item.badge ?? item.alert;
  const logged = logActivity.data;

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.intro}>
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
          <Text accessibilityRole="header" style={styles.title}>
            {item.title}
          </Text>
          <Text style={styles.subtitle}>
            {item.subtitle ?? `Get ready for: ${item.title}`}
          </Text>
        </View>

        <View style={styles.tips}>
          <Text style={styles.tipsLabel}>Prep tips</Text>
          {item.prepTips.map((tip) => (
            <View key={tip} style={styles.tip}>
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color={COLORS.primary}
                style={styles.tipIcon}
              />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {logged ? (
          <Text style={styles.result} accessibilityLiveRegion="polite">
            {logged.alreadyEarnedToday
              ? "Logged again — today's points for this one are already earned."
              : `Nice work! +${logged.pointsAwarded} Eco Points`}
          </Text>
        ) : null}
        <FormError message={logActivity.error?.message} />

        <PrimaryButton
          label={logged ? "Done" : `Log Activity · +${item.points} pts`}
          loading={logActivity.isPending}
          onPress={
            logged
              ? onClose
              : () =>
                  logActivity.mutate({
                    kind: "activity",
                    key: item.key,
                    aqiLevel,
                  })
          }
        />
        {logged ? null : (
          <View style={styles.later}>
            <TextLink label="Maybe later" onPress={onClose} />
          </View>
        )}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, gap: 16 },
  intro: { gap: 6 },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: COLORS.primarySoft,
  },
  badgeText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.4,
    color: COLORS.primary,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.3,
    color: COLORS.onSurface,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.onSurfaceMuted,
  },
  tips: { gap: 12 },
  tipsLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.onSurfaceMuted,
  },
  tip: { flexDirection: "row", gap: 10 },
  tipIcon: { marginTop: 1 },
  tipText: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.onSurface,
  },
  result: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: COLORS.primary,
  },
  later: { alignItems: "center" },
});
