import { useCallback, useEffect, useRef, useState } from 'react';
import type { SongItem } from '../types';
import { useDownload } from './useDownload';

export const useDownloadFlow = (downloadVideos: boolean) => {
  const {
    downloadJobs,
    hasErrors,
    startDownloads,
    getCompletedCount,
    importCompletedDownloads,
    clearDownloads,
  } = useDownload(downloadVideos);

  const [showDownloadingModal, setShowDownloadingModal] = useState(false);
  const [showImportingModal, setShowImportingModal] = useState(false);
  const [importingSongCount, setImportingSongCount] = useState(0);

  const isImportingRef = useRef(false);

  const runImport = useCallback(async (countHint?: number) => {
    if (isImportingRef.current)
      return;

    const completedCount = countHint ?? getCompletedCount();
    if (completedCount === 0) {
      setShowDownloadingModal(false);
      clearDownloads();
      return;
    }

    isImportingRef.current = true;
    setShowDownloadingModal(false);
    setImportingSongCount(completedCount);
    setShowImportingModal(true);

    try {
      await importCompletedDownloads();
    } catch (error) {
      console.error('Error processing downloads:', error);
    } finally {
      setShowImportingModal(false);
      clearDownloads();
      isImportingRef.current = false;
    }
  }, [clearDownloads, getCompletedCount, importCompletedDownloads]);

  const startDownloadFlow = useCallback((items: SongItem[]) => {
    const result = startDownloads(items);

    if (result.totalCount === 0)
      return;

    if (result.hasPendingDownloads) {
      setShowDownloadingModal(true);
      return;
    }

    void runImport(result.completedCount);
  }, [runImport, startDownloads]);

  useEffect(() => {
    const allComplete = downloadJobs.length > 0 && downloadJobs.every((job) => job.status === 'COMPLETED');
    if (allComplete && showDownloadingModal && !hasErrors)
      void runImport();
  }, [downloadJobs, showDownloadingModal, hasErrors, runImport]);

  const dismissDownloading = useCallback(() => {
    setShowDownloadingModal(false);
    clearDownloads();
  }, [clearDownloads]);

  return {
    downloadJobs,
    hasErrors,
    showDownloadingModal,
    showImportingModal,
    importingSongCount,
    startDownloadFlow,
    dismissDownloading,
  };
};
