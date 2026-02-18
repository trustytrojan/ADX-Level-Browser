import * as FileSystem from 'expo-file-system/legacy';
import { File, Directory, Paths } from 'expo-file-system';
import { Platform } from 'react-native';
import type { Song } from '../types';
import { getSource, getTrackUrl, getImageUrl, getChartUrl, getVideoUrl } from './sources';

const sanitizeFilename = (s: string) => s.replace(/[^a-z0-9._-]/gi, '-');

/**
 * Download a song from any source and create a zipped .adx file
 * 
 * @param song - The song to download
 * @param outputFile - The file to save the .adx to
 * @param downloadVideo - Whether to download the video file
 */
export const downloadSong = async (
  song: Song,
  outputFile: File,
  downloadVideo: boolean = true
): Promise<void> => {
  // Get the source for this song
  const source = await getSource(song.sourceId);
  
  if (!source) {
    throw new Error(`Source "${song.sourceId}" not found`);
  }

  // Create a temporary directory for storing the downloaded files
  const tempDir = new Directory(Paths.document, `temp_${song.sourceId}_${song.id}`);
  tempDir.create({ intermediates: true, idempotent: true });

  const songDirName = sanitizeFilename(song.title);

  try {
    // Create song directory inside temp directory
    FileSystem.makeDirectoryAsync(`${tempDir.uri}/${songDirName}`);

    // Build URLs for all resources
    const trackUrl = getTrackUrl(source, song.id);
    const chartUrl = getChartUrl(source, song.id);
    const imageUrl = getImageUrl(source, song.id);
    const videoUrl = getVideoUrl(source, song.id);

    // Define file paths
    const trackPath = `${tempDir.uri}/${songDirName}/track.mp3`;
    const chartPath = `${tempDir.uri}/${songDirName}/maidata.txt`;
    const imagePath = `${tempDir.uri}/${songDirName}/bg.png`;
    const videoPath = `${tempDir.uri}/${songDirName}/pv.mp4`;

    // Download files in parallel
    const downloadPromises: Promise<any>[] = [
      FileSystem.downloadAsync(trackUrl, trackPath),
      FileSystem.downloadAsync(chartUrl, chartPath),
      FileSystem.downloadAsync(imageUrl, imagePath),
    ];

    const videoFile = new File(videoPath);

    // Only download video if enabled
    if (downloadVideo) {
      const videoPromise = fetch(videoUrl)
        .then(resp => {
          if (!resp.ok)
            throw new Error(`[downloadSong] [${videoUrl}] ${resp.status} ${resp.statusText}`);
          if (resp.headers.get('Content-Type') != 'video/mp4')
            throw new Error(`[downloadSong] [${videoUrl}] Content-Type is not video/mp4`);
          if (!resp.body)
            throw new Error(`[downloadSong] [${videoUrl}] resp.body is null`);

          return resp.body.pipeTo(videoFile.writableStream());
        })
        .catch();
      downloadPromises.push(videoPromise);
    }

    await Promise.all(downloadPromises);

    // Get the output file URI
    const outputFileUri = `${Paths.document.uri}adx-downloads/${outputFile.name}`;

    // Create zip archive
    if (Platform.OS === 'android') {
      const { zip } = await import('react-native-zip-archive');
      await zip(tempDir.uri, outputFileUri);
    } else if (Platform.OS === 'ios') {
      const fflate = await import('fflate');

      const videoFile = new File(videoPath);
      
      const filesToZip: Record<string, Uint8Array> = {
        [`${songDirName}/track.mp3`]: new File(trackPath).bytesSync(),
        [`${songDirName}/maidata.txt`]: new File(chartPath).bytesSync(),
        [`${songDirName}/bg.png`]: new File(imagePath).bytesSync(),
      };

      // Only include video if it was downloaded and exists
      if (downloadVideo && videoFile.exists) {
        filesToZip[`${songDirName}/pv.mp4`] = videoFile.bytesSync();
      }

      const zipped = fflate.zipSync(filesToZip);
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
