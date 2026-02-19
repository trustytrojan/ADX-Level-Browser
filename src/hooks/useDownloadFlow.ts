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
  const [showCloseOnComplete, setShowCloseOnComplete] = useState(false);
  const [downloadCompletionVersion, setDownloadCompletionVersion] = useState(0);

  const isImportingRef = useRef(false);
  const didMarkCompletionRef = useRef(false);

  const runImport = useCallback(async (countHint?: number) => {
    if (isImportingRef.current)
      return;

    const completedCount = countHint ?? getCompletedCount();
    if (completedCount === 0) {
      setShowDownloadingModal(false);
      setShowCloseOnComplete(false);
      clearDownloads();
      return;
    }

    isImportingRef.current = true;
    setShowDownloadingModal(false);
    setShowCloseOnComplete(false);
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

  const startFlow = useCallback((items: SongItem[], importAfterDownload: boolean) => {
    const result = startDownloads(items);

    if (result.totalCount === 0)
      return;

    didMarkCompletionRef.current = false;
    setShowCloseOnComplete(!importAfterDownload);

    if (result.hasPendingDownloads) {
      setShowDownloadingModal(true);
      return;
    }

    if (importAfterDownload)
      void runImport(result.completedCount);
  }, [runImport, startDownloads]);

  const startDownloadFlow = useCallback((items: SongItem[]) => {
    startFlow(items, true);
  }, [startFlow]);

  const startDownloadOnlyFlow = useCallback((items: SongItem[]) => {
    startFlow(items, false);
  }, [startFlow]);

  useEffect(() => {
    const allComplete = downloadJobs.length > 0 && downloadJobs.every((job) => job.status === 'COMPLETED');

    if (allComplete && showDownloadingModal && !didMarkCompletionRef.current) {
      didMarkCompletionRef.current = true;
      setDownloadCompletionVersion((value) => value + 1);
    }

    if (allComplete && showDownloadingModal && !hasErrors && !showCloseOnComplete)
      void runImport();
  }, [downloadJobs, showDownloadingModal, hasErrors, runImport, showCloseOnComplete]);

  const dismissDownloading = useCallback(() => {
    setShowDownloadingModal(false);
    setShowCloseOnComplete(false);
    clearDownloads();
  }, [clearDownloads]);

  return {
    downloadJobs,
    hasErrors,
    showDownloadingModal,
    showImportingModal,
    importingSongCount,
    showCloseOnComplete,
    downloadCompletionVersion,
    startDownloadFlow,
    startDownloadOnlyFlow,
    dismissDownloading,
  };
};
