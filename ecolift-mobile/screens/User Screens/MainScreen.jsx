// @ts-check
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import MapView, {
  UrlTile,
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import * as Location from "expo-location";
import DrawerScreen from "./DrawerScreen";
import PopPremiumScreen from "./PopPremiumScreen";
import LocationDrawerScreen from "./LocationDrawerScreen";
import api from "../../services/Api"; // adjust path if needed
import { getDistance } from "geolib"; // 📦 for distance calc
import AsyncStorage from "@react-native-async-storage/async-storage";
import RideService from "../../services/RideService";
import { useRide } from "../../context/RideContext";
import socket from "../../services/socket";
import { useToast } from "../../context/ToastContext";
import DriverService from "../../services/DriverService";
import RideOngoingBanner from "./RideOngoingBanner";
import RideCompletedPopup from "./RideCompletedPopup";
import RideCancelledPopup from "./RideCancelledPopup";

export const RIDE_STATUSES = {
  REQUESTED: "requested", // when user books
  ACCEPTED: "accepted", // when driver accepts
  COMPLETED: "completed",
  CANCELED: "canceled",
};

const { width, height } = Dimensions.get("window");
const STATUSBAR_HEIGHT = Platform.OS === "ios" ? 44 : StatusBar.currentHeight;
const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

const MainScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState(
    "Fetching location..."
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLocationDrawerOpen, setIsLocationDrawerOpen] = useState(false);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [showRoute, setShowRoute] = useState(false);
  const [startCoords, setStartCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [rideBooked, setRideBooked] = useState(false);
  const [countdownTime, setCountdownTime] = useState(10 * 60); // 10 minutes in seconds
  const [showRideCompletedPopup, setShowRideCompletedPopup] = useState(false);
  const mapRef = useRef(null);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const countdownIntervalRef = useRef(null);
  const [userRole, setUserRole] = useState(null);
  const [rideId, setRideId] = useState(null);
  const [driverPopup, setDriverPopup] = useState(false);
  const [driverDetails, setDriverDetails] = useState(null);
  const [rideFoundOrAccepted, setRideFoundOrAccepted] = useState(false);
  const [chosenDate, setChosenDate] = useState(new Date());
  const [rideAddress, setRideAddress] = useState({
    pickup: "",
    dropOff: "",
  });
  const [rideStarted, setRideStarted] = useState(false);
  const [rideCompleted, setRideCompleted] = useState(false);
  const [rideCancelled, setRideCancelled] = useState(false);
  const [vehicleType, setVehicleType] = useState("2 Wheeler");
  const [statusBar, setStatusBar] = useState("Accepted");

  const [freeRide, setFreeRide] = useState(0);

  useEffect(() => {
    let intervalId;

    const fetchUserData = async () => {
      try {
        const userName = await AsyncStorage.getItem("userEmail");
        const user = await DriverService.getDriverById();
        const userModel = user.find((x) => x.email === userName);
        setFreeRide(userModel?.userProfile?.freeRidesRemaining || 0);
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    };

    // Initial fetch
    fetchUserData();

    // Setup interval to fetch every 3 seconds
    intervalId = setInterval(() => {
      fetchUserData();
    }, 3000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const {
    updateRideData,
    updateRideRequestedData,
    updateUserData,
    userData,
    updateRideOngoingDataUser,
    rideOngoingDataUser,
    rideRequestData,
  } = useRide();

  const { showSuccessToast, showErrorToast, showInfoToast } = useToast();

  const slideAnim = useRef(new Animated.Value(-width * 0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;
  const locationSlideAnim = useRef(new Animated.Value(height)).current;
  const locationOpacityAnim = useRef(new Animated.Value(0)).current;
  const locationShadowAnim = useRef(new Animated.Value(0)).current;
  const rideStatusIntervalRef = useRef(null);

  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (addressResponse.length > 0) {
        const address = addressResponse[0];
        const addressParts = [];
        if (address.name) addressParts.push(address.name);
        if (address.street && address.name !== address.street)
          addressParts.push(address.street);
        if (address.district) addressParts.push(address.district);
        if (address.city) addressParts.push(address.city);
        return addressParts.length > 0
          ? addressParts.join(", ")
          : "Current Location";
      }
      return "Current Location";
    } catch (error) {
      console.error("Error getting address:", error);
      return "Current Location";
    }
  };

  useEffect(() => {
    let subscription = null;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationAddress("Location access denied");
          return;
        }

        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setLocation(initialLocation.coords);

        const address = await getAddressFromCoordinates(
          initialLocation.coords.latitude,
          initialLocation.coords.longitude
        );
        setLocationAddress(address);

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,
            distanceInterval: 20,
          },
          async (newLocation) => {
            setLocation(newLocation.coords);

            const newAddress = await getAddressFromCoordinates(
              newLocation.coords.latitude,
              newLocation.coords.longitude
            );
            setLocationAddress(newAddress);

            if (mapRef.current && !showRoute) {
              mapRef.current.animateToRegion(
                {
                  latitude: newLocation.coords.latitude,
                  longitude: newLocation.coords.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                },
                1000
              );
            }
          }
        );

        setLocationSubscription(subscription);
      } catch (err) {
        console.error("Error getting current location:", err);
        setLocationAddress("Unable to get location");
      }
    })();

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  useEffect(() => {
    const loadRole = async () => {
      const role = await AsyncStorage.getItem("userRole");
      setUserRole(role);
    };

    loadRole();
  }, []);

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
    const config = { duration: 300, useNativeDriver: true };
    if (isLocationDrawerOpen) {
      Animated.parallel([
        Animated.timing(locationSlideAnim, { toValue: 0, ...config }),
        Animated.timing(locationOpacityAnim, { toValue: 1, ...config }),
        Animated.timing(locationShadowAnim, { toValue: 1, ...config }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(locationSlideAnim, { toValue: height, ...config }),
        Animated.timing(locationOpacityAnim, { toValue: 0, ...config }),
        Animated.timing(locationShadowAnim, { toValue: 0, ...config }),
      ]).start();
    }
  }, [isLocationDrawerOpen]);

  // Countdown timer effect
  useEffect(() => {
    if (rideBooked && countdownTime > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdownTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(countdownIntervalRef.current);
            // Show popup when timer reaches zero
            setShowRideCompletedPopup(true);
            // Reset ride status
            setRideBooked(false);

            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [rideBooked]);

  const calculateRoute = async () => {
    if (startCoords && destCoords) {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${startCoords.longitude},${startCoords.latitude};${destCoords.longitude},${destCoords.latitude}?overview=full&geometries=geojson`
        );
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0].geometry.coordinates.map((coord) => ({
            latitude: coord[1],
            longitude: coord[0],
          }));

          setRouteCoordinates(route);
          setShowRoute(true);

          if (mapRef.current) {
            mapRef.current.fitToCoordinates(route, {
              edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
              animated: true,
            });
          }
        }
      } catch (error) {
        console.error("Error calculating route:", error);
      }
    }
  };

  const getLocationName = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/nearest/v1/driving/${longitude},${latitude}`
      );
      const data = await response.json();

      if (
        data.waypoints &&
        data.waypoints.length > 0 &&
        data.waypoints[0].name
      ) {
        return data.waypoints[0].name;
      } else {
        return "Address not found";
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      return "Error fetching address";
    }
  };

  const bookRide = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId"); // make sure this is stored after login

      if (!startCoords || !destCoords || !userId) {
        console.warn("Missing required data for ride booking");
        Alert.alert("Errorr", "MIssing some data");

        return;
      }

      const distanceInMeters = getDistance(startCoords, destCoords);
      const distanceInKm = parseFloat((distanceInMeters / 1000).toFixed(2));

      const rideData = {
        user: userId,
        pickupLocation: `${startCoords.latitude},${startCoords.longitude}`,
        dropoffLocation: `${destCoords.latitude},${destCoords.longitude}`,
        status: RIDE_STATUSES.REQUESTED,
        distance: distanceInKm,
        isPreBooked: false,
        preBookedDate: new Date().toISOString(), // if needed for scheduled ride
        fare: Math.round(distanceInKm * 50), // example: ₹50/km
        driver: null,
        vehicleType: vehicleType
      };

      const response = await api.post("/ride", rideData);
      updateRideRequestedData({ ...rideData, rideId: response?.data?._id });
      setRideId(response.data._id);
      setRideBooked(true);
      setCountdownTime(10 * 60);
    } catch (error) {
      console.error(
        "❌ Ride booking failed:",
        error.response?.data || error.message
      );
    }
  };

  const closeRideCompletedPopup = () => {
    setShowRideCompletedPopup(false);
    // Reset countdown time for future bookings
    setCountdownTime(10 * 60);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const defaultRegion = {
    latitude: location?.latitude || 27.7097,
    longitude: location?.longitude || 85.323,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const toggleDrawer = () => {
    if (isLocationDrawerOpen) setIsLocationDrawerOpen(false);
    setIsDrawerOpen(!isDrawerOpen);
  };

  const toggleLocationDrawer = () => {
    if (isDrawerOpen) setIsDrawerOpen(false);
    setIsLocationDrawerOpen(!isLocationDrawerOpen);
  };

  const centerOnUserLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  };

  const renderOverlay = () => {
    if (!isDrawerOpen && !isLocationDrawerOpen) return null;
    return (
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={isDrawerOpen ? toggleDrawer : toggleLocationDrawer}
      >
        <Animated.View
          style={[
            styles.overlay,
            { opacity: isDrawerOpen ? opacityAnim : locationOpacityAnim },
          ]}
        />
      </TouchableOpacity>
    );
  };

  const renderOSMAttribution = () => (
    <View style={styles.attributionContainer}>
      <Text style={styles.attributionText}>© OpenStreetMap contributors</Text>
    </View>
  );

  const clearRoute = async () => {
    setShowRoute(false);
    setRouteCoordinates([]);
    setStartCoords(null);
    setDestCoords(null);
    setRideBooked(false);
    if (rideBooked) {
      try {
        await RideService.cancelRide(rideId);
        setCountdownTime(10 * 60);
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
      } catch (err) {
        Alert.alert("Error:", "Error cancelling ride");
      }
    }
  };

  const fetchDriverDataAndUpdateRideOngoingDataForUser = async (driverId) => {
    try {
      const driver = await DriverService.getDriver(driverId);
      updateRideOngoingDataUser({
        ...rideRequestData,
        driver: driver,
        status: "accepted",
      });
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

      fetchDriverDataAndUpdateRideOngoingDataForUser(data.driverId);
      setRideBooked(false);
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
      showSuccessToast("Ride Accepted by driver.");
    });

    socket.on("rideCompleted", (data) => {
      // data example: { rideId, message }
      showSuccessToast(data.message);
      setRideCompleted(true);
    });

    socket.on("rideCancelled", (data) => {
      showSuccessToast("We are sorry to inform you that your ride has been cancelled.");
      setRideCancelled(true);
    });

    socket.on("rideStatusUpdated", (data) => {
      showSuccessToast(data.message);
      setStatusBar(data.status);
    });

    return () => {
      socket.off("rideAccepted");
      socket.off("rideCompleted");
      socket.off("rideCancelled");
    };
  }, []);

  const renderBookRideButton = () => {
    if (!showRoute || rideOngoingDataUser) return null;

    return (
      <TouchableOpacity
        style={[
          styles.bookRideButton,
          rideBooked && countdownTime > 0 ? styles.timerActive : null,
        ]}
        onPress={bookRide}
        disabled={rideBooked && countdownTime > 0}
      >
        {!rideBooked || countdownTime === 0 ? (
          <Text style={styles.bookRideText}>Book a Ride</Text>
        ) : (
          <Text style={styles.timerText}>{formatTime(countdownTime)}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderRideCompletedPopup = () => {
    return (
      <Modal
        visible={showRideCompletedPopup}
        transparent={true}
        animationType="fade"
        onRequestClose={closeRideCompletedPopup}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.popupContainer}>
            <Text style={styles.popupTitle}>No Rides found at the moment!</Text>
            <Text style={styles.popupText}>
              Please Try again after a few moment.
            </Text>
            <TouchableOpacity
              style={styles.popupButton}
              onPress={closeRideCompletedPopup}
            >
              <Text style={styles.popupButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={defaultRegion}
        mapType="none"
        rotateEnabled
        scrollEnabled
        zoomEnabled
        showsUserLocation
        followsUserLocation={false}
        showsMyLocationButton={false}
        loadingEnabled
        loadingIndicatorColor="#008080"
        loadingBackgroundColor="#FFFFFF"
        moveOnMarkerPress={false}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
      >
        {/* {Platform.OS === "android" && (
          <UrlTile
            urlTemplate={OSM_TILE_URL}
            maximumZ={19}
            zIndex={0}
            shouldReplaceMapContent={true}
          />
        )} */}

        {location && !showRoute && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Your Location"
          >
            <View style={styles.markerContainer}>
              <View style={styles.markerInner} />
            </View>
          </Marker>
        )}

        {startCoords && (
          <Marker coordinate={startCoords} title="Starting Point">
            <View style={styles.startMarkerContainer}>
              <MaterialIcons name="trip-origin" size={16} color="#FFF" />
            </View>
          </Marker>
        )}

        {destCoords && (
          <Marker coordinate={destCoords} title="Destination">
            <View style={styles.destMarkerContainer}>
              <MaterialIcons name="location-on" size={16} color="#FFF" />
            </View>
          </Marker>
        )}

        {showRoute && routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={5}
            strokeColor="#008080"
          />
        )}
      </MapView>

      {/* {renderOSMAttribution()} */}

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.menuButton} onPress={toggleDrawer}>
            <Ionicons name="menu" size={24} color="black" />
          </TouchableOpacity>

          {renderBookRideButton()}
          {rideOngoingDataUser && rideOngoingDataUser?.status === "accepted" && (
            <RideOngoingBanner
              pickupLocation={rideRequestData.pickupLocation}
              dropoffLocation={rideRequestData.dropoffLocation}
              fare={rideRequestData?.fare}
              onClose={() => {
                setRideBooked(false);
                setRideStarted(false);
              }}
              status={statusBar}
              rideDetails={rideOngoingDataUser}
              freeRidesRemaining={userData?.freeRidesRemaining}
            />
          )}

          {rideCompleted && (
            <RideCompletedPopup
              driver={rideOngoingDataUser?.driver}
              fare={rideRequestData?.fare}
              visible={true}
              freeRidesRemaining={userData.freeRidesRemaining}
              onClose={() => {
                setRideStarted(false);
                setRouteCoordinates([]);
                setShowRoute(false);
                setStartCoords(null);
                setDestCoords(null);
                setRideBooked(false);
                updateRideOngoingDataUser(null);
                updateRideRequestedData(null);
                setRideCompleted(false);
              } }        />
          )}

          {rideCancelled && (
              <RideCancelledPopup
                  driver={rideOngoingDataUser?.driver}
                  visible={true}
                  onClose={() => {
                    setRideStarted(false);
                    setRouteCoordinates([]);
                    setShowRoute(false);
                    setStartCoords(null);
                    setDestCoords(null);
                    setRideBooked(false);
                    updateRideOngoingDataUser(null);
                    updateRideRequestedData(null);
                    setRideCancelled(false);
                  } }        />
          )}

          <TouchableOpacity
            style={styles.freeRidesPill}
            onPress={() => {
              showInfoToast(
                `You have got ${freeRide} free rides remaining`
              );
            }}
          >
            <Ionicons
              name="trophy"
              size={18}
              color="#FFD700"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.pillText}>
              Free Rides: {freeRide}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.crownButton}
            onPress={() => setShowPremiumPopup(true)}
          >
            <MaterialCommunityIcons name="crown" size={24} color="#008080" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={centerOnUserLocation}
      >
        <MaterialIcons name="my-location" size={24} color="#008080" />
      </TouchableOpacity>

      {showRoute && !rideStarted && (
        <TouchableOpacity style={styles.clearRouteButton} onPress={clearRoute}>
          <MaterialIcons name="close" size={22} color="#008080" />
        </TouchableOpacity>
      )}

      {!rideOngoingDataUser && (
          <View style={styles.bottomContainer}>
            <View style={styles.fromContainer}>
              <Text style={styles.fromLabel}>From: </Text>
              {!location ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#008080" />
                    <Text style={styles.loadingText}>Getting your location...</Text>
                  </View>
              ) : (
                  <Text style={styles.fromText}>{locationAddress}</Text>
              )}
            </View>
            <TouchableOpacity
                style={styles.destinationButton}
                onPress={toggleLocationDrawer}
            >
              <MaterialIcons name="location-on" size={24} color="#008080" />
              <Text style={styles.destinationText}>Where to?</Text>
            </TouchableOpacity>
          </View>
      )}

      {renderOverlay()}
      {renderRideCompletedPopup()}

      <DrawerScreen
        isVisible={isDrawerOpen}
        onClose={toggleDrawer}
        slideAnim={slideAnim}
        //@ts-ignore
        opacityAnim={opacityAnim}
        shadowAnim={shadowAnim}
      />
      <LocationDrawerScreen
        isVisible={isLocationDrawerOpen}
        onClose={toggleLocationDrawer}
        slideAnim={locationSlideAnim}
        opacityAnim={locationOpacityAnim}
        shadowAnim={locationShadowAnim}
        currentLocation={location}
        currentAddress={locationAddress}
        calculateRoute={calculateRoute}
        setStartCoords={setStartCoords}
        setDestCoords={setDestCoords}
        setRideAdress={setRideAddress}
        setVehicleTypes={setVehicleType}
      />
      {showPremiumPopup && (
        <PopPremiumScreen onClose={() => setShowPremiumPopup(false)} />
      )}
    </View>
  );
};

