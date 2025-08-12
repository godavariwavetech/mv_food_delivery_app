import React, {useContext} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {View, ActivityIndicator} from 'react-native';
import Login from '../screens/Login';
import Ordertracking from '../screens/Ordertracking';
import Orders from '../screens/Orders';
import EditProfile from '../screens/EditProfile';
import DrawerNavigator from './DrawerNavigator'; // Import the drawer navigator
import {AuthContext} from '../context/AuthContext'; // Import Auth Context
import SplashScreen from '../screens/SplashScreen';
import Registration from '../screens/Registration';
import ForgotPassword from '../screens/ForgotPassword';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const {user, loading} = useContext(AuthContext); // Get user from AuthContext

  // Show loading screen while checking user
  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Registration" component={Registration} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainApp" component={DrawerNavigator} />
            <Stack.Screen name="Orders" component={Orders} />
            <Stack.Screen name="Ordertracking" component={Ordertracking} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
