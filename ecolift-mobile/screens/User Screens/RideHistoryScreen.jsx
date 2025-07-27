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
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DrawerScreen from "./DrawerScreen";
import RideService from "../../services/RideService";
import { useRide } from "../../context/RideContext";
import RideHistoryCardChild from "./RideHistoryCardChild";

const { width } = Dimensions.get("window");

const RideHistoryScreen = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [rideHistory, setRideHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const slideAnim = useRef(new Animated.Value(-width * 0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;
  const { userData } = useRide();

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
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

  useEffect(() => {
    const fetchRideHistory = async () => {
      try {
        const response = await RideService.getRideHistory(userData.user._id);
        setRideHistory(response ?? []);
      } catch (error) {
        console.error("Error fetching ride history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRideHistory();
  }, []);

  const renderRideCard = (ride, index) => (
    <View key={index} style={styles.rideCard}>
      <Text style={styles.rideTitle}>Ride #{index + 1}</Text>
      <View style={styles.rideInfo}>
        <Text style={styles.label}>From:</Text>
        <Text style={styles.value}>{ride?.pickupLocation}</Text>
      </View>
      <View style={styles.rideInfo}>
        <Text style={styles.label}>To:</Text>
        <Text style={styles.value}>{ride?.dropoffLocation}</Text>
      </View>
      <View style={styles.rideInfo}>
        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>
          {new Date(ride?.createdAt).toLocaleString()}
        </Text>
      </View>
      <View style={styles.rideInfo}>
        <Text style={styles.label}>Distance:</Text>
        <Text style={styles.value}>{ride?.distance} km</Text>
      </View>
      <View style={styles.rideInfo}>
        <Text style={styles.label}>Points Earned:</Text>
        <Text style={styles.value}>{Math.ceil(ride.distance)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.headerContainer}>
        <TouchableOpacity style={styles.menuButton} onPress={toggleDrawer}>
          <Ionicons name="menu" size={24} color="black" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        <MaterialCommunityIcons name="history" size={100} color="#008080" />
        <Text style={styles.titleText}>Your recent Ride history</Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#008080"
            style={{ marginTop: 20 }}
          />
        ) : (
          <ScrollView contentContainerStyle={{}}>
            {rideHistory && rideHistory.length === 0 ? (
              <Text style={{}}>No rides found.</Text>
            ) : (
              rideHistory.map((val, index) => {
                return (
                  <View>
                    <RideHistoryCardChild ride={val} index={index} />
                  </View>
                );
              })
            )}
          </ScrollView>
        )}
      </View>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <TouchableOpacity style={styles.overlay} onPress={toggleDrawer}>
          <Animated.View style={[styles.overlay, { opacity: opacityAnim }]} />
        </TouchableOpacity>
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
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 999,
  },
  rideCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    width: 350,
  },
  rideTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  rideInfo: {
    flexDirection: "row",
    marginBottom: 6,
  },
  label: {
    fontWeight: "500",
    color: "#555",
    width: 120,
  },
  value: {
    color: "#222",
    flexShrink: 1,
  },
});

export default RideHistoryScreen;
