import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const PopInfoConfirmation = ({ visible, onClose, name }) => {
  const navigation = useNavigation();

  const handleOkay = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "WelcomeScreenRider" }],
    });
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#aaa" />
              </TouchableOpacity>

              <View style={styles.contentContainer}>
                <View style={styles.iconContainer}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="checkmark" size={40} color="#fff" />
                  </View>
                </View>

                <Text style={styles.congratsText}>
                  Congratulations, {name}!
                </Text>

                <Text style={styles.infoText}>
                  Your form will be verified within 24 hours{"\n"}
                  of the submission
                </Text>

                {/* Okay Button */}
                <TouchableOpacity
                  style={styles.okayButton}
                  onPress={handleOkay}
                >
                  <Text style={styles.okayButtonText}>Okay</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
  },
  contentContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  iconContainer: {
    marginBottom: 25,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#008080",
    justifyContent: "center",
    alignItems: "center",
  },
  congratsText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  infoText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  okayButton: {
    backgroundColor: "#008080",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
  },
  okayButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PopInfoConfirmation;
