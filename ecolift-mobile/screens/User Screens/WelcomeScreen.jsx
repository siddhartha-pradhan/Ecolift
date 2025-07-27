import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { CommonActions } from "@react-navigation/native";

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/Landing.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Welcome to EcoLift</Text>
      <Text style={styles.subtitle}>Nepal's first free ride-sharing app</Text>

      {/* Navigate to the Login screen */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("LoginScreen")}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Navigate to the Signup screen */}
      <TouchableOpacity
        style={[styles.button, styles.signupButton]}
        onPress={() => navigation.navigate("SignupScreen")}
      >
        <Text style={styles.buttonText}>Sign up</Text>
      </TouchableOpacity>

      {/* Navigate to the WelcomeScreenRider for Driver Mode */}
      <View style={styles.driverModeContainer}>
        <Text style={styles.driverModeText}>Want to drive? </Text>
        <TouchableOpacity
          onPress={() => {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "WelcomeScreenRider" }],
              })
            );
          }}
        >
          <Text style={styles.driverModeLink}>Switch to Driver mode</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 24,
    paddingTop: 40,
    overflow:"scroll"
  },
  logo: {
    width: 330,
    height: 450,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#008080",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#008080",
    width: "100%",
    padding: 16,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 3,
  },
  signupButton: {
    backgroundColor: "#006666",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  driverModeContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  driverModeText: {
    fontSize: 14,
    color: "#666666",
  },
  driverModeLink: {
    fontSize: 14,
    color: "#008080",
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});

export default WelcomeScreen;
