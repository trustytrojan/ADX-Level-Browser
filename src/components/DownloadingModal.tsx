import { Modal, Text, View, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useEffect, useRef } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { DownloadJobItem } from '../types';
import { styles } from '../styles/AppStyles';

interface DownloadingModalProps {
  visible: boolean;
  downloadJobs: DownloadJobItem[];
  onComplete: () => void;
  hasErrors: boolean;
  isCompressing: boolean;
}

export const DownloadingModal = ({
  visible,
  downloadJobs,
  onComplete,
  hasErrors,
  isCompressing,
}: DownloadingModalProps) => {
  // Check if all downloads are complete
  const allComplete = downloadJobs.length > 0 && downloadJobs.every(job => job.status === 'COMPLETED');
  const isComplete = allComplete || hasErrors;
  const shouldShowCompressing = isComplete && isCompressing && downloadJobs.length > 1;
  
  // Count completed jobs
  const completedCount = downloadJobs.filter(job => job.status === 'COMPLETED').length;
  const totalCount = downloadJobs.length;

  // Auto-dismiss after 1 second if complete with no errors
  const autoDismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isComplete && !hasErrors && !isCompressing) {
      autoDismissTimerRef.current = setTimeout(() => {
        onComplete();
      }, 1000);
    }

    return () => {
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
      }
    };
  }, [isComplete, hasErrors, isCompressing, onComplete]);

  console.log(`[${new Date().toISOString()}] [DownloadingModal] downloadJobs:`, downloadJobs.map(({ title }) => title));

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={() => {
        // User cannot close this modal while downloading
        if (isComplete) {
          onComplete();
        }
      }}
    >
      <View style={styles.downloadingModalOverlay}>
        <View
          style={styles.downloadingModalContent}
          onStartShouldSetResponder={() => true}
        >
          <Text style={styles.downloadingModalTitle}>
            {isComplete ? 'Importing Levels' : 'Downloading Levels'}
          </Text>

          <Text style={styles.downloadingModalSubtitle}>
            {completedCount} of {totalCount} complete
          </Text>

          {hasErrors && (
            <View style={styles.downloadingModalErrorBanner}>
              <MaterialCommunityIcons name="alert" size={20} color="#ff6b6b" />
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
                    { width: `${(completedCount / totalCount) * 100}%` }
                  ]} 
                />
              </View>
            </View>
          )}

          <ScrollView style={styles.downloadingModalList}>
            {downloadJobs.map((job) => {
              const isCompleted = job.status === 'COMPLETED';
              const isInProgress = job.status === 'IN_PROGRESS';
              return (
                <View key={job.id} style={styles.downloadingModalItem}>
                  <View style={styles.downloadingModalItemLeft}>
                    {isCompleted ? (
                      <MaterialCommunityIcons name="check-circle" size={20} color="#4caf50" />
                    ) : isInProgress ? (
                      <ActivityIndicator size="small" color="#007AFF" />
                    ) : (
                      <MaterialCommunityIcons name="clock-outline" size={20} color="#9aa3b2" />
                    )}
                  </View>
                  <View style={styles.downloadingModalItemContent}>
                    <Text style={styles.downloadingModalItemTitle} numberOfLines={1}>
                      {job.title}
                    </Text>
                    {job.artist && (
                      <Text style={styles.downloadingModalItemSubtitle} numberOfLines={1}>
                        {job.artist}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {shouldShowCompressing && (
            <View style={styles.downloadingModalLoadingContainer}>
              <Text style={{ color: '#9aa3b2', fontSize: 14, marginBottom: 16, textAlign: 'center' }}>
                Compressing levels for bulk import...
              </Text>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          )}

          {isComplete && !shouldShowCompressing && hasErrors && (
            <TouchableOpacity
              style={styles.downloadingModalCompleteButton}
              onPress={onComplete}
            >
              <Text style={styles.downloadingModalCompleteButtonText}>Dismiss</Text>
            </TouchableOpacity>
          )}

          {!isComplete && (
            <View style={styles.downloadingModalLoadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.downloadingModalLoadingText}>
                Please wait...
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
