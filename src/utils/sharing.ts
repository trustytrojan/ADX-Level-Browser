import { Alert, Platform, AppState } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';
import { getContentUriAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';

// Track if an intent is currently active
let isIntentActive = false;

export const openWithAstroDX = async (file: File, songTitle: string): Promise<void> => {
  const appState = AppState.currentState;
  const isAppInBackground = appState !== 'active';

  // If app is in background or an intent is already active, do nothing
  if (isAppInBackground || isIntentActive) {
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
      ]
    );
  }
};

export const openMultipleWithAstroDX = async (
  files: File[],
  onCompressionStart?: () => void,
  onCompressionEnd?: () => void
): Promise<void> => {
  if (files.length === 0) return;

  const appState = AppState.currentState;
  const isAppInBackground = appState !== 'active';

  // If app is in background or an intent is already active, don't proceed
  if (isAppInBackground || isIntentActive) {
    return;
  }

  try {
    const outputPath = `${Paths.document.uri}combined-songs.adx`;
    const combinedSongsFile = new File(outputPath);

    if (Platform.OS === 'android') {
      const { zip, unzip } = await import('react-native-zip-archive');

      // Zip all ADX files into one combined ADX file
      const filePaths = files.map(f => f.uri);

      // remove the ".adx" extension, use these as the destination directory for unzipping each adx
      const withoutExtensions: string[] = [];

      for (const uri of filePaths) {
        const withoutExt = uri.slice(0, uri.length - 4);
        withoutExtensions.push(withoutExt);
        await unzip(uri, withoutExt);
      }

      if (combinedSongsFile.exists) {
        combinedSongsFile.delete();
      }

      // zip all the unzipped song folders into "combined-songs.adx"
      await zip(withoutExtensions, outputPath);

      // delete all the unzipped song folders
      withoutExtensions.forEach(uri => new Directory(uri).delete());
    } else if (Platform.OS === 'ios') {
      const fflate = await import('fflate');

      const decompressedSongFolders = Object.create(null);

      for (const file of files) {
        const bytes = file.bytesSync();
        const songFiles = fflate.unzipSync(bytes);
        Object.assign(decompressedSongFolders, songFiles);
      }

      // Show loading modal
      onCompressionStart?.();

      // Give React time to render the modal before starting the synchronous compression
      await new Promise(resolve => setTimeout(resolve, 300));

      const finalAdx = fflate.zipSync(decompressedSongFolders);

      combinedSongsFile.write(finalAdx);

      // Hide loading modal
      onCompressionEnd?.();
    } else {
      throw new Error('Unsupported platform');
    }

    // Create a File object for the zipped file and open it with AstroDX
    await openWithAstroDX(combinedSongsFile, 'Combined Songs');
  } catch (error) {
    console.error('Error combining files:', error);
    onCompressionEnd?.();
    Alert.alert('Error', 'Failed to combine files for sending to AstroDX');
  }
};

// Helper to force reset the intent lock (call when app comes to foreground)
export const resetIntentLock = () => {
  isIntentActive = false;
};
