import { Modal, Text, View, ActivityIndicator } from 'react-native';
import { styles } from '../../styles/AppStyles';

interface ImportingModalProps {
  visible: boolean;
  songCount: number;
}

export const ImportingModal = ({
  visible,
  songCount,
}: ImportingModalProps) => {
  const isMultiple = songCount > 1;
  
  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      // onRequestClose={() => {
      //   // User cannot close this modal while importing
      // }}
    >
      <View style={styles.downloadingModalOverlay}>
        <View
          style={styles.downloadingModalContent}
          onStartShouldSetResponder={() => true}
        >
          <Text style={styles.downloadingModalTitle}>
            Importing Levels
          </Text>

          <View style={styles.downloadingModalLoadingContainer}>
            <Text style={{ color: '#9aa3b2', fontSize: 14, marginBottom: 16, textAlign: 'center' }}>
              {isMultiple 
                ? `Preparing ${songCount} levels for bulk import...`
                : 'Preparing level for import...'}
            </Text>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        </View>
      </View>
    </Modal>
  );
};
