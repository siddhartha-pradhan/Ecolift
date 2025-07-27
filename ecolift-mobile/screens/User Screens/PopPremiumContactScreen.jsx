import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const PopPremiumContactScreen = ({ onClose }) => {
  return (
    <Modal transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.popupContainer}>
          {/* Close Icon */}
          <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color="#000" />
          </TouchableOpacity>

          {/* Crown Icon */}
          <MaterialCommunityIcons
            name="crown"
            size={60}
            color="gold"
            style={styles.crownIcon}
          />

          {/* Title Text */}
          <Text style={styles.titleText}>
            Contact the admin for activating your Premium Account.
          </Text>

          {/* Subtitle Text */}
          <Text style={styles.subtitleText}>
            {/* First Sentence */}
            Just at <Text style={styles.priceText}>NRS 500</Text> per month.
            {"\n"}
          </Text>

          <Text style={styles.subtitleSecondText}>
            {/* Second Sentence */}
            Reach out to admin via email at{" "}
            <Text style={{ color: "#008080", fontWeight: "bold" }}>
              ecolift99@gmail.com
            </Text>
            {"\n "}
            for more details.
          </Text>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // Slightly darker overlay for better contrast
    justifyContent: "center",
    alignItems: "center",
  },
  popupContainer: {
    width: "85%", // Increase width for a less congested look
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 35, // More padding for space
    alignItems: "center",
    elevation: 10,
    position: "relative",
  },
  closeIcon: {
    position: "absolute",
    top: 15,
    right: 15,
  },
  crownIcon: {
    marginBottom: 25, // More space below the crown icon
  },
  titleText: {
    fontSize: 20, // Larger font size for title
    textAlign: "center",
    color: "#000",
    marginBottom: 20, // Increased space after title
    fontWeight: "600", // Make it slightly bold for emphasis
  },
  subtitleText: {
    fontSize: 16, // Slightly larger font size for easier reading
    textAlign: "center",
    color: "#000",
    lineHeight: 24, // Reduced line height for tighter spacing
    marginBottom: 5, // Decreased margin for minimal space
    letterSpacing: 0.5, // Subtle spacing between letters for a minimalist feel
  },
  subtitleSecondText: {
    fontSize: 16, // Same font size for second part, to keep uniformity
    textAlign: "center",
    color: "#000",
    lineHeight: 24, // Matching line height for tighter spacing
    marginBottom: 10, // Slightly more space below for the second sentence
    letterSpacing: 0.5, // Same letter spacing as the first sentence
  },
  priceText: {
    color: "#008080", // Color change for NRS 500
    fontWeight: "bold", // Bold to make it stand out
  },
  closeButton: {
    backgroundColor: "#008080",
    paddingVertical: 15, // Larger padding for easier touch
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 18, // Slightly larger text on button
    fontWeight: "600",
  },
});

export default PopPremiumContactScreen;
