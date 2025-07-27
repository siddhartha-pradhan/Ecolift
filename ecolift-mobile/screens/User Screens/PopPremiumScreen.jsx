import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native"; // ✅ import navigation

const PopPremiumScreen = ({ onClose }) => {
  const navigation = useNavigation(); // ✅ get navigation instance

  const handleNavigateToPremium = () => {
    onClose(); // Close the modal first
    setTimeout(() => {
      navigation.navigate("PremiumScreen"); // ✅ navigate after closing
    }, 300); // optional delay for smoother UI
  };

  return (
    <Modal transparent animationType="fade">
      {/* Press anywhere to close */}
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.popupContainer}>
          {/* Close Icon */}
          <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>

          {/* Crown Icon */}
          <MaterialCommunityIcons
            name="crown"
            size={48}
            color="#008080"
            style={styles.crownIcon}
          />

          {/* Title Text */}
          <Text style={styles.titleText}>
            Get exclusive features with{" "}
            <Text style={{ color: "#008080", fontWeight: "bold" }}>
              Ecolift
            </Text>{" "}
            premium
          </Text>

          {/* Subtitle Text */}
          <Text style={styles.subtitleText}>
            Press the button below to know more about the full premium features.
          </Text>

          {/* Premium Button */}
          <TouchableOpacity
            style={styles.premiumButton}
            onPress={handleNavigateToPremium}
          >
            <Text style={styles.premiumButtonText}>Ecolift Premium</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    elevation: 10,
    position: "relative",
  },
  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  crownIcon: {
    marginBottom: 15,
  },
  titleText: {
    fontSize: 16,
    textAlign: "center",
    color: "#000",
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 14,
    textAlign: "center",
    color: "#000",
    marginBottom: 20,
  },
  premiumButton: {
    backgroundColor: "#008080",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  premiumButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PopPremiumScreen;
