//@ts-check

import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const RideHistoryCardChild = ({ride, index}) => {
     const [rideAddress, setRideAddress] = useState({
          pickup: "",
          dropoff: "",
        });
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
          if (!ride) return;
          const pickUppCoords = ride?.pickupLocation.split(",");
          const pickupAddress = await getLocationName(
            pickUppCoords[0],
            pickUppCoords[1]
          );
          const dropoffCoords = ride?.dropoffLocation.split(",");
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
        }, [ride]);
  return (
    <>
      <View key={index} style={styles.rideCard}>
        <Text style={styles.rideTitle}>Ride #{index + 1}</Text>
        <View style={styles.rideInfo}>
          <Text style={styles.label}>From:</Text>
          <Text style={styles.value}>{rideAddress?.pickup}</Text>
        </View>
        <View style={styles.rideInfo}>
          <Text style={styles.label}>To:</Text>
          <Text style={styles.value}>{rideAddress?.dropoff}</Text>
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
      </View>
    </>
  );
};

const styles = StyleSheet.create({
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

export default RideHistoryCardChild;
