import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { Button, Provider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';

// Define navigation types
type RootStackParamList = {
  LoginScreen: undefined;
  CreateAccount: undefined;
};

type BusinessSignupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateAccount'>;

const GeneralSignupScreen: React.FC = () => {
  const navigation = useNavigation<BusinessSignupScreenNavigationProp>();

  // State for each input field
  const [name, setName] = useState('');
  const [nic, setNic] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    if (!name || !nic || !email || !contact || !username || !password) {
      Alert.alert('Error', 'Please fill out all fields!');
      return;
    }

    try {
      // Send the data to the backend
      const response = await axios.post('http://192.168.8.132:5000/api/general-consumer/signup', {
        name,
        nic,
        email,
        contact,
        username,
        password,
      });

      if (response.data.message) {
        Alert.alert('Success', response.data.message);
        navigation.navigate('LoginScreen'); // Redirect to Login screen
      } else {
        Alert.alert('Error', 'Unexpected response from the server.');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.response && error.response.data.error) {
        Alert.alert('Error', error.response.data.error); // Show backend error
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.');
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
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Create an</Text>
              <Text style={styles.title}>account</Text>
            </View>

            {/* Input Fields */}
            <View style={styles.formContainer}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Name"
                placeholderTextColor="#A0A0A0"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>NIC</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter NIC"
                placeholderTextColor="#A0A0A0"
                value={nic}
                onChangeText={setNic}
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Email"
                placeholderTextColor="#A0A0A0"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.label}>Contact</Text>
              <TextInput
                style={styles.input}
                placeholder="+ 94    Enter Contact No"
                placeholderTextColor="#A0A0A0"
                keyboardType="phone-pad"
                value={contact}
                onChangeText={setContact}
              />

              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Contact"
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
            </View>

            {/* Sign Up Button */}
            <Button
              style={styles.signupButton}
              contentStyle={styles.signupButtonContent}
              labelStyle={styles.signupButtonLabel}
              onPress={handleSignup}
            >
              Sign Up
            </Button>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#000', // Black background
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 50,
    paddingTop: 50,
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
    marginTop: 30,
    alignItems: 'center', // Center the title
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFF',
  },
  formContainer: {
    marginTop: 40,
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
    marginBottom: 20,
  },
  signupButton: {
    marginTop: 40,
    marginBottom: 40,
    width: '35%',
    alignSelf: 'center',
    borderRadius: 10,
  },
  signupButtonContent: {
    backgroundColor: '#FF7F50', // Orange button
    paddingVertical: 5,
  },
  signupButtonLabel: {
    color: '#000', // Black text for the button
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default GeneralSignupScreen;
