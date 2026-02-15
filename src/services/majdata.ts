import * as FileSystem from 'expo-file-system/legacy';
import { zip } from 'react-native-zip-archive';
import { File, Directory, Paths } from 'expo-file-system';

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

  console.log(`[downloadMajdataSong] tempDir.uri:`, tempDir.uri);

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

    await FileSystem.downloadAsync(trackUrl, trackPath);
    await FileSystem.downloadAsync(chartUrl, chartPath);
    await FileSystem.downloadAsync(imageUrl, imagePath);

    // Video is optional
    let videoExists = false;
    try {
      await FileSystem.downloadAsync(videoUrl, videoPath);
      videoExists = true;
    } catch (error) {
      console.warn('Failed to download video file, continuing without it:', error);
    }

    // Get the output file URI
    const outputFileUri = `${Paths.document.uri}adx-downloads/${outputFile.name}`;

    // Create zip archive
    await zip(tempDir.uri, outputFileUri);

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

