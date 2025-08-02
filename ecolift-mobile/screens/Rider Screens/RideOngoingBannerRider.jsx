// @ts-check
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const RideOngoingBannerRider = ({ rideDetails, onComplete, onCancel, isCompleting, isCancelling, rideAddress }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!rideDetails) return null;

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((prev) => !prev);
  };

  return (
      <View style={styles.container}>
        <TouchableOpacity onPress={toggleExpanded} style={styles.toggleHeader}>
          <Text style={styles.title}>
            {isExpanded ? "▼ Ride Ongoing" : "▶ Ride Ongoing"}
          </Text>
        </TouchableOpacity>

        {isExpanded && (
            <>
              <Text style={styles.label}>User's Name:</Text>
              <Text style={styles.value}>{rideDetails?.userProfile?.user?.name}</Text>

              <Text style={styles.label}>Pickup:</Text>
              <Text style={styles.value}>{rideAddress.pickup}</Text>

              <Text style={styles.label}>Dropoff:</Text>
              <Text style={styles.value}>{rideAddress.dropoff}</Text>

              <Text style={styles.label}>Status</Text>
              <Text style={styles.value}>{rideDetails?.status}</Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.completeButton} onPress={onComplete}>
                  {isCompleting ? (
                      <ActivityIndicator color="#fff" />
                  ) : (
                      <Text style={styles.buttonText}>Complete Ride</Text>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onCancel}
                  disabled={isCancelling || isCompleting}
              >
                {isCancelling ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Cancel Ride</Text>
                )}
              </TouchableOpacity>
            </>
        )}
      </View>
  );
};

export default RideOngoingBannerRider;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingTop: 10,
    padding: 20,
    borderTopColor: "#ccc",
    borderTopWidth: 1,
    elevation: 10,
    width: "100%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  toggleHeader: {
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  label: {
    fontWeight: "600",
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    color: "#444",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  completeButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#f44336",
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
});
