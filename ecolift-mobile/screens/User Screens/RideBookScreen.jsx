//@ts-check
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  Platform,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DrawerScreen from "./DrawerScreen";
import api from "../../services/Api";
import { useRide } from "../../context/RideContext";
import socket from "../../services/socket";
import RideService from "../../services/RideService";
import DriverService from "../../services/DriverService";
import { useToast } from "../../context/ToastContext";

const { width } = Dimensions.get("window");

const RideBookScreen = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width * 0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;
  const [availableRiders, setAvailableRiders] = useState([]);
  const [requestedRiderId, setRequestedRiderId] = useState(null);
  const [isRequestPending, setIsRequestPending] = useState(false);
  const requestTimeoutRef = useRef(null);

  const { rideRequestData, userData, rideOngoingDataUser, updateUserData, updateRideOngoingDataUser } = useRide();
  const {showErrorToast, showSuccessToast} = useToast()

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const getAvailableRiders = async () => {
    try {
      const response = await api.get("/driver");
      const ridersAvailable = response.data.filter(
        (val) => val.availableStatus === "available"
      );
      setAvailableRiders(ridersAvailable);
    } catch (err) {
      Alert.alert("Error", "Unable to fetch available rides.");
    }
  };


  useEffect(() => {
    const config = { duration: 300, useNativeDriver: true };
    if (isDrawerOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, ...config }),
        Animated.timing(opacityAnim, { toValue: 1, ...config }),
        Animated.timing(shadowAnim, { toValue: 1, ...config }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -width * 0.8, ...config }),
        Animated.timing(opacityAnim, { toValue: 0, ...config }),
        Animated.timing(shadowAnim, { toValue: 0, ...config }),
      ]).start();
    }
  }, [isDrawerOpen]);

const handleRequestRide = async (riderId) => {
  if (!riderId || rideRequestData == null) {
    return Alert.alert("Please first book the ride");
  }

  try {
    setIsRequestPending(true);
    // Wait for 30 seconds before proceeding
    setRequestedRiderId(riderId);
    await RideService.requestRide(rideRequestData.rideId, riderId);
  } catch (err) {
    setRequestedRiderId(null);
    Alert.alert("Error requesting");
  } finally {
    setIsRequestPending(false);
  }
};


  const fetchDriverData = async (driverId) => {
    try {
      const driver = await DriverService.getDriver(driverId);
      updateRideOngoingDataUser({...rideRequestData, driver:driver});
    } catch (err) {
      showErrorToast("Error finding driver");
    }
  };


  useEffect(() => {
    // Register userId after connecting (replace with your actual userId)
    const userId = userData.user._id;
    socket.emit("register", { userId });

    // Listen for rideAccepted event
    socket.on("rideAccepted", (data) => {
      // data example: { rideId, message }
      fetchDriverData(data.driverId);
      updateUserData({
        ...userData,
        user: {
          ...userData.user,
          freeRidesRemaining:
            userData.user.freeRidesRemaining > 0
              ? userData.user.freeRidesRemaining - 1
              : 0,
        },
      });
      showSuccessToast("Ride Accepted by driver");
    });


    return () => {
      socket.off("rideAccepted");
    };
  }, []);


  useEffect(() => {
    getAvailableRiders();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header & Drawer Toggle */}
      <SafeAreaView style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={toggleDrawer}
          accessibilityLabel="Toggle drawer"
        >
          <Ionicons name="menu" size={24} color="black" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        <Ionicons name="car-sport-outline" size={200} color="#008080" />
        <Text style={styles.titleText}>Available riders</Text>
        <Text style={styles.paragraphText}>
          Looking for riders to give you a lift? People below are willing to
          provide you lift at the moment! Liink up and reach your destination
          with ease. Click on the rider to see the details and accept the ride.
          Happy Riding! 🚗💨
        </Text>
        {availableRiders && availableRiders.length > 0 ? (
          availableRiders.map((val) => {
            return (
              <View key={val._id} style={styles.riderCard}>
                <View style={styles.riderInfo}>
                  <Text style={styles.riderName}>
                    {val?.user?.name || "No Name"}
                  </Text>
                  <Text style={styles.riderEmail}>
                    {val?.user?.email || "No Email"}
                  </Text>
                  <Text style={styles.riderRating}>
                    ⭐ Rating: {val?.user?.rating ?? "N/A"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.requestButton}
                  onPress={() => handleRequestRide(val._id)}
                  disabled={isRequestPending}
                >
                  {isRequestPending && requestedRiderId === val._id ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.requestButtonText}>Request Ride</Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <Text style={styles.paragraphText}>
            No available riders at the moment.
          </Text>
        )}
      </View>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={toggleDrawer}
          />
        </Animated.View>
      )}

      {/* Drawer Menu */}
      <DrawerScreen
        isVisible={isDrawerOpen}
        onClose={toggleDrawer}
        slideAnim={slideAnim}
        // @ts-ignore
        opacityAnim={opacityAnim}
        shadowAnim={shadowAnim}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    position: "absolute",
    top: Platform.OS === "android" ? StatusBar.currentHeight : 10,
    left: 10,
    zIndex: 10,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    margin: 20,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 100,
    alignItems: "center",
  },
  titleText: {
    fontSize: 22,
    color: "#000",
    fontWeight: "600",
    marginTop: 20,
  },
  paragraphText: {
    fontSize: 18,
    color: "#000",
    fontWeight: "400",
    marginTop: 20,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 999,
  },
  riderCard: {
    width: "90%",
    padding: 16,
    backgroundColor: "#f0f8ff",
    borderRadius: 10,
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  riderInfo: {
    flex: 1,
  },
  riderName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  riderEmail: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  riderRating: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  requestButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#008080",
    borderRadius: 8,
  },
  requestButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default RideBookScreen;
