//@ts-check
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { WebView } from "react-native-webview";
import axios from "axios";

const NominatimAPI_URL = "https://nominatim.openstreetmap.org/search";

const LocationFromScreen = ({ navigation, route }) => {
  const { onSelectLocation, initialLocation } = route.params || {};
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentLocationLoading, setCurrentLocationLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const webViewRef = useRef(null);

  const fetchLocationSuggestions = async (query) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${NominatimAPI_URL}?q=${query},Nepal&format=json&addressdetails=1&limit=10`
      );
      const data = response.data;
      setSuggestions(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      setSuggestions([]);
      setLoading(false);
    }
  };

  const handleSearchInputChange = (text) => {
    setSearchQuery(text);
    if (text.length > 2) {
      fetchLocationSuggestions(text);
    } else {
      setSuggestions([]);
    }
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation({
      name: location.display_name,
      latitude: parseFloat(location.lat),
      longitude: parseFloat(location.lon),
    });
    setSearchQuery(location.display_name); // Set the location name in the search input
    setSuggestions([]); // Collapse suggestions
  };

  const getCurrentLocation = async () => {
    try {
      setCurrentLocationLoading(true);

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setCurrentLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;


      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse`,
        {
          params: {
            format: "json",
            lat: latitude,
            lon: longitude,
            addressdetails: 1,
          },
          headers: {
            "User-Agent": "Eco lift/1.0",
          },
        }
      );
      const data = response.data;

      if (data && data.display_name) {
        setSelectedLocation({
          name: data.display_name,
          latitude,
          longitude,
        });
        setSearchQuery(data.display_name); // Set the current location name in the search input
      }

      setCurrentLocationLoading(false);
    } catch (error) {
      console.error("Error getting current location:", error);
      setCurrentLocationLoading(false);
    }
  };

  // Update location data when receiving new coordinates from the map
  const updateLocationFromMap = async (latitude, longitude) => {
    try {
           const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse`, 
      {
        params: {
          format: "json",
          lat: latitude,
          lon: longitude,
          addressdetails: 1,
        },
        headers: {
          "User-Agent": "Eco lift/1.0",
        },
      }
    );
      const data = response.data;

      if (data && data.display_name) {
        setSelectedLocation({
          name: data.display_name,
          latitude,
          longitude,
        });
        setSearchQuery(data.display_name);
      }
    } catch (error) {
      console.error("Error updating location from map:", error);
    }
  };

  // Handle messages from WebView
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "markerDragged") {
        updateLocationFromMap(data.latitude, data.longitude);
      } else if (data.type === "mapReady") {
        setIsMapReady(true);
      }
    } catch (error) {
      console.error("Error parsing WebView message:", error);
    }
  };

  // Update the map when location changes
  useEffect(() => {
    if (selectedLocation && webViewRef.current && isMapReady) {
      const updateMap = `
        try {
          if (typeof map !== 'undefined') {
            map.setView([${selectedLocation.latitude}, ${selectedLocation.longitude}], 15);
            if (marker) {
              marker.setLatLng([${selectedLocation.latitude}, ${selectedLocation.longitude}]);
            } else {
              marker = L.marker([${selectedLocation.latitude}, ${selectedLocation.longitude}], {draggable: true}).addTo(map);
              marker.on('dragend', function(event) {
                var position = marker.getLatLng();
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'markerDragged',
                  latitude: position.lat,
                  longitude: position.lng
                }));
              });
            }
          }
        } catch(e) {
          console.error(e);
        }
        true;
      `;
      webViewRef.current.injectJavaScript(updateMap);
    }
  }, [selectedLocation, isMapReady]);

  // OSM map HTML
  const getMapHTML = () => {
    let initialLat = 27.7172; // Default to Kathmandu, Nepal
    let initialLng = 85.324;
    let initialZoom = 13;

    if (selectedLocation) {
      initialLat = selectedLocation.latitude;
      initialLng = selectedLocation.longitude;
      initialZoom = 15;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { width: 100%; height: 100vh; }
          .drag-instruction {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(255, 255, 255, 0.8);
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 14px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 1000;
            pointer-events: none;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div class="drag-instruction">Hold and drag the pin to adjust location</div>
        <script>
          var map = L.map('map').setView([${initialLat}, ${initialLng}], ${initialZoom});
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
          }).addTo(map);
          
          var marker = L.marker([${initialLat}, ${initialLng}], {draggable: true}).addTo(map);
          
          // Handle marker drag events
          marker.on('dragend', function(event) {
            var position = marker.getLatLng();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'markerDragged',
              latitude: position.lat,
              longitude: position.lng
            }));
          });
          
          // Handle map tap/click events to move marker
          map.on('click', function(e) {
            marker.setLatLng(e.latlng);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'markerDragged',
              latitude: e.latlng.lat,
              longitude: e.latlng.lng
            }));
          });

          // Notify React Native that the map is ready
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'mapReady'
          }));
          
          true; // Needed for injectJavaScript to work properly
        </script>
      </body>
      </html>
    `;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Starting Point</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a location..."
            value={searchQuery}
            onChangeText={handleSearchInputChange}
            autoFocus
          />
          {loading && <ActivityIndicator size="small" color="#008080" />}

          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSearchQuery(""); // Clear the text input
                setSuggestions([]); // Reset suggestions
              }}
            >
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Current Location Button */}
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={getCurrentLocation}
          disabled={currentLocationLoading}
        >
          {currentLocationLoading ? (
            <ActivityIndicator size="small" color="#008080" />
          ) : (
            <>
              <MaterialIcons name="my-location" size={20} color="#008080" />
              <Text style={styles.currentLocationText}>
                Use Current Location
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Suggestions List */}
      {!selectedLocation && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.place_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => handleLocationSelect(item)}
            >
              <View style={styles.suggestionIcon}>
                <MaterialIcons name="location-on" size={20} color="#008080" />
              </View>
              <View style={styles.suggestionTextContainer}>
                <Text style={styles.suggestionText} numberOfLines={1}>
                  {item.display_name.split(",")[0]}
                </Text>
                <Text style={styles.suggestionSubtext} numberOfLines={1}>
                  {item.display_name
                    .substring(item.display_name.indexOf(",") + 1)
                    .trim()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() =>
            !loading && searchQuery.length > 2 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No locations found</Text>
              </View>
            ) : null
          }
        />
      )}

      {/* Map Section with OSM */}
      {selectedLocation && (
        <View style={styles.mapContainer}>
          <WebView
            ref={webViewRef}
            originWhitelist={["*"]}
            source={{ html: getMapHTML() }}
            style={styles.map}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onMessage={handleMessage}
            onError={(e) => console.error("WebView error:", e)}
          />
        </View>
      )}

      {/* Confirm Pickup Button */}
      {selectedLocation && (
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={() => {
            if (onSelectLocation) {
              onSelectLocation(selectedLocation.name, {
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
              });
            }
            navigation.goBack();
          }}
        >
          <Text style={styles.confirmButtonText}>Confirm Pickup</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 5,
  },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  currentLocationText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#008080",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  suggestionIcon: {
    marginRight: 15,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionText: {
    fontSize: 16,
    color: "#333",
  },
  suggestionSubtext: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#777",
    fontSize: 15,
  },
  mapContainer: {
    flex: 1,
    marginTop: 20,
    marginBottom: 10,
  },
  map: {
    flex: 1,
    borderRadius: 8,
  },
  confirmButton: {
    backgroundColor: "#008080",
    paddingVertical: 14,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default LocationFromScreen;
