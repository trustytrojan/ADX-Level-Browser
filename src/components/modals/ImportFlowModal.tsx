import { Modal } from 'react-native';
import type { DownloadJobItem, SongItem } from '../../types';
import { DownloadingContainer } from './containers/DownloadingContainer';
import { ImportingContainer } from './containers/ImportingContainer';
import { ReviewSelectionContainer } from './containers/ReviewSelectionContainer';

interface ImportFlowModalProps {
  reviewVisible: boolean;
  downloadingVisible: boolean;
  importingVisible: boolean;
  selectedSongs: SongItem[];
  onRemoveSong: (songId: string) => void;
  onClearSelection: () => void;
  onDownload: () => void;
  onDownloadOnly?: () => void;
  onCloseReview: () => void;
  useRomanizedMetadata?: boolean;
  downloadJobs: DownloadJobItem[];
  hasErrors: boolean;
  showCloseOnComplete?: boolean;
  onDismissDownloading?: () => void;
  importingSongCount: number;
  importCompressionComplete: boolean;
  onRetryImporting: () => void;
  onCloseImporting: () => void;
}

export const ImportFlowModal = ({
  reviewVisible,
  downloadingVisible,
  importingVisible,
  selectedSongs,
  onRemoveSong,
  onClearSelection,
  onDownload,
  onDownloadOnly,
  onCloseReview,
  useRomanizedMetadata = false,
  downloadJobs,
  hasErrors,
  showCloseOnComplete = false,
  onDismissDownloading,
  importingSongCount,
  importCompressionComplete,
  onRetryImporting,
  onCloseImporting,
}: ImportFlowModalProps) => {
  const mode = importingVisible ? 'importing' : downloadingVisible ? 'downloading' : reviewVisible ? 'review' : null;

  const allComplete = downloadJobs.length > 0 && downloadJobs.every((job) => job.status === 'COMPLETED');
  const canDismissDownloading = hasErrors || (showCloseOnComplete && allComplete);

  if (!mode)
    return null;

  return (
    <Modal
      visible
      animationType='none'
      transparent
      onRequestClose={() => {
        if (mode === 'review') {
          onCloseReview();
          return;
        }

        if (mode === 'downloading' && canDismissDownloading && onDismissDownloading)
          onDismissDownloading();
      }}
    >
      {mode === 'review' && (
        <ReviewSelectionContainer
          selectedSongs={selectedSongs}
          onRemoveSong={onRemoveSong}
          onClearSelection={onClearSelection}
          onDownload={onDownload}
          onDownloadOnly={onDownloadOnly}
          onClose={onCloseReview}
          useRomanizedMetadata={useRomanizedMetadata}
        />
      )}

      {mode === 'downloading' && (
        <DownloadingContainer
          downloadJobs={downloadJobs}
          hasErrors={hasErrors}
          showCloseOnComplete={showCloseOnComplete}
          onDismiss={onDismissDownloading}
        />
      )}

      {mode === 'importing' && (
        <ImportingContainer
          songCount={importingSongCount}
          compressionComplete={importCompressionComplete}
          onImport={onRetryImporting}
          onClose={onCloseImporting}
        />
      )}
    </Modal>
  );
};