export default MainScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  safeArea: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 },
  map: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  markerContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0, 128, 128, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  markerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#008080",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  startMarkerContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#008080",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  destMarkerContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FF4500",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  attributionContainer: {
    position: "absolute",
    bottom: 100,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 4,
    borderRadius: 3,
    zIndex: 5,
  },
  attributionText: { fontSize: 10, color: "#333" },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? STATUSBAR_HEIGHT : 10,
    paddingBottom: 10,
    marginHorizontal: 10,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginLeft: 5,
  },
  crownButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginRight: 5,
  },
  bookRideButton: {
    height: 44,
    borderRadius: 22,
    backgroundColor: "#008080",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  timerActive: {
    backgroundColor: "#FF8C00", // Change color when timer is active
  },
  bookRideText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  timerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  myLocationButton: {
    position: "absolute",
    right: 20,
    bottom: 140,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10,
  },
  clearRouteButton: {
    position: "absolute",
    right: 20,
    bottom: 195,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10,
  },
  fromContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  fromLabel: { fontSize: 14, color: "#666", fontWeight: "500" },
  fromText: { fontSize: 14, color: "#333", flex: 1 },
  loadingContainer: { flexDirection: "row", alignItems: "center" },
  loadingText: { fontSize: 14, color: "#666", marginLeft: 5 },
  destinationButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  destinationText: { marginLeft: 10, fontSize: 16, color: "#333" },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 999,
  },
  // Modal popup styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContainer: {
    width: width * 0.8,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#008080",
    marginBottom: 15,
  },
  popupText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  popupButton: {
    backgroundColor: "#008080",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  popupButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  rideInfoBanner: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    elevation: 4,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  freeRideButton: {
    position: "relative",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },

  bannerTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },

  bannerDetail: {
    fontSize: 14,
    color: "#555",
  },

  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  freeRidesPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8DC",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFD700",
  },

  pillText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
  },
  ongoingRideButton: {
    marginTop: 8,
    backgroundColor: "#008080",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  ongoingRideButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  rideOngoingButton: {
    position: "absolute",
    right: 20,
    bottom: 200,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10,
  },
});
