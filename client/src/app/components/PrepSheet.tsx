import { ActivityDetails } from "@/types/activities_type";
import { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge } from "./activities-subcomponents";
import { T } from "@/constants/theme";

function PrepSheet({
  visible,
  item,
  onClose,
}: {
  visible: boolean;
  item: ActivityDetails | null;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        damping: 20,
        stiffness: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!item) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.sheetOverlay} onPress={onClose} />
      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: insets.bottom + 24, transform: [{ translateY }] },
        ]}
      >
        {/* Handle */}
        <View style={styles.sheetHandle} />

        <Badge
          label={item.badge ?? item.alert}
          style={{ alignSelf: "flex-start", marginBottom: 8 }}
        />
        <Text style={styles.sheetTitle}>{item.title}</Text>
        <Text style={styles.sheetSubtitle}>
          {item.subtitle ?? `Get ready for: ${item.title}`}
        </Text>

        <Text style={styles.tipsLabel}>PREP TIPS</Text>
        {item.prepTips.map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.sheetCta} onPress={onClose}>
          <Text style={styles.sheetCtaText}>
            Log Activity · +{item.points} pts
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

export default PrepSheet;

const styles = StyleSheet.create({
  // Bottom Sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: T.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "75%",
    ...Platform.select({
      android: { elevation: 24 },
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: -4 },
      },
    }),
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: T.border,
    borderRadius: 99,
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: T.text,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  sheetSubtitle: {
    fontSize: 13,
    color: T.muted,
    lineHeight: 20,
    marginBottom: 20,
  },
  tipsLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: T.muted,
    marginBottom: 10,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: T.border,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: T.green,
    marginTop: 7,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: T.text,
    lineHeight: 22,
  },
  sheetCta: {
    backgroundColor: T.green,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  sheetCtaText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
