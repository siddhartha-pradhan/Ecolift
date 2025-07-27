import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  SafeAreaView,
  Platform,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const menuItems = [
  {
    label: "Profile",
    icon: <Ionicons name="person-circle-outline" size={22} color="#000" />,
    screen: "ProfileScreenRider",
  },
  {
    label: "Home",
    icon: <Ionicons name="home-outline" size={22} color="#000" />,
    screen: "MainScreenRider",
  },
  {
    label: "Available Rides",
    icon: <Ionicons name="car-sport-outline" size={22} color="#000" />,
    screen: "RideBookScreenRider",
  },
  {
    label: "Store",
    icon: <MaterialCommunityIcons name="store" size={22} color="#000" />,
    screen: "StoreScreen",
  },
  {
    label: "Ride History",
    icon: <MaterialIcons name="history" size={22} color="#000" />,
    screen: "RideHistoryScreenRider",
  },

  {
    label: "Support",
    icon: (
      <MaterialCommunityIcons name="shield-account" size={22} color="#000" />
    ),
    screen: "SupportScreenRider",
  },
  {
    label: "Logout",
    icon: <Ionicons name="log-out-outline" size={22} color="#000" />,
    screen: "WelcomeScreenRider",
  },
];

const DrawerScreenRider = ({ isVisible, onClose, slideAnim, shadowAnim }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const [activeItem, setActiveItem] = useState("");
  const [userData, setUserData] = useState({ name: "", email: "" });

  useEffect(() => {
    if (isVisible) {
      const currentRouteName = route.name;
      const matchedItem = menuItems.find(
        (item) => item.screen === currentRouteName
      );
      if (matchedItem) {
        setActiveItem(matchedItem.label);
      }
    }
  }, [isVisible, route.name]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const name = await AsyncStorage.getItem("userName");
        const email = await AsyncStorage.getItem("userEmail");
        setUserData({
          name: name || "Rider",
          email: email || "rider@email.com",
        });
      } catch (error) {
        console.error("Failed to load rider data:", error.message);
      }
    };
    fetchUserData();
  }, []);

  const handlePress = async (label, screen) => {
    setActiveItem(label);
    if (label === "Logout") {
      await AsyncStorage.multiRemove(["token", "userName", "userEmail"]);
      navigation.reset({
        index: 0,
        routes: [{ name: "WelcomeScreenRider" }],
      });
    } else if (screen) {
      navigation.navigate(screen);
    }

    setTimeout(() => onClose(), 300);
  };

  const shadowStyleInterpolation = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  return (
    <Animated.View
      style={[
        styles.drawer,
        {
          transform: [{ translateX: slideAnim }],
          shadowOpacity: shadowStyleInterpolation,
        },
      ]}
    >
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.userHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle-outline" size={60} color="#008080" />
          </View>
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                activeItem === item.label && styles.activeMenuItem,
              ]}
              onPress={() => handlePress(item.label, item.screen)}
            >
              {activeItem === item.label && (
                <View style={styles.activeIndicator} />
              )}
              <View style={styles.iconLabel}>
                <View style={styles.iconContainer}>
                  {React.cloneElement(item.icon, {
                    color: activeItem === item.label ? "#008080" : "#333",
                  })}
                </View>
                <Text
                  style={[
                    styles.menuText,
                    activeItem === item.label && styles.activeText,
                  ]}
                >
                  {item.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: width * 0.8,
    backgroundColor: "white",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 5,
    zIndex: 1000,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  closeButton: {
    position: "absolute",
    top: Platform.OS === "android" ? StatusBar.currentHeight + 30 : 75,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(240,240,240,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  userHeader: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 15,
  },
  avatarContainer: {
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 5,
    position: "relative",
  },
  activeMenuItem: {
    backgroundColor: "rgba(0,128,128,0.08)",
    shadowColor: "#008080",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#008080",
  },
  iconLabel: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 30,
    alignItems: "center",
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
  activeText: {
    color: "#008080",
    fontWeight: "600",
  },
  activeIndicator: {
    position: "absolute",
    left: 0.5,
    top: "50%",
    height: "150%",
    width: 4,
    backgroundColor: "#008080",
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  versionText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    paddingBottom: 20,
  },
});

export default DrawerScreenRider;
