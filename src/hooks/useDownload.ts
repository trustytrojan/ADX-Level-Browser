import { useSyncExternalStore, useRef, useCallback } from 'react';
import { File } from 'expo-file-system';
import type { SongItem, DownloadJobItem } from '../types';
import { getFileForSong } from '../utils/fileSystem';
import { downloadSong } from '../services/download';

type CompletedFileItem = {
  file: File;
  title: string;
};

// Create a simple store for download jobs
const createStore = <T,>(initialValue: T) => {
  let state = initialValue;
  const listeners = new Set<() => void>();
  
  return {
    getState: () => state,
    setState: (newState: T | ((prev: T) => T)) => {
      state = typeof newState === 'function' ? (newState as (prev: T) => T)(state) : newState;
      listeners.forEach(listener => listener());
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
    downloadJobsStore.getState
  );
  
  const hasErrors = useSyncExternalStore(
    hasErrorsStore.subscribe,
    hasErrorsStore.getState
  );
  
  const setDownloadJobs = useCallback((
    updater: DownloadJobItem[] | ((prev: DownloadJobItem[]) => DownloadJobItem[])
  ) => {
    downloadJobsStore.setState(updater);
  }, [downloadJobsStore]);
  
  const setHasErrors = useCallback((value: boolean) => {
    hasErrorsStore.setState(value);
  }, [hasErrorsStore]);

  const getSongId = (item: SongItem): string => {
    return item.id || '';
  };

  const downloadSingleSong = (item: SongItem) => {
    const file = getFileForSong(item);
    const songId = getSongId(item);

    // Update to IN_PROGRESS immediately
    setDownloadJobs((prev) =>
      prev.map((entry) =>
        entry.id === songId
          ? { ...entry, status: 'IN_PROGRESS' as const, percentDone: 0 }
          : entry
      )
    );

    return downloadSong(item, file, downloadVideos).then(() => {
      // Update to COMPLETED
      setDownloadJobs((prev) =>
        prev.map((entry) =>
          entry.id === songId
            ? { ...entry, status: 'COMPLETED' as const, percentDone: 100 }
            : entry
        )
      );
    }).catch(error => {
      console.error('Download error:', error);
      setHasErrors(true);
      // Mark as failed by removing from jobs list
      setDownloadJobs((prev) => prev.filter((entry) => entry.id !== songId));
    });
  };

  const startDownloads = async (items: SongItem[]) => {
    if (items.length === 0) return;

    // Reset state
    setHasErrors(false);

    // Separate cached and uncached songs
    const cachedSongs: SongItem[] = [];
    const uncachedSongs: SongItem[] = [];

    items.forEach((item) => {
      const file = getFileForSong(item);
      if (file.exists) {
        cachedSongs.push(item);
      } else {
        uncachedSongs.push(item);
      }
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
  };

  const getCompletedFiles = (): CompletedFileItem[] => {
    return downloadJobs
      .filter((job) => job.status === 'COMPLETED')
      .map((job) => {
        const file = getFileForSong({ id: job.id, sourceId: job.sourceId } as SongItem);
        return { file, title: job.title };
      });
  };

  const clearDownloads = () => {
    setDownloadJobs([]);
    setHasErrors(false);
  };

  const isDownloading = downloadJobs.length > 0 && 
    downloadJobs.some(job => job.status !== 'COMPLETED');

  return {
    downloadJobs,
    hasErrors,
    isDownloading,
    startDownloads,
    getCompletedFiles,
    clearDownloads,
  };
};
