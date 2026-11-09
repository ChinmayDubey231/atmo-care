import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { type Href, Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import useSocialAuth from "../hooks/useSocialAuth";

// Values mirror the variables in the "Breathe — Sign in redesign" Figma file.
const COLORS = {
  primary: "#006944",
  primaryPressed: "#005c3b",
  onPrimary: "#ffffff",
  surface: "#f3f7f5",
  surfacePressed: "#e9eeec",
  card: "#ffffff",
  onSurface: "#2b302f",
  onSurfaceMuted: "#585c5b",
  placeholder: "#737876",
  border: "#dbe5e1",
  error: "#b31b25",
  errorContainer: "#ffdad6",
  sky: "#002a20",
  mist: "#c9f5de",
  mistHalo: "rgba(201, 245, 222, 0.28)",
};

const FONTS = {
  display: "PlusJakartaSans-ExtraBold",
  heading: "PlusJakartaSans-Bold",
  body: "BeVietnamPro-Regular",
  medium: "BeVietnamPro-Medium",
  semiBold: "BeVietnamPro-SemiBold",
};

// Outermost first. Each band is a circle rising from behind the form sheet.
const SKY_BANDS = [
  { radius: 390, color: "#00382a" },
  { radius: 314, color: "#004834" },
  { radius: 246, color: "#005c41" },
  { radius: 184, color: "#0c7350" },
  { radius: 132, color: "#3fa97f" },
  { radius: 88, color: COLORS.mist },
];
const SKY_CENTER_X = 0.76; // Fraction of the screen width
const SKY_CENTER_BELOW_HERO = 12;
const HERO_MIN_HEIGHT = 340;
const SHEET_OVERLAP = 32;
const BREATH_MS = 4000;

function Sky() {
  const { width } = useWindowDimensions();
  const [breath] = React.useState(() => new Animated.Value(0));

  React.useEffect(() => {
    let loop: Animated.CompositeAnimation | undefined;
    let unmounted = false;
    const phase = (toValue: number) =>
      Animated.timing(breath, {
        toValue,
        duration: BREATH_MS,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      });

    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced || unmounted) return;
      loop = Animated.loop(Animated.sequence([phase(1), phase(0)]));
      loop.start();
    });

    return () => {
      unmounted = true;
      loop?.stop();
    };
  }, [breath]);

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {SKY_BANDS.map(({ radius, color }, index) => (
        <Animated.View
          key={radius}
          style={{
            position: "absolute",
            width: radius * 2,
            height: radius * 2,
            borderRadius: radius,
            backgroundColor: color,
            left: width * SKY_CENTER_X - radius,
            bottom: -(radius + SKY_CENTER_BELOW_HERO),
            transform: [
              {
                // Inner bands swell a little further, like an inhale
                scale: breath.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1 + (6 + index * 1.5) / radius],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
}

/** Sunrise hero with a form sheet. Children render inside the sheet. */
export function AuthScreen({
  title,
  subtitle,
  onBack,
  children,
}: {
  title: string;
  subtitle: string;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const scrollRef = React.useRef<ScrollView>(null);

  // The form sits low on the screen, so lift it above the keyboard
  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const shown = Keyboard.addListener("keyboardDidShow", () => {
      // Give KeyboardAvoidingView a moment to resize the scroll area first
      timer = setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: HERO_MIN_HEIGHT - SHEET_OVERLAP - insets.top - 8,
          animated: true,
        });
      }, 80);
    });
    const hidden = Keyboard.addListener("keyboardDidHide", () => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    });
    return () => {
      clearTimeout(timer);
      shown.remove();
      hidden.remove();
    };
  }, [insets.top]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.root}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.hero}>
            <Sky />
            <View style={[styles.heroCopy, { paddingTop: insets.top + 19 }]}>
              <View style={styles.brand}>
                {onBack ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                    hitSlop={10}
                    onPress={onBack}
                    style={styles.markHalo}
                  >
                    <MaterialIcons
                      name="arrow-back"
                      size={18}
                      color={COLORS.mist}
                    />
                  </Pressable>
                ) : (
                  <View style={styles.markHalo}>
                    <View style={styles.markCore} />
                  </View>
                )}
                <Text style={styles.wordmark}>Breathe</Text>
              </View>
              <Text accessibilityRole="header" style={styles.title}>
                {title}
              </Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
          </View>

          <View
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, 20) },
            ]}
          >
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

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
      <View style={[styles.inputBox, focused && styles.inputBoxFocused]}>
        <TextInput
          {...input}
          ref={inputRef}
          accessibilityLabel={label}
          placeholderTextColor={COLORS.placeholder}
          secureTextEntry={concealable && !revealed}
          style={[styles.input, spaced && styles.inputSpaced]}
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

