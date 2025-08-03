import React, {useEffect, useRef, useState} from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    ScrollView, Animated, Dimensions, TouchableOpacity, Platform, StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DriverService from "../../services/DriverService";
import { Ionicons } from "@expo/vector-icons";
import DrawerScreenRider from "./DrawerScreenRider";
import { REACT_APP_API_URL } from "@env";

const UserOrdersScreen = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState();

    const { width } = Dimensions.get("window");

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const slideAnim = useRef(new Animated.Value(-width * 0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const shadowAnim = useRef(new Animated.Value(0)).current;

    const toggleDrawer = () => {
        setIsDrawerOpen(prev => !prev);
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

    useEffect(() => {
        const fetchUserDataAndOrders = async () => {
            try {
                const userEmail = await AsyncStorage.getItem("userEmail");
                const driverList = await DriverService.getDriverById();
                const user = driverList.find((d) => d.email === userEmail);

                if (user) {
                    setUserData(user);
                    const token = await AsyncStorage.getItem("token");

                    const apiUrl = REACT_APP_API_URL;
                    console.log(apiUrl);

                    const res = await fetch(`${apiUrl}/api/v1/order/user`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    const data = await res.json();

                    if (res.ok) {
                        setOrders(data);
                    } else {
                        console.error(data.error || "Failed to fetch orders.");
                    }
                }
            } catch (err) {
                console.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDataAndOrders();
    }, []);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#008080" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <SafeAreaView style={styles.headerContainer}>
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={toggleDrawer}
                    accessibilityLabel="Toggle drawer"
                >
                    <Ionicons name="menu" size={24} color="black" />
                </TouchableOpacity>
            </SafeAreaView>
            <Text style={styles.header}>Your Orders</Text>
            <FlatList
                data={orders}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                    <View style={styles.orderCard}>
                        <View style={styles.orderHeader}>
                            <Ionicons name="receipt-outline" size={24} color="#008080" />
                            <Text style={styles.orderTitle}>Order ID: {"\n"}{item._id}</Text>
                        </View>
                        <Text style={styles.orderDate}>
                            Date: {new Date(item.createdAt).toLocaleString()}
                        </Text>
                        <Text>Total: ${item.totalAmount}</Text>
                        <Text>Claim Code: {item.claimCode}</Text>
                        <Text>Status: {item.isClaimed ? "Claimed" : "Not Claimed"}</Text>
                        <View style={styles.itemList}>
                            {item.orderDetails.map((detail, idx) => (
                                <Text key={idx} style={styles.itemText}>
                                    - {detail.itemId?.name || "Item"} x {detail.quantity}
                                </Text>
                            ))}
                        </View>
                    </View>
                )}
            />
            {isDrawerOpen && (
                <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        onPress={toggleDrawer}
                    />
                </Animated.View>
            )}

            <DrawerScreenRider
                isVisible={isDrawerOpen}
                onClose={toggleDrawer}
                slideAnim={slideAnim}
                opacityAnim={opacityAnim}
                shadowAnim={shadowAnim}
            />

        </SafeAreaView>
    );
};

export default UserOrdersScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        fontSize: 24,
        fontWeight: "700",
        color: "#008080",
        marginTop: 60,
        marginBottom: 10,
        textAlign: "center",
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 30,
        marginTop: 30
    },
    orderCard: {
        backgroundColor: "#f8f8f8",
        padding: 16,
        marginBottom: 16,
        borderRadius: 10,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    orderTitle: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    orderDate: {
        fontSize: 14,
        color: "#666",
        marginBottom: 6,
    },
    itemList: {
        marginTop: 10,
    },
    itemText: {
        fontSize: 14,
        color: "#444",
    },
    headerContainer: {
        position: "absolute",
        top: Platform.OS === "android" ? StatusBar.currentHeight : 10,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 10,
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
