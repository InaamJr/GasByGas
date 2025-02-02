import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { Button, Provider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Define the navigation types
type RootStackParamList = {
  Login: undefined;
  CreateAccount: undefined;
  Dashboard: { consumerName: string; consumerId: number }; 
  ResetPassword: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter your username and password");
      return;
    }
  
    try {
      const response = await axios.post("http://192.168.8.132:5000/api/consumer/login", {
        username,
        password,
      });
  
      console.log("API Response:", response.data); // Log the API response
  
      if (response.data.token && response.data.consumer_name && response.data.consumer_id) {
        // Save the consumer_id in AsyncStorage
        await AsyncStorage.setItem("consumer_id", response.data.consumer_id.toString());
        console.log("Consumer ID saved to AsyncStorage:", response.data.consumer_id);
  
        Alert.alert("Success", "Login successful");
        navigation.navigate("Dashboard", {
          consumerName: response.data.consumer_name,
          consumerId: response.data.consumer_id,
        });
      } else {
        Alert.alert("Error", "Invalid response from the server");
      }
    } catch (error: any) {
      console.error("Login Error:", error); // Log the error
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
        source={require('./assets/bg.jpg')} // Replace with your image path
        style={styles.backgroundImage}
        resizeMode="cover" // Adjust to "contain", "stretch", or "repeat" if needed
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Login</Text>
          </View>

          {/* Input Fields */}
          <View style={styles.formContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Username"
              placeholderTextColor="#A0A0A0"
              value={username}
              onChangeText={setUsername}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Password"
              placeholderTextColor="#A0A0A0"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {/* Forgot Password Link */}
            <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <Button
            style={styles.loginButton}
            contentStyle={styles.loginButtonContent}
            labelStyle={styles.loginButtonLabel}
            onPress={handleLogin}
          >
            Login
          </Button>

          {/* Signup Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don’t have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#000', // Black background
    paddingHorizontal: 50,
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
  forgotPasswordContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: "#FF7F50", // Orange color for the link
    fontWeight: "thin",
    marginLeft: 190,
  },  
  loginButton: {
    marginTop: 40,
    width: '30%',
    alignSelf: 'center',
    borderRadius: 10,
  },
  loginButtonContent: {
    backgroundColor: '#FF7F50', // Orange button
    paddingVertical: 5,
  },
  loginButtonLabel: {
    color: '#000', // Black text
    fontWeight: 'bold',
    fontSize: 16,
  },
  signupContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  signupText: {
    color: '#FFF',
    fontSize: 14,
  },
  signupLink: {
    color: '#FF7F50', // Orange link
    fontWeight: 'bold',
    marginTop: 5,
  },
});

export default LoginScreen;
