import { useEffect, useRef } from "react";
import { Animated } from "react-native";

// ── Custom Hook for Animations ───────────────────────────────────────────────
export function useAQIAnimations(aqi: number | null, gaugePercent: number) {
  const gaugeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const plantBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (aqi == null) return;

    Animated.parallel([
      Animated.spring(gaugeAnim, {
        toValue: gaugePercent,
        tension: 60,
        friction: 10,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 70,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(plantBounce, {
            toValue: -6,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(plantBounce, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });
  }, [aqi, gaugePercent, gaugeAnim, fadeAnim, scaleAnim, plantBounce]);

  return { gaugeAnim, fadeAnim, scaleAnim, plantBounce };
}
