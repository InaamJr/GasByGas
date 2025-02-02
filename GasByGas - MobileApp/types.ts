import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Define the root stack parameter list for your app
export type RootStackParamList = {
  Dashboard: { consumerName: string; consumerId: number; updatedName?: string };
  PlaceGasRequest: undefined; // No parameters needed
  TokenScreen: { requestId: number }; // Expects requestId
  EditConsumerScreen: { consumerId: number };
  LoginScreen: undefined;
};

export type GasToken = {
  token_no: string;
  outlet_name: string;
  expected_pickup_date: string;
  expiry_date: string;
  status: "valid" | "used" | "expired" | "reallocated";
  gasDetails: { cylinder_name: string; quantity: number }[];
};

// Export navigation types for easy use in components
export type DashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Dashboard"
>;
export type PlaceGasRequestNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "PlaceGasRequest"
>;
export type TokenScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "TokenScreen"
>;
export type EditConsumerScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "EditConsumerScreen"
>;
export type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "LoginScreen"
>;
