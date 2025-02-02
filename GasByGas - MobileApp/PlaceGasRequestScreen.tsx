import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

// TypeScript Interfaces
interface GasType {
  type_id: number;
  name: string;
}

interface GasRequest {
  gasType: number;
  quantity: string;
}

interface Outlet {
  outlet_id: number;
  outlet_name: string;
  district: string;
}

const PlaceGasRequestScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [gasTypes, setGasTypes] = useState<GasType[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [selectedGasRequests, setSelectedGasRequests] = useState<GasRequest[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<number | null>(null);
  const [outletModalVisible, setOutletModalVisible] = useState(false);
  const [pickupDate, setPickupDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchGasTypes = async () => {
      try {
        const response = await axios.get<GasType[]>("http://192.168.8.132:5000/api/cylinder-types");
        setGasTypes(response.data);
      } catch (error) {
        console.error("Error fetching gas types:", error);
      }
    };

    const fetchOutlets = async () => {
      try {
        const response = await axios.get<Outlet[]>("http://192.168.8.132:5000/api/outlets");
        console.log(response.data); // Debugging: Log fetched outlet data
        setOutlets(response.data);
      } catch (error) {
        console.error("Error fetching outlets:", error);
      }
    };

    fetchGasTypes();
    fetchOutlets();
  }, []);

  const handleGasTypeSelect = (typeId: number) => {
    if (selectedGasRequests.some((req) => req.gasType === typeId)) {
      Alert.alert("Error", "This gas type is already selected.");
      return;
    }
    setSelectedGasRequests([...selectedGasRequests, { gasType: typeId, quantity: "" }]);
  };

  const handleQuantityChange = (typeId: number, quantity: string) => {
    const updatedRequests = selectedGasRequests.map((req) =>
      req.gasType === typeId ? { ...req, quantity } : req
    );
    setSelectedGasRequests(updatedRequests);
  };

  const handleRemoveGasRequest = (typeId: number) => {
    const updatedRequests = selectedGasRequests.filter((req) => req.gasType !== typeId);
    setSelectedGasRequests(updatedRequests);
  };

  const handlePlaceRequest = async () => {
    if (!selectedOutlet) {
      Alert.alert('Error', 'Please select an outlet.');
      return;
    }
  
    if (
      selectedGasRequests.length === 0 ||
      selectedGasRequests.some((req) => !req.quantity || req.quantity <= 0)
    ) {
      Alert.alert('Error', 'Please enter valid quantities for all selected gas types.');
      return;
    }
  
    try {
      // Retrieve the logged-in consumer ID from AsyncStorage
      const loggedInConsumerId = await AsyncStorage.getItem('consumer_id');
      if (!loggedInConsumerId) {
        Alert.alert('Error', 'Consumer ID not found. Please log in again.');
        return;
      }
  
      const requests = selectedGasRequests.map((req) => ({
        gas_type_id: req.gasType,
        quantity: parseInt(req.quantity, 10),
      }));
  
      const requestData = {
        consumer_id: parseInt(loggedInConsumerId), // Use the logged-in consumer's ID
        outlet_id: selectedOutlet,
        expected_pickup_date: pickupDate.toISOString().split('T')[0],
        requests,
      };
  
      console.log('Request Data:', requestData); // Debugging log
  
      const response = await axios.post('http://192.168.8.132:5000/api/gas-requests', requestData);
  
      if (response.status === 201) {
        Alert.alert('Success', 'Gas request placed successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to place gas request.');
      }
    } catch (error: any) {
      if (error.response) {
        console.error('Error placing gas request:', error.response.data);
        Alert.alert('Error', error.response.data.error || 'Failed to place gas request.');
      } else {
        console.error('Error placing gas request:', error.message);
        Alert.alert('Error', 'Failed to place gas request.');
      }
    }
  };  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Place Gas Request</Text>

      {/* Gas Types */}
      <Text style={styles.sectionTitle}>Select Gas Types</Text>
      <FlatList
        data={gasTypes}
        keyExtractor={(item) => item.type_id.toString()}
        horizontal
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.gasCard,
              selectedGasRequests.some((req) => req.gasType === item.type_id) && styles.gasCardSelected,
            ]}
            onPress={() => handleGasTypeSelect(item.type_id)}
          >
            <Text style={styles.gasCardText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Selected Gas Requests */}
      {selectedGasRequests.map((req) => (
        <View key={req.gasType} style={styles.selectedGasRow}>
          <Text style={styles.selectedGasLabel}>
            {gasTypes.find((type) => type.type_id === req.gasType)?.name || ""}
          </Text>
          <TextInput
            style={styles.quantityInput}
            placeholder="Quantity"
            keyboardType="numeric"
            value={req.quantity}
            onChangeText={(text) => handleQuantityChange(req.gasType, text)}
          />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveGasRequest(req.gasType)}
          >
            <Text style={styles.removeButtonText}>X</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Outlet Selection */}
      <Text style={styles.sectionTitle}>Select Outlet</Text>
      <TouchableOpacity
        style={styles.outletButton}
        onPress={() => setOutletModalVisible(true)}
      >
        <Text>{selectedOutlet ? outlets.find((o) => o.outlet_id === selectedOutlet)?.outlet_name : "Select Outlet"}</Text>
      </TouchableOpacity>
      <Modal visible={outletModalVisible} transparent>
        <View style={styles.modal}>
          <FlatList
            data={outlets}
            keyExtractor={(item) => item.outlet_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedOutlet(item.outlet_id);
                  setOutletModalVisible(false);
                }}
              >
                {/* Outlet Name */}
                <Text style={styles.outletName}>{item.outlet_name || "Unnamed Outlet"}</Text>
                
                {/* District */}
                <Text style={styles.outletDistrict}>{item.district}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {/* Pickup Date */}
      <Text style={styles.sectionTitle}>Expected Pickup Date</Text>
      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text>{pickupDate.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          style={styles.datePicker}
          value={pickupDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setPickupDate(date);
          }}
        />
      )}

      {/* Place Request Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handlePlaceRequest}>
        <Text style={styles.submitButtonText}>Place Request</Text>
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
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 15,
  },
  gasCard: {
    height: 55,
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gasCardSelected: {
    backgroundColor: "#FF7F50",
  },
  gasCardText: {
    color: "#333",
  },
  selectedGasRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  selectedGasLabel: {
    flex: 2,
  },
  quantityInput: {
    flex: 1,
    borderColor: "#DDD",
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
    marginHorizontal: 5,
  },
  removeButton: {
    flex: 0.5,
    backgroundColor: "#FF4D4D",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  outletButton: {
    width: "75%",
    backgroundColor: "#F9F9F9",
    borderWidth: 0.5,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
  },
  datePickerButton: {
    backgroundColor: "#DDD",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  datePicker: {
    width: 200,
    marginLeft: -10,
    marginTop: 10,
    marginBottom: -47,
  },
  submitButton: {
    backgroundColor: "#FF7F50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 90,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  modal: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 30,
    paddingTop: 60,
  },
  modalItem: {
    backgroundColor: "#FFF",
    padding: 25,
    marginHorizontal: 20,
    marginVertical: 5,
    borderRadius: 10,
  },
  outletName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333", // Darker for better visibility
  },
  outletDistrict: {
    fontSize: 14,
    color: "#666", // Slightly lighter color to differentiate
  },
});

export default PlaceGasRequestScreen;


