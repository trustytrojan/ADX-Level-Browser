import { useCallback, useEffect, useRef, useState } from 'react';
import { File } from 'expo-file-system';
import type { SongItem } from '../types';
import { useDownload } from './useDownload';
import { openWithAstroDX } from '../utils/sharing';

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
  const [isImportCompressionComplete, setIsImportCompressionComplete] = useState(false);
  const [showCloseOnComplete, setShowCloseOnComplete] = useState(false);
  const [downloadCompletionVersion, setDownloadCompletionVersion] = useState(0);

  const isImportingRef = useRef(false);
  const didMarkCompletionRef = useRef(false);
  const importReadyTargetRef = useRef<{ fileUri: string; title: string } | null>(null);

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
    setIsImportCompressionComplete(false);
    importReadyTargetRef.current = null;
    setShowImportingModal(true);

    let importSucceeded = false;

    try {
      await importCompletedDownloads((target) => {
        importReadyTargetRef.current = target;
        setIsImportCompressionComplete(true);
      });
      importSucceeded = true;
    } catch (error) {
      console.error('Error processing downloads:', error);
    } finally {
      if (!importSucceeded) {
        setShowImportingModal(false);
        setIsImportCompressionComplete(false);
        importReadyTargetRef.current = null;
      }

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
    setTimeout(() => {
      clearDownloads();
    }, 0);
  }, [clearDownloads]);

  const retryImporting = useCallback(async () => {
    const target = importReadyTargetRef.current;
    if (!target)
      return;

    await openWithAstroDX(new File(target.fileUri));
  }, []);

  const dismissImporting = useCallback(() => {
    setShowImportingModal(false);
    setIsImportCompressionComplete(false);
    setImportingSongCount(0);
    importReadyTargetRef.current = null;
  }, []);

  return {
    downloadJobs,
    hasErrors,
    showDownloadingModal,
    showImportingModal,
    importingSongCount,
    isImportCompressionComplete,
    retryImporting,
    dismissImporting,
    showCloseOnComplete,
    downloadCompletionVersion,
    startDownloadFlow,
    startDownloadOnlyFlow,
    dismissDownloading,
  };
};
