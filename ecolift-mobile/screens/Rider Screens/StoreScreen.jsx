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
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DrawerScreenRider from "./DrawerScreenRider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ItemService from "../../services/ItemService";
import DriverService from "../../services/DriverService";
import {useToast} from "../../context/ToastContext";

const { width } = Dimensions.get("window");

const StoreScreen = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width * 0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;
  const {showSuccessToast} = useToast()

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  // Fetch all items from API
  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await ItemService.getItems();
      setItems(data);
    } catch (err) {
      toast.error("Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleItemPress = async (item, price) => {
    if (price > redeemPoints) {
      alert(
        `You do not have sufficient budget to purchase ${item.name}.`
      );
    } else {
      showSuccessToast(`You have sufficient budget to purchase item ${item.name}. Please visit your nearest store.`);

      setRedeemPoints(redeemPoints - price);

      await ItemService.reduceRedeemPoints(userData?._id, price)
    }
    // You can replace the alert with any navigation or action
  };


  const [userData, setUserData] = useState();
  const [redeemPoints, setRedeemPoints] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userName = await AsyncStorage.getItem("userEmail");
        const driver = await DriverService.getDriverById();
        const driverModel = driver.find((x) => x.email === userName);
        setUserData(driverModel);
        setRedeemPoints(driverModel?.userProfile?.redeemPoints);
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchUserData();
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

      {/* Main Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Store Icon */}
        <View style={styles.contentContainer}>
          <MaterialCommunityIcons name="store" size={200} color="#008080" />
          <Text style={styles.titleText}>Redeem Store</Text>
        </View>
        <View style={styles.pointsBar}>
          <Text style={styles.pointsText}>
            Available Points: {redeemPoints}
          </Text>
        </View>

        {/* Item List Below Store Icon */}
        <View style={styles.itemsContainer}>
          {items.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.itemBox}
              onPress={() => handleItemPress(item, item.price)} // Handle item click
            >
              <MaterialCommunityIcons name="gift" size={60} color="#008080" />
              <Text style={styles.itemText}>{item.name}</Text>
              <Text style={styles.priceText}>${item.price}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
  scrollContainer: {
    paddingBottom: 20, // Optional: Adds padding to the bottom of the scrollable content
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
  itemsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 30,
  },
  itemBox: {
    width: width * 0.4,
    height: 180,
    backgroundColor: "#f0f0f0",
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#008080",
    marginTop: 10,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginTop: 5,
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
  pointsBar: {
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight + 60 : 70,
    marginHorizontal: 20,
    padding: 12,
    backgroundColor: "#008080",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 5,
  },
  pointsText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default StoreScreen;
