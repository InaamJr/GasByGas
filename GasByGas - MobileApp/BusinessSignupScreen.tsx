import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ImageBackground
} from 'react-native';
import { Button, Provider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import * as DocumentPicker from 'expo-document-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';

// Define navigation types
type RootStackParamList = {
  LoginScreen: undefined;
  CreateAccount: undefined;
};

type BusinessSignupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateAccount'>;

const BusinessSignupScreen: React.FC = () => {
  const navigation = useNavigation<BusinessSignupScreenNavigationProp>();


  // State for each input field
  const [business_name, setBusinessName] = useState('');
  const [business_reg_no, setBusinessRegNo] = useState('');
  const [nic, setNic] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [certification_document, setBusinessCertificate] = useState<any>(null);

  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setBusinessCertificate(result.assets[0]); // Store the file details
        Alert.alert('Success', 'Business Certificate uploaded successfully.');
      } else {
        Alert.alert('Error', 'No valid file selected.');
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to upload Business Certificate.');
    }
  };

  const handleSignup = async () => {
    if (
      !business_name ||
      !business_reg_no ||
      !nic ||
      !email ||
      !contact ||
      !username ||
      !password ||
      !certification_document
    ) {
      Alert.alert('Error', 'Please fill out all fields and upload the business certificate!');
      return;
    }

    try {
      // Prepare FormData
      const formData = new FormData();
      formData.append('business_name', business_name);
      formData.append('business_reg_no', business_reg_no);
      formData.append('nic', nic);
      formData.append('email', email);
      formData.append('contact', contact);
      formData.append('username', username);
      formData.append('password', password);
      formData.append('verification_status', 'pending'); // Set account to pending by default
      formData.append('certification_document', {
        uri: certification_document.uri,
        name: certification_document.name || 'certificate.jpg',
        type: certification_document.type || 'image/jpeg',
      } as any); // Fix for FormData

      // Send FormData to the backend
      const response = await axios.post(
        'http://192.168.8.132:5000/api/business-consumer/signup',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

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
              <Text style={styles.label}>Business Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Business Name"
                placeholderTextColor="#A0A0A0"
                value={business_name}
                onChangeText={setBusinessName}
              />

              <Text style={styles.label}>Business Registration No</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Business Registration No"
                placeholderTextColor="#A0A0A0"
                value={business_reg_no}
                onChangeText={setBusinessRegNo}
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

              {/* Upload Button */}
              <Text style={styles.label}>Business Certificate</Text>
              <TouchableOpacity style={styles.uploadButton} onPress={handleDocumentPick}>
                <Text style={styles.uploadButtonText}>
                  {certification_document ? 'Certificate Uploaded' : 'Upload Business Certificate'}
                </Text>
              </TouchableOpacity>
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
    alignItems: 'center',
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
  uploadButton: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  signupButton: {
    marginTop: 40,
    marginBottom: 40,
    width: '35%',
    alignSelf: 'center',
    borderRadius: 10,
  },
  signupButtonContent: {
    backgroundColor: '#FF7F50',
    paddingVertical: 5,
  },
  signupButtonLabel: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default BusinessSignupScreen;