export function FormError({ message }: { message: string | null }) {
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
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
  loading: boolean;
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

function SocialButton({
  icon,
  label,
  onPress,
  disabled,
  loading,
}: {
  icon: "google" | "apple";
  label: string;
  onPress: () => void;
  disabled: boolean;
  loading: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Continue with ${label}`}
      accessibilityState={{ disabled, busy: loading }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.social, pressed && styles.socialPressed]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.onSurface} />
      ) : (
        <>
          <AntDesign name={icon} size={18} color={COLORS.onSurface} />
          <Text style={styles.socialText}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

/** The "or" divider followed by the Google and Apple buttons. */
export function SocialSignIn() {
  const { handleSocialAuth, loadingStrategy } = useSocialAuth();

  return (
    <>
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialRow}>
        <SocialButton
          icon="google"
          label="Google"
          onPress={() => handleSocialAuth("oauth_google")}
          disabled={!!loadingStrategy}
          loading={loadingStrategy === "oauth_google"}
        />
        <SocialButton
          icon="apple"
          label="Apple"
          onPress={() => handleSocialAuth("oauth_apple")}
          disabled={!!loadingStrategy}
          loading={loadingStrategy === "oauth_apple"}
        />
      </View>
    </>
  );
}

export function AuthFooter({
  prompt,
  linkLabel,
  href,
}: {
  prompt: string;
  linkLabel: string;
  href: Href;
}) {
  return (
    <View style={styles.footer}>
      <View style={styles.footerRow}>
        <Text style={styles.prompt}>{prompt}</Text>
        <Link href={href} asChild>
          <Pressable accessibilityRole="link" hitSlop={10}>
            <Text style={styles.link}>{linkLabel}</Text>
          </Pressable>
        </Link>
      </View>
      <Text style={styles.legal}>{"Privacy Policy  ·  Terms of Service"}</Text>
    </View>
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

/** One link is centred; several spread across the sheet. */
export function LinkRow({ children }: { children: React.ReactNode }) {
  const justifyContent =
    React.Children.count(children) > 1 ? "space-between" : "center";
  return <View style={[styles.linkRow, { justifyContent }]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.sky },
  scrollContent: { flexGrow: 1 },

  hero: { flex: 1, minHeight: HERO_MIN_HEIGHT, overflow: "hidden" },
  heroCopy: { paddingHorizontal: 24 },
  brand: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 40 },
  markHalo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.mistHalo,
  },
  markCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.mist,
  },
  wordmark: {
    fontFamily: FONTS.display,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.4,
    color: COLORS.onPrimary,
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.8,
    color: COLORS.onPrimary,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.mist,
    marginTop: 8,
  },

  sheet: {
    marginTop: -SHEET_OVERLAP,
    paddingTop: 28,
    paddingHorizontal: 24,
    gap: 20,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: SHEET_OVERLAP,
    borderTopRightRadius: SHEET_OVERLAP,
  },

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

  divider: { flexDirection: "row", alignItems: "center", gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.onSurfaceMuted,
  },

  socialRow: { flexDirection: "row", gap: 12 },
  social: {
    flex: 1,
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
  socialPressed: { backgroundColor: COLORS.surfacePressed },
  socialText: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: COLORS.onSurface,
  },

  footer: { alignItems: "center", gap: 10 },
  footerRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  prompt: {
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.onSurfaceMuted,
  },
  link: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.primary,
  },
  legal: {
    fontFamily: FONTS.body,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.onSurfaceMuted,
  },
  linkRow: { flexDirection: "row" },
});
