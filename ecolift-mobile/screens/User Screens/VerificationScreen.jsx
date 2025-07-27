import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/Api"; // Importing the updated API service

export default function VerificationScreen({ route, navigation }) {
  const { email } = route.params;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const codeInputRefs = useRef([]);

  const handleCodeChange = (text, index) => {
    const sanitized = text.replace(/\D/g, "");
    const newOtp = [...otp];
    newOtp[index] = sanitized;
    setOtp(newOtp);

    if (sanitized && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError("");
    const enteredOtp = otp.map((digit) => digit.trim()).join(""); // Join the OTP digits

    if (enteredOtp.length !== 6) {
      setOtpError("OTP must be exactly 6 digits.");
      return;
    }

    // Convert the OTP to an integer
    const otpInteger = parseInt(enteredOtp, 10);

    if (isNaN(otpInteger)) {
      setOtpError("OTP must be a valid number.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        email: email.trim().toLowerCase(),
        code: otpInteger, // Send the OTP as an integer
      };


      // Make the API call using the imported api service
      const response = await api.post("/auth/verify", payload);


      if (response.data.success) {
        Alert.alert("Success", "Your account has been verified.", [
          {
            text: "Go to Login",
            onPress: () => navigation.replace("LoginScreen"),
          },
        ]);
      } else {
        setOtpError(response.data.message || "Invalid OTP.");
      }
    } catch (error) {
      console.error(
        "Verification error:",
        error?.response?.data || error.message
      );

      const errMsg =
        error.response?.data?.message ||
        "Something went wrong while verifying the code.";
      setOtpError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    Alert.alert("Resend Code", `A new OTP will be sent to: ${email}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="#0A8F7C" />
      </TouchableOpacity>

      <View style={styles.imageContainer}>
        <Image
          source={require("../../assets/VerificationVector.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>User Verification</Text>
      <Text style={styles.subtitle}>Enter the code sent to: {email}</Text>

      <View style={styles.codeContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (codeInputRefs.current[index] = ref)}
            style={styles.codeInput}
            maxLength={1}
            keyboardType="numeric"
            value={digit}
            onChangeText={(text) => handleCodeChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
          />
        ))}
      </View>

      {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

      <TouchableOpacity onPress={handleResendCode}>
        <Text style={styles.resendText}>
          Didn’t receive the code? Resend OTP
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.verifyButton, loading && styles.buttonDisabled]}
        onPress={handleVerifyOtp}
        disabled={loading}
      >
        <Text style={styles.verifyButtonText}>
          {loading ? "Verifying..." : "Verify"}
        </Text>
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
    marginBottom: 30,
  },
  image: {
    width: "100%",
    height: 220,
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 20,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  codeInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 18,
    marginHorizontal: 6,
    backgroundColor: "#F5F5F5",
    color: "#333",
  },
  resendText: {
    color: "#0A8F7C",
    textAlign: "center",
    textDecorationLine: "underline",
    marginBottom: 20,
  },
  verifyButton: {
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
    width: "90%",
    alignSelf: "center",
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
