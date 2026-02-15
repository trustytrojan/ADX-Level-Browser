import { Modal, Pressable, Text, View, Switch, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { styles } from '../styles/AppStyles';
import { clearDownloadCache } from '../utils/fileSystem';

interface SettingsModalProps {
  visible: boolean;
  useRomanizedMetadata: boolean;
  onRomanizedMetadataChange: (value: boolean) => void;
  onCacheCleared: () => void;
  onClose: () => void;
}

export const SettingsModal = ({
  visible,
  useRomanizedMetadata,
  onRomanizedMetadataChange,
  onCacheCleared,
  onClose,
}: SettingsModalProps) => {
  const [clearingCache, setClearingCache] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      await clearDownloadCache();
      setCacheCleared(true);
      onCacheCleared();
      // Reset the message after 2 seconds
      setTimeout(() => setCacheCleared(false), 2000);
    } catch (error) {
      console.error('Failed to clear download cache:', error);
    } finally {
      setClearingCache(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.helpModalOverlay}>
        <View style={styles.helpModalContent}>
          <Text style={styles.helpModalTitle}>Settings</Text>
          
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={styles.settingsModalText}>Romanized Metadata</Text>
              <Switch
                value={useRomanizedMetadata}
                onValueChange={onRomanizedMetadataChange}
              />
            </View>
            <Text style={{ color: '#9aa3b2', fontSize: 12 }}>
              Display romanized song titles, artists, and designers when available
            </Text>
          </View>

          <View style={{ gap: 8 }}>
            <Pressable
              style={[
                styles.helpModalCloseButton,
                { backgroundColor: '#ff6b6b' },
                clearingCache && { opacity: 0.6 },
              ]}
              onPress={handleClearCache}
              disabled={clearingCache}
            >
              {clearingCache ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : cacheCleared ? (
                <Text style={styles.helpModalCloseButtonText}>✓ Cache Cleared</Text>
              ) : (
                <Text style={styles.helpModalCloseButtonText}>Clear Download Cache</Text>
              )}
            </Pressable>

            <Pressable
              style={styles.helpModalCloseButton}
              onPress={onClose}
            >
              <Text style={styles.helpModalCloseButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};
