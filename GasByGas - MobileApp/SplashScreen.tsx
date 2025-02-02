import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { BlurView } from 'expo-blur';
import { NavigationProp } from '@react-navigation/native';

type SplashScreenProps = {
  navigation: NavigationProp<any>; // Type for navigation
};

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  return (
    <ImageBackground
      source={require('./assets/background.jpg')} // Replace with your background image
      style={styles.background}
    >
      {/* Light Effect
      <BlurView intensity={50} style={styles.lightEffect} /> */}

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('./assets/logo.png')} // Replace with your logo image
          style={styles.logo}
        />
        <Text style={styles.tagline}>MADE CONVENIENT</Text>
      </View>

      {/* Get Started Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('CreateAccount')} // Navigate to CreateAccountScreen
      >
        <Text style={styles.buttonText}>GET STARTED</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
//   lightEffect: {
//     position: 'absolute',
//     top: -50,
//     left: -50,
//     width: 200,
//     height: 200,
//     borderRadius: 100,
//     backgroundColor: 'rgba(173, 216, 230, 0.3)', // Light blue color
//   },
  logoContainer: {
    alignItems: 'center',
    marginTop: 300,
    marginBottom: 75,
  },
  logo: {
    width: 200, // Adjust based on your logo size
    height: 100,
    resizeMode: 'contain',
  },
  tagline: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 0,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  button: {
    backgroundColor: '#FF7F50', // Orange color for button
    paddingVertical: 15,
    paddingHorizontal: 45,
    borderRadius: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SplashScreen;
