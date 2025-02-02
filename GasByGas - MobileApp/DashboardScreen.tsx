import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Modal,
  Keyboard,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { DashboardScreenNavigationProp, RootStackParamList, GasToken } from "./types";


type GasType = {
  type_id: number;
  name: string;
  price: number;
  weight_kg: number;
  image: any;
};

type Request = {
  request_id: number;
  request_date: string;
  status: "pending" | "accepted" | "rejected";
};


const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, "Dashboard">>();
  const [gasTypes, setGasTypes] = useState<GasType[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [consumerName, setConsumerName] = useState(route.params?.consumerName || "Consumer");
  const consumerId = route.params?.consumerId;
  const [tokenData, setTokenData] = useState<GasToken | null>(null);
  const [isTokenModalVisible, setTokenModalVisible] = useState(false);


  // Fetch updated consumer details when the screen regains focus
  useFocusEffect(
    React.useCallback(() => {
      if (consumerId) {
        const fetchUpdatedConsumerDetails = async () => {
          try {
            const response = await fetch(
              `http://192.168.8.132:5000/api/consumer-details/${consumerId}`
            );
            if (!response.ok) {
              console.error("Failed to fetch updated consumer details");
              return;
            }
            const data = await response.json();
            setConsumerName(data.name); // Update the consumer name
          } catch (error) {
            console.error("Error fetching updated consumer details:", error);
          }
        };

        fetchUpdatedConsumerDetails();
      }
    }, [consumerId]) // Dependency ensures this runs when consumerId changes
  );

  useFocusEffect(
    React.useCallback(() => {
      fetchRequests();
    }, [consumerId])
  );

  // Fetch requests when the screen is focused
  const fetchRequests = async () => {
    if (!consumerId) {
      console.error("Consumer ID is missing!");
      return;
    }

    try {
      const response = await fetch(
        `http://192.168.8.132:5000/api/gas-requests?consumer_id=${consumerId}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch requests:", errorText);
        return;
      }

      const data = await response.json();
      console.log("Fetched Requests:", data);
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  useEffect(() => {
    const fetchGasTypes = async () => {
      try {
        const response = await fetch("http://192.168.8.132:5000/api/cylinder-types");
        if (!response.ok) {
          console.error("Failed to fetch gas types:", response.statusText);
          return;
        }
        const data = await response.json();

        const gasTypeImages = [
          require("./assets/GasS.png"),
          require("./assets/GasM.png"),
          require("./assets/GasL.png"),
        ];

        const gasTypesWithDetails = data.map((item: any, index: number) => {
          let formattedName = "";
          if (item.name.includes("LP-Small")) {
            formattedName = `Small ${item.weight_kg}kg`;
          } else if (item.name.includes("LP-Medium")) {
            formattedName = `Medium ${item.weight_kg}kg`;
          } else if (item.name.includes("LP-Large")) {
            formattedName = `Large ${item.weight_kg}kg`;
          }

          return {
            ...item,
            name: formattedName,
            image: gasTypeImages[index],
          };
        });

        setGasTypes(gasTypesWithDetails);
      } catch (error) {
        console.error("Error fetching gas types:", error);
      }
    };

    fetchGasTypes();
  }, []);

  // Function to fetch token details
  const fetchTokenDetails = async (requestId: number) => {
    try {
      const response = await fetch(`http://192.168.8.132:5000/api/token-details/${requestId}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch token:", errorText);
        return;
      }
      const data = await response.json();
      setTokenData(data);
      setTokenModalVisible(true);
    } catch (error) {
      console.error("Error fetching token:", error);
    }
  };

  const handleAvatarPress = () => {
    setDropdownVisible((prev) => !prev);
  };

  // const handleOutsideClick = () => {
  //   setDropdownVisible(false);
  //   Keyboard.dismiss();
  // };

  // Handle logout functionality
  const handleLogout = () => {
    // Clear session or token storage here (if applicable)
    // For example, if you're using AsyncStorage:
    // await AsyncStorage.removeItem("userToken");

    // Reset navigation to LoginScreen to prevent navigating back
    navigation.reset({
      index: 0,
      routes: [{ name: "LoginScreen" }],
    });
  };

  // Function to format date (Remove Time)
  const formatDate = (dateString: string) => {
    return dateString.split("T")[0]; // Extract YYYY-MM-DD from "YYYY-MM-DDTHH:MM:SS"
  };

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "#4CAF50"; // Green
      case "used":
        return "#007BFF"; // Blue
      case "expired":
        return "#F44336"; // Red
      case "reallocated":
        return "#FF9800"; // Orange
      default:
        return "#000"; // Default Black
    }
  };

  return (
    <View style={styles.container}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.consumerName}>{consumerName}</Text>
        </View>
        <TouchableOpacity onPress={handleAvatarPress}>
            <Image source={require("./assets/avatar.png")} style={styles.avatar} />
        </TouchableOpacity>
        {isDropdownVisible && (
          <View style={styles.dropdown}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setDropdownVisible(false);
                navigation.navigate("EditConsumerScreen", { consumerId });
              }}
            >
              <Text style={styles.dropdownText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleLogout} // Call handleLogout
            >
              <Text style={[styles.dropdownText, styles.logoutText]}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Gas Types */}
      <Text style={styles.sectionTitle}>Gas Types</Text>
      <View style={styles.gasTypeCard}>
        {gasTypes.map((item) => (
          <View key={item.type_id} style={styles.gasTypeRow}>
            <Image source={item.image} style={styles.gasIcon} />
            <View style={styles.gasTypeDetails}>
              <Text style={styles.gasName}>{item.name.split(" ")[0]}</Text>
              <Text style={styles.gasWeight}>{item.name.split(" ")[1]}</Text>
            </View>
            <Text style={styles.gasPrice}>
              LKR {item.price !== undefined ? parseFloat(String(item.price)).toFixed(2) : "N/A"}
            </Text>
          </View>
        ))}
      </View>

      {/* Requests */}
      <Text style={[styles.sectionTitle, styles.requestsTitle]}>Requests</Text>
      <View style={styles.requestsContainer}>
        <View style={styles.requestsHeader}>
          <Text style={[styles.requestsHeaderText, styles.headerDate]}>Placed Date</Text>
          <Text style={[styles.requestsHeaderText, styles.headerStatus]}>Status</Text>
          <Text style={[styles.requestsHeaderText, styles.headerToken]}>Token</Text>
        </View>
        <FlatList
          data={requests}
          renderItem={({ item }) => (
            <View style={styles.requestRow}>
              <Text style={styles.requestDate}>{item.request_date.substring(0, 10)}</Text>
              <Text style={[styles.requestStatus, styles[`status_${item.status}`]]}>{item.status}</Text>
              <TouchableOpacity
                style={styles.viewToken}
                disabled={item.status !== "accepted"}
                onPress={() => fetchTokenDetails(item.request_id)}
              >
                <Text style={{ color: item.status === "accepted" ? "#007BFF" : "#A0A0A0" }}>
                  View Token
                </Text>
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.request_id.toString()}
          horizontal={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={styles.requestList}
        />
      </View>

      {/* Add Request Button */}
      <TouchableOpacity
        style={styles.addRequestButton}
        onPress={() => navigation.navigate("PlaceGasRequest")}
      >
        <Text style={styles.addRequestText}>+</Text>
      </TouchableOpacity>
      
      
      {/* Updated Token Modal */}
      <Modal visible={isTokenModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {tokenData ? (
              <>
                <Text style={styles.modalTitle}>Gas Token</Text>

                {/* Token Number */}
                <View style={styles.tokenSection}>
                  <Text style={styles.tokenLabel}>Token No:</Text>
                  <Text style={styles.tokenValue}>{tokenData.token_no}</Text>
                </View>

                {/* Outlet Name */}
                <View style={styles.tokenSection}>
                  <Text style={styles.tokenLabel}>Outlet:</Text>
                  <Text style={styles.tokenValue}>{tokenData.outlet_name}</Text>
                </View>

                {/* Pickup Date - Formatted */}
                <View style={styles.tokenSection}>
                  <Text style={styles.tokenLabel}>Pickup Date:</Text>
                  <Text style={styles.tokenValue}>{formatDate(tokenData.expected_pickup_date)}</Text>
                </View>

                {/* Expiry Date - Formatted */}
                <View style={styles.tokenSection}>
                  <Text style={styles.tokenLabel}>Expiry Date:</Text>
                  <Text style={[styles.tokenValue, styles.expiryDate]}>
                    {formatDate(tokenData.expiry_date)}
                  </Text>
                </View>

                {/* Token Status - Color-Coded */}
                <View style={styles.tokenSection}>
                  <Text style={styles.tokenLabel}>Status:</Text>
                  <Text
                    style={[
                      styles.tokenValue,
                      { color: getStatusColor(tokenData?.status || "valid"), fontWeight: "bold" },
                    ]}
                  >
                    {tokenData?.status?.toUpperCase()}
                  </Text>
                </View>

                {/* Gas Details */}
                <Text style={styles.sectionSubtitle}>Gas Types</Text>
                {tokenData.gasDetails.map((gas, index) => (
                  <View key={index} style={styles.gasDetailRow}>
                    <Text style={styles.gasName}>{gas.cylinder_name}</Text>
                    <Text style={styles.gasQuantity}>{gas.quantity} qty</Text>
                  </View>
                ))}

                {/* Close Button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setTokenModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.loadingText}>Loading token details...</Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F5F5F5",
    padding: 30,
  },
  welcomeSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: "#333",
  },
  consumerName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  dropdown: {
    position: "absolute",
    top: 70,
    right: 20,
    backgroundColor: "#FFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    zIndex: 1000, // Ensures it appears above other elements
  },
  dropdownItem: {
    paddingVertical: 10,
    // borderBottomWidth: 0.5,
    // borderBottomColor: "#DDD",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  logoutText: {
    color: "#FF4D4D",
    fontWeight: "bold",
  },
  sectionTitle: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 10,
  },
  gasTypeCard: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gasTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
  },
  gasTypeDetails: {
    flex: 1,
  },
  gasIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  gasName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  gasWeight: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  gasPrice: {
    fontSize: 14,
    color: "#777",
    marginLeft: "auto",
    paddingRight: 10,
  },
  requestsTitle: {
    marginTop: 10,
  },
  requestsContainer: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 15,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  requestList: {
    height: 125,
  },
  requestsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  requestsHeaderText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#c8c7c7",
  },
  headerDate: {
    flex: 1,
  },
  headerStatus: {
    flex: 1,
    textAlign: "center",
  },
  headerToken: {
    flex: 1,
    textAlign: "right",
  },
  requestRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 10,
    marginBottom: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  requestDate: {
    flex: 1,
    fontSize: 14,
    color: "#555",
  },
  requestStatus: {
    flex: 1,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  viewToken: {
    flex: 1,
    alignItems: "flex-end",
  },
  status_pending: {
    color: "#FFC107",
  },
  status_accepted: {
    color: "#4CAF50",
  },
  status_rejected: {
    color: "#F44336",
  },
  addRequestButton: {
    position: "absolute",
    bottom: 20,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF7F50",
    alignItems: "center",
    justifyContent: "center",
  },
  addRequestText: {
    fontSize: 50,
    color: "#FFF",
    fontWeight: "bold",
    marginTop: -5,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#FFF",
    padding: 30,
    borderRadius: 15,
    width: "85%",
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  tokenSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  tokenLabel: {
    fontSize: 16,
    color: "#555",
  },
  tokenValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  expiryDate: {
    color: "#E74C3C",
  },

  // Gas Details
  sectionSubtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 25,
    marginBottom: 8,
  },
  gasDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  TgasName: { fontSize: 16, color: "#555" },
  gasQuantity: { fontSize: 16, fontWeight: "bold", color: "#333" },

  // Close Button
  closeButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 15,
  },
  closeButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingText: { fontSize: 16, color: "#777" },  
});

export default DashboardScreen;
