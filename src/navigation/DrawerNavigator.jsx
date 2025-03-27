import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import OrdersScreen from '../screens/Orders';
import Ordertracking from '../screens/Ordertracking';
import CompletedOrders from '../screens/CompletedOrders';
import Payment from '../screens/Payment';
import Contact from '../screens/Contact';
import ProfileScreen from '../screens/Profile';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { createStackNavigator } from '@react-navigation/stack';
import EditProfileScreen from '../screens/EditProfile';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
     
      screenOptions={{
        drawerStyle: {
          backgroundColor: "#FFFFFF", // White background
        },
        headerShown: false,
        drawerActiveBackgroundColor: "green", // Light Lime Green
        drawerActiveTintColor: "#FFFFFF", // White text/icons for active item
        drawerInactiveTintColor: "#333333", // Dark gray for inactive text/icons
        drawerLabelStyle: { fontSize: 16, fontWeight: 'bold' },
      }}
      
    >
      {/* Orders Screen */}
      <Drawer.Screen
        name="Home"
        component={OrdersScreen}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialIcons name="list" size={22} color={color} />
          ),
        }}
      />

      {/* Order Tracking Screen */}
      {/* <Drawer.Screen
        name="Order Tracking"
        component={Ordertracking}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialIcons name="location-on" size={22} color={color} />
          ),
        }}
      /> */}

      {/* Completed Orders */}
      <Drawer.Screen
        name="Completed Orders"
        component={CompletedOrders}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialIcons name="check-circle" size={22} color={color} />
          ),
        }}
      />

      {/* Payments */}
      <Drawer.Screen
        name="Payments"
        component={Payment}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialIcons name="payment" size={22} color={color} />
          ),
        }}
      />

      {/* Contact Details */}
      <Drawer.Screen
        name="Contact Details"
        component={Contact}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialIcons name="phone" size={22} color={color} />
          ),
        }}
      />

      {/* Profile Stack (Nested Navigator) */}
      <Drawer.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialIcons name="person" size={22} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
