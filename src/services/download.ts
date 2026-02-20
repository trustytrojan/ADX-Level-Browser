import * as FileSystem from 'expo-file-system/legacy';
import { Directory, File, Paths } from 'expo-file-system';
import type { Song } from '../types';
import { unzipFileToFolder, zipFolderToFile } from '../utils/archive';
import { getChartUrl, getImageUrl, getSource, getTrackUrl, getVideoUrl } from './sources';

const sanitizeFilename = (s: string) => s.replace(/[^a-z0-9._-]/gi, '-');

/**
 * Download a song from any source to an uncompressed folder
 *
 * @param song - The song to download
 * @param outputFolder - The directory to save the song files to
 * @param downloadVideo - Whether to download the video file
 */
export const downloadSong = async (
  song: Song,
  outputFolder: Directory,
  downloadVideo: boolean = true,
): Promise<void> => {
  // Get the source for this song
  const source = await getSource(song.sourceId);

  if (!source)
    throw new Error(`Source "${song.sourceId}" not found`);

  const songDirName = sanitizeFilename(song.title);

  // Create the song directory inside the output folder
  const songDir = new Directory(outputFolder, songDirName);
  songDir.create({ intermediates: true, idempotent: true });

  try {
    // Build URLs for all resources
    const trackUrl = getTrackUrl(source, song.id);
    const chartUrl = getChartUrl(source, song.id);
    const imageUrl = getImageUrl(source, song.id);
    const videoUrl = getVideoUrl(source, song.id);

    // Define file paths
    const trackPath = `${songDir.uri}/track.mp3`;
    const chartPath = `${songDir.uri}/maidata.txt`;
    const imagePath = `${songDir.uri}/bg.png`;
    const videoPath = `${songDir.uri}/pv.mp4`;

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
        .then((resp) => {
          if (resp.status === 404)
            return videoFile.exists && videoFile.delete();
          if (!resp.ok)
            throw new Error(`[downloadSong] [${videoUrl}] ${resp.status} ${resp.statusText}`);
          if (resp.headers.get('Content-Type') != 'video/mp4')
            throw new Error(`[downloadSong] [${videoUrl}] Content-Type is not video/mp4`);
          if (resp.bodyUsed)
            throw new Error(`[downloadSong] [${videoUrl}] resp.bodyUsed`);
          return resp.arrayBuffer().then((buf) => videoFile.write(new Uint8Array(buf)));
        });
      downloadPromises.push(videoPromise);
    }

    await Promise.all(downloadPromises);
  } catch (error) {
    // Clean up on error
    try {
      songDir.delete();
    } catch {
      // Ignore cleanup errors
    }
    throw error;
  }
};

/**
 * Zip a song folder into an .adx file
 *
 * @param songFolder - The directory containing the song files
 * @param outputFile - The .adx file to create
 */
export const zipSongFolder = async (
  songFolder: Directory,
  outputFile: File,
): Promise<void> => {
  try {
    await zipFolderToFile(songFolder, outputFile);
  } catch (error) {
    console.error('Error zipping song folder:', error);
    throw error;
  }
};

/**
 * Unzip an .adx file into a song folder
 *
 * @param adxFile - The .adx file to extract
 * @param outputFolder - The directory to extract the song files to
 */
export const unzipAdxFile = async (
  adxFile: File,
  outputFolder: Directory,
): Promise<void> => {
  try {
    await unzipFileToFolder(adxFile, outputFolder);
  } catch (error) {
    console.error('Error unzipping ADX file:', error);
    throw error;
  }
};
