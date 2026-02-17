import { useState, useRef } from 'react';
import { Alert } from 'react-native';
import { File } from 'expo-file-system';
import type { SongItem, DownloadState, DownloadJobItem } from '../types';
import { getFileForSong } from '../utils/fileSystem';
import { openWithAstroDX, openMultipleWithAstroDX } from '../utils/sharing';
import { downloadSong } from '../services/download';

const DOWNLOAD_TIMEOUT_MS = 90000;
const DOWNLOAD_TIMEOUT_MESSAGE = 'Download timed out (90s limit)';

type CompletedFileItem = {
  file: File;
  title: string;
};

export const useDownload = (downloadVideos: boolean = true) => {
  const [downloadJobs, setDownloadJobs] = useState<DownloadJobItem[]>([]);
  const [downloadedMap, setDownloadedMap] = useState<Record<string, boolean>>({});
  const totalDownloadsRef = useRef<number>(0);
  const completedDownloadsRef = useRef<number>(0);
  const batchCompletedFilesRef = useRef<CompletedFileItem[]>([]);
  const shouldClearOnNextActiveRef = useRef<boolean>(false);

  const getSongId = (item: SongItem): string => {
    return item.id || '';
  };

  const getDownloadTimeout = () => {
    return setTimeout(() => {
      throw new Error(DOWNLOAD_TIMEOUT_MESSAGE);
    }, DOWNLOAD_TIMEOUT_MS);
  };

  const addDownloadJobIfMissing = (songId: string, item: SongItem) => {
    setDownloadJobs((prev) => {
      const exists = prev.some((job) => job.id === songId);
      if (exists) {
        return prev;
      }

      return [
        ...prev,
        {
          id: songId,
          sourceId: item.sourceId,
          title: item.title,
          artist: item.artist,
          designer: item.designer,
          romanizedDesigner: item.romanizedDesigner,
          status: 'QUEUED',
        },
      ];
    });
  };

  const updateDownloadJob = (
    songId: string,
    updater: (entry: DownloadJobItem) => DownloadJobItem
  ) => {
    setDownloadJobs((prev) =>
      prev.map((entry) => (entry.id === songId ? updater(entry) : entry))
    );
  };

  const addCompletedFile = (file: File, title: string) => {
    batchCompletedFilesRef.current.push({ file, title });
  };

  // Derived state: track which songs are currently downloading
  const downloading: DownloadState = downloadJobs.reduce((acc, job) => {
    if (job.status !== 'COMPLETED') {
      acc[job.id] = true;
    }
    return acc;
  }, {} as DownloadState);

  const downloadSingleSong = async (item: SongItem) => {
    const file = getFileForSong(item);
    const songId = getSongId(item);

    addDownloadJobIfMissing(songId, item);

    try {
      const timeoutId = getDownloadTimeout();

      try {
        updateDownloadJob(songId, (entry) => ({ ...entry, status: 'IN_PROGRESS' }));

        await downloadSong(item, file, downloadVideos);

        clearTimeout(timeoutId);
        setDownloadedMap((prev) => ({ ...prev, [songId]: true }));
        addCompletedFile(file, item.title);
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }

      handleDownloadComplete(songId);
    } catch (error) {
      console.error('Error:', error);
      handleDownloadError(error, songId);
    }
  };

  const handleDownloads = async (items: SongItem[]) => {
    if (items.length === 0) {
      return;
    }

    // Separate already downloaded and to be downloaded
    const alreadyDownloaded: SongItem[] = [];
    const itemsToDownload: SongItem[] = [];

    items.forEach((item) => {
      const file = getFileForSong(item);
      if (file.exists) {
        alreadyDownloaded.push(item);
      } else {
        itemsToDownload.push(item);
      }
    });

    // Send already downloaded files (don't await - let it run in background)
    if (alreadyDownloaded.length > 0) {
      const files = alreadyDownloaded.map(getFileForSong);
      if (files.length === 1)
        openWithAstroDX(files[0], alreadyDownloaded[0].title).catch((error) => {
          console.error('Error sending files to AstroDX:', error);
        });
      else
        openMultipleWithAstroDX(files).catch((error) => {
          console.error('Error sending files to AstroDX:', error);
        });
    }

    // If nothing to download, we're done
    if (itemsToDownload.length === 0) {
      if (alreadyDownloaded.length === 0) {
        Alert.alert('Already Downloaded', 'All selected songs are already downloaded.');
      }
      return;
    }

    // Initialize or update batch tracking for downloads
    const hasActiveDownloads = totalDownloadsRef.current > completedDownloadsRef.current;
    
    if (hasActiveDownloads) {
      // Add to existing batch (individual songs tapped while downloads in progress)
      totalDownloadsRef.current += itemsToDownload.length;
    } else {
      // Start new batch
      totalDownloadsRef.current = itemsToDownload.length;
      completedDownloadsRef.current = 0;
      batchCompletedFilesRef.current = [];
    }

    // Start all downloads
    itemsToDownload.forEach((item) => {
      downloadSingleSong(item);
    });
  };

  const handleDownloadComplete = (songId: string) => {
    completedDownloadsRef.current += 1;
    setDownloadJobs((prev) =>
      prev.map((entry) =>
        entry.id === songId
          ? { ...entry, status: 'COMPLETED', percentDone: 100 }
          : entry
      )
    );

    // Check if all downloads are complete
    if (completedDownloadsRef.current === totalDownloadsRef.current) {
      // All downloads complete - open all accumulated files
      const files = batchCompletedFilesRef.current.map(f => f.file);
      const batchTitles = batchCompletedFilesRef.current.map(f => f.title);
      
      // Snapshot the batch before clearing to prevent interference from new downloads
      const filesToOpen = [...files];
      const titlesToOpen = [...batchTitles];
      
      if (filesToOpen.length === 1) {
        openWithAstroDX(filesToOpen[0], titlesToOpen[0]).catch(console.error);
      } else if (filesToOpen.length > 1) {
        openMultipleWithAstroDX(filesToOpen).catch(console.error);
      } else {
        console.warn(`[handleDownloadComplete] No files to open despite completion!`);
      }
      
      // Clear the batch after snapshotting
      batchCompletedFilesRef.current = [];
      totalDownloadsRef.current = 0;
      completedDownloadsRef.current = 0;
      if (filesToOpen.length > 0) {
        shouldClearOnNextActiveRef.current = true;
      }
    }
  };

  const handleDownloadError = (error: unknown, songId: string) => {
    console.error('Error:', error);
    completedDownloadsRef.current += 1;
    const errorMessage = error instanceof Error 
      ? (error.name === 'AbortError' ? DOWNLOAD_TIMEOUT_MESSAGE : error.message)
      : 'An unknown error occurred';
    Alert.alert('Error', errorMessage);

    setDownloadJobs((prev) => prev.filter((entry) => entry.id !== songId));
  };


  const handleAppBecameActive = () => {
    if (!shouldClearOnNextActiveRef.current) return;
    const hasActiveJobs = downloadJobs.some((job) => job.status !== 'COMPLETED');
    if (hasActiveJobs) return;

    setDownloadJobs([]);
    shouldClearOnNextActiveRef.current = false;
    totalDownloadsRef.current = 0;
    completedDownloadsRef.current = 0;
  };

  return {
    downloading,
    downloadJobs,
    downloadedMap,
    handleDownloads,
    setDownloadedMap,
    handleAppBecameActive,
  };
};
