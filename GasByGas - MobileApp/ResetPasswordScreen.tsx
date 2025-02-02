import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from "react-native";
import { Button, Provider } from "react-native-paper";
import { useNavigation } from '@react-navigation/native';
import axios from "axios";
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  ResetPassword: undefined;
  Login: undefined;
};

type ResetPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ResetPassword'>;

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const [identifier, setIdentifier] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");

  const handleResetPassword = async () => {
    if (!identifier || !newPassword) {
      Alert.alert("Error", "Please enter your username/email and new password");
      return;
    }

    try {
      const response = await axios.post(
        "http://192.168.8.132:5000/api/consumer/reset-password",
        {
          identifier,
          newPassword,
        }
      );

      if (response.data.message) {
        Alert.alert("Success", response.data.message, [
          {
            text: "OK",
            onPress: () => navigation.navigate('Login'), // Redirect to Login Screen
          },
        ]);
      }
    } catch (error: any) {
      if (error.response) {
        Alert.alert("Error", error.response.data.error);
      } else {
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    }
  };

  return (
    <Provider>
      <ImageBackground
        source={require("./assets/bg.jpg")} // Replace with your image path
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Reset Password</Text>
          </View>

          {/* Input Fields */}  
          <View style={styles.formContainer}>
            <Text style={styles.label}>Username / Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Username/Email"
              placeholderTextColor="#A0A0A0"
              value={identifier}
              onChangeText={setIdentifier}
            />

            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter New Password"
              placeholderTextColor="#A0A0A0"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>

          <Button
            style={styles.resetButton}
            contentStyle={styles.resetButtonContent}
            labelStyle={styles.resetButtonLabel}
            onPress={handleResetPassword}
          >
            Reset Password
          </Button>
        </KeyboardAvoidingView>
      </ImageBackground>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#000', // Black background
    paddingHorizontal: 40,
    paddingTop: 50,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  backText: {
    color: '#FFF',
    fontSize: 24,
  },
  titleContainer: {
    marginTop: 80,
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFF',
  },
  formContainer: {
    marginTop: 90,
  },
  label: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    color: '#000',
    fontSize: 16,
    marginBottom: 15,
  },
  resetButton: {
    marginTop: 20,
    alignSelf: "center",
    borderRadius: 10,
  },
  resetButtonContent: {
    backgroundColor: "#FF7F50",
    paddingVertical: 5,
  },
  resetButtonLabel: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ResetPasswordScreen;
