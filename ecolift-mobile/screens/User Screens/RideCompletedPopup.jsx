import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";

const RideCompletedPopup = ({
  visible,
  onClose,
  driver,
  fare,
  freeRidesRemaining
}) => {
  if (!driver) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>🚗 You have reached your destination</Text>

          <Text style={styles.label}>Driver Name:</Text>
          <Text style={styles.value}>{driver?.user?.name}</Text>

          <Text style={styles.label}>Driver Phone:</Text>
          <Text style={styles.value}>{driver?.user?.phonenumber}</Text>

          <Text style={styles.label}>Fare:</Text>
          <Text style={styles.value}>{fare}</Text>

          <Text style={styles.cashNote}>
            You have completed your ride worth of Rs {fare}.
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

export default RideCompletedPopup;

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
