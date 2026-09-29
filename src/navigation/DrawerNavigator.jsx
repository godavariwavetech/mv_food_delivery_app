import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// --- Import all your screens ---
import OrdersScreen from '../screens/Orders';
import CompletedOrders from '../screens/CompletedOrders';
import Contact from '../screens/Contact';
import ProfileScreen from '../screens/Profile';
import EditProfileScreen from '../screens/EditProfile';
import AccountsScreen from '../screens/AccountsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import DeleteAccountScreen from '../screens/DeleteAccountScreen';
// --- ⬇️ 1. Import the new Terms and Conditions screen ---
import TermsAndConditionsScreen from '../screens/TermsAndConditionsScreen';
import CODSettlementsScreen from '../screens/CODSettlementsScreen';
import PendingAmountScreen from '../screens/PendingAmountScreen';
import PendingAmountHistoryScreen from '../screens/PendingAmountHistoryScreen';
import RequestAdvanceScreen from '../screens/RequestAdvanceScreen';


const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// This stack for Profile -> Edit Profile remains unchanged
const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
};

// Pending Amount Dashboard -> History -> Request Advance
const PendingAmountStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PendingAmountDashboard" component={PendingAmountScreen} />
      <Stack.Screen name="PendingAmountHistory" component={PendingAmountHistoryScreen} />
      <Stack.Screen name="RequestAdvance" component={RequestAdvanceScreen} />
    </Stack.Navigator>
  );
};

// "NEW" badge label for the Pending Amount drawer item
const PendingAmountDrawerLabel = ({ color }) => (
  <View style={badgeStyles.labelRow}>
    <Text style={[badgeStyles.labelText, { color }]}>Advance Amount</Text>
    <View style={badgeStyles.badge}>
      <Text style={badgeStyles.badgeText}>NEW</Text>
    </View>
  </View>
);

const badgeStyles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

const DrawerNavigator = () => {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#08B341'}}>
      <Drawer.Navigator
        initialRouteName="Home"
        screenOptions={{
          drawerStyle: {
            backgroundColor: '#FFFFFF', // White background
          },
          headerShown: false,
          drawerActiveBackgroundColor: '#08B341', // Light Lime #08B341
          drawerActiveTintColor: '#FFFFFF', // White text/icons for active item
          drawerInactiveTintColor: '#333333', // Dark gray for inactive text/icons
          drawerLabelStyle: {fontSize: 16, fontWeight: 'bold'},
        }}>
        {/* Orders Screen */}
        <Drawer.Screen
          name="Home"
          component={OrdersScreen}
          options={{
            drawerIcon: ({color}) => (
              <MaterialIcons name="list" size={22} color={color} />
            ),
          }}
        />

        {/* Completed Orders */}
        <Drawer.Screen
          name="Completed Orders"
          component={CompletedOrders}
          options={{
            drawerIcon: ({color}) => (
              <MaterialIcons name="check-circle" size={22} color={color} />
            ),
          }}
        />

        {/* Payments History */}
        <Drawer.Screen
          name="Payments History"
          component={AccountsScreen}
          options={{
            drawerIcon: ({color}) => (
              <MaterialIcons
                name="account-balance-wallet"
                size={22}
                color={color}
              />
            ),
          }}
        />

        <Drawer.Screen
          name="COD Settlements"
          component={CODSettlementsScreen}
          options={{
            drawerIcon: ({color}) => (
              <MaterialIcons name="attach-money" size={22} color={color} />
            ),
          }}
        />

        {/* Pending Amount / Advance Usage (Nested Navigator) */}
        <Drawer.Screen
          name="Pending Amount"
          component={PendingAmountStack}
          options={{
            drawerLabel: ({color}) => (
              <PendingAmountDrawerLabel color={color} />
            ),
            drawerIcon: ({color}) => (
              <MaterialIcons name="currency-rupee" size={22} color={color} />
            ),
          }}
        />

        {/* Reports */}
        <Drawer.Screen
          name="Reports"
          component={ReportsScreen}
          options={{
            drawerIcon: ({color}) => (
              <MaterialIcons name="work-history" size={22} color={color} />
            ),
          }}
        />

        {/* Contact Details */}
        <Drawer.Screen
          name="Contact Details"
          component={Contact}
          options={{
            drawerIcon: ({color}) => (
              <MaterialIcons name="phone" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Terms & Conditions"
          component={TermsAndConditionsScreen}
          options={{
            drawerIcon: ({color}) => (
              <MaterialIcons name="description" size={22} color={color} />
            ),
          }}
        />

        {/* Profile Stack (Nested Navigator) */}
        <Drawer.Screen
          name="Profile"
          component={ProfileStack}
          options={{
            drawerIcon: ({color}) => (
              <MaterialIcons name="person" size={22} color={color} />
            ),
          }}
        />

        {/* --- ⬇️ 2. Add the new screen to the drawer menu --- */}

        {/* Delete Account */}
        <Drawer.Screen
          name="Delete Account"
          component={DeleteAccountScreen}
          options={{
            drawerIcon: ({color}) => (
              <MaterialIcons name="delete" size={22} color={color} />
            ),
          }}
        />
      </Drawer.Navigator>
    </SafeAreaView>
  );
};

export default DrawerNavigator;