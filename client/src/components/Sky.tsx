import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type StyleProp,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BRAND_SKY, COLORS, type SkyPalette } from "@/constants/theme";

// Outermost first. Each band is a circle rising from behind the sheet.
const BAND_RADII = [390, 314, 246, 184, 132, 88];
const CENTER_X = 0.76; // Fraction of the frame width
const CENTER_BELOW_FRAME = 12;
const BREATH_MS = 4000;
const SHEET_OVERLAP = 32;

/** The sunrise. Fills its parent, with the sun rising from the bottom edge. */
export function Sky({
  palette = BRAND_SKY,
  scale = 1,
  frameWidth,
  centerX = CENTER_X,
  still = false,
}: {
  palette?: SkyPalette;
  scale?: number;
  /** Width of the parent, when it is narrower than the screen */
  frameWidth?: number;
  centerX?: number;
  still?: boolean;
}) {
  const { width } = useWindowDimensions();
  const [breath] = React.useState(() => new Animated.Value(0));

  // Only breathes while its screen is showing
  useFocusEffect(
    React.useCallback(() => {
      if (still) return;
      let loop: Animated.CompositeAnimation | undefined;
      let active = true;
      const phase = (toValue: number) =>
        Animated.timing(breath, {
          toValue,
          duration: BREATH_MS,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        });

      AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
        if (reduced || !active) return;
        loop = Animated.loop(Animated.sequence([phase(1), phase(0)]));
        loop.start();
      });

      return () => {
        active = false;
        loop?.stop();
      };
    }, [breath, still]),
  );

  return (
    <View
      style={[StyleSheet.absoluteFill, { backgroundColor: palette.base }]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {BAND_RADII.map((baseRadius, index) => {
        const radius = baseRadius * scale;
        return (
          <Animated.View
            key={baseRadius}
            style={{
              position: "absolute",
              width: radius * 2,
              height: radius * 2,
              borderRadius: radius,
              backgroundColor: palette.bands[index],
              left: (frameWidth ?? width) * centerX - radius,
              bottom: -(radius + CENTER_BELOW_FRAME),
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
        );
      })}
    </View>
  );
}

/** Every screen's layout: a sunrise hero with content on a sheet below it. */
export function SkyScreen({
  hero,
  children,
  heroHeight,
  palette = BRAND_SKY,
  skyScale = 1,
  heroGrows = false,
  liftForKeyboard = false,
  tabbed = false,
  sheetStyle,
}: {
  hero: React.ReactNode;
  children: React.ReactNode;
  /** Height on a phone with a 44pt status bar */
  heroHeight: number;
  palette?: SkyPalette;
  skyScale?: number;
  /** Give spare height to the hero instead of the sheet */
  heroGrows?: boolean;
  /** The form sits low on the screen, so lift it above the keyboard */
  liftForKeyboard?: boolean;
  /** The screen sits above the tab bar */
  tabbed?: boolean;
  sheetStyle?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  const scrollRef = React.useRef<ScrollView>(null);
  const [scrollY] = React.useState(() => new Animated.Value(0));
  const minHeight = heroGrows ? heroHeight : heroHeight + insets.top - 44;

  React.useEffect(() => {
    if (!liftForKeyboard) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const shown = Keyboard.addListener("keyboardDidShow", () => {
      // Give KeyboardAvoidingView a moment to resize the scroll area first
      timer = setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: minHeight - SHEET_OVERLAP - insets.top - 8,
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
  }, [liftForKeyboard, minHeight, insets.top]);

  const content = (
    <Animated.ScrollView
      ref={scrollRef}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
      overScrollMode="never"
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true },
      )}
    >
      <View style={[styles.hero, { minHeight }, heroGrows && styles.grow]}>
        <Sky palette={palette} scale={skyScale} />
        <View style={[styles.heroContent, { paddingTop: insets.top + 16 }]}>
          {hero}
        </View>
      </View>

      <View
        style={[
          styles.sheet,
          !heroGrows && styles.sheetGrows,
          { paddingBottom: tabbed ? 24 : Math.max(insets.bottom, 20) },
          sheetStyle,
        ]}
      >
        {children}
      </View>
    </Animated.ScrollView>
  );

  return (
    <View style={[styles.root, { backgroundColor: palette.base }]}>
      <StatusBar style="light" />
      {liftForKeyboard ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.root}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
      {/* Keeps the light status bar readable once the sheet scrolls under it */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.statusStrip,
          {
            height: insets.top,
            backgroundColor: palette.base,
            opacity: scrollY.interpolate({
              inputRange: [0, 48],
              outputRange: [0, 1],
              extrapolate: "clamp",
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  hero: { overflow: "hidden" },
  grow: { flex: 1 },
  heroContent: { paddingHorizontal: 24 },
  sheet: {
    marginTop: -SHEET_OVERLAP,
    paddingTop: 24,
    paddingHorizontal: 24,
    gap: 28,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: SHEET_OVERLAP,
    borderTopRightRadius: SHEET_OVERLAP,
  },
  sheetGrows: { flexGrow: 1 },
  statusStrip: { position: "absolute", top: 0, left: 0, right: 0 },
});
