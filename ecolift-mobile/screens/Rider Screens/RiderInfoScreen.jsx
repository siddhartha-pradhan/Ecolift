//@ts-check
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DropDownPicker from "react-native-dropdown-picker";
import PopInfoConfirmation from "./PopInfoConfirmation"; // Import the popup component
import api from "../../services/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { height: screenHeight } = Dimensions.get("window");

const RiderInfoScreen = ({ navigation, route }) => {
  // Add state for the confirmation popup
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [username, setUsername] = useState(""); // You can get this from route params or context if needed

  const scrollViewRef = useRef(null);
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [licenseImage, setLicenseImage] = useState(null);
  const [bluebookImage, setBluebookImage] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [keyboardShown, setKeyboardShown] = useState(false);
  const [contentHeight, setContentHeight] = useState(screenHeight);
  const [vehicleOptions, setVehicleOptions] = useState([
    { label: "2 Wheeler", value: "2 Wheeler" },
    { label: "4 Wheeler", value: "4 Wheeler" },
  ]);

  const [isVerifying, setIsVeryfing] = useState(false);

  // Set up keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardShown(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardShown(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Scroll to bottom when images are added
  useEffect(() => {
    if (licenseImage || bluebookImage) {
      // Use setTimeout to ensure scroll happens after layout update
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 0);
    }
  }, [licenseImage, bluebookImage]);

  // Disable scrolling when dropdown is open to prevent the nesting error
  useEffect(() => {
    if (dropdownOpen && scrollViewRef.current) {
      // When dropdown opens, we want to disable scrolling
      scrollViewRef.current.setNativeProps({
        scrollEnabled: false,
      });
    } else if (scrollViewRef.current) {
      // When dropdown closes, re-enable scrolling
      scrollViewRef.current.setNativeProps({
        scrollEnabled: true,
      });
    }
  }, [dropdownOpen]);

  const handleContentSizeChange = (width, height) => {
    setContentHeight(height);
  };

  const handleUploadImage = async (setImage) => {
    Keyboard.dismiss();

    Alert.alert("Select Option", "Choose image source", [
      {
        text: "Camera",
        onPress: async () => {
          const cameraPermission =
            await ImagePicker.requestCameraPermissionsAsync();
          if (!cameraPermission.granted) {
            Alert.alert("Permission Denied", "Camera access is required!");
            return;
          }

          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
          });

          if (!result.canceled) {
            setImage(result.assets[0].uri);
          }
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          const mediaPermission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!mediaPermission.granted) {
            Alert.alert("Permission Denied", "Gallery access is required!");
            return;
          }

          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
          });

          if (!result.canceled) {
            setImage(result.assets[0].uri);
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const isFormComplete =
    vehicleType &&
    vehicleNumber &&
    licenseImage &&
    bluebookImage &&
    termsAccepted;

  const getMimeType = (uri) => {
    const extension = uri.split(".").pop();
    if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
    if (extension === "png") return "image/png";
    return "application/octet-stream"; // fallback
  };
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userName = await AsyncStorage.getItem("userName");
        setUsername(userName);
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchUserData();
  }, []);

  const handleSubmit = async () => {
    // Instead of showing an alert, show the confirmation popup
    try {
      setIsVeryfing(true);
      // Check required fields
      const userId = await AsyncStorage.getItem("userId");
      if (!userId || !vehicleType || !licenseImage || !bluebookImage) {
        Alert.alert("Error", "Please fill all fields and upload both images.");
        return;
      }

      const formData = new FormData();

      formData.append("user", userId);
      formData.append("vehicleDetails", vehicleType);

      // @ts-ignore
      formData.append("licenseImage", {
        uri: licenseImage,
        type: getMimeType(licenseImage),
        name: licenseImage.split("/").pop(),
      });

      const blueBookeMime = getMimeType(bluebookImage);
      // @ts-ignore
      formData.append("bluebookImage", {
        uri: bluebookImage,
        type: getMimeType(bluebookImage),
        name: bluebookImage.split("/").pop(),
      });

      const response = await api.post("/driver", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201 || response.status === 200) {
        Alert.alert("Success", "Driver profile submitted successfully.");
        setShowConfirmation(true);
      } else {
        Alert.alert("Error", "Failed to submit profile.");
      }
    } catch (err) {
      console.error("Error submitting driver profile:", err.response);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsVeryfing(false);
    }

    // TODO: Backend submission
    // You can still perform your backend submission logic here
  };

  // Function to close the confirmation popup
  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    // Optional: Navigate back or to another screen after closing the popup
    // navigation.navigate('Home');
  };

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 0);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        enabled={!dropdownOpen}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollContent,
            { minHeight: screenHeight },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
          onContentSizeChange={handleContentSizeChange}
          scrollEventThrottle={16}
          removeClippedSubviews={false}
          overScrollMode="always"
          scrollEnabled={!dropdownOpen} // Disable scrolling when dropdown is open
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#008080" />
          </TouchableOpacity>

          <Text style={styles.title}>Let's get your vehicle registered</Text>

          {/* Vehicle Type - Handle z-index separately */}
          <View style={[styles.inputContainer, { zIndex: 1000 }]}>
            <Text style={styles.label}>*Vehicle Type</Text>
            <DropDownPicker
              open={dropdownOpen}
              value={vehicleType}
              items={vehicleOptions}
              setOpen={setDropdownOpen}
              setValue={setVehicleType}
              setItems={setVehicleOptions}
              placeholder="Select vehicle type"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              onOpen={() => {
                // Close keyboard when dropdown opens
                Keyboard.dismiss();
                // No need to manually disable ScrollView here, we're using the
                // scrollEnabled prop and useEffect to handle this
              }}
              zIndex={3000}
              zIndexInverse={1000}
              listMode="SCROLLVIEW" // Switch to SCROLLVIEW to avoid virtualized list inside ScrollView
            />
          </View>

          {/* Vehicle Number */}
          <View style={[styles.inputContainer, { zIndex: 500 }]}>
            <Text style={styles.label}>*Vehicle Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter vehicle number"
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
            />
          </View>

          {/* License Image */}
          <View style={styles.inputContainer}>
            <Text style={styles.uploadLabel}>Upload License</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => handleUploadImage(setLicenseImage)}
            >
              <Text style={styles.uploadButtonText}>Choose Image</Text>
            </TouchableOpacity>
            {licenseImage && (
              <Image
                source={{ uri: licenseImage }}
                style={styles.preview}
                onLoad={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 0);
                }}
              />
            )}
          </View>

          {/* Bluebook Image */}
          <View style={styles.inputContainer}>
            <Text style={styles.uploadLabel}>Upload Vehicle Bluebook</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => handleUploadImage(setBluebookImage)}
            >
              <Text style={styles.uploadButtonText}>Choose Image</Text>
            </TouchableOpacity>
            {bluebookImage && (
              <Image
                source={{ uri: bluebookImage }}
                style={styles.preview}
                onLoad={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 0);
                }}
              />
            )}
          </View>

          {/* Terms and Submit */}
          <View style={styles.inputContainer}>
            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: termsAccepted ? "#008080" : "transparent",
                  },
                ]}
                onPress={() => setTermsAccepted(!termsAccepted)}
              >
                {termsAccepted && (
                  <Ionicons name="checkmark" size={18} color="#fff" />
                )}
              </TouchableOpacity>
              <Text style={styles.termsText}>
                Agree to{" "}
                <Text
                  style={styles.termsLink}
                  onPress={() => Alert.alert("Terms", "Show T&Cs here")}
                >
                  Terms and Conditions
                </Text>
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: isFormComplete ? "#008080" : "#ccc" },
              ]}
              onPress={handleSubmit}
              disabled={!isFormComplete || isVerifying}
            >
              {isVerifying ? (
                <ActivityIndicator />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Extra padding at the bottom */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Confirmation Popup */}
      <PopInfoConfirmation
        visible={showConfirmation}
        onClose={handleCloseConfirmation}
        name={username}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 150, // Extra padding at the bottom
  },
  backButton: {
    marginBottom: 30,
  },
  title: {
    fontSize: 25,
    fontWeight: "500",
    color: "#008080",
    marginBottom: 35,
    textAlign: "center",
  },
  label: {
    marginBottom: 5,
    fontSize: 14,
    color: "#333",
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  dropdown: {
    backgroundColor: "#f0f0f0",
    borderColor: "#ccc",
    borderRadius: 10,
    minHeight: 50,
  },
  dropdownContainer: {
    backgroundColor: "#f0f0f0",
    borderColor: "#ccc",
    maxHeight: 150,
  },
  uploadLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
    marginBottom: 5,
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginVertical: 10,
  },
  uploadButtonText: {
    fontSize: 16,
    color: "#333",
  },
  preview: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 15,
    resizeMode: "cover",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#008080",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  termsText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  termsLink: {
    color: "#008080",
    textDecorationLine: "underline",
  },
  submitButton: {
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  bottomPadding: {
    height: 100,
  },
});

export default RiderInfoScreen;
