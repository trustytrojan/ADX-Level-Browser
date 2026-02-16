import * as FileSystem from 'expo-file-system/legacy';
import { File, Directory, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

const MAJDATA_BASE_URL = 'https://majdata.net/api3/api/maichart';

/**
 * Download majdata song files and create a zipped .adx file
 */
export const downloadMajdataSong = async (
  majdataId: string,
  songTitle: string,
  outputFile: File
): Promise<void> => {
  // Create a temporary directory for storing the downloaded files
  const tempDir = new Directory(Paths.document, majdataId);
  tempDir.create({ intermediates: true, idempotent: true });

  // console.log(`[downloadMajdataSong] tempDir.uri:`, tempDir.uri);

  FileSystem.makeDirectoryAsync(`${tempDir.uri}/${songTitle}`);
  
  try {
    // Download the three required files using FileSystem.downloadAsync
    const trackUrl = `${MAJDATA_BASE_URL}/${majdataId}/track`;
    const chartUrl = `${MAJDATA_BASE_URL}/${majdataId}/chart`;
    const imageUrl = `${MAJDATA_BASE_URL}/${majdataId}/image?fullImage=true`;
    const videoUrl = `${MAJDATA_BASE_URL}/${majdataId}/video`;

    // Download files
    const trackPath = `${tempDir.uri}/${songTitle}/track.mp3`;
    const chartPath = `${tempDir.uri}/${songTitle}/maidata.txt`;
	  const imagePath = `${tempDir.uri}/${songTitle}/bg.png`;
    const videoPath = `${tempDir.uri}/${songTitle}/pv.mp4`;

    await Promise.all([
      FileSystem.downloadAsync(trackUrl, trackPath),
      FileSystem.downloadAsync(chartUrl, chartPath),
      FileSystem.downloadAsync(imageUrl, imagePath),
      FileSystem.downloadAsync(videoUrl, videoPath).catch(err => {
        console.warn('Failed to download video file, continuing without it:', err);
      })
    ]);

    // track, chart, image are expected to exist at this point

    // Get the output file URI
    const outputFileUri = `${Paths.document.uri}adx-downloads/${outputFile.name}`;

    // Create zip archive
    if (Platform.OS === 'android') {
      const { zip } = await import('react-native-zip-archive');
      await zip(tempDir.uri, outputFileUri);
    } else if (Platform.OS === 'ios') {
      const fflate = await import('fflate');

      const videoFile = new File(videoPath);
      
      const zipped = fflate.zipSync({
        [`${songTitle}/track.mp3`]: new File(trackPath).bytesSync(),
        [`${songTitle}/maidata.txt`]: new File(chartPath).bytesSync(),
        [`${songTitle}/bg.png`]: new File(imagePath).bytesSync(),
        ...(videoFile.exists ? { [`${songTitle}/pv.mp4`]: videoFile.bytesSync() } : {})
      });

      new File(outputFileUri).write(zipped);
    }

    // Clean up temp directory
    try {
      tempDir.delete();
    } catch (error) {
      console.warn('Failed to clean up temp directory:', error);
    }
  } catch (error) {
    // Clean up on error
    try {
      tempDir.delete();
    } catch {
      // Ignore cleanup errors
    }
    throw error;
  }
};

