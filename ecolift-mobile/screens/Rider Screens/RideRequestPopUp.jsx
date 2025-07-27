//@ts-check
import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

const RideRequestPopUp = ({
  visible,
  onAccept,
  onIgnore,
  rideDetails,
  isAccepting,
}) => {
  if (!rideDetails) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>New Ride Request</Text>

          <Text style={styles.label}>User:</Text>
          <Text style={styles.value}>
            {rideDetails.userProfile?.user?.name}
          </Text>

          <Text style={styles.label}>Pickup:</Text>
          <Text style={styles.value}>{rideDetails.pickupLocation}</Text>

          <Text style={styles.label}>Dropoff:</Text>
          <Text style={styles.value}>{rideDetails.dropoffLocation}</Text>

          {/* Add more ride details as needed */}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
              {isAccepting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Accept</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectButton} onPress={onIgnore}>
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default RideRequestPopUp;

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
});
