import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { getRecommendedActivities } from "@/utils/activityRecommendations";
import { ActivityDetails } from "@/types/activities_type";

const COLORS = {
  primary: "#006944",
  surfaceHighest: "#d7dedc",
  onSurface: "#2b302f",
  surfaceLowest: "#ffffff",
};

interface Props {
  aqi: number | null;
}

export function DailyActivitiesBento({ aqi }: Props) {
  const currentHour = new Date().getHours();
  const recom = getRecommendedActivities(aqi, currentHour);

  // State to track which activity was tapped
  const [selectedActivity, setSelectedActivity] =
    useState<ActivityDetails | null>(null);

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Daily Activities</Text>

      {/* ── Top Wide Card: Primary Recommendation ── */}
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.bentoWide}
        onPress={() => setSelectedActivity(recom.primary)}
      >
        <ImageBackground
          source={{ uri: recom.primary.image }}
          style={styles.bentoImage}
        >
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.bentoGradient}
          >
            <View style={styles.badgeWrapper}>
              <Text style={styles.badgeText}>{recom.primary.badge}</Text>
            </View>
            <Text style={styles.bentoWideTitle}>{recom.primary.title}</Text>
            <Text style={styles.bentoWideSubtitle}>
              {recom.primary.subtitle}
            </Text>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>

      {/* ── Bottom Row: 2 Secondary Recommendations ── */}
      <View style={styles.bentoRow}>
        {/* Secondary 1 */}
        <TouchableOpacity
          style={[
            styles.bentoSquare,
            { backgroundColor: COLORS.surfaceHighest },
          ]}
          onPress={() => setSelectedActivity(recom.secondary1)}
        >
          <View
            style={[
              styles.iconWrapperSmall,
              { backgroundColor: recom.secondary1.color + "20" },
            ]}
          >
            <MaterialCommunityIcons
              name={recom.secondary1.icon as any}
              size={22}
              color={recom.secondary1.color}
            />
          </View>
          <View>
            <Text style={styles.bentoSquareTitle}>
              {recom.secondary1.title}
            </Text>
            <Text
              style={[
                styles.bentoSquareAlert,
                { color: recom.secondary1.color },
              ]}
            >
              {recom.secondary1.alert}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Secondary 2 */}
        <TouchableOpacity
          style={[
            styles.bentoSquare,
            {
              backgroundColor: recom.secondary2.color + "10",
              borderWidth: 1,
              borderColor: recom.secondary2.color + "15",
            },
          ]}
          onPress={() => setSelectedActivity(recom.secondary2)}
        >
          <View
            style={[
              styles.iconWrapperSmall,
              { backgroundColor: recom.secondary2.color + "15" },
            ]}
          >
            <MaterialCommunityIcons
              name={recom.secondary2.icon as any}
              size={22}
              color={recom.secondary2.color}
            />
          </View>
          <View>
            <Text style={styles.bentoSquareTitle}>
              {recom.secondary2.title}
            </Text>
            <Text
              style={[
                styles.bentoSquareAlert,
                { color: recom.secondary2.color },
              ]}
            >
              {recom.secondary2.alert}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Contextual Bottom Sheet Modal ── */}
      <Modal
        visible={!!selectedActivity}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedActivity(null)}
      >
        <View style={styles.modalOverlay}>
          {/* Tapping the dark background closes the modal */}
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setSelectedActivity(null)}
          />

          <View style={styles.bottomSheet}>
            {/* Grabber handle */}
            <View style={styles.grabber} />

            {/* Header */}
            <View style={styles.sheetHeader}>
              <View
                style={[
                  styles.sheetIconWrapper,
                  {
                    backgroundColor:
                      (selectedActivity?.color || COLORS.primary) + "15",
                  },
                ]}
              >
                {selectedActivity?.icon ? (
                  <MaterialCommunityIcons
                    name={selectedActivity.icon as any}
                    size={28}
                    color={selectedActivity.color}
                  />
                ) : (
                  <Ionicons name="leaf" size={28} color={COLORS.primary} />
                )}
              </View>
              <Text style={styles.sheetTitle}>{selectedActivity?.title}</Text>
              {selectedActivity?.badge || selectedActivity?.alert ? (
                <Text
                  style={[
                    styles.sheetAlert,
                    { color: selectedActivity?.color || COLORS.primary },
                  ]}
                >
                  {selectedActivity?.badge || selectedActivity?.alert}
                </Text>
              ) : null}
            </View>

            {/* Context / The "Why" */}
            <View style={styles.contextBox}>
              <MaterialCommunityIcons
                name="air-filter"
                size={20}
                color={COLORS.onSurface}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.contextText}>
                <Text style={{ fontWeight: "700" }}>
                  Current AQI is {aqi ?? "--"}.
                </Text>{" "}
                {selectedActivity?.subtitle ||
                  "This activity is highly recommended right now."}
              </Text>
            </View>

            {/* ── NEW: Dynamic Prep Tips ── */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: 12,
              }}
            >
              <Text style={[styles.prepTitle, { marginBottom: 0 }]}>
                Preparation Tips
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "800",
                  color: COLORS.primary,
                }}
              >
                +{selectedActivity?.points} Eco Points
              </Text>
            </View>

            {selectedActivity?.prepTips?.map((tip, index) => (
              <View key={index} style={styles.prepRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={selectedActivity.color || COLORS.primary}
                />
                <Text style={styles.prepText}>{tip}</Text>
              </View>
            ))}

            {/* Prep Tips */}
            <Text style={styles.prepTitle}>Preparation</Text>
            <View style={styles.prepRow}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.prepText}>
                Log this activity to earn 50 Eco Points
              </Text>
            </View>
            <View style={styles.prepRow}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.prepText}>
                Helps maintain daily wellness streak
              </Text>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: selectedActivity?.color || COLORS.primary },
              ]}
              onPress={() => {
                alert(`Started ${selectedActivity?.title}!`);
                setSelectedActivity(null);
              }}
            >
              <Text style={styles.primaryButtonText}>Start Activity</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setSelectedActivity(null)}
            >
              <Text style={styles.secondaryButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... Keep all your existing bento grid styles here ...
  sectionContainer: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.onSurface,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  bentoWide: {
    height: 160,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 12,
  },
  bentoImage: { width: "100%", height: "100%", justifyContent: "flex-end" },
  bentoGradient: { padding: 16, paddingTop: 40 },
  badgeWrapper: {
    backgroundColor: "#006944",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  bentoWideTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 2,
  },
  bentoWideSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "500",
  },
  bentoRow: { flexDirection: "row", gap: 12 },
  bentoSquare: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 20,
    padding: 16,
    justifyContent: "space-between",
  },
  iconWrapperSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  bentoSquareTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  bentoSquareAlert: { fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },

  // ── Modal & Bottom Sheet Styles ──
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  bottomSheet: {
    backgroundColor: COLORS.surfaceLowest,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40, // Extra padding for safe area
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  grabber: {
    width: 40,
    height: 5,
    backgroundColor: "#e4e9e7",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 24,
  },
  sheetHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  sheetIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  sheetAlert: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  contextBox: {
    flexDirection: "row",
    backgroundColor: "#f3f7f5",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: "center",
  },
  contextText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.onSurface,
    lineHeight: 20,
  },
  prepTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.onSurface,
    marginBottom: 12,
  },
  prepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  prepText: {
    fontSize: 14,
    color: COLORS.onSurface,
    marginLeft: 8,
    fontWeight: "500",
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 24,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  secondaryButtonText: {
    color: "#737876",
    fontSize: 15,
    fontWeight: "700",
  },
});
