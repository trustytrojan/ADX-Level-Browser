import { ActivityIndicator, Text, View } from 'react-native';
import { styles } from '../../styles/AppStyles';
import MyModal from './MyModal';

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
    <MyModal
      visible={visible}
      animationType='none'
      transparent={true}
    >
      <View style={styles.downloadingModalOverlay}>
        <View style={styles.downloadingModalContent}>
          <Text style={styles.downloadingModalTitle}>
            Importing Levels
          </Text>

          <View style={styles.downloadingModalLoadingContainer}>
            <Text style={{ color: '#9aa3b2', fontSize: 14, marginBottom: 16, textAlign: 'center' }}>
              {isMultiple ? `Preparing ${songCount} levels for bulk import...` : 'Preparing level for import...'}
            </Text>
            <ActivityIndicator size='large' color='#007AFF' />
          </View>
        </View>
      </View>
    </MyModal>
  );
};
