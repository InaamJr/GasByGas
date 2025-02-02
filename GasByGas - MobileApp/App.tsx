import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './SplashScreen';
import CreateAccountScreen from './CreateAccountScreen';
import LoginScreen from './LoginScreen';
import GeneralSignupScreen from './GeneralSignupScreen';
import BusinessSignupScreen from './BusinessSignupScreen';
import ResetPasswordScreen from './ResetPasswordScreen';
import DashboardScreen from './DashboardScreen';
import PlaceGasRequestScreen from './PlaceGasRequestScreen';
import EditConsumerScreen from './EditConsumerScreen';


const Stack = createStackNavigator();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
        <Stack.Screen name="GeneralSignup" component={GeneralSignupScreen} />
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{
            // gestureEnabled: false, // Disable swipe gestures
            headerShown: false, // Optional: Hide the header
          }}
        />
        <Stack.Screen name="BusinessSignup" component={BusinessSignupScreen} /> 
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={{
            gestureEnabled: false, // Disable swipe gestures
          }}
          initialParams={{ consumerName: "Consumer" }} 
        />
        <Stack.Screen name="PlaceGasRequest" component={PlaceGasRequestScreen} />
        <Stack.Screen name="EditConsumerScreen" component={EditConsumerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
