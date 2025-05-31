import { Linking, Alert, SafeAreaView } from 'react-native';
import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { useColorScheme } from 'react-native';
import VersionCheck from 'react-native-version-check';
import { getFCMToken, requestNotificationPermission } from './src/NotificationService';
import { AuthProvider } from './src/context/AuthContext';

const App = () => {
  const theme = useColorScheme();

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
                  console.log('Play store link')
                  // Linking.openURL("https://play.google.com/store/apps/details?id=com.freshozapcartdeliverypartner") // Open Play Store / App Store
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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaView>
  );
};

export default App;


