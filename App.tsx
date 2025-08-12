import { Linking, Alert, SafeAreaView, AppState } from 'react-native';
import React, { useEffect, useRef } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { useColorScheme } from 'react-native';
import VersionCheck from 'react-native-version-check';
import { getFCMToken, requestNotificationPermission } from './src/NotificationService';
import { AuthProvider } from './src/context/AuthContext';

const App = () => {
  const theme = useColorScheme();
  const appState = useRef(AppState.currentState);

  // Function to check for updates
  const checkForUpdate = async () => {
    try {
      const res = await VersionCheck.needUpdate(); // Check if an update is needed
      if (res.isNeeded) {
        Alert.alert(
          "Update Available",
          "A new version of this app is available. Please update to continue using the app.",
          [
            {
              text: "Update Now",
              onPress: () => {
                try {
                  Linking.openURL(res.storeUrl);
                } catch (error) {
                  console.log(error)
                }

              }
            },
          ],
          { cancelable: false } // Prevent dismissing the alert
        );
      }
    } catch (error) {
      console.log("Error checking for updates:", error);
    }
  };

  useEffect(() => {
  
    const handleNotificationRequest = async () => {
      await requestNotificationPermission();
      checkForUpdate(); // Check for app updates
      getFCMToken()
    };

    handleNotificationRequest();
  }, []);

      useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        checkForUpdate();
      }
      appState.current = nextAppState;
    });
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaView>
  );
};

export default App;


