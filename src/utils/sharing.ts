import { Alert, Platform, AppState } from 'react-native';
import { File } from 'expo-file-system';
import { getContentUriAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import { showDownloadCompleteNotification } from './notifications';

// Track if an intent is currently active
let isIntentActive = false;

export const openWithAstroDX = async (file: File, songTitle: string): Promise<void> => {
  const appState = AppState.currentState;
  const isAppInBackground = appState !== 'active';

  // If app is in background or an intent is already active, just show notification
  if (isAppInBackground || isIntentActive) {
    await showDownloadCompleteNotification(songTitle);
    return;
  }

  if (Platform.OS === 'android') {
    try {
      isIntentActive = true;
      const contentUri = await getContentUriAsync(file.uri);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1,
        packageName: 'com.Reflektone.AstroDX',
      });
      
      // Reset flag after a delay (user will have switched apps)
      setTimeout(() => {
        isIntentActive = false;
      }, 2000);
    } catch (error) {
      isIntentActive = false;
      console.error('Intent error:', error);
      
      // Check if it's the "already started" error
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('already started')) {
        await showDownloadCompleteNotification(songTitle);
        return;
      }
      
      Alert.alert(
        'Cannot Open File',
        'AstroDX app not found. Would you like to share instead?',
        [
          {
            text: 'Share',
            onPress: async () => {
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(file.uri);
              }
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  } else {
    Alert.alert(
      'Download Complete',
      `${songTitle} ready to share!`,
      [
        {
          text: 'Share',
          onPress: async () => {
            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(file.uri);
            }
          }
        },
        { text: 'OK', style: 'cancel' }
      ]
    );
  }
};

// Helper to force reset the intent lock (call when app comes to foreground)
export const resetIntentLock = () => {
  isIntentActive = false;
};
