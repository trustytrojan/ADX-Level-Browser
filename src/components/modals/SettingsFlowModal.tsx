import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { styles } from '../../styles/AppStyles';
import { clearDownloadCache } from '../../utils/fileSystem';
import { addSource, deleteSource, loadSources, updateSource } from '../../services/sources';
import { SourcesList } from '../SourcesList';
import type { AppSettings, Source } from '../../types';

interface SettingsFlowModalProps {
  visible: boolean;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onCacheCleared: () => void;
  onClose: () => void;
}

type SettingsMode = 'settings' | 'add-source' | 'edit-source';

export const SettingsFlowModal = ({
  visible,
  settings,
  onSettingsChange,
  onCacheCleared,
  onClose,
}: SettingsFlowModalProps) => {
  const [mode, setMode] = useState<SettingsMode>('settings');
  const [clearingCache, setClearingCache] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [sourceToEdit, setSourceToEdit] = useState<Source | null>(null);

  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setMode('settings');
      void loadSources().then(setSources).catch(console.error);
    }
  }, [visible]);

  useEffect(() => {
    if (mode === 'edit-source' && sourceToEdit) {
      setSourceName(sourceToEdit.name);
      setSourceUrl(sourceToEdit.baseUrl);
    }
    if (mode === 'add-source') {
      setSourceName('');
      setSourceUrl('');
    }
  }, [mode, sourceToEdit]);

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
      setTimeout(() => setCacheCleared(false), 2000);
    } catch (error) {
      console.error('Failed to clear download cache:', error);
    } finally {
      setClearingCache(false);
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    try {
      await deleteSource(sourceId);
      await refreshSources();
    } catch (error) {
      console.error('Failed to delete source:', error);
    }
  };

  const handleSaveSource = async () => {
    if (!sourceName.trim() || !sourceUrl.trim())
      return;

    setSubmitting(true);
    try {
      if (mode === 'add-source') {
        const sourceId = sourceName.toLowerCase().replace(/\s+/g, '-');
        await addSource({
          id: sourceId,
          name: sourceName.trim(),
          baseUrl: sourceUrl.trim(),
          enabled: true,
        });
      }

      if (mode === 'edit-source' && sourceToEdit) {
        await updateSource(sourceToEdit.id, {
          name: sourceName.trim(),
          baseUrl: sourceUrl.trim(),
        });
      }

      await refreshSources();
      setMode('settings');
      setSourceToEdit(null);
    } catch (error) {
      console.error('Failed to save source:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPress = (source: Source) => {
    setSourceToEdit(source);
    setMode('edit-source');
  };

  const handleToggleRomanized = (value: boolean) => {
    onSettingsChange({ ...settings, useRomanizedMetadata: value });
  };

  const handleToggleVideos = (value: boolean) => {
    onSettingsChange({ ...settings, downloadVideos: value });
  };

  return (
    <Modal
      visible={visible}
      animationType='none'
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.helpModalOverlay}>
        <View style={styles.helpModalContent}>
          {mode === 'settings' && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.helpModalTitle}>Settings</Text>

              <View style={{ marginBottom: 24 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Text style={styles.settingsModalText}>Romanized Metadata</Text>
                  <Switch
                    value={settings.useRomanizedMetadata}
                    onValueChange={handleToggleRomanized}
                  />
                </View>
                <Text style={{ color: '#9aa3b2', fontSize: 12, marginBottom: 16 }}>
                  Display romanized song titles, artists, and designers when available
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
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
                onAddPress={() => setMode('add-source')}
                onEditPress={handleEditPress}
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
                  {clearingCache
                    ? <ActivityIndicator size='small' color='#fff' />
                    : cacheCleared
                    ? <Text style={styles.helpModalCloseButtonText}>✓ Cache Cleared</Text>
                    : <Text style={styles.helpModalCloseButtonText}>Clear Download Cache</Text>}
                </Pressable>

                <Pressable
                  style={styles.helpModalCloseButton}
                  onPress={onClose}
                >
                  <Text style={styles.helpModalCloseButtonText}>Close</Text>
                </Pressable>
              </View>
            </ScrollView>
          )}

          {(mode === 'add-source' || mode === 'edit-source') && (
            <>
              <Text style={styles.helpModalTitle}>{mode === 'add-source' ? 'Add Source' : 'Edit Source'}</Text>

              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: '#9aa3b2', fontSize: 14, marginBottom: 8 }}>Source Name</Text>
                <TextInput
                  style={{
                    backgroundColor: '#2a2d35',
                    color: '#fff',
                    padding: 12,
                    borderRadius: 8,
                    fontSize: 14,
                    marginBottom: 16,
                  }}
                  placeholder='My Custom Source'
                  placeholderTextColor='#9aa3b2'
                  value={sourceName}
                  onChangeText={setSourceName}
                  autoCapitalize='words'
                />

                <Text style={{ color: '#9aa3b2', fontSize: 14, marginBottom: 8 }}>Base URL</Text>
                <TextInput
                  style={{
                    backgroundColor: '#2a2d35',
                    color: '#fff',
                    padding: 12,
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                  placeholder='https://example.com/api'
                  placeholderTextColor='#9aa3b2'
                  value={sourceUrl}
                  onChangeText={setSourceUrl}
                  autoCapitalize='none'
                  autoCorrect={false}
                  keyboardType='url'
                />
              </View>

              <View style={{ gap: 8 }}>
                <Pressable
                  style={[
                    styles.helpModalCloseButton,
                    { backgroundColor: '#007AFF' },
                    submitting && { opacity: 0.6 },
                  ]}
                  onPress={handleSaveSource}
                  disabled={submitting}
                >
                  {submitting
                    ? <ActivityIndicator size='small' color='#fff' />
                    : <Text style={styles.helpModalCloseButtonText}>{mode === 'add-source' ? 'Add Source' : 'Update Source'}</Text>}
                </Pressable>

                <Pressable
                  style={styles.helpModalCloseButton}
                  onPress={() => setMode('settings')}
                >
                  <Text style={styles.helpModalCloseButtonText}>Back</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </Pressable>
    </Modal>
  );
};
