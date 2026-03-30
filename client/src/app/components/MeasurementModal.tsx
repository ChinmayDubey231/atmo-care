import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React from "react";
import {
  measurements,
  MeasurementOption,
} from "../../utils/measurementUnitsConfig";

interface MeasurementModalProps {
  modalVisible: boolean;
  selectedValue: string;
  onSelect: (item: MeasurementOption) => void;
  onClose: () => void;
}

const MeasurementModal = ({
  modalVisible,
  selectedValue,
  onSelect,
  onClose,
}: MeasurementModalProps) => {
  return (
    <Modal visible={modalVisible} transparent animationType="slide">
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Choose an option</Text>

        <FlatList
          data={measurements}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                onSelect(item);
                onClose();
              }}
            >
              <View>
                <Text style={styles.optionLabel}>{item.label}</Text>
                <Text style={styles.optionDesc}>{item.description}</Text>
              </View>
              {selectedValue === item.value && (
                <Text style={styles.check}>✓</Text>
              )}
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ddd",
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#111",
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  optionLabel: {
    fontSize: 15,
    color: "#111",
  },
  optionDesc: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  check: {
    fontSize: 18,
    color: "#007AFF",
  },
  separator: {
    height: 0.5,
    backgroundColor: "#e5e5e5",
  },
});

export default MeasurementModal;
