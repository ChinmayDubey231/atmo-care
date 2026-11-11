import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { IconBubble } from "@/components/ui";
import { COLORS, FONTS, withAlpha } from "@/constants/theme";
import type { ActivityDetails } from "@/types/activities_type";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export function ActivityPhotoCard({
  item,
  onPress,
}: {
  item: ActivityDetails;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.points} points`}
      onPress={onPress}
      style={({ pressed }) => [styles.photoCard, pressed && styles.pressed]}
    >
      <Image
        source={{ uri: item.image }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={200}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        locations={[0.15, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.pointsPill}>
        <Text style={styles.pointsText}>+{item.points} pts</Text>
      </View>
      <View style={styles.photoBody}>
        {item.badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        ) : null}
        <View>
          <Text style={styles.photoTitle}>{item.title}</Text>
          <Text style={styles.photoSubtitle} numberOfLines={2}>
            {item.subtitle}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function ActivityTile({
  item,
  onPress,
}: {
  item: ActivityDetails;
  onPress: () => void;
}) {
  const color = item.color ?? COLORS.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.points} points`}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
    >
      <IconBubble size={40} tint={withAlpha(color, 0.13)}>
        <MaterialCommunityIcons
          name={(item.icon ?? "leaf") as IconName}
          size={22}
          color={color}
        />
      </IconBubble>
      <View style={styles.tileText}>
        <Text style={[styles.tileAlert, { color }]}>{item.alert}</Text>
        <Text style={styles.tileTitle}>{item.title}</Text>
        <Text style={styles.tilePoints}>+{item.points} pts</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { transform: [{ scale: 0.98 }] },

  photoCard: {
    height: 188,
    borderRadius: 24,
    overflow: "hidden",
    justifyContent: "flex-end",
    backgroundColor: COLORS.primary,
  },
  pointsPill: {
    position: "absolute",
    top: 14,
    right: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.card,
  },
  pointsText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.primary,
  },
  photoBody: { padding: 16, gap: 6 },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  badgeText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.4,
    color: COLORS.onPrimary,
  },
  photoTitle: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.2,
    color: COLORS.onPrimary,
  },
  photoSubtitle: {
    fontFamily: FONTS.body,
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(255,255,255,0.88)",
  },

  tile: {
    flex: 1,
    padding: 16,
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  tileText: { gap: 2 },
  tileAlert: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.4,
  },
  tileTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: COLORS.onSurface,
  },
  tilePoints: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.onSurfaceMuted,
  },
});
