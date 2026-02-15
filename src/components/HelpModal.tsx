import { Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/AppStyles';

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
}

export const HelpModal = ({ visible, onClose }: HelpModalProps) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.helpModalOverlay}>
        <View style={styles.helpModalContent}>
          <Text style={styles.helpModalTitle}>Help</Text>
          <Text style={styles.helpModalText}>
            This is a helper application for downloading and importing ADX files to AstroDX.{'\n'}
            Here's how to use the app:{'\n'}
            - Pull down on the song list to refresh the database.{'\n'}
            - Button colors: Converts are dark gray; Majdata songs are blue.{'\n'}
            - Filter by song title/artist with the search bar.{'\n'}
            - Tap a song to start downloading it.{'\n'}
            - You can download multiple songs simultaneously. Once all downloads complete, all songs will be imported into AstroDX at once!{'\n'}
            - If a song has a <Ionicons name="checkmark-circle" size={20} color="#4caf50" />, it is already downloaded inside this app. Tap on it to immediately import to AstroDX.{'\n'}
            - You can press and hold on a song to enter multi-select mode, which lets you perform the above actions on multiple songs.
          </Text>
          <Pressable
            style={styles.helpModalCloseButton}
            onPress={onClose}
          >
            <Text style={styles.helpModalCloseButtonText}>Close</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};
