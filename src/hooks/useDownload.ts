import { useState, useRef } from 'react';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { File, Paths } from 'expo-file-system';
import type { SongItem, DownloadState, DownloadJobItem } from '../types';
import { getFileForSong, isMajdataSong } from '../utils/fileSystem';
import { openWithAstroDX, openMultipleWithAstroDX } from '../utils/sharing';
import { ExportJob } from '../services/gdrive';
import { downloadMajdataSong } from '../services/majdata';

const DOWNLOAD_TIMEOUT_MS = 90000;
const DOWNLOAD_TIMEOUT_MESSAGE = 'Download timed out (90s limit)';

type CompletedFileItem = {
  file: File;
  title: string;
};

export const useDownload = () => {
  const [downloadJobs, setDownloadJobs] = useState<DownloadJobItem[]>([]);
  const [downloadedMap, setDownloadedMap] = useState<Record<string, boolean>>({});
  const totalDownloadsRef = useRef<number>(0);
  const completedDownloadsRef = useRef<number>(0);
  const batchCompletedFilesRef = useRef<CompletedFileItem[]>([]);
  const shouldClearOnNextActiveRef = useRef<boolean>(false);

  const getSongId = (item: SongItem): string => {
    return item.folderId || item.majdataId || '';
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
          title: item.title,
          artist: item.artist,
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
    // console.log(`[downloadSingleSong] Added to batch, batch count=${batchCompletedFilesRef.current.length}`);
  };

  const startGoogleDriveDownload = (
    item: SongItem,
    songId: string,
    file: File,
  ) => {
    // console.log(`[downloadSingleSong] Starting Google Drive download for ${item.title}`);
    ExportJob.create(item.folderId!, item.zetarakuId || item.folderId!)
      .then((job) => {
        return job
          .waitForSuccess((status, percentDone) => {
            updateDownloadJob(songId, (entry) => ({
              ...entry,
              status: status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'QUEUED',
              percentDone,
            }));
          })
          .then(() => {
            if (!job.archives || job.archives.length === 0) {
              throw new Error('No archives generated');
            }

            const downloadUrl = job.archives[0].storagePath;
            const timeoutId = getDownloadTimeout();
            const fileUri = `${Paths.document.uri}adx-downloads/${file.name}`;
            // console.log(`[downloadSingleSong] Downloading Google Drive file for ${item.title}`);

            return FileSystem.downloadAsync(downloadUrl, fileUri)
              .then(() => {
                clearTimeout(timeoutId);
                // console.log(`[downloadSingleSong] Google Drive download completed for ${item.title}`);
                setDownloadedMap((prev) => ({ ...prev, [songId]: true }));
                addCompletedFile(file, item.title);
              })
              .catch((error: unknown) => {
                clearTimeout(timeoutId);
                throw error;
              });
          });
      })
      .then(() => {
        handleDownloadComplete(songId);
      })
      .catch((error) => {
        handleDownloadError(error, songId);
      });
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
    const isMajdata = isMajdataSong(item);
    // console.log(`[downloadSingleSong] Starting for ${item.title} (${songId}), isMajdata=${isMajdata}`);

    addDownloadJobIfMissing(songId, item);

    try {
      if (isMajdata) {
        // console.log(`[downloadSingleSong] Starting majdata download for ${item.title}`);
        const timeoutId = getDownloadTimeout();

        try {
          updateDownloadJob(songId, (entry) => ({ ...entry, status: 'IN_PROGRESS' }));

          await downloadMajdataSong(item.majdataId!, item.title, file);

          clearTimeout(timeoutId);
          // console.log(`[downloadSingleSong] Majdata download completed for ${item.title}`);
          setDownloadedMap((prev) => ({ ...prev, [songId]: true }));
          addCompletedFile(file, item.title);
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      } else {
        // Don't await - let download progress in background and complete asynchronously
        startGoogleDriveDownload(item, songId, file);
        return;
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

    // Initialize batch tracking for downloads
    totalDownloadsRef.current = itemsToDownload.length;
    completedDownloadsRef.current = 0;
    batchCompletedFilesRef.current = [];

    // Start all downloads
    itemsToDownload.forEach((item) => {
      downloadSingleSong(item);
    });
  };

  const handleDownloadComplete = (songId: string) => {
    completedDownloadsRef.current += 1;
    // console.log(`[handleDownloadComplete] Completed=${completedDownloadsRef.current}, Total=${totalDownloadsRef.current}, songId=${songId}`);
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
      // console.log(`[handleDownloadComplete] All downloads complete! Opening ${files.length} files`);
      // console.log(`[handleDownloadComplete] Batch contains: ${batchTitles.join(', ')}`);
      
      // Snapshot the batch before clearing to prevent interference from new downloads
      const filesToOpen = [...files];
      const titlesToOpen = [...batchTitles];
      
      if (filesToOpen.length === 1) {
        // console.log(`[handleDownloadComplete] Opening single file: ${titlesToOpen[0]}`);
        openWithAstroDX(filesToOpen[0], titlesToOpen[0]).catch(console.error);
      } else if (filesToOpen.length > 1) {
        // console.log(`[handleDownloadComplete] Opening ${filesToOpen.length} files with openMultipleWithAstroDX`);
        openMultipleWithAstroDX(filesToOpen).catch(console.error);
      } else {
        console.log(`[handleDownloadComplete] WARNING: No files to open despite completion!`);
      }
      
      // Clear the batch after snapshotting
      batchCompletedFilesRef.current = [];
      totalDownloadsRef.current = 0;
      completedDownloadsRef.current = 0;
      if (filesToOpen.length > 0) {
        shouldClearOnNextActiveRef.current = true;
      }
    } else {
      // console.log(`[handleDownloadComplete] Still waiting for ${totalDownloadsRef.current - completedDownloadsRef.current} more download(s)`);
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

