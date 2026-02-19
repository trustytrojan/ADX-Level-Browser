import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { DownloadJobItem } from '../../types';
import { styles } from '../../styles/AppStyles';
import MyModal from './MyModal';
import { ModalSongElement } from './ModalSongElement';

interface DownloadingModalProps {
  visible: boolean;
  downloadJobs: DownloadJobItem[];
  hasErrors: boolean;
  onDismiss?: () => void;
}

export const DownloadingModal = ({
  visible,
  downloadJobs,
  hasErrors,
  onDismiss,
}: DownloadingModalProps) => {
  // Count completed jobs
  const completedCount = downloadJobs.filter((job) => job.status === 'COMPLETED').length;
  const totalCount = downloadJobs.length;
  const allComplete = downloadJobs.length > 0 && downloadJobs.every((job) => job.status === 'COMPLETED');
  const isComplete = allComplete || hasErrors;

  return (
    <MyModal
      visible={visible}
      animationType='none'
      transparent={true}
      onRequestClose={() => {
        // User cannot close this modal while downloading
        if (isComplete && onDismiss)
          onDismiss();
      }}
    >
      <View style={styles.downloadingModalOverlay}>
        <View style={styles.downloadingModalContent}>
          <Text style={styles.downloadingModalTitle}>
            Downloading Levels
          </Text>

          <Text style={styles.downloadingModalSubtitle}>
            {completedCount} of {totalCount} complete
          </Text>

          {hasErrors && (
            <View style={styles.downloadingModalErrorBanner}>
              <MaterialCommunityIcons name='alert' size={20} color='#ff6b6b' />
              <Text style={styles.downloadingModalErrorText}>
                Some downloads failed
              </Text>
            </View>
          )}

          {!isComplete && (
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

          <ScrollView style={styles.downloadingModalList}>
            {downloadJobs.map((job) => {
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

          {isComplete && hasErrors && onDismiss && (
            <TouchableOpacity
              style={styles.downloadingModalCompleteButton}
              onPress={onDismiss}
            >
              <Text style={styles.downloadingModalCompleteButtonText}>Dismiss</Text>
            </TouchableOpacity>
          )}

          {!isComplete && (
            <View style={styles.downloadingModalLoadingContainer}>
              <ActivityIndicator size='large' color='#007AFF' />
              <Text style={styles.downloadingModalLoadingText}>
                Please wait...
              </Text>
            </View>
          )}
        </View>
      </View>
    </MyModal>
  );
};
