//@ts-check
// MainScreenRider.jsx

import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useRide } from "../../context/RideContext";
import { useToast } from "../../context/ToastContext";
import RideService from "../../services/RideService";
import socket from "../../services/socket";
import DrawerScreenRider from "./DrawerScreenRider";
import RideCompletedRiderPopup from "./RideCompletedRiderPopup";
import RideOngoingBannerRider from "./RideOngoingBannerRider";
import RideCancelledRiderPopup from "./RideCancelledRiderPopup";
import Polyline from "@mapbox/polyline";
import { Polyline as MapPolyline } from "react-native-maps";

const { width, height } = Dimensions.get("window");
const STATUSBAR_HEIGHT = Platform.OS === "ios" ? 44 : StatusBar.currentHeight;
// const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

const MainScreenRider = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState(
    "Fetching location..."
  );
  const {
    userData,
    rideData,
    updateRideData,
    rideOngoingDataRider,
    updateRideOngoingDataRider,
  } = useRide();


  const [rideAddress, setRideAddress] = useState({
    pickup: "",
    dropoff: "",
  });
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  const fetchRoute = async (pickup, dropoff) => {
    try {
      const response = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${pickup}&destination=${dropoff}&key=AIzaSyDc4dFNDDhYiOuoAE7YgCu9722UMqHf6bE`
      );
      const data = await response.json();

      if (data.routes.length) {
        const points = Polyline.decode(data.routes[0].overview_polyline.points);
        const coords = points.map(([latitude, longitude]) => ({
          latitude,
          longitude,
        }));
        setRouteCoordinates(coords);
      }
    } catch (err) {
      console.error("Error fetching route:", err);
    }
  };

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

  const fetchAddress = async () => {
    try {
      if (!rideOngoingDataRider?.pickupLocation || !rideOngoingDataRider?.dropoffLocation) return;

      const [pickupLat, pickupLng] = rideOngoingDataRider.pickupLocation.split(",");
      const [dropLat, dropLng] = rideOngoingDataRider.dropoffLocation.split(",");

      const pickupAddress = await getLocationName(pickupLat, pickupLng);
      const dropAddress = await getLocationName(dropLat, dropLng);

      setRideAddress({
        pickup: pickupAddress || "Pickup address unavailable",
        dropoff: dropAddress || "Dropoff address unavailable",
      });
    } catch (err) {
      console.error("Error fetching ride address", err);
      setRideAddress({ pickup: "Error", dropoff: "Error" });
    }
  };

  useEffect(() => {
    const fetchRideAddress = async () => {
      if (
          !rideOngoingDataRider ||
          !rideOngoingDataRider.pickupLocation ||
          !rideOngoingDataRider.dropoffLocation
      ) {
        // Reset only if there is no ongoing ride
        setRideAddress({ pickup: "", dropoff: "" });
        return;
      }

      try {
        const [pickupLat, pickupLng] = rideOngoingDataRider.pickupLocation.split(",");
        const [dropLat, dropLng] = rideOngoingDataRider.dropoffLocation.split(",");

        const pickupAddress = await getLocationName(pickupLat, pickupLng);
        const dropAddress = await getLocationName(dropLat, dropLng);

        setRideAddress({
          pickup: pickupAddress || "Pickup address unavailable",
          dropoff: dropAddress || "Dropoff address unavailable",
        });

        if (
            rideOngoingDataRider?.pickupLocation &&
            rideOngoingDataRider?.dropoffLocation
        ) {
          const pickup = rideOngoingDataRider.pickupLocation;
          const dropoff = rideOngoingDataRider.dropoffLocation;
          fetchRoute(pickup, dropoff);
        } else {
          setRouteCoordinates([]);
        }

      } catch (err) {
        console.error("Error fetching ride address", err);
        setRideAddress({ pickup: "Error", dropoff: "Error" });
      }
    };

    fetchRideAddress();
  }, [rideOngoingDataRider]);

  const { showSuccessToast } = useToast();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const mapRef = useRef(null);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [rideRequestModal, setRideRequestModal] = useState(false);
  const [rideDetail, setRideDetail] = useState(null);
  const [rideCompleted, setRideCompleted] = useState(false);
  const [rideCancelled, setRideCancelled] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCanceling, setIsCanceled] = useState(false);

  const slideAnim = useRef(new Animated.Value(-width * 0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;

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
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationAddress("Location access denied");
        return;
      }

      let initialLocation = await Location.getCurrentPositionAsync({
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
          if (mapRef.current) {
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
    })();

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  const completeRide = async () => {
    setIsCompleting(true);
    try {
      await RideService.completeRide(
        rideOngoingDataRider._id,
        userData.user._id
      );
      showSuccessToast(
        `Successfully completed ride for  ${
          rideOngoingDataRider?.userProfile?.user?.name
        } and redeem ${Math.ceil(rideOngoingDataRider?.distance)}`
      );
      setRideCompleted(true);
      setRouteCoordinates([]);
    } catch (err) {
    } finally {
      setIsCompleting(false);
    }
  };

  const cancelRide = async () => {
    setIsCanceled(true);
    try {
      await RideService.cancelRide(
          rideOngoingDataRider._id,
          userData.user._id
      );
      showSuccessToast(
          `Successfully canceled ride for ${
              rideOngoingDataRider?.userProfile?.user?.name
          } and redeem -5 points from your account/`
      );
      setRideCancelled(true);
      setRouteCoordinates([]);
    } catch (err) {
    } finally {
      setIsCanceled(false);
    }
  };

  useEffect(() => {
    // Register userId after connecting (replace with your actual userId)
    const userId = userData.user._id;
    socket.emit("register", { userId });

    return () => {
      socket.off("rideRequested");
    };
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

  const defaultRegion = {
    latitude: location?.latitude || 27.7097,
    longitude: location?.longitude || 85.323,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
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
    if (!isDrawerOpen) return null;
    return (
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={toggleDrawer}
      >
        <Animated.View style={[styles.overlay, { opacity: opacityAnim }]} />
      </TouchableOpacity>
    );
  };

  const renderOSMAttribution = () => (
    <View style={styles.attributionContainer}>
      <Text style={styles.attributionText}>© OpenStreetMap contributors</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={defaultRegion}
        mapType="standard"
        rotateEnabled
        scrollEnabled
        zoomEnabled
        showsUserLocation
        followsUserLocation={false}
        showsMyLocationButton={false}
        loadingEnabled
        loadingIndicatorColor="#008080"
        loadingBackgroundColor="#FFFFFF"
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
      >
        {/* <UrlTile
          urlTemplate={OSM_TILE_URL}
          maximumZ={19}
          zIndex={1}
          shouldReplaceMapContent
        /> */}
        {location && (
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

        {rideOngoingDataRider && rideOngoingDataRider.pickupLocation && (
            <Marker
                coordinate={{
                  latitude: parseFloat(rideOngoingDataRider.pickupLocation.split(",")[0]),
                  longitude: parseFloat(rideOngoingDataRider.pickupLocation.split(",")[1]),
                }}
                title="Pickup Location"
                pinColor="green"
            />
        )}

        {rideOngoingDataRider && rideOngoingDataRider.dropoffLocation && (
            <Marker
                coordinate={{
                  latitude: parseFloat(rideOngoingDataRider.dropoffLocation.split(",")[0]),
                  longitude: parseFloat(rideOngoingDataRider.dropoffLocation.split(",")[1]),
                }}
                title="Dropoff Location"
                pinColor="red"
            />
        )}

        {routeCoordinates.length > 0 && (
            <MapPolyline
                coordinates={routeCoordinates}
                strokeWidth={4}
                strokeColor="#007AFF"
            />
        )}
      </MapView>

      {renderOSMAttribution()}

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.menuButton} onPress={toggleDrawer}>
            <Ionicons name="menu" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={centerOnUserLocation}
      >
        <MaterialIcons name="my-location" size={24} color="#008080" />
      </TouchableOpacity>

      {renderOverlay()}

      <DrawerScreenRider
        isVisible={isDrawerOpen}
        onClose={toggleDrawer}
        slideAnim={slideAnim}
        //@ts-ignore
        opacityAnim={opacityAnim}
        shadowAnim={shadowAnim}
      />
      {rideOngoingDataRider && rideOngoingDataRider.status == "accepted" && (
        <RideOngoingBannerRider
          rideDetails={rideOngoingDataRider}
          onComplete={() => {
            completeRide();
          }}
          onCancel={() => {
            cancelRide();
          }}
          isCompleting={isCompleting}
          isCancelling={isCanceling}
          rideAddress={rideAddress}
        />
      )}
      {rideCompleted && (
        <RideCompletedRiderPopup
          pointsRedeemed={Math.ceil(rideOngoingDataRider.distance)}
          visible={rideCompleted}
          onClose={() => {
            updateRideOngoingDataRider(null);
            setRideCompleted(false);
          }}
          userProfile={rideOngoingDataRider?.userProfile}
          fare={rideOngoingDataRider?.fare ?? 0}
        />
      )}
      {rideCancelled && (
          <RideCancelledRiderPopup
              visible={rideCancelled}
              onClose={() => {
                updateRideOngoingDataRider(null);
                setRideCancelled(false);
              }}
          />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  safeArea: { position: "absolute", top: STATUSBAR_HEIGHT, left: 0, right: 0 },
  headerContainer: { flexDirection: "row", padding: 16 },
  menuButton: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 24,
    elevation: 4,
  },
  myLocationButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 15,
    elevation: 5,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },
  fromContainer: { marginBottom: 12 },
  fromLabel: { fontWeight: "bold", color: "#333" },
  fromText: { marginTop: 4, fontSize: 16, color: "#444" },
  markerContainer: {
    height: 20,
    width: 20,
    backgroundColor: "#008080",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#fff",
  },
  markerInner: {
    height: 10,
    width: 10,
    backgroundColor: "#00FFFF",
    borderRadius: 5,
    alignSelf: "center",
    marginTop: 3,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#00000088",
  },
  attributionContainer: {
    position: "absolute",
    bottom: 20,
    left: 10,
    backgroundColor: "#fff",
    padding: 4,
    borderRadius: 5,
  },
  attributionText: {
    fontSize: 10,
    color: "#444",
  },
  loadingContainer: { flexDirection: "row", alignItems: "center" },
  loadingText: { marginLeft: 8, color: "#444" },
  rideOngoingButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 15,
    elevation: 5,
  },
});

export default MainScreenRider;
