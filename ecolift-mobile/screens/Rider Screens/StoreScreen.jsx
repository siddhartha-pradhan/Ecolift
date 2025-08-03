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
import { REACT_APP_API_URL } from "@env";
import { useNavigation } from "@react-navigation/native";
const { width } = Dimensions.get("window");

const StoreScreen = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width * 0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;
  const {showSuccessToast} = useToast()
  const navigation = useNavigation();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartSlideAnim = useRef(new Animated.Value(width)).current;

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
    const existingInCart = cartItems.find(ci => ci._id === item._id);
    const currentQty = existingInCart ? existingInCart.quantity : 0;

    if (price > redeemPoints) {
      alert(`You do not have sufficient budget to purchase ${item.name}.`);
      return;
    }

    if (currentQty >= item.quantity) {
      alert(`Cannot add more of ${item.name}. Only ${item.quantity} available.`);
      return;
    }

    showSuccessToast(`You have sufficient budget to purchase ${item.name}. Please visit your nearest store.`);

    setRedeemPoints(prev => prev - price);

    setCartItems(prevCart => {
      const existingIndex = prevCart.findIndex(ci => ci._id === item._id);

      if (existingIndex !== -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingIndex].quantity += 1;
        return updatedCart;
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });

    openCartDrawer();
  };

  const openCartDrawer = () => {
    setIsCartOpen(true);
    Animated.timing(cartSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeCartDrawer = () => {
    Animated.timing(cartSlideAnim, {
      toValue: width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsCartOpen(false));
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

  const handleDecreaseQuantity = (itemId) => {
    setCartItems((prevCart) => {
      const updatedCart = prevCart
          .map((item) => {
            if (item._id === itemId) {
              // Refund points
              setRedeemPoints((prev) => prev + item.price);

              // Decrease quantity
              return {
                ...item,
                quantity: item.quantity - 1,
              };
            }
            return item;
          })
          .filter((item) => item.quantity > 0); // remove items with 0 quantity

      return updatedCart;
    });

    const item = cartItems.find(i => i._id === itemId);
    if (item) {
      setRedeemPoints(redeemPoints + item.price);
    }
  };

  const handleCheckout = async () => {
    if (!cartItems.length) return;

    const orderDetails = cartItems.map(item => ({
      itemId: item._id,
      quantity: item.quantity,
    }));

    const token = await AsyncStorage.getItem("token");

    try {
      const totalPoints = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      await ItemService.reduceRedeemPoints(userData?._id, totalPoints, true)

      const apiUrl = REACT_APP_API_URL;

      console.log(apiUrl);

      const res = await fetch(`${apiUrl}/api/v1/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderDetails }),
      });

      const result = await res.json();

      if (res.ok) {
        showSuccessToast("Order placed successfully!");
        setCartItems([]);
        closeCartDrawer();
        navigation.navigate("UserOrdersScreen");
      } else {
        alert(result.error || "Failed to place order");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during checkout.");
    }
  };

  console.log(items);

  return (
    <View style={styles.container}>
      {/* Header & Drawer Toggle */}
      <SafeAreaView style={styles.headerContainer}>
        {/* Menu Button */}
        <TouchableOpacity
            style={styles.menuButton}
            onPress={toggleDrawer}
            accessibilityLabel="Toggle drawer"
        >
          <Ionicons name="menu" size={24} color="black" />
        </TouchableOpacity>

        {/* Cart Toggle Button */}
        <TouchableOpacity
            style={styles.cartButton}
            onPress={isCartOpen ? closeCartDrawer : openCartDrawer}
            accessibilityLabel="Toggle cart"
        >
          <Ionicons name="cart-outline" size={24} color="black" />
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
                  onPress={() => handleItemPress(item, item.price)}
              >
                <MaterialCommunityIcons name="gift" size={60} color="#008080" />
                <Text style={styles.itemText}>{item.name}</Text>
                <Text style={styles.priceText}>{item.price} Points</Text>
                <Text style={{ fontSize: 14, color: "#555", marginTop: 5 }}>
                  In Stock: {item.quantity}
                </Text>
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

      {isCartOpen && (
          <>
            <TouchableOpacity
                style={StyleSheet.absoluteFill}
                onPress={closeCartDrawer}
            />
            <Animated.View
                style={[
                  styles.cartDrawer,
                  { transform: [{ translateX: cartSlideAnim }] },
                ]}
            >
              <Text style={styles.cartTitle}>Your Cart</Text>
              <ScrollView contentContainerStyle={styles.cartContent}>
                {cartItems.map((item, index) => (
                    <View key={index} style={styles.cartItem}>
                      <MaterialCommunityIcons name="gift" size={40} color="#008080" />
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text style={styles.itemText}>{item.name}</Text>
                        <Text style={styles.priceText}>
                          {item.price} × {item.quantity} = {item.price * item.quantity} Points
                        </Text>
                      </View>
                      {/* Decrease Quantity Button */}
                      <TouchableOpacity
                          onPress={() => handleDecreaseQuantity(item._id)}
                          style={styles.decreaseButton}
                      >
                        <Ionicons name="remove-circle-outline" size={24} color="red" />
                      </TouchableOpacity>
                    </View>
                ))}
              </ScrollView>
              <View style={{ marginTop: 20, alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 18, fontWeight: '600' }}>
                  Total:
                  {cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)} points
                </Text>
              </View>
              <TouchableOpacity
                  style={styles.checkoutButton}
                  onPress={handleCheckout}
              >
                <Text style={styles.checkoutText}>Checkout</Text>
              </TouchableOpacity>
            </Animated.View>
          </>
      )}

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
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    zIndex: 10,
  },
  cartButton: {
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
    position: "absolute",
    right: 10,
    margin: 20,
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
    width: width * 0.5,
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
    marginTop: 20,
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
  cartDrawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: width * 0.75,
    backgroundColor: '#fff',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 999,
  },
  cartTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    marginTop: 25,
    color: '#008080',
  },
  cartContent: {
    paddingBottom: 100,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  checkoutButton: {
    marginTop: 20,
    backgroundColor: '#008080',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default StoreScreen;
