// @ts-check
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  UIManager,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

// Enable LayoutAnimation on Android (optional if you want combo animations later)
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const RideOngoingBanner = ({
                             rideDetails,
                             onClose,
                             pickupLocation,
                             dropoffLocation,
                             fare,
                             freeRidesRemaining,
                           }) => {
  const [rideAddress, setRideAddress] = useState({
    pickup: "",
    dropoff: "",
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current; // off-screen initially

  const getLocationName = async (latitude, longitude) => {
    try {
      const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDc4dFNDDhYiOuoAE7YgCu9722UMqHf6bE`
      );
      const data = await response.json();
      if (data.status === "OK" && data.results.length > 0) {
        return data.results[0].formatted_address;
      } else {
        return "Address not found";
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      return "Error fetching address";
    }
  };

  const fetchAddresses = async () => {
    if (!rideDetails) return;
    const pickUppCoords = pickupLocation.split(",");
    const pickupAddress = await getLocationName(
        pickUppCoords[0],
        pickUppCoords[1]
    );
    const dropoffCoords = dropoffLocation.split(",");
    const dropAddress = await getLocationName(
        dropoffCoords[0],
        dropoffCoords[1]
    );
    if (pickupAddress && dropAddress) {
      setRideAddress((p) => ({
        ...p,
        pickup: pickupAddress,
        dropoff: dropAddress,
      }));
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [pickupLocation, dropoffLocation]);

  const toggleExpanded = () => {
    Animated.timing(slideAnim, {
      toValue: isExpanded ? SCREEN_WIDTH : 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsExpanded((prev) => !prev));
  };

  if (!rideDetails) return null;

  return (
      <>
        <TouchableOpacity
            style={styles.fab}
            onPress={toggleExpanded}
        >
          <Text style={styles.fabText}>{isExpanded ? "❌" : "🚗"}</Text>
        </TouchableOpacity>

        <Animated.View
            style={[
              styles.container,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
        >
          <Text style={styles.title}>🚗 Ride Ongoing</Text>

          <Text style={styles.label}>Rider:</Text>
          <Text style={styles.value}>{rideDetails?.driver?.user?.name}</Text>

          <Text style={styles.label}>Phone number:</Text>
          <Text style={styles.value}>{rideDetails?.driver?.user?.phonenumber}</Text>

          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>{rideDetails?.status}</Text>

          <Text style={styles.label}>Vehicle Type:</Text>
          <Text style={styles.value}>{rideDetails?.driver?.vehicleDetails}</Text>

          <Text style={styles.label}>Pickup:</Text>
          <Text style={styles.value}>{rideAddress.pickup || pickupLocation}</Text>

          <Text style={styles.label}>Dropoff:</Text>
          <Text style={styles.value}>{rideAddress.dropoff || dropoffLocation}</Text>
        </Animated.View>
      </>
  );
};

export default RideOngoingBanner;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    width: 300,
    backgroundColor: "#fff",
    padding: 20,
    borderColor: "#ccc",
    borderWidth: 1,
    elevation: 12,
    zIndex: 999,
    minHeight: 380,
  },
  fab: {
    position: "absolute",
    right: 20,
    top: 70,
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 100,
    elevation: 5,
    zIndex: 1000,
  },
  fabText: {
    color: "#fff",
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
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
    marginTop: 30,
  },
  cancelButton: {
    backgroundColor: "#f44336",
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});
