import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, AppState, Text, Pressable, Linking, Platform } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import type { SongItem } from './types';
import { SearchBar } from './components/SearchBar';
import { DownloadJobsList } from './components/DownloadJobsList';
import { SongList } from './components/SongList';
import { SelectionToolbar } from './components/SelectionToolbar';
import { HelpModal } from './components/HelpModal';
import { SettingsModal } from './components/SettingsModal';
import { useSearch } from './hooks/useSearch';
import { useDownload } from './hooks/useDownload';
import { useSelection } from './hooks/useSelection';
import { resetIntentLock } from './utils/sharing';
import { styles } from './styles/AppStyles';
import { loadSongsDatabase, refreshSongsDatabase } from './utils/songsDatabase';
import { Entypo, Ionicons } from '@expo/vector-icons';

export default function App() {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [useRomanizedMetadata, setUseRomanizedMetadata] = useState(false);
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load songs database on mount
  useEffect(() => {
    loadSongsDatabase()
      .then((loadedSongs) => {
        setSongs(loadedSongs);
        setDbLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load songs database:', error);
        setDbError(error.message || 'Failed to load songs database');
        setDbLoading(false);
      });
  }, []);

  const {
    searchText,
    filteredSongs,
    loading,
    handleSearch,
    handleSubmitEditing,
  } = useSearch(songs);

  const {
    downloading,
    downloadJobs,
    downloadedMap,
    handleDownloads,
    setDownloadedMap,
    handleAppBecameActive,
  } = useDownload();

  const {
    isSelectionMode,
    enterSelectionMode,
    exitSelectionMode,
    toggleSelection,
    isSelected,
    getSelectedCount,
    getSelectedIds,
  } = useSelection();

  // App state tracking
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // Reset intent lock when app comes to foreground
        resetIntentLock();
        handleAppBecameActive();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleItemPress = (item: SongItem) => {
    const songId = item.folderId || item.majdataId || '';
    if (isSelectionMode) {
      toggleSelection(songId);
    } else {
      handleDownloads([item]);
    }
  };

  const handleItemLongPress = (item: SongItem) => {
    const songId = item.folderId || item.majdataId || '';
    if (!isSelectionMode) {
      enterSelectionMode(songId);
    }
  };

  const handleDownloadSelected = () => {
    const selectedIds = getSelectedIds();
    const selectedSongs = songs.filter((song) => {
      const songId = song.folderId || song.majdataId || '';
      return selectedIds.includes(songId);
    });
    exitSelectionMode();
    handleDownloads(selectedSongs);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const updatedSongs = await refreshSongsDatabase();
      setSongs(updatedSongs);
      // console.log('Songs database refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh songs database:', error);
      // Continue with existing songs on error
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>AstroDX Convert Browser</Text>
          <View style={styles.headerRight}>
            <Pressable
              onPress={() => Linking.openURL('https://github.com/trustytrojan/adx-convert-browser')}
              hitSlop={12}
            >
              <Ionicons name="logo-github" size={24} color="#9aa3b2" />
            </Pressable>
            <Pressable 
              onPress={() => setShowSettingsModal(true)} 
              hitSlop={12}
            >
              <Ionicons name="settings-outline" size={24} color="#9aa3b2" />
            </Pressable>
            <Pressable 
              onPress={() => setShowHelpModal(true)} 
              hitSlop={12}
            >
              <Entypo name="help-with-circle" size={24} color="#9aa3b2" />
            </Pressable>
          </View>
        </View>
      </View>
      <SearchBar
        value={searchText}
        onChangeText={handleSearch}
        onSubmitEditing={handleSubmitEditing}
      />

      {dbLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading songs database...</Text>
        </View>
      )}

      {dbError && (
        <View style={styles.loadingContainer}>
          <View style={styles.errorContainer}>
            <Ionicons name="close-circle" size={24} color="#ff6b6b" style={styles.errorIcon} />
            <Text style={styles.errorText}>{dbError}</Text>
          </View>
          <Text style={styles.errorSubtext}>Please check your connection and restart the app</Text>
        </View>
      )}

      {!dbLoading && !dbError && loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}

      <DownloadJobsList downloadJobs={downloadJobs} />

      <SongList
        songs={filteredSongs}
        downloading={downloading}
        downloadedMap={downloadedMap}
        isSelectionMode={isSelectionMode}
        isSelected={isSelected}
        onSongPress={handleItemPress}
        onSongLongPress={handleItemLongPress}
        setDownloadedMap={setDownloadedMap}
        searchText={searchText}
        loading={loading}
        useRomanizedMetadata={useRomanizedMetadata}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      {isSelectionMode && (
        <SelectionToolbar
          selectedCount={getSelectedCount()}
          onDownload={handleDownloadSelected}
          onCancel={exitSelectionMode}
        />
      )}

      <HelpModal
        visible={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      <SettingsModal
        visible={showSettingsModal}
        useRomanizedMetadata={useRomanizedMetadata}
        onRomanizedMetadataChange={setUseRomanizedMetadata}
        onCacheCleared={() => setDownloadedMap({})}
        onClose={() => setShowSettingsModal(false)}
      />

      {/* since we only support expo go on ios, and it needs 'inverted' to be visible */}
      <StatusBar style={Platform.OS === 'ios' ? 'inverted' : 'auto'} />
    </View>
  );
}
