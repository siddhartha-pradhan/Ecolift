//@ts-check
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons, Feather } from "@expo/vector-icons";
import api from "../../services/Api"; // ✅ import the axios instance
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRide } from "../../context/RideContext";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdVisible, setIsAdVisible] = useState(false);
  const { updateUserData } = useRide();

  const handleSendCode = async () => {
    if (!email || !password) {
      setError("Email and password cannot be empty.");
      Alert.alert("Login Unsuccessful", "Email and password cannot be empty.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("Invalid email address.");
      Alert.alert("Login Unsuccessful", "Please enter a valid email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      Alert.alert(
        "Login Unsuccessful",
        "Password must be at least 6 characters."
      );
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const data = response.data;
      if (data.user.role !== "Normal") {
        setError("You are not authorized to login as a user.");
        Alert.alert(
          "Login Unsuccessful",
          "You are not authorized to login as a user."
        );
        return;
      }
      updateUserData(response.data);
      // // Store the token and user info (name, email) in AsyncStorage
      await AsyncStorage.setItem("token", data.token); // Store JWT token
      await AsyncStorage.setItem("userName", data.user.name); // Store name
      await AsyncStorage.setItem("userEmail", data.user.email); // Store email
      await AsyncStorage.setItem("userRole", response.data.user.role); // Store user ID
      await AsyncStorage.setItem("userPhone", response.data.user.phonenumber); // Store user phone
      await AsyncStorage.setItem("userId", response.data.user._id);

      setError("");
      Alert.alert("Login Successful", "Welcome back!", [
        {
          text: "Continue",
          onPress: () => {
            setEmail("");
            setPassword("");
            if (response.data.user.isPremium) {
              navigation.navigate("MainScreen");
            } else {
              setIsAdVisible(true); // 👈 show ad screen
              setTimeout(() => {
                setIsAdVisible(false);
                navigation.navigate("MainScreen");
              }, 15000);
            }
          },
        },
      ]);
    } catch (err) {
      console.error("Login Error:", err);
      // console.error("Login Error:", err.response?.data || err.message);
      // const message =
      //   err.response?.data?.message ||
      //   "Please check your network or try again.";
      // setError(message);
      // Alert.alert("Login Failed", message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  if (isAdVisible) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.adContainer}>
          <Text style={styles.adText}>
            🌱 Sponsored Ad: EcoLift saves the planet!
          </Text>
          <ActivityIndicator
            size="large"
            color="#0A8F7C"
            style={{ marginTop: 20 }}
          />
          <Text style={styles.adCountdown}>Redirecting in 15 seconds...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <Ionicons name="chevron-back" size={24} color="#0A8F7C" />
      </TouchableOpacity>

      <View style={styles.imageContainer}>
        <Image
          // @ts-ignore
          source={require("../../assets/LoginVector.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.welcomeText}>
        Welcome back, <Text style={styles.boldText}>EcoLift User!</Text>
      </Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Feather name="mail" size={20} color="#999" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="*Email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Feather name="lock" size={20} color="#999" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="*Password"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Feather
            name={showPassword ? "eye" : "eye-off"}
            size={20}
            color="#999"
            style={{ marginRight: 10 }}
          />
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Text style={styles.verificationText}>
        Please enter your credentials to proceed.
      </Text>

      <TouchableOpacity
        style={[
          styles.sendCodeButton,
          (!email || !password || loading) && styles.disabledButton,
        ]}
        onPress={handleSendCode}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.sendCodeButtonText}>Login</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  image: {
    width: "100%",
    height: 220,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 20,
    color: "#333",
    marginBottom: 30,
    textAlign: "center",
    fontWeight: "500",
  },
  boldText: {
    color: "#0A8F7C",
    fontWeight: "bold",
  },
  inputContainer: {
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    width: "90%",
    alignSelf: "center",
  },
  inputIcon: {
    marginLeft: 5,
  },
  input: {
    height: 50,
    flex: 1,
    paddingLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  verificationText: {
    fontSize: 14,
    color: "#999",
    marginBottom: 20,
    marginLeft: 5,
    textAlign: "center",
  },
  sendCodeButton: {
    backgroundColor: "#0A8F7C",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 20,
    width: "90%",
    alignSelf: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  sendCodeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
  adContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
  },
  adText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0A8F7C",
    textAlign: "center",
  },
  adCountdown: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
    textAlign: "center",
  },
});
