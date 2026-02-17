import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, AppState, Text, Pressable, Linking, Platform } from 'react-native';
import { useEffect, useRef, useState, useCallback } from 'react';
import type { SongItem, AppSettings } from './types';
import { SearchBar } from './components/SearchBar';
import { DownloadJobsList } from './components/DownloadJobsList';
import { SongList } from './components/SongList';
import { SelectionToolbar } from './components/SelectionToolbar';
import { HelpModal } from './components/HelpModal';
import { SettingsModal } from './components/SettingsModal';
import { AddSourceModal } from './components/AddSourceModal';
import { CompressionLoadingModal } from './components/CompressionLoadingModal';
import { useDownload } from './hooks/useDownload';
import { useSelection } from './hooks/useSelection';
import { resetIntentLock } from './utils/sharing';
import { styles } from './styles/AppStyles';
import { loadNextPage, resetPaginationState, type SourcePaginationState } from './services/sources';
import { loadSettings, saveSettings } from './services/settings';
import { Entypo, Ionicons } from '@expo/vector-icons';

export default function App() {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAddSourceModal, setShowAddSourceModal] = useState(false);
  const [shouldReturnToSettings, setShouldReturnToSettings] = useState(false);
  const [sourcesVersion, setSourcesVersion] = useState(0);
  const [settings, setSettings] = useState<AppSettings>({
    downloadVideos: true,
    useRomanizedMetadata: false,
  });
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [paginationState, setPaginationState] = useState<SourcePaginationState>({});
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings()
      .then(setSettings)
      .catch((error) => {
        console.error('Failed to load settings:', error);
      });
  }, []);

  // Load initial page of songs
  const loadInitialSongs = async (search: string = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const initialPagination = resetPaginationState();
      const result = await loadNextPage(initialPagination, search);
      setSongs(result.songs);
      setPaginationState(result.paginationState);
    } catch (err) {
      console.error('Failed to load songs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load songs from sources');
    } finally {
      setLoading(false);
    }
  };

  // Check if there are more pages to load from any source
  const hasMorePages = () => {
    const states = Object.values(paginationState);
    return states.length === 0 || states.some(state => state.hasMore);
  };

  // Load more songs (next page)
  const loadMoreSongs = async () => {
    const hasMore = hasMorePages();
    
    // console.log('loadMoreSongs called - hasMore:', hasMore, 'paginationState:', paginationState, 'loadingMore:', loadingMore, 'loading:', loading);
    
    if (!hasMore || loadingMore || loading) {
      return;
    }

    setLoadingMore(true);
    try {
      const result = await loadNextPage(paginationState, searchText);
      // console.log('Loaded more songs:', result.songs.length, 'Updated pagination:', result.paginationState);
      if (result.songs.length > 0) {
        // Deduplicate songs by their unique key (sourceId:id)
        setSongs(prev => {
          const existingKeys = new Set(prev.map(song => `${song.sourceId}:${song.id}`));
          const newUniqueSongs = result.songs.filter(
            song => !existingKeys.has(`${song.sourceId}:${song.id}`)
          );
          return [...prev, ...newUniqueSongs];
        });
      }
      // Always update pagination state, even if no songs returned (to update hasMore flags)
      setPaginationState(result.paginationState);
    } catch (err) {
      console.error('Failed to load more songs:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadInitialSongs();
  }, []);

  // Handle search with debounce
  const handleSearch = (text: string) => {
    setSearchText(text);
    
    // Clear existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set new timeout for 500ms
    searchTimeout.current = setTimeout(() => {
      loadInitialSongs(text);
    }, 500);
  };

  const handleSubmitEditing = () => {
    // Clear timeout and search immediately
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    loadInitialSongs(searchText);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  const {
    downloading,
    downloadJobs,
    downloadedMap,
    showCompressionLoading,
    handleDownloads,
    setDownloadedMap,
    handleAppBecameActive,
  } = useDownload(settings.downloadVideos);

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

  const handleItemPress = useCallback((item: SongItem) => {
    const songId = item.id || '';
    if (isSelectionMode) {
      toggleSelection(songId);
    } else {
      handleDownloads([item]);
    }
  }, [isSelectionMode, toggleSelection, handleDownloads]);

  const handleItemLongPress = useCallback((item: SongItem) => {
    const songId = item.id || '';
    if (!isSelectionMode) {
      enterSelectionMode(songId);
    }
  }, [isSelectionMode, enterSelectionMode]);

  const handleDownloadSelected = () => {
    const selectedIds = getSelectedIds();
    const selectedSongs = songs.filter((song) => {
      const songId = song.id || '';
      return selectedIds.includes(songId);
    });
    exitSelectionMode();
    handleDownloads(selectedSongs);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadInitialSongs(searchText);
    } catch (error) {
      console.error('Failed to refresh songs:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSettingsChange = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleSourceAdded = () => {
    setSourcesVersion(v => v + 1);
    setShowAddSourceModal(false);
    // Return to settings modal after a short delay
    setTimeout(() => {
      setShouldReturnToSettings(false);
      setShowSettingsModal(true);
    }, 300);
  };
  
  const handleRequestAddSource = () => {
    setShouldReturnToSettings(true);
    setShowSettingsModal(false);
    // Wait for settings modal to close before opening add source modal
    setTimeout(() => {
      setShowAddSourceModal(true);
    }, 300);
  };
  
  const handleAddSourceClose = () => {
    setShowAddSourceModal(false);
    if (shouldReturnToSettings) {
      setTimeout(() => {
        setShouldReturnToSettings(false);
        setShowSettingsModal(true);
      }, 300);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>ADX Level Browser</Text>
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

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading songs from sources...</Text>
        </View>
      )}

      {error && (
        <View style={styles.loadingContainer}>
          <View style={styles.errorContainer}>
            <Ionicons name="close-circle" size={24} color="#ff6b6b" style={styles.errorIcon} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
          <Text style={styles.errorSubtext}>Please check your connection and restart the app</Text>
        </View>
      )}

      <DownloadJobsList downloadJobs={downloadJobs} />

      <SongList
        songs={songs}
        downloading={downloading}
        downloadedMap={downloadedMap}
        isSelectionMode={isSelectionMode}
        isSelected={isSelected}
        onSongPress={handleItemPress}
        onSongLongPress={handleItemLongPress}
        setDownloadedMap={setDownloadedMap}
        searchText={searchText}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMorePages()}
        onLoadMore={loadMoreSongs}
        useRomanizedMetadata={settings.useRomanizedMetadata}
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
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onCacheCleared={() => setDownloadedMap({})}
        onClose={() => setShowSettingsModal(false)}
        sourcesVersion={sourcesVersion}
        onRequestAddSource={handleRequestAddSource}
      />

      <AddSourceModal
        visible={showAddSourceModal}
        onClose={handleAddSourceClose}
        onSourceAdded={handleSourceAdded}
      />

      <CompressionLoadingModal visible={showCompressionLoading} />

      <StatusBar style='light' />
    </View>
  );
}
