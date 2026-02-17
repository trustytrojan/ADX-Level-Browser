import { File, Directory, Paths } from 'expo-file-system';
import type { SongItem } from '../types';

export const getFileForSong = (item: SongItem): File => {
  // Use the song's unique ID
  const id = item.id;
  if (!id) {
    throw new Error('Song must have an id');
  }
  // Include sourceId in filename to ensure uniqueness across sources
  const fileName = `${item.sourceId}_${id}.adx`;
  const downloadsDir = new Directory(Paths.document, 'adx-downloads');
  downloadsDir.create({ intermediates: true, idempotent: true });
  return new File(downloadsDir, fileName);
};

export const clearDownloadCache = async (): Promise<void> => {
  const downloadsDir = new Directory(Paths.document, 'adx-downloads');
  try {
    // Delete the entire adx-downloads directory
    if (downloadsDir.exists) {
      downloadsDir.delete();
    }
  } catch (error) {
    // If directory doesn't exist, that's fine
    console.error('Error clearing download cache:', error);
    throw error;
  }
};
