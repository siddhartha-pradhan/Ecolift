//@ts-check
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
import api from "../../services/Api"; // Importing the API service

const VerificationScreenRider = ({ route, navigation }) => {
  const { email } = route.params;
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [codeError, setCodeError] = useState("");
  const codeInputRefs = useRef([]);

  const handleCodeChange = (text, index) => {
    const sanitized = text.replace(/\D/g, "");
    const newCode = [...code];
    newCode[index] = sanitized;
    setCode(newCode);

    if (sanitized && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && code[index] === "" && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    setCodeError("");
    const enteredCode = code.map((digit) => digit.trim()).join(""); // Join the code digits

    if (enteredCode.length !== 6) {
      setCodeError("Code must be exactly 6 digits.");
      return;
    }

    // Convert the code to an integer
    const codeInteger = parseInt(enteredCode, 10);

    if (isNaN(codeInteger)) {
      setCodeError("Code must be a valid number.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        email: email.trim().toLowerCase(),
        code: codeInteger, // Send the code as an integer
      };


      // Make the API call using the imported api service - using /auth/verify endpoint
      const response = await api.post("/auth/verify", payload);


      if (response.data.success) {
        // Show success alert before navigation
        Alert.alert(
          "Verification Successful",
          "Your email has been verified, let's verify your details now",
          [
            {
              text: "Continue",
              onPress: () => {
                // Navigate to RiderInfoScreen only after user confirms the alert
                navigation.navigate("RiderInfoScreen");
              },
            },
          ]
        );
      } else {
        setCodeError(response.data.message || "Invalid code.");
      }
    } catch (error) {
      console.error(
        "Verification error:",
        error?.response?.data || error.message
      );

      const errMsg =
        error.response?.data?.message ||
        "Something went wrong while verifying the code.";
      setCodeError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    Alert.alert("Resend Code", `A new code will be sent to: ${email}`);
    // TODO: Implement actual resend code logic here
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="#0A8F7C" />
      </TouchableOpacity>

      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          // @ts-ignore
          source={require("../../assets/VerificationVector.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>Rider Email Verification</Text>

      {/* Show Email */}
      <Text style={styles.subtitle}>Enter the code sent to {email}</Text>

      {/* Code Input */}
      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            // @ts-ignore
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

      {codeError ? <Text style={styles.errorText}>{codeError}</Text> : null}

      {/* Resend */}
      <TouchableOpacity onPress={handleResendCode}>
        <Text style={styles.resendText}>
          Didn't receive the code? Resend OTP
        </Text>
      </TouchableOpacity>

      {/* Verify Button */}
      <TouchableOpacity
        style={[styles.verifyButton, loading && styles.buttonDisabled]}
        onPress={handleVerify}
        disabled={loading}
      >
        <Text style={styles.verifyButtonText}>
          {loading ? "Verifying..." : "Verify"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

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

export default VerificationScreenRider;
