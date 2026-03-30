import { Animated, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useRef } from "react";
import { MOCK_HISTORY, TOTAL_POINTS } from "@/utils/activityRecommendations";
import { T } from "@/constants/theme";
function StatsBar() {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.statsBar, { opacity }]}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{MOCK_HISTORY.length}</Text>
        <Text style={styles.statLabel}>Logged</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{TOTAL_POINTS}</Text>
        <Text style={styles.statLabel}>Total pts</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>3</Text>
        <Text style={styles.statLabel}>Day streak 🔥</Text>
      </View>
    </Animated.View>
  );
}

export default StatsBar;

const styles = StyleSheet.create({
  // Stats bar
  statsBar: {
    flexDirection: "row",
    backgroundColor: T.card,
    borderRadius: T.radius,
    paddingVertical: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: T.text,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: T.muted,
    marginTop: 2,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: T.border,
  },
});
