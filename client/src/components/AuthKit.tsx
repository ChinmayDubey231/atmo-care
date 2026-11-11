import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { type Href, Link } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SkyScreen } from "@/components/Sky";
import { BRAND_SKY, COLORS, FONTS, withAlpha } from "@/constants/theme";
import useSocialAuth from "@/hooks/useSocialAuth";

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
  return (
    <SkyScreen
      heroHeight={340}
      heroGrows
      liftForKeyboard
      sheetStyle={styles.sheet}
      hero={
        <>
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
                  color={BRAND_SKY.mist}
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
        </>
      }
    >
      {children}
    </SkyScreen>
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

/** One link is centred; several spread across the sheet. */
export function LinkRow({ children }: { children: React.ReactNode }) {
  const justifyContent =
    React.Children.count(children) > 1 ? "space-between" : "center";
  return <View style={[styles.linkRow, { justifyContent }]}>{children}</View>;
}

const styles = StyleSheet.create({
  sheet: { paddingTop: 28, gap: 20 },

  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 3,
    marginBottom: 40,
  },
  markHalo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: withAlpha(BRAND_SKY.mist, 0.28),
  },
  markCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: BRAND_SKY.mist,
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
    color: BRAND_SKY.mist,
    marginTop: 8,
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
  socialPressed: { backgroundColor: COLORS.surfaceLow },
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
