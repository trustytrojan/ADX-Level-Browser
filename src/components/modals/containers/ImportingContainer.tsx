import { ActivityIndicator, Platform, Text, TouchableOpacity, View } from 'react-native';
import { FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../../../styles';

interface ImportingContainerProps {
  songCount: number;
  compressionComplete: boolean;
  onImport: () => void;
  onClose: () => void;
}

export const ImportingContainer = ({
  songCount,
  compressionComplete,
  onImport,
  onClose,
}: ImportingContainerProps) => {
  const isMultiple = songCount > 1;
  const isPad = Platform.OS === 'ios' && 'isPad' in Platform && Boolean(Platform.isPad);
  const iDevice = isPad ? 'iPad' : 'iPhone';

  const title = compressionComplete ? 'Ready to Import' : 'Preparing Levels';

  const messageElement = compressionComplete
    ? Platform.OS === 'android'
      ? (
        <Text style={{ color: '#9aa3b2', fontSize: 14, textAlign: 'center' }}>
          Tap <Text style={{ fontWeight: 'bold' }}>AstroDX</Text> in the{' '}
          <Text style={{ fontWeight: 'bold' }}>Open with</Text> dialog
        </Text>
      )
      : (
        <View>
          <Text style={{ color: '#9aa3b2', fontSize: 14 }}>
            1. Tap <Text style={{ fontWeight: 'bold' }}>Save to Files</Text>
          </Text>
          <Text style={{ color: '#9aa3b2', fontSize: 14 }}>
            2. Navigate to <Text style={{ fontWeight: 'bold' }}>On My {iDevice}</Text>{' '}
            <FontAwesome6 name='arrow-right' color='#9aa3b2' /> <Text style={{ fontWeight: 'bold' }}>AstroDX</Text>
          </Text>
          <Text style={{ color: '#9aa3b2', fontSize: 14, textAlign: 'left' }}>
            3. Press <Text style={{ fontWeight: 'bold' }}>Save</Text>
          </Text>
          <Text style={{ color: '#9aa3b2', fontSize: 14, textAlign: 'left' }}>
            4. <Text style={{ fontWeight: 'bold' }}>Restart</Text> AstroDX
          </Text>
        </View>
      )
    : (
      <Text style={{ color: '#9aa3b2', fontSize: 14, textAlign: 'center' }}>
        {isMultiple ? `Preparing ${songCount} levels for bulk import...` : 'Preparing level for import...'}
      </Text>
    );

  return (
    <View style={styles.downloadingModalOverlay}>
      <View style={styles.downloadingModalContent}>
        <Text style={styles.downloadingModalTitle}>
          {title}
        </Text>

        <View style={styles.downloadingModalLoadingContainer}>
          <View style={{ marginBottom: 16 }}>
            {messageElement}
          </View>
          {compressionComplete
            ? <MaterialCommunityIcons name='check-circle' size={36} color='#4caf50' />
            : <ActivityIndicator size='large' color='#007AFF' />}
        </View>

        {compressionComplete && (
          <View style={styles.importingModalButtons}>
            <TouchableOpacity
              style={styles.importingModalImportButton}
              onPress={onImport}
            >
              <MaterialCommunityIcons
                name='import'
                size={20}
                color='#fff'
              />
              <Text style={styles.reviewModalDownloadButtonText}>Import</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.importingModalCloseButton}
              onPress={onClose}
            >
              <Text style={styles.downloadingModalCompleteButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};
