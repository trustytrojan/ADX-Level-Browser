import { Modal, Text, View, ActivityIndicator } from 'react-native';
import { styles } from '../styles/AppStyles';

interface CompressionLoadingModalProps {
  visible: boolean;
}

export const CompressionLoadingModal = ({ visible }: CompressionLoadingModalProps) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => {
        // User cannot close this modal
      }}
    >
      <View style={styles.helpModalOverlay}>
        <View 
          style={styles.helpModalContent}
          onStartShouldSetResponder={() => true}
        >
          <Text style={styles.helpModalTitle}>Please Wait</Text>
          <Text style={{ color: '#9aa3b2', fontSize: 14, marginBottom: 24, textAlign: 'center' }}>
            Compressing songs for bulk import...
          </Text>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </View>
    </Modal>
  );
};
