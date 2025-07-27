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
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons, AntDesign, Feather } from "@expo/vector-icons";
import api from "../../services/Api"; // Import the API instance

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [termsError, setTermsError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async () => {
    setIsLoading(true);
    setNameError("");
    setPhoneError("");
    setEmailError("");
    setPasswordError("");
    setTermsError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedPhone = phoneNumber.trim();

    if (trimmedName.length < 3) {
      setNameError("Name should be at least 3 characters long.");
      return;
    }

    if (trimmedPhone.length !== 10) {
      setPhoneError("Phone number should be exactly 10 digits.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    if (trimmedPassword.length < 6) {
      setPasswordError("Password should be at least 6 characters.");
      return;
    }

    if (!agreeToTerms) {
      setTermsError("Please agree to the Terms and Conditions.");
      return;
    }

    try {
      const response = await api.post("/auth/register", {
        name: trimmedName,
        phonenumber: trimmedPhone,
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert(
          "Success",
          "A verification code has been sent to your email address.",
          [
            {
              text: "OK",
              onPress: () => {
                setName("");
                setPhoneNumber("");
                setEmail("");
                setPassword("");
                setAgreeToTerms(false);
                navigation.navigate("VerificationScreen", {
                  email: trimmedEmail,
                });
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", response.data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Signup error:", error);

      if (error.response?.data?.message) {
        Alert.alert("Error", error.response.data.message);
      } else {
        Alert.alert(
          "Error",
          "An error occurred while sending the OTP. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "android" ? 100 : 0}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Ionicons name="chevron-back" size={24} color="#0A8F7C" />
            </TouchableOpacity>

            <View style={styles.content}>
              <Image
                // @ts-ignore
                source={require("../../assets/Vector.png")}
                style={styles.image}
                resizeMode="contain"
              />

              <Text style={styles.title}>
                Let's get started,{" "}
                <Text style={styles.highlightText}>EcoLift</Text> user.
              </Text>

              <View style={styles.form}>
                {/* Name Input */}
                <View style={styles.inputContainer}>
                  <Feather
                    name="edit-2"
                    size={20}
                    color="#999"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="*Name"
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
                {nameError && <Text style={styles.errorText}>{nameError}</Text>}

                {/* Phone Input */}
                <View style={styles.inputContainer}>
                  <AntDesign
                    name="phone"
                    size={20}
                    color="#999"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="*Phone"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    maxLength={10}
                    value={phoneNumber}
                    onChangeText={(text) =>
                      setPhoneNumber(text.replace(/[^0-9]/g, ""))
                    }
                  />
                </View>
                {phoneError && (
                  <Text style={styles.errorText}>{phoneError}</Text>
                )}

                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Feather
                    name="mail"
                    size={20}
                    color="#999"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="*Email"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
                {emailError && (
                  <Text style={styles.errorText}>{emailError}</Text>
                )}

                {/* Password Input with eye toggle */}
                <View style={styles.inputContainer}>
                  <Feather
                    name="lock"
                    size={20}
                    color="#999"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="*Password"
                    placeholderTextColor="#999"
                    secureTextEntry={!isPasswordVisible}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    style={{ paddingHorizontal: 10 }}
                  >
                    <Feather
                      name={isPasswordVisible ? "eye" : "eye-off"}
                      size={20}
                      color="#999"
                    />
                  </TouchableOpacity>
                </View>
                {passwordError && (
                  <Text style={styles.errorText}>{passwordError}</Text>
                )}

                <Text style={styles.infoText}>
                  A verification code will be sent to your email address.
                </Text>

                {/* Terms and Conditions */}
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setAgreeToTerms(!agreeToTerms)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      agreeToTerms && styles.checkboxChecked,
                    ]}
                  >
                    {agreeToTerms && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.checkboxText}>
                    Agree to{" "}
                    <Text style={styles.checkboxLink}>
                      Terms and Conditions
                    </Text>
                  </Text>
                </TouchableOpacity>
                {termsError && (
                  <Text style={styles.errorText}>{termsError}</Text>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.button,
                    (!name ||
                      !phoneNumber ||
                      !email ||
                      !password ||
                      !agreeToTerms) &&
                      styles.buttonDisabled,
                  ]}
                  onPress={handleSendCode}
                  disabled={
                    !name ||
                    !phoneNumber ||
                    !email ||
                    !password ||
                    !agreeToTerms
                  }
                >
                  {isLoading ? (
                    <ActivityIndicator />
                  ) : (
                    <Text style={styles.buttonText}>Send code</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 100,
  },
  image: {
    width: "100%",
    height: 220,
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    color: "#333",
    marginBottom: 30,
    textAlign: "center",
    fontWeight: "500",
  },
  highlightText: {
    color: "#0A8F7C",
    fontWeight: "bold",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
  },
  inputIcon: {
    marginLeft: 15,
  },
  input: {
    height: 50,
    paddingLeft: 15,
    borderRadius: 10,
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    color: "#999",
    marginBottom: 20,
    marginLeft: 5,
    textAlign: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#0A8F7C",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#0A8F7C",
  },
  checkboxText: {
    fontSize: 14,
    color: "#333",
  },
  checkboxLink: {
    color: "#0A8F7C",
    fontWeight: "500",
  },
  button: {
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
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  driverPrompt: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },

  linkText: {
    color: "#007BFF",
    fontWeight: "600",
  },
});
