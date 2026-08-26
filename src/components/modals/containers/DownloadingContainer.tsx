import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { DownloadJobItem } from '../../../types';
import { styles } from '../../../styles';
import { ModalSongElement } from '../ModalSongElement';

interface DownloadingContainerProps {
  downloadJobs: DownloadJobItem[];
  hasErrors: boolean;
  showCloseOnComplete?: boolean;
  onDismiss?: () => void;
}

export const DownloadingContainer = ({
  downloadJobs,
  hasErrors,
  showCloseOnComplete = false,
  onDismiss,
}: DownloadingContainerProps) => {
  const completedCount = downloadJobs.filter((job) => job.status === 'COMPLETED').length;
  const totalCount = downloadJobs.length;
  const hasJobs = totalCount > 0;
  const allComplete = hasJobs && downloadJobs.every((job) => job.status === 'COMPLETED');
  const isComplete = allComplete || hasErrors;

  return (
    <View style={styles.downloadingModalOverlay}>
      <View style={styles.downloadingModalContent}>
        <Text style={styles.downloadingModalTitle}>
          {isComplete ? 'Downloads Complete' : 'Downloading Levels'}
        </Text>

        {hasJobs && (
          <Text style={styles.downloadingModalSubtitle}>
            {completedCount} of {totalCount} complete
          </Text>
        )}

        {hasErrors && (
          <View style={styles.downloadingModalErrorBanner}>
            <MaterialCommunityIcons name='alert' size={20} color='#ff6b6b' />
            <Text style={styles.downloadingModalErrorText}>
              Some downloads failed
            </Text>
          </View>
        )}

        {hasJobs && !isComplete && (
          <View style={styles.downloadingModalProgressContainer}>
            <View style={styles.downloadingModalProgressBar}>
              <View
                style={[
                  styles.downloadingModalProgressFill,
                  { width: `${(completedCount / totalCount) * 100}%` },
                ]}
              />
            </View>
          </View>
        )}

        {hasJobs && (
          <ScrollView style={styles.downloadingModalList}>
            {downloadJobs
              // display the currently downloading songs first
              .sort((job) => job.status === 'IN_PROGRESS' ? -1 : 0)
              .map((job) => {
                const isCompleted = job.status === 'COMPLETED';
                const isInProgress = job.status === 'IN_PROGRESS';

                const leftIcon = isCompleted
                  ? <MaterialCommunityIcons name='check-circle' size={20} color='#4caf50' />
                  : isInProgress
                  ? <ActivityIndicator size='small' color='#007AFF' />
                  : <MaterialCommunityIcons name='clock-outline' size={20} color='#9aa3b2' />;

                return (
                  <ModalSongElement
                    key={job.id}
                    title={job.title}
                    subtitle={job.artist}
                    leftIcon={leftIcon}
                    variant='downloading'
                  />
                );
              })}
          </ScrollView>
        )}

        {isComplete && (hasErrors || showCloseOnComplete) && onDismiss && (
          <TouchableOpacity
            style={styles.downloadingModalCompleteButton}
            onPress={onDismiss}
          >
            <Text style={styles.downloadingModalCompleteButtonText}>Close</Text>
          </TouchableOpacity>
        )}

        {hasJobs && !isComplete && (
          <View style={styles.downloadingModalLoadingContainer}>
            <ActivityIndicator size='large' color='#007AFF' />
            <Text style={styles.downloadingModalLoadingText}>
              Please wait...
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
