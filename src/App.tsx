import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Linking, Text, TouchableOpacity, View } from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppSettings, SongItem } from './types';
import { SearchBar } from './components/SearchBar';
import { SongList } from './components/SongList';
import { HelpModal } from './components/modals/HelpModal';
import { SettingsFlowModal } from './components/modals/SettingsFlowModal';
import { ImportFlowModal } from './components/modals/ImportFlowModal';
import { useDownloadFlow } from './hooks/useDownloadFlow';
import { styles } from './styles';
import {
  getEnabledSourceCount,
  loadNextPage,
  resetPaginationState,
  type SourcePaginationState,
} from './services/sources';
import { loadSettings, saveSettings } from './services/settings';
import { Entypo, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function App() {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [cacheVersion, setCacheVersion] = useState(0);
  const [settings, setSettings] = useState<AppSettings>({
    downloadVideos: true,
    useRomanizedMetadata: false,
  });
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [remainingSources, setRemainingSources] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [paginationState, setPaginationState] = useState<SourcePaginationState>({});
  const [toDownload, setToDownload] = useState<Set<string>>(new Set());
  const [showReviewSelectionModal, setShowReviewSelectionModal] = useState(false);
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
    setSongs([]);

    try {
      const initialPagination = resetPaginationState();
      setPaginationState(initialPagination);

      const enabledSourceCount = await getEnabledSourceCount();
      setRemainingSources(enabledSourceCount);

      const result = await loadNextPage(
        initialPagination,
        search,
        ({ songs: sourceSongs, paginationState, remainingSources }) => {
          setRemainingSources(remainingSources);
          setPaginationState(paginationState);

          if (sourceSongs.length > 0) {
            setSongs((prev) => {
              const existingKeys = new Set(prev.map((song) => `${song.sourceId}:${song.id}`));
              const newUniqueSongs = sourceSongs.filter(
                (song) => !existingKeys.has(`${song.sourceId}:${song.id}`),
              );

              if (newUniqueSongs.length === 0)
                return prev;

              return [...prev, ...newUniqueSongs];
            });
          }
        },
      );

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
    return states.length === 0 || states.some((state) => state.hasMore);
  };

  // Load more songs (next page)
  const loadMoreSongs = async () => {
    const hasMore = hasMorePages();

    if (!hasMore || loadingMore || loading)
      return;

    setLoadingMore(true);
    try {
      const result = await loadNextPage(paginationState, searchText);
      if (result.songs.length > 0) {
        // Deduplicate songs by their unique key (sourceId:id)
        setSongs((prev) => {
          const existingKeys = new Set(prev.map((song) => `${song.sourceId}:${song.id}`));
          const newUniqueSongs = result.songs.filter(
            (song) => !existingKeys.has(`${song.sourceId}:${song.id}`),
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
    if (searchTimeout.current)
      clearTimeout(searchTimeout.current);

    // Set new timeout for 500ms
    searchTimeout.current = setTimeout(() => {
      loadInitialSongs(text);
    }, 500);
  };

  const handleSubmitEditing = () => {
    // Clear timeout and search immediately
    if (searchTimeout.current)
      clearTimeout(searchTimeout.current);
    loadInitialSongs(searchText);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current)
        clearTimeout(searchTimeout.current);
    };
  }, []);

  const {
    downloadJobs,
    hasErrors,
    showDownloadingModal,
    showImportingModal,
    importingSongCount,
    isImportCompressionComplete,
    retryImporting,
    dismissImporting,
    showCloseOnComplete,
    downloadCompletionVersion,
    startDownloadFlow,
    startDownloadOnlyFlow,
    dismissDownloading,
  } = useDownloadFlow(settings.downloadVideos);

  const handleItemPress = useCallback((item: SongItem) => {
    const songId = item.id || '';
    setToDownload((prev) => {
      const next = new Set(prev);
      if (next.has(songId))
        next.delete(songId);
      else
        next.add(songId);
      return next;
    });
  }, []);

  const handleRemoveSong = (songId: string) => {
    setToDownload((prev) => {
      const next = new Set(prev);
      next.delete(songId);

      if (next.size === 0)
        setShowReviewSelectionModal(false);

      return next;
    });
  };

  const handleClearSelection = () => {
    setShowReviewSelectionModal(false);
    setTimeout(() => {
      setToDownload(new Set());
    }, 0);
  };

  const handleReviewSelection = () => {
    setShowReviewSelectionModal(true);
  };

  const handleStartDownload = () => {
    const songsToDownload = songs.filter((song) => toDownload.has(song.id || ''));
    if (songsToDownload.length === 0)
      return;

    setShowReviewSelectionModal(false);
    setToDownload(new Set());
    startDownloadFlow(songsToDownload);
  };

  const handleStartDownloadOnly = () => {
    const songsToDownload = songs.filter((song) => toDownload.has(song.id || ''));
    if (songsToDownload.length === 0)
      return;

    setShowReviewSelectionModal(false);
    setToDownload(new Set());
    startDownloadOnlyFlow(songsToDownload);
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
    saveSettings(newSettings);
  };

  const handleCacheCleared = () => {
    setCacheVersion((v) => v + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>ADX Level Browser</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://github.com/trustytrojan/adx-convert-browser')}
              hitSlop={12}
            >
              <Ionicons name='logo-github' size={24} color='#9aa3b2' />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowSettingsModal(true)}
              hitSlop={12}
            >
              <Ionicons name='settings-outline' size={24} color='#9aa3b2' />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowHelpModal(true)}
              hitSlop={12}
            >
              <Entypo name='help-with-circle' size={24} color='#9aa3b2' />
            </TouchableOpacity>
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
          <ActivityIndicator size='large' color='#007AFF' />
          <Text style={styles.loadingText}>
            Loading songs from {remainingSources} source{remainingSources > 1 ? 's' : ''}...
          </Text>
        </View>
      )}

      {error && (
        <View style={styles.loadingContainer}>
          <View style={styles.errorContainer}>
            <Ionicons name='close-circle' size={24} color='#ff6b6b' style={styles.errorIcon} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
          <Text style={styles.errorSubtext}>Please check your connection and restart the app</Text>
        </View>
      )}

      <SongList
        songs={songs}
        isInQueue={(id: string) => toDownload.has(id)}
        onSongPress={handleItemPress}
        searchText={searchText}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMorePages()}
        onLoadMore={loadMoreSongs}
        useRomanizedMetadata={settings.useRomanizedMetadata}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        downloadedStateVersion={cacheVersion + downloadCompletionVersion}
      />

      {toDownload.size > 0 && !showDownloadingModal && (
        <TouchableOpacity
          style={styles.downloadFab}
          onPress={handleReviewSelection}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name='playlist-check' size={24} color='#fff' />
          <Text style={styles.downloadFabText}>
            Review Selection ({toDownload.size})
          </Text>
        </TouchableOpacity>
      )}

      <HelpModal
        visible={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      <SettingsFlowModal
        visible={showSettingsModal}
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onCacheCleared={handleCacheCleared}
        onClose={() => setShowSettingsModal(false)}
      />

      <ImportFlowModal
        reviewVisible={showReviewSelectionModal}
        downloadingVisible={showDownloadingModal}
        importingVisible={showImportingModal}
        selectedSongs={songs.filter((song) => toDownload.has(song.id || ''))}
        onRemoveSong={handleRemoveSong}
        onClearSelection={handleClearSelection}
        onDownload={handleStartDownload}
        onDownloadOnly={handleStartDownloadOnly}
        onCloseReview={() => setShowReviewSelectionModal(false)}
        useRomanizedMetadata={settings.useRomanizedMetadata}
        downloadJobs={downloadJobs}
        hasErrors={hasErrors}
        showCloseOnComplete={showCloseOnComplete}
        onDismissDownloading={dismissDownloading}
        importingSongCount={importingSongCount}
        importCompressionComplete={isImportCompressionComplete}
        onRetryImporting={retryImporting}
        onCloseImporting={dismissImporting}
      />

      <StatusBar style='light' />
    </View>
  );
}
