import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const setupNotifications = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('downloads', {
      name: 'Downloads',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#007AFF',
    });
  }

  return true;
};

export const showDownloadCompleteNotification = async (songTitle: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Download Complete',
      body: `${songTitle} is ready!`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null, // Show immediately
  });
};

export const showDownloadProgressNotification = async (
  completedCount: number,
  totalCount: number
): Promise<string> => {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Downloading Songs',
      body: `${completedCount} of ${totalCount} completed`,
      sticky: true,
      priority: Notifications.AndroidNotificationPriority.LOW,
      categoryIdentifier: 'download-progress',
    },
    trigger: null,
  });
  return notificationId;
};

export const updateDownloadProgressNotification = async (
  notificationId: string,
  completedCount: number,
  totalCount: number
) => {
  // Cancel old notification and create new one (update doesn't work reliably)
  await Notifications.dismissNotificationAsync(notificationId);
  return showDownloadProgressNotification(completedCount, totalCount);
};

export const dismissDownloadProgressNotification = async (notificationId: string) => {
  await Notifications.dismissNotificationAsync(notificationId);
};
