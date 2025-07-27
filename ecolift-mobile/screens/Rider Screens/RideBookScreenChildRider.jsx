//@ts-check
import { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import polyline from "@mapbox/polyline"; // install with: npm install @mapbox/polyline

const { width, height } = Dimensions.get("window");

const RideBookScreenChildRider = ({ request, acceptRide, declineRide }) => {
  const [rideAddress, setRideAddress] = useState({
    pickup: "",
    dropoff: "",
  });
  const [mapVisible, setMapVisible] = useState(false);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]); // <--- New state for route polyline

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

  // New function to fetch route from Google Directions API
  const fetchRoute = async (origin, destination) => {
    try {
      const resp = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=AIzaSyDc4dFNDDhYiOuoAE7YgCu9722UMqHf6bE`
      );
      const json = await resp.json();

      if (json.routes.length) {
        const points = polyline.decode(json.routes[0].overview_polyline.points);
        const routeCoordinates = points.map(point => ({
          latitude: point[0],
          longitude: point[1],
        }));
        setRouteCoords(routeCoordinates);
      } else {
        setRouteCoords([]);
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
      setRouteCoords([]);
    }
  };

  const fetchAddresses = async () => {
    if (!request) return;
    const pickupCoordsArray = request?.pickupLocation.split(",");
    const dropoffCoordsArray = request?.dropoffLocation.split(",");

    const pickupLat = parseFloat(pickupCoordsArray[0]);
    const pickupLng = parseFloat(pickupCoordsArray[1]);
    const dropoffLat = parseFloat(dropoffCoordsArray[0]);
    const dropoffLng = parseFloat(dropoffCoordsArray[1]);

    const pickupAddress = await getLocationName(pickupLat, pickupLng);
    const dropAddress = await getLocationName(dropoffLat, dropoffLng);

    if (pickupAddress && dropAddress) {
      setRideAddress({
        pickup: pickupAddress,
        dropoff: dropAddress,
      });
      const pickup = { latitude: pickupLat, longitude: pickupLng };
      const dropoff = { latitude: dropoffLat, longitude: dropoffLng };
      setPickupCoords(pickup);
      setDropoffCoords(dropoff);

      // Fetch route with directions API
      await fetchRoute(pickup, dropoff);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [request]);

  return (
      <>
        <View style={styles.rideBox} key={request._id}>
          <Text style={styles.rideBoxTitle}>Ride Request</Text>
          <Text style={styles.rideBoxText}>
            Name: {request?.userProfile?.user?.name}
          </Text>
          <Text style={styles.rideBoxText}>
            Location From: {rideAddress?.pickup ?? "Not found"}
          </Text>
          <Text style={styles.rideBoxText}>
            Location To: {rideAddress?.dropoff ?? "Not found"}
          </Text>
          <Text style={styles.rideBoxText}>
            Distance: {request?.distance?.toString()} km
          </Text>
          <Text style={styles.rideBoxText}>
            Vehicle Type: {request?.vehicleType?.toString()}
          </Text>
          <Text style={styles.rideBoxText}>Fare: Rs:{request?.fare?.toString()}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => acceptRide(request._id)}
            >
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => declineRide(request._id)}
            >
              <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>
          </View>

          {/* View Map Button */}
          <TouchableOpacity
              style={styles.mapButton}
              onPress={() => setMapVisible(true)}
          >
            <Text style={styles.mapButtonText}>View on Map</Text>
          </TouchableOpacity>
        </View>

        {/* Modal with Map */}
        <Modal visible={mapVisible} animationType="slide" onRequestClose={() => setMapVisible(false)}>
          <View style={styles.mapModalContainer}>
            <MapView
                style={styles.map}
                initialRegion={{
                  latitude: pickupCoords?.latitude ?? 37.78825,
                  longitude: pickupCoords?.longitude ?? -122.4324,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
            >
              {pickupCoords && <Marker coordinate={pickupCoords} title="Pickup" pinColor="green" />}
              {dropoffCoords && <Marker coordinate={dropoffCoords} title="Dropoff" pinColor="red" />}
              {/* Use the fetched routeCoords for actual route */}
              {routeCoords.length > 0 && (
                  <Polyline coordinates={routeCoords} strokeColor="#007AFF" strokeWidth={4} />
              )}
            </MapView>
            <TouchableOpacity style={styles.closeMapButton} onPress={() => setMapVisible(false)}>
              <Text style={styles.buttonText}>Close Map</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </>
  );
};

const styles = StyleSheet.create({
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  acceptButton: {
    backgroundColor: "#008080",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10,
    flex: 1,
    alignItems: "center",
  },
  rejectButton: {
    backgroundColor: "red",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  mapButton: {
    marginTop: 15,
    backgroundColor: "#004d40",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  mapButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    width: width,
    height: height - 100,
  },
  closeMapButton: {
    backgroundColor: "#008080",
    padding: 15,
    alignItems: "center",
  },
});

export default RideBookScreenChildRider;
