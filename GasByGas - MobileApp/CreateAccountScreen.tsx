import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Button, Provider } from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  GeneralSignup: undefined;
  BusinessSignup: undefined;
  LoginScreen: undefined;
  CreateAccount: undefined;
};

type CreateAccountScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "CreateAccount"
>;

const CreateAccountScreen: React.FC = () => {
  const navigation = useNavigation<CreateAccountScreenNavigationProp>();
  const [consumerType, setConsumerType] = useState<string>('');

  const handleNext = () => {
    if (consumerType === "General Consumer") {
      navigation.navigate('GeneralSignup'); // Navigate to General Consumer Signup
    } else if (consumerType === "Business / Industrial Consumer") {
      navigation.navigate('BusinessSignup'); // Navigate to Business Consumer Signup
    } else {
      alert("Please select a consumer type!");
    }
  };

  return (
    <Provider>
      <ImageBackground
        source={require('./assets/bg.jpg')} // Replace with your image path
        style={styles.backgroundImage}
        resizeMode="cover" // Adjust to "contain", "stretch", or "repeat" if needed
      >
        <View style={styles.container}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Create an</Text>
            <Text style={styles.title}>account</Text>
          </View>

          {/* Dropdown */}
          <View style={styles.dropdownContainer}>
            <Text style={styles.label}>Consumer Type</Text>
            <View style={styles.dropdownWrapper}>
              <RNPickerSelect
                onValueChange={(value) => setConsumerType(value)}
                items={[
                  { label: "General Consumer", value: "General Consumer" },
                  { label: "Business / Industrial Consumer", value: "Business / Industrial Consumer" },
                ]}
                placeholder={{
                  label: "Select Consumer Type",
                  value: '', // Use null for placeholder value
                  color: "#A0A0A0",
                }}
                style={{
                  inputIOS: styles.inputIOS,
                  inputAndroid: styles.inputAndroid,
                  iconContainer: styles.iconContainer,
                }}
                Icon={() => <Text style={styles.icon}>▼</Text>}
              />
            </View>
          </View>

          {/* Next Button */}
          <Button
            style={styles.nextButton}
            contentStyle={styles.nextButtonContent}
            labelStyle={styles.nextButtonLabel}
            onPress={handleNext}
          >
            Next
          </Button>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
              <Text style={styles.loginLink}>login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </Provider>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'rgba(0, 0, 0, 0.6)', // Black background
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
    marginTop: 60,
    alignItems: 'center', // Center the title
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFF',
  },
  dropdownContainer: {
    marginTop: 110,
  },
  label: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 10,
  },
  dropdownWrapper: {
    borderRadius: 10, // Adjust the border radius here
    overflow: 'hidden', // Ensures content respects the border radius
  },
  inputIOS: {
    height: 50,
    backgroundColor: '#FFF',
    color: '#000',
    fontSize: 14,
    borderRadius: 10,
    paddingLeft: 15,
    paddingRight: 30, // Space for the dropdown icon
  },
  inputAndroid: {
    height: 50,
    backgroundColor: '#FFF',
    color: '#000',
    fontSize: 16,
    borderRadius: 10,
    paddingLeft: 15,
    paddingRight: 30, // Space for the dropdown icon
  },
  iconContainer: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  icon: {
    fontSize: 18,
    color: '#000',
  },
  nextButton: {
    marginTop: 40,
    width: '30%',
    alignSelf: 'center',
    borderRadius: 10,
  },
  nextButtonContent: {
    backgroundColor: '#FF7F50', // Orange button
    paddingVertical: 5,
  },
  nextButtonLabel: {
    color: '#000', // Black text for the button
    fontWeight: 'bold', // Bold text for the button
    fontSize: 16,
  },
  loginContainer: {
    marginTop: 175,
    alignItems: 'center',
  },
  loginText: {
    color: '#FFF',
    fontSize: 14,
  },
  loginLink: {
    color: '#FF7F50', // Orange link
    fontWeight: 'bold',
    marginTop: 5, // Space between "Already have an account?" and "login"
  },
});

export default CreateAccountScreen;
