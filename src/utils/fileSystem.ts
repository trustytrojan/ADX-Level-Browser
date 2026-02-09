import { File, Directory, Paths } from 'expo-file-system';
import type { SongItem } from '../types';

export const getFileForSong = (item: SongItem): File => {
  // Use folderId to ensure unique filenames, even if titles are similar
  const fileName = `${item.folderId}.adx`;
  const downloadsDir = new Directory(Paths.document, 'adx-downloads');
  downloadsDir.create({ intermediates: true, idempotent: true });
  return new File(downloadsDir, fileName);
};
