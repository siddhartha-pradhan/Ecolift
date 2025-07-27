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

const { width } = Dimensions.get("window");

const SupportScreen = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width * 0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;

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
        <MaterialCommunityIcons
          name="shield-account"
          size={250}
          color="#008080"
        />
        <Text style={styles.titleText}>Support</Text>

        {/* Support text with border */}
        <View style={styles.supportBox}>
          <Text style={styles.paragraphText}>
            If you need any assistance, feel free to reach out.{"\n "}
            <Text>We are here to help!</Text>
            {"\n"}
            <Text style={styles.contactEmail}>
              Contact admin via: ecolift99@gmail.com
            </Text>
          </Text>
        </View>
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
    width: 50,
    height: 50,
    borderRadius: 25,
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
    fontSize: 32,
    color: "#000",
    fontWeight: "600",
    marginTop: 20,
  },
  supportBox: {
    marginTop: 30,
    padding: 20,
    borderWidth: 2,
    borderColor: "#008080", // Border color set to #008080
    borderRadius: 15,
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
  },
  paragraphText: {
    fontSize: 22,
    color: "#000", // Text color inside the box is now black for better contrast
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 35, // Increased line height for more spacing
  },
  contactEmail: {
    fontSize: 24,
    fontWeight: "700",
    color: "#008080", // Text color for the email is set to #008080
    marginTop: 10,
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

export default SupportScreen;
