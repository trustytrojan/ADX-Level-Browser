import { File, Directory, Paths } from 'expo-file-system';
import type { SongItem } from '../types';

export const getFileForSong = (item: SongItem): File => {
  // Use either folderId (for Google Drive songs) or majdataId (for Majdata songs)
  const id = item.folderId || item.majdataId;
  if (!id) {
    throw new Error('Song must have either folderId or majdataId');
  }
  const fileName = `${id}.adx`;
  const downloadsDir = new Directory(Paths.document, 'adx-downloads');
  downloadsDir.create({ intermediates: true, idempotent: true });
  return new File(downloadsDir, fileName);
};

export const isMajdataSong = (item: SongItem): boolean => {
  return !!item.majdataId;
};

export const isGoogleDriveSong = (item: SongItem): boolean => {
  return !!item.folderId;
};

