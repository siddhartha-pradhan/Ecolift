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
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DrawerScreenRider from "./DrawerScreenRider";
import api from "../../services/Api";
import RideService from "../../services/RideService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRide } from "../../context/RideContext";
import { useToast } from "../../context/ToastContext";
import { useNavigation } from "@react-navigation/native"; // ✅ import navigation
import RideBookScreenChildRider from "./RideBookScreenChildRider";
import DriverService from "../../services/DriverService";

const { width } = Dimensions.get("window");

const RideBookScreenRider = () => {
  const navigation = useNavigation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width * 0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef(null);
  const { userData, updateRideData, updateRideOngoingDataRider, rideOngoingDataRider } = useRide();
  const { showSuccessToast, showErrorToast } = useToast();
  const [rideAddress, setRideAddress] = useState({
    pickup: "",
    dropOff: "",
  });

  const [driverData, setDriverData] = useState();

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        const userName = await AsyncStorage.getItem("userEmail");
        const driver = await DriverService.getDriverById();
        const driverModel = driver.find((x) => x.email === userName);
        setDriverData(driverModel);
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchDriverData();
  }, []);

  const [rideRequests, setRideRequests] = useState([]);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const fetchRequestedRides = async () => {
    try {
      if (!driverData) return;

      const res = await api.get(`/ride`);
      var requestedRides = res?.data?.filter(
        (val) => val.status === "requested"
      );
      const declinedRides = await RideService.getDeclineRides(userData.user._id);
      const declineRideIds = declinedRides?.map((val)=>val.ride);
      // @ts-ignore
      requestedRides = requestedRides.filter((val)=> !declineRideIds.includes(val._id) && val.vehicleType === driverData?.driverProfile?.vehicleDetails);
      setRideRequests(requestedRides);
    } catch (err) {
      showErrorToast("Error fetching rides");
    }
  };

  const acceptRide = async (rideId) => {
    try {
      await RideService.acceptRide(rideId, userData.user._id);
      const rideDetails = await RideService.getRideDetails(rideId);
      updateRideData(rideDetails);
      updateRideOngoingDataRider({ ...rideDetails });
      showSuccessToast("Succesffuly accepted ride, Ride Started");
      // @ts-ignore
      navigation.navigate("MainScreenRider");
    } catch (err) {
      console.error(err);
    }
  };

   const declineRides = async (rideId) => {
    try {
      await RideService.declineRide(rideId, userData.user._id);
      fetchRequestedRides()
      showSuccessToast("Succesffuly declined ride, Ride Started");
      // @ts-ignore
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!driverData) return;

    fetchRequestedRides(); // now it will only run after driverData is set

    intervalRef.current = setInterval(fetchRequestedRides, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [driverData]);

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

  // Example coordinates

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
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Ionicons name="car-sport-outline" size={200} color="#008080" />
        <Text style={styles.titleText}>Available Riders</Text>
        <Text style={styles.paragraphText}>
          Looking for passenger to give lift? People below need lift at the
          moment! You can pick them up and drop them at their destination. Click
          on the passenger to see the details and accept the ride. Happy Riding!
          🚗💨
        </Text>

        {rideOngoingDataRider ? (
            <Text style={styles.paragraphText}>
              You can not accept any rides at the moment, you have an ongoing ride. Please cancel or complete the ongoing ride to accept new rides.
            </Text>
        ) : (
          rideRequests && rideRequests.length > 0 ? (
            rideRequests.map((request) => {
              return(
              <View key={request._id}>
              <RideBookScreenChildRider request={request} acceptRide={acceptRide} declineRide={declineRides} />;
              </View>)
            })
          ) : (
              <Text style={styles.paragraphText}>
                No any available rides
              </Text>
          )
        )}
      </ScrollView>

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
      <DrawerScreenRider
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
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 80 : 100,
    alignItems: "center",
    paddingBottom: 40,
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
  rideBox: {
    width: "90%",
    backgroundColor: "#e0f7fa",
    borderRadius: 12,
    padding: 20,
    marginTop: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  rideBoxTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    color: "#00796b",
  },
  rideBoxText: {
    fontSize: 16,
    color: "#004d40",
    marginBottom: 5,
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
 
 
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default RideBookScreenRider;
