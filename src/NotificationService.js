import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { Alert } from 'react-native';

export const requestNotificationPermission = async () => {
  try {
    // Request Notifee Permission
    const permission = await notifee.requestPermission();
    
    // if (permission) {
    //   console.log("Notification Permission Granted ✅");
    // } else {
    //   console.log("Notification Permission Denied ❌");
    // }

    // Firebase Permission
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    // if (enabled) {
    //   console.log("FCM Permission Granted ✅");
    //   getFCMToken();
    // } else {
    //   console.log("FCM Permission Denied ❌");
    // }
  } catch (error) {
    console.log("Permission Error: ", error);
    // Alert.alert(error)

  }
};

export const getFCMToken = async () => {
  console.log(">>>>>>>>>>>>>>>")
  const token = await messaging().getToken();
  console.log(token)
  messaging().onMessage(async (remoteMessage) => {
    await notifee.createChannel({
      id: 'default1',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH, // Ensures high priority notifications
      sound: 'notification_sound', // You can add a custom sound here
      vibration: true,
    });
    console.log(">>>>>>>>>>>>>MESSAGECALLING",remoteMessage)
    await notifee.displayNotification({
      title: remoteMessage.notification.title,
      body: remoteMessage.notification.body,
      android: {
        channelId: "default1",
        importance: AndroidImportance.HIGH,
      },
    });
  });

 return token
};
