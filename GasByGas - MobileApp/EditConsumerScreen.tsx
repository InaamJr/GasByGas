import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from "axios";
import { RootStackParamList, EditConsumerScreenNavigationProp } from "./types";

const EditConsumerScreen: React.FC = () => {
  const navigation = useNavigation<EditConsumerScreenNavigationProp>(); // Use the typed navigation prop
  const route = useRoute<RouteProp<RootStackParamList, "EditConsumerScreen">>();
  const { consumerId } = route.params;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNo, setContactNo] = useState("");

  useEffect(() => {
    // Fetch consumer details
    const fetchConsumerDetails = async () => {
      try {
        const response = await axios.get(
          `http://192.168.8.132:5000/api/consumer-details/${consumerId}`
        );
        const data = response.data;
        setName(data.name);
        setEmail(data.email);
        setContactNo(data.contact_no);
      } catch (error) {
        console.error("Error fetching consumer details:", error);
        Alert.alert("Error", "Failed to load consumer details.");
      }
    };

    fetchConsumerDetails();
  }, [consumerId]);

  const handleSave = async () => {
    if (!name || !email || !contactNo) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
  
    try {
      const response = await axios.put(
        "http://192.168.8.132:5000/api/update-consumer",
        { consumer_id: consumerId, name, email, contact_no: contactNo }
      );
  
      if (response.status === 200) {
        Alert.alert("Success", "Details updated successfully.", [
          {
            text: "OK",
            onPress: () =>
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: "Dashboard",
                    params: {
                      consumerName: name, // Pass updated name
                      consumerId,
                    },
                  },
                ],
              }),
          },
        ]);
      } else {
        Alert.alert("Error", "Failed to update details.");
      }
    } catch (error) {
      console.error("Error updating consumer details:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Contact Number</Text>
      <TextInput
        style={styles.input}
        value={contactNo}
        onChangeText={setContactNo}
        placeholder="Enter your contact number"
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 30,
    marginTop: 20,
    color: "#333",
  },
  label: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#FF7F50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EditConsumerScreen;
