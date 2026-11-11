import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { BottomSheet } from "@/components/ui";
import { COLORS, FONTS } from "@/constants/theme";
import {
  measurements,
  type MeasurementOption,
} from "@/utils/measurementUnitsConfig";

export function MeasurementSheet({
  visible,
  selectedValue,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selectedValue: string;
  onSelect: (item: MeasurementOption) => void;
  onClose: () => void;
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose} style={styles.sheet}>
      <Text accessibilityRole="header" style={styles.title}>
        Measurement units
      </Text>
      <View style={styles.options} accessibilityRole="radiogroup">
        {measurements.map((item) => {
          const selected = selectedValue === item.value;
          return (
            <Pressable
              key={item.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => {
                onSelect(item);
                onClose();
              }}
              style={({ pressed }) => [
                styles.option,
                selected && styles.optionSelected,
                pressed && !selected && styles.optionPressed,
              ]}
            >
              <View style={styles.optionText}>
                <Text style={styles.optionLabel}>{item.label}</Text>
                <Text style={styles.optionDescription}>{item.description}</Text>
              </View>
              {selected ? (
                <MaterialIcons name="check" size={22} color={COLORS.primary} />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: { paddingHorizontal: 24, gap: 12 },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
    color: COLORS.onSurface,
  },
  options: { gap: 4 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  optionSelected: { backgroundColor: COLORS.primarySoft },
  optionPressed: { backgroundColor: COLORS.surface },
  optionText: { flex: 1, gap: 2 },
  optionLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: COLORS.onSurface,
  },
  optionDescription: {
    fontFamily: FONTS.body,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.onSurfaceMuted,
  },
});
