import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../styles';

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
}

export const HelpModal = ({ visible, onClose }: HelpModalProps) => {
  return (
    <Modal
      visible={visible}
      animationType='none'
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.helpModalOverlay}>
        <View
          style={styles.helpModalContent}
          onStartShouldSetResponder={() => true}
        >
          <Text style={styles.helpModalTitle}>Help</Text>
          <Text style={styles.helpModalText}>
            • Pull down on the list to refresh it using your configured sources.{'\n'}
            • Majdata.net levels are blue buttons, all others are dark gray.{'\n'}
            • You can search for songs by title, artist, or chart designer (for Majdata charts) with the search
            bar.{'\n'}
            • Tap a song to select it for importing, tap again to unselect.{'\n'}
            • If a song has a{' '}
            <Ionicons name='checkmark-circle' size={20} color='#4caf50' />, it is already downloaded inside this
            app.{'\n'}
            • Tap "Review Selection" to begin downloading and/or importing selected levels.{'\n'}
          </Text>
          <TouchableOpacity
            style={styles.helpModalCloseButton}
            onPress={onClose}
          >
            <Text style={styles.helpModalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
