import { Platform } from 'react-native';
import { File } from 'expo-file-system';
import { getContentUriAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';

export const openWithAstroDX = async (file: File) => {
  if (Platform.OS === 'android') {
    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data: file.contentUri ?? await getContentUriAsync(file.uri),
      flags: 1,
      packageName: 'com.Reflektone.AstroDX',
    });
  } else if (Platform.OS === 'ios') {
    await Sharing.shareAsync(file.uri);
  } else {
    throw new Error('Unsupported platform');
  }
};
