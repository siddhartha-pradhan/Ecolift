//@ts-check
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Keyboard,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRide } from "../../context/RideContext";

const vehicleOptions = ["2 Wheeler", "4 Wheeler"];

const LocationDrawerScreen = ({
                                isVisible,
                                onClose,
                                slideAnim,
                                opacityAnim,
                                shadowAnim,
                                currentLocation,
                                currentAddress,
                                calculateRoute,
                                setStartCoords,
                                setDestCoords,
                                setRideAdress,
    setVehicleTypes,
                              }) => {
  const navigation = useNavigation();
  const [startLocation, setStartLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicleType, setVehicleType] = useState("2 Wheeler");
  const [shouldResetFields, setShouldResetFields] = useState(true);
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const { userData } = useRide();

  useEffect(() => {
    if (!isVisible && shouldResetFields) {
      setStartLocation("");
      setDestination("");
      setStartCoords(null);
      setDestCoords(null);
    }
  }, [isVisible]);

  const navigateToFromLocation = () => {
    // @ts-ignore
    navigation.navigate("LocationFromScreen", {
      onSelectLocation: (location, coords) => {
        setStartLocation(location);
        setRideAdress((p) => ({ ...p, pickup: location }));
        setStartCoords(coords);
      },
      initialLocation: startLocation,
    });
  };

  const navigateToToLocation = () => {
    // @ts-ignore
    navigation.navigate("LocationToScreen", {
      onSelectLocation: (location, coords) => {
        setDestination(location);
        setDestCoords(coords);
        setRideAdress((p) => ({ ...p, dropoff: location }));
      },
      initialLocation: destination,
    });
  };

  const handleSearch = async () => {
    Keyboard.dismiss();
    if (startLocation && destination) {
      setShouldResetFields(false);
      onClose();
      calculateRoute();
      setTimeout(() => setShouldResetFields(true), 500);
    }
  };

  const handleClose = () => {
    setShouldResetFields(true);
    onClose();
  };

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setOpen(false);
    if (event.type !== "dismissed") {
      setDate(currentDate);
    }
  };

  const animatedDrawerStyles = {
    transform: [{ translateY: slideAnim }],
  };

  return (
      <Animated.View style={[styles.drawer, animatedDrawerStyles]}>
        <View style={styles.drawerContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Choose Location</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            {/* Pickup Location */}
            <TouchableOpacity
                style={styles.inputWrapper}
                onPress={navigateToFromLocation}
                activeOpacity={0.7}
            >
              <MaterialIcons
                  name="trip-origin"
                  size={20}
                  color="#008080"
                  style={styles.inputIcon}
              />
              <Text
                  style={[styles.input, !startLocation && styles.placeholderText]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
              >
                {startLocation || "Enter starting point"}
              </Text>
              {startLocation.length > 0 && (
                  <TouchableOpacity
                      style={styles.clearButton}
                      onPress={() => {
                        setStartLocation("");
                        setStartCoords(null);
                      }}
                  >
                    <Ionicons name="close-circle" size={20} color="#999" />
                  </TouchableOpacity>
              )}
            </TouchableOpacity>

            {/* Dropoff Location */}
            <TouchableOpacity
                style={styles.inputWrapper}
                onPress={navigateToToLocation}
                activeOpacity={0.7}
            >
              <MaterialIcons
                  name="location-on"
                  size={20}
                  color="#008080"
                  style={styles.inputIcon}
              />
              <Text
                  style={[styles.input, !destination && styles.placeholderText]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
              >
                {destination || "Enter destination"}
              </Text>
              {destination.length > 0 && (
                  <TouchableOpacity
                      style={styles.clearButton}
                      onPress={() => {
                        setDestination("");
                        setDestCoords(null);
                      }}
                  >
                    <Ionicons name="close-circle" size={20} color="#999" />
                  </TouchableOpacity>
              )}
            </TouchableOpacity>

            {/* Radio: Vehicle Type */}
            <View style={styles.radioSection}>
              <Text style={styles.dropdownLabel}>Select Vehicle Type</Text>
              {vehicleOptions.map((type) => (
                  <TouchableOpacity
                      key={type}
                      style={styles.radioItem}
                      onPress={() => {
                        setVehicleType(type)
                        setVehicleTypes(type)
                      }}
                  >
                    <View style={styles.radioCircle}>
                      {vehicleType === type && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.radioText}>{type}</Text>
                  </TouchableOpacity>
              ))}
            </View>

            {/* Search Button */}
            <TouchableOpacity
                style={[
                  styles.searchButton,
                  (!startLocation || !destination) && styles.disabledButton,
                ]}
                onPress={handleSearch}
                disabled={!startLocation || !destination}
            >
              <Text style={styles.searchButtonText}>Find Route</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
  );
};

const styles = StyleSheet.create({
  drawer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: "50%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    zIndex: 1000,
    minHeight: 500,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  searchContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    height: 45,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 45,
    color: "#333",
    fontSize: 15,
    paddingVertical: 10,
  },
  placeholderText: {
    color: "#999",
  },
  clearButton: {
    padding: 5,
  },
  searchButton: {
    backgroundColor: "#008080",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
    marginBottom: 20
  },
  disabledButton: {
    backgroundColor: "#aaa",
  },
  searchButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
  radioSection: {
    marginVertical: 10,
  },
  dropdownLabel: {
    marginBottom: 6,
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  radioCircle: {
    height: 22,
    width: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#008080",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#008080",
  },
  radioText: {
    fontSize: 15,
    color: "#333",
  },
});

export default LocationDrawerScreen;
