import { Text, FlatList, RefreshControl, ActivityIndicator, View } from 'react-native';
import { useRef, useCallback } from 'react';
import type { SongItem, DownloadState } from '../types';
import { SongListItem } from './SongListItem';
import { getFileForSong } from '../utils/fileSystem';
import { styles } from '../styles/AppStyles';

interface SongListProps {
  songs: SongItem[];
  downloading: DownloadState;
  downloadedMap: Record<string, boolean>;
  isSelectionMode: boolean;
  isSelected: (id: string) => boolean;
  onSongPress: (item: SongItem) => void;
  onSongLongPress: (item: SongItem) => void;
  setDownloadedMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  searchText: string;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  refreshing: boolean;
  onRefresh: () => void;
  useRomanizedMetadata: boolean;
}

export const SongList = ({
  songs,
  downloading,
  downloadedMap,
  isSelectionMode,
  isSelected,
  onSongPress,
  onSongLongPress,
  setDownloadedMap,
  searchText,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  refreshing,
  onRefresh,
  useRomanizedMetadata,
}: SongListProps) => {
  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<{ item: SongItem }> }) => {
    setDownloadedMap((prev) => {
      let next = prev;
      viewableItems.forEach(({ item }) => {
        const songId = item.id || '';
        if (prev[songId] !== undefined) return;
        const file = getFileForSong(item);
        if (file.exists) {
          if (next === prev) next = { ...prev };
          next[songId] = true;
        }
      });
      return next;
    });
  });

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const handleEndReached = () => {
    // console.log('End reached - loading:', loading, 'loadingMore:', loadingMore, 'hasMore:', hasMore, 'songs:', songs.length);
    // Only load more if there are actually more pages available
    if (!loading && !loadingMore && hasMore && songs.length > 0) {
      onLoadMore();
    }
  };

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={{ padding: 16, alignItems: 'center' }}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  }, [loadingMore]);

  const renderItem = useCallback(
    ({ item }: { item: SongItem }) => {
      const songId = item.id || '';
      return (
        <SongListItem
          item={item}
          downloading={downloading}
          downloaded={downloadedMap[songId] || false}
          isSelectionMode={isSelectionMode}
          isSelected={isSelected(songId)}
          onPress={onSongPress}
          useRomanizedMetadata={useRomanizedMetadata}
          onLongPress={onSongLongPress}
        />
      );
    },
    [downloading, downloadedMap, isSelectionMode, isSelected, onSongPress, onSongLongPress, useRomanizedMetadata]
  );

  return (
    <>
      <Text style={styles.sectionLabel}>Song List</Text>
      <FlatList
        style={styles.songsList}
        data={songs}
        keyExtractor={(item) => `${item.sourceId}:${item.id}`}
        renderItem={renderItem}
        ListEmptyComponent={
          !loading && searchText ? (
            <Text style={styles.emptyText}>No songs found</Text>
          ) : null
        }
        ListFooterComponent={renderFooter}
        onViewableItemsChanged={viewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
        removeClippedSubviews={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
            colors={['#007AFF']}
          />
        }
      />
    </>
  );
};
