import { Pressable, Text, View, Switch, ActivityIndicator, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { styles } from '../../styles/AppStyles';
import { clearDownloadCache } from '../../utils/fileSystem';
import { loadSources, deleteSource } from '../../services/sources';
import { SourcesList } from '../SourcesList';
import type { AppSettings, Source } from '../../types';
import MyModal from './MyModal';

interface SettingsModalProps {
  visible: boolean;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onCacheCleared: () => void;
  onClose: () => void;
  sourcesVersion: number;
  onRequestAddSource: () => void;
}

export const SettingsModal = ({
  visible,
  settings,
  onSettingsChange,
  onCacheCleared,
  onClose,
  sourcesVersion,
  onRequestAddSource,
}: SettingsModalProps) => {
  const [clearingCache, setClearingCache] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);
  
  const handleRequestAddSource = () => {
    onRequestAddSource();
  };

  // Load sources when modal opens or when sources are updated
  useEffect(() => {
    if (visible) {
      loadSources().then((loadedSources) => {
        setSources(loadedSources);
      }).catch(console.error);
    }
  }, [visible, sourcesVersion]);

  const refreshSources = async () => {
    const updatedSources = await loadSources();
    setSources(updatedSources);
  };

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

  const handleToggleRomanized = (value: boolean) => {
    onSettingsChange({ ...settings, useRomanizedMetadata: value });
  };

  const handleToggleVideos = (value: boolean) => {
    onSettingsChange({ ...settings, downloadVideos: value });
  };

  const handleDeleteSource = async (sourceId: string) => {
    try {
      await deleteSource(sourceId);
      await refreshSources();
    } catch (error) {
      console.error('Failed to delete source:', error);
    }
  };

  return (
    <>
      <MyModal
        visible={visible}
        animationType="none"
        transparent={true}
        onRequestClose={onClose}
      >
        <Pressable 
          style={styles.helpModalOverlay}
        >
          <View 
            style={styles.helpModalContent}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.helpModalTitle}>Settings</Text>
              
              <View style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={styles.settingsModalText}>Romanized Metadata</Text>
                  <Switch
                    value={settings.useRomanizedMetadata}
                    onValueChange={handleToggleRomanized}
                  />
                </View>
                <Text style={{ color: '#9aa3b2', fontSize: 12, marginBottom: 16 }}>
                  Display romanized song titles, artists, and designers when available
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={styles.settingsModalText}>Download Videos</Text>
                  <Switch
                    value={settings.downloadVideos}
                    onValueChange={handleToggleVideos}
                  />
                </View>
                <Text style={{ color: '#9aa3b2', fontSize: 12 }}>
                  Download video files (PV) for songs. Disable to save bandwidth and storage.
                </Text>
              </View>

              <SourcesList
                sources={sources}
                onDelete={handleDeleteSource}
                onAddPress={handleRequestAddSource}
                onSourceUpdated={refreshSources}
              />

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
            </ScrollView>
          </View>
        </Pressable>
      </MyModal>
    </>
  );
};
