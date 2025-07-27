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
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DrawerScreen from "./DrawerScreen";
import PopPremiumContactScreen from "./PopPremiumContactScreen"; // import the popup

const { width } = Dimensions.get("window");

const PremiumScreen = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // state to control popup visibility
  const slideAnim = useRef(new Animated.Value(-width * 0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const togglePopup = () => {
    setShowPopup(!showPopup); // Toggle the visibility of the popup
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

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerContainer}>
        <TouchableOpacity style={styles.menuButton} onPress={toggleDrawer}>
          <Ionicons name="menu" size={24} color="black" />
        </TouchableOpacity>
      </SafeAreaView>

      <View style={styles.contentContainer}>
        <MaterialCommunityIcons name="crown" size={200} color="#008080" />

        {/* Premium Header */}
        <View style={styles.premiumHeader.wrapper}>
          <Text style={styles.premiumHeader.sparkle}>✨ </Text>
          <Text style={styles.premiumHeader.ecolift}>Ecolift </Text>
          <Text style={styles.premiumHeader.premium}>Premium</Text>
          <Text style={styles.premiumHeader.sparkle}> ✨</Text>
        </View>

        {/* Premium Points */}
        <View style={styles.premiumPoints.container}>
          <Text style={styles.premiumPoints.point}>
            • 🚫 Enjoy an Ad-Free Experience.
          </Text>
          <Text style={styles.premiumPoints.point}>
            • 🎁 Unlock Total of 3 Free Rides.
          </Text>
          <Text style={styles.premiumPoints.point}>
            • 📅 Pre-book Your Ride in Advance.
          </Text>
        </View>
      </View>

      {/* Button to show the popup */}
      <TouchableOpacity onPress={togglePopup} style={styles.premiumButton}>
        <Text style={styles.premiumButtonText}>Activate Premium</Text>
      </TouchableOpacity>

      {/* Overlay for drawer */}
      {isDrawerOpen && (
        <TouchableOpacity style={styles.overlay} onPress={toggleDrawer}>
          <Animated.View style={[styles.overlay, { opacity: opacityAnim }]} />
        </TouchableOpacity>
      )}

      <DrawerScreen
        isVisible={isDrawerOpen}
        onClose={toggleDrawer}
        slideAnim={slideAnim}
        opacityAnim={opacityAnim}
        shadowAnim={shadowAnim}
      />

      {/* Show Popup when `showPopup` is true */}
      {showPopup && <PopPremiumContactScreen onClose={togglePopup} />}
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

  // 🌟 Premium Header Styles
  premiumHeader: {
    wrapper: {
      flexDirection: "row",
      marginTop: 20,
      alignItems: "center",
    },
    ecolift: {
      fontSize: 32,
      color: "#008080",
      fontWeight: "bold",
    },
    premium: {
      fontSize: 32,
      color: "#000",
      fontWeight: "bold",
    },
    sparkle: {
      fontSize: 30,
    },
  },

  // 📝 Premium Points Styles
  premiumPoints: {
    container: {
      marginTop: 30,
      marginLeft: width * 0.1 + 10,
      alignSelf: "flex-start",
      paddingLeft: 10,
      borderLeftWidth: 2,
      borderLeftColor: "#008080", // subtle vertical accent line
    },
    point: {
      fontSize: 18,
      color: "#000",
      marginVertical: 10,
      lineHeight: 35,
      letterSpacing: 0.3,
      fontWeight: "500",
    },
  },

  // Button to trigger the popup
  premiumButton: {
    position: "absolute",
    bottom: 60,
    backgroundColor: "#008080",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 10,
    alignSelf: "center",
  },
  premiumButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
});

export default PremiumScreen;
