//@ts-check
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { CommonActions } from "@react-navigation/native";

const WelcomeScreenRider = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image
        // @ts-ignore
        source={require("../../assets/Landing.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Welcome to EcoLift Drives</Text>
      <Text style={styles.subtitle}>Nepal's first free ride-sharing app</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("LoginScreenRider")}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.signupButton]}
        onPress={() => navigation.navigate("SignupScreenRider")}
      >
        <Text style={styles.buttonText}>Sign up</Text>
      </TouchableOpacity>

      <View style={styles.driverModeContainer}>
        <Text style={styles.driverModeText}>Not a driver? </Text>
        <TouchableOpacity
          onPress={() => {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "WelcomeScreen" }],
              })
            );
          }}
        >
          <Text style={styles.driverModeLink}>Switch to Passenger mode</Text>
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

export default WelcomeScreenRider;
