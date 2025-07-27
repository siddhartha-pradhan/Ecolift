import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";

const RideCancelledRiderPopup = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>You have cancelled your ride.</Text>
          <Text
            style={{
              color: "#ed2c46", // forest green for success
              fontWeight: "bold",
              fontSize: 16,
              marginTop: 12,
              padding: 8,
              backgroundColor: "#f8d5d5", // light green background
              borderRadius: 8,
              textAlign: "center",
            }}
          >
            5 Points Deducted{" "}
            <MaterialCommunityIcons name="star" />
          </Text>

          <Text style={styles.cashNote}>
            As you cancelled a ride, you have been charged a cancellation fee of 5 points.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.rejectButton} onPress={onClose}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default RideCancelledRiderPopup;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  label: {
    fontWeight: "600",
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: "#444",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  rejectButton: {
    backgroundColor: "#f44336",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  cashNote: {
    marginTop: 20,
    fontSize: 14,
    fontStyle: "italic",
    color: "#666",
    textAlign: "center",
  },
});
