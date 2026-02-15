import { File, Directory, Paths } from 'expo-file-system';
import type { SongItem } from '../types';

const SONGS_DB_URL = 'https://github.com/trustytrojan/adx-convert-db/raw/refs/heads/main/songs.json';
const SONGS_DB_FILENAME = 'songs.json';

/**
 * Loads the songs database from private app data.
 * If the database doesn't exist locally, downloads it from GitHub first.
 * @returns Promise<SongItem[]> - Array of songs, deduplicated by folderId
 */
export async function loadSongsDatabase(): Promise<SongItem[]> {
  const dataDir = new Directory(Paths.document, 'data');
  await dataDir.create({ intermediates: true, idempotent: true });
  
  const songsFile = new File(dataDir, SONGS_DB_FILENAME);

  if (!songsFile.exists) {
    console.log('Songs database not found locally, downloading from GitHub...');
    await downloadSongsDatabase(songsFile);
  }

  // Read and parse the JSON file
  const jsonText = await songsFile.text();
  const rawSongs = JSON.parse(jsonText) as SongItem[];
  
  // Deduplicate songs by folderId (keep first occurrence)
  const songs = Array.from(new Map(rawSongs.map(item => [item.folderId, item])).values());
  
  console.log(`Loaded ${songs.length} songs from database`);
  return songs;
}

/**
 * Downloads the songs database from GitHub
 * @param targetFile - The file to save the downloaded database to
 */
async function downloadSongsDatabase(targetFile: File): Promise<void> {
  try {
    const response = await fetch(SONGS_DB_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to download songs database: ${response.status} ${response.statusText}`);
    }

    const jsonText = await response.text();
    
    // Validate it's valid JSON before saving
    JSON.parse(jsonText);
    
    await targetFile.write(jsonText);
    console.log('Songs database downloaded successfully');
  } catch (error) {
    console.error('Error downloading songs database:', error);
    throw new Error(`Failed to download songs database: ${error}`);
  }
}

/**
 * Forces a refresh of the songs database by downloading the latest version
 * @returns Promise<SongItem[]> - Array of updated songs
 */
export async function refreshSongsDatabase(): Promise<SongItem[]> {
  const dataDir = new Directory(Paths.document, 'data');
  await dataDir.create({ intermediates: true, idempotent: true });
  
  const songsFile = new File(dataDir, SONGS_DB_FILENAME);
  
  console.log('Refreshing songs database...');
  await downloadSongsDatabase(songsFile);
  
  return loadSongsDatabase();
}
