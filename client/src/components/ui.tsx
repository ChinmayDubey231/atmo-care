import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS, FONTS } from "@/constants/theme";

export function FieldGroup({ children }: { children: React.ReactNode }) {
  return <View style={styles.fields}>{children}</View>;
}

type FieldProps = Omit<TextInputProps, "style" | "secureTextEntry"> & {
  label: string;
  action?: { label: string; onPress: () => void };
  concealable?: boolean;
  spaced?: boolean;
  inputRef?: React.Ref<TextInput>;
};

export function Field({
  label,
  action,
  concealable,
  spaced,
  inputRef,
  ...input
}: FieldProps) {
  const [focused, setFocused] = React.useState(false);
  const [revealed, setRevealed] = React.useState(false);
  const readOnly = input.editable === false;

  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {action ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={10}
            onPress={action.onPress}
          >
            <Text style={styles.fieldAction}>{action.label}</Text>
          </Pressable>
        ) : null}
      </View>
      <View
        style={[
          styles.inputBox,
          focused && styles.inputBoxFocused,
          readOnly && styles.inputBoxReadOnly,
        ]}
      >
        <TextInput
          {...input}
          ref={inputRef}
          accessibilityLabel={label}
          placeholderTextColor={COLORS.placeholder}
          secureTextEntry={concealable && !revealed}
          style={[
            styles.input,
            spaced && styles.inputSpaced,
            readOnly && styles.inputReadOnly,
          ]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {concealable ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? "Hide password" : "Show password"}
            hitSlop={10}
            onPress={() => setRevealed((value) => !value)}
          >
            <MaterialIcons
              name={revealed ? "visibility" : "visibility-off"}
              size={20}
              color={COLORS.placeholder}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function FormError({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return (
    <View
      style={styles.error}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <MaterialIcons name="error-outline" size={20} color={COLORS.error} />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primary,
        pressed && styles.primaryPressed,
        disabled && !loading && styles.primaryDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.onPrimary} />
      ) : (
        <Text style={styles.primaryText}>{label}</Text>
      )}
    </Pressable>
  );
}

export function TextLink({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" hitSlop={10} onPress={onPress}>
      <Text style={styles.link}>{label}</Text>
    </Pressable>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function IconBubble({
  size,
  tint,
  children,
}: {
  size: number;
  tint: string;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: tint,
        },
      ]}
    >
      {children}
    </View>
  );
}

export function Section({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          {title}
        </Text>
        {typeof right === "string" ? (
          <Text style={styles.sectionNote}>{right}</Text>
        ) : (
          right
        )}
      </View>
      {children}
    </View>
  );
}

/** Slides up from the bottom over a dimmed backdrop. */
export function BottomSheet({
  visible,
  onClose,
  children,
  style,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [progress] = React.useState(() => new Animated.Value(0));
  const [mounted, setMounted] = React.useState(visible);

  if (visible && !mounted) setMounted(true);

  React.useEffect(() => {
    if (visible) {
      Animated.spring(progress, {
        toValue: 1,
        damping: 24,
        stiffness: 240,
        overshootClamping: true,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(progress, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, progress]);

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.backdrop, { opacity: progress }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={onClose}
        />
      </Animated.View>
      <Animated.View
        accessibilityViewIsModal
        style={[
          styles.sheet,
          {
            maxHeight: height * 0.88,
            paddingBottom: Math.max(insets.bottom, 16) + 16,
            transform: [
              {
                translateY: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [height, 0],
                }),
              },
            ],
          },
          style,
        ]}
      >
        <View style={styles.handle} />
        {children}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fields: { gap: 14 },
  field: { gap: 6 },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.onSurface,
  },
  fieldAction: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.primary,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 54,
    paddingLeft: 16,
    paddingRight: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  inputBoxFocused: { borderWidth: 2, borderColor: COLORS.primary },
  inputBoxReadOnly: {
    borderColor: COLORS.surfaceLow,
    backgroundColor: COLORS.surfaceLow,
  },
  input: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    // The box border already shows focus, so drop the browser's own ring
    ...Platform.select<object>({ web: { outlineStyle: "none" } }),
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.onSurface,
  },
  inputSpaced: { letterSpacing: 4 },
  inputReadOnly: { color: COLORS.onSurfaceMuted },

  error: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: COLORS.errorContainer,
  },
  errorText: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.error,
  },

  primary: {
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },
  primaryPressed: {
    backgroundColor: COLORS.primaryPressed,
    transform: [{ scale: 0.98 }],
  },
  primaryDisabled: { opacity: 0.45 },
  primaryText: {
    fontFamily: FONTS.heading,
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.onPrimary,
  },

  link: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.primary,
  },

  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    overflow: "hidden",
  },
  bubble: { alignItems: "center", justifyContent: "center" },

  section: { gap: 12 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
    color: COLORS.onSurface,
  },
  sectionNote: {
    flexShrink: 1,
    fontFamily: FONTS.body,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.onSurfaceMuted,
  },

  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 42, 32, 0.62)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
});
