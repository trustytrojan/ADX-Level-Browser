import { useCallback, useRef, useSyncExternalStore } from 'react';
import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';
import type { DownloadJobItem, SongItem } from '../types';
import { getFileForSong, getFolderForSong } from '../utils/fileSystem';
import { downloadSong, unzipAdxFile, zipSongFolder } from '../services/download';
import { openWithAstroDX } from '../utils/sharing';

type CompletedItem = {
  file: File | null;
  folder: Directory | null;
  title: string;
  item: SongItem;
};

type StartDownloadsResult = {
  hasPendingDownloads: boolean;
  completedCount: number;
  totalCount: number;
};

// Create a simple store for download jobs
const createStore = <T>(initialValue: T) => {
  let state = initialValue;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    setState: (newState: T | ((prev: T) => T)) => {
      state = typeof newState === 'function' ? (newState as (prev: T) => T)(state) : newState;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

export const useDownload = (downloadVideos: boolean = true) => {
  const downloadJobsStore = useRef(createStore<DownloadJobItem[]>([])).current;
  const hasErrorsStore = useRef(createStore<boolean>(false)).current;

  /*
  WE MUST USE useSyncExternalStore INSTEAD OF useState TO AVOID REACT'S AUTOMATIC BATCHING!
  THIS FORCES A RENDER ON ANY UPDATE TO THESE VALUES!
  */

  const downloadJobs = useSyncExternalStore(
    downloadJobsStore.subscribe,
    downloadJobsStore.getState,
  );

  const hasErrors = useSyncExternalStore(
    hasErrorsStore.subscribe,
    hasErrorsStore.getState,
  );

  const setDownloadJobs = useCallback((
    updater: DownloadJobItem[] | ((prev: DownloadJobItem[]) => DownloadJobItem[]),
  ) => {
    downloadJobsStore.setState(updater);
  }, [downloadJobsStore]);

  const setHasErrors = useCallback((value: boolean) => {
    hasErrorsStore.setState(value);
  }, [hasErrorsStore]);

  const getSongId = (item: SongItem): string => {
    return item.id || '';
  };

  const isSongCached = (item: SongItem): boolean => {
    const file = getFileForSong(item);
    const folder = getFolderForSong(item);
    return file.exists || folder.exists;
  };

  const downloadSingleSong = (item: SongItem) => {
    const folder = getFolderForSong(item);
    const songId = getSongId(item);

    // Update to IN_PROGRESS immediately
    setDownloadJobs((prev) =>
      prev.map((entry) => entry.id === songId ? { ...entry, status: 'IN_PROGRESS' as const, percentDone: 0 } : entry)
    );

    return downloadSong(item, folder, downloadVideos).then(() => {
      // Update to COMPLETED
      setDownloadJobs((prev) =>
        prev.map((entry) => entry.id === songId ? { ...entry, status: 'COMPLETED' as const, percentDone: 100 } : entry)
      );
    }).catch((error) => {
      console.error('Download error:', error);
      setHasErrors(true);
      // Mark as failed by removing from jobs list
      setDownloadJobs((prev) => prev.filter((entry) => entry.id !== songId));
    });
  };

  const startDownloads = (items: SongItem[]): StartDownloadsResult => {
    if (items.length === 0)
      return { hasPendingDownloads: false, completedCount: 0, totalCount: 0 };

    // Reset state
    setHasErrors(false);

    // Separate cached and uncached songs
    const cachedSongs: SongItem[] = [];
    const uncachedSongs: SongItem[] = [];

    items.forEach((item) => {
      if (isSongCached(item))
        cachedSongs.push(item);
      else
        uncachedSongs.push(item);
    });

    // Initialize download jobs for ALL songs
    const jobs: DownloadJobItem[] = items.map((item) => ({
      ...(cachedSongs.some((song) => getSongId(song) === getSongId(item))
        ? { status: 'COMPLETED' as const, percentDone: 100 }
        : { status: 'QUEUED' as const, percentDone: 0 }),
      id: getSongId(item),
      sourceId: item.sourceId,
      title: item.title,
      artist: item.artist,
      designer: item.designer,
      romanizedDesigner: item.romanizedDesigner,
    }));

    setDownloadJobs(jobs);

    // Start downloads for uncached songs in parallel
    uncachedSongs.forEach(downloadSingleSong);

    return {
      hasPendingDownloads: uncachedSongs.length > 0,
      completedCount: cachedSongs.length,
      totalCount: items.length,
    };
  };

  const getCompletedItems = (): CompletedItem[] => {
    const jobs = downloadJobsStore.getState();
    return jobs
      .filter((job) => job.status === 'COMPLETED')
      .map((job) => {
        const item = { id: job.id, sourceId: job.sourceId } as SongItem;
        const file = getFileForSong(item);
        const folder = getFolderForSong(item);
        return {
          file: file.exists ? file : null,
          folder: folder.exists ? folder : null,
          title: job.title,
          item,
        };
      });
  };

  const clearDownloads = () => {
    setDownloadJobs([]);
    setHasErrors(false);
  };

  const getCompletedCount = (): number => {
    return getCompletedItems().length;
  };

  const importCompletedDownloads = async (): Promise<number> => {
    const completedItems = getCompletedItems();

    if (completedItems.length === 0)
      return 0;

    if (completedItems.length === 1) {
      const item = completedItems[0];
      const adxFile = getFileForSong(item.item);
      const folder = getFolderForSong(item.item);

      if (!adxFile.exists && folder.exists)
        await zipSongFolder(folder, adxFile);

      await openWithAstroDX(adxFile, item.title);
      return 1;
    }

    for (const item of completedItems) {
      const adxFile = getFileForSong(item.item);
      const folder = getFolderForSong(item.item);

      if (adxFile.exists && !folder.exists)
        await unzipAdxFile(adxFile, folder);
    }

    const folders = completedItems.map((item) => getFolderForSong(item.item));
    const combinedAdxPath = `${Paths.document.uri}combined-songs.adx`;
    const combinedAdxFile = new File(combinedAdxPath);

    if (combinedAdxFile.exists)
      combinedAdxFile.delete();

    if (Platform.OS === 'android') {
      const { zip } = await import('react-native-zip-archive');
      const folderPaths = folders.map((folder) => folder.uri);
      await zip(folderPaths, combinedAdxPath);
    } else if (Platform.OS === 'ios') {
      const fflate = await import('fflate');
      const allSongFiles: Record<string, Uint8Array> = {};
      const legacyFileSystem = await import('expo-file-system/legacy');

      for (const folder of folders) {
        const contents = await legacyFileSystem.readDirectoryAsync(folder.uri);

        for (const itemName of contents) {
          const itemPath = `${folder.uri}/${itemName}`;
          const itemInfo = await legacyFileSystem.getInfoAsync(itemPath);

          if (itemInfo.exists && itemInfo.isDirectory) {
            const songFiles = await legacyFileSystem.readDirectoryAsync(itemPath);
            for (const fileName of songFiles) {
              const filePath = `${itemPath}/${fileName}`;
              const file = new File(filePath);
              if (file.exists)
                allSongFiles[`${itemName}/${fileName}`] = file.bytesSync();
            }
          }
        }
      }

      const zipped = fflate.zipSync(allSongFiles);
      combinedAdxFile.write(zipped);
    }

    await openWithAstroDX(combinedAdxFile, 'Combined Songs');
    return completedItems.length;
  };

  const isDownloading = downloadJobs.length > 0
    && downloadJobs.some((job) => job.status !== 'COMPLETED');

  return {
    downloadJobs,
    hasErrors,
    isDownloading,
    startDownloads,
    getCompletedItems,
    getCompletedCount,
    importCompletedDownloads,
    clearDownloads,
  };
};
