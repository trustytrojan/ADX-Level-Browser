import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { SongItem } from '../types';
import { SongElement } from './SongElement';
import { getFileForSong, getFolderForSong } from '../utils/fileSystem';
import { styles } from '../styles/AppStyles';

interface SongListProps {
  songs: SongItem[];
  isInQueue: (id: string) => boolean;
  onSongPress: (item: SongItem) => void;
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
  isInQueue,
  onSongPress,
  searchText,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  refreshing,
  onRefresh,
  useRomanizedMetadata,
}: SongListProps) => {
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());

  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<{ item: SongItem }> }) => {
    setDownloadedIds((prev) => {
      let updated = false;
      const next = new Set(prev);
      viewableItems.forEach(({ item }) => {
        const songId = item.id || '';
        if (!prev.has(songId)) {
          const file = getFileForSong(item);
          const folder = getFolderForSong(item);
          if (file.exists || folder.exists) {
            next.add(songId);
            updated = true;
          }
        }
      });
      return updated ? next : prev;
    });
  });

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const handleEndReached = () => {
    // Only load more if there are actually more pages available
    if (!loading && !loadingMore && hasMore && songs.length > 0)
      onLoadMore();
  };

  const renderFooter = useCallback(() => {
    if (!loadingMore)
      return null;
    return (
      <View style={{ padding: 16, alignItems: 'center' }}>
        <ActivityIndicator size='small' color='#007AFF' />
      </View>
    );
  }, [loadingMore]);

  const renderItem = useCallback(
    ({ item }: { item: SongItem }) => {
      const songId = item.id || '';
      return (
        <SongElement
          item={item}
          downloaded={downloadedIds.has(songId)}
          isSelected={isInQueue(songId)}
          onPress={onSongPress}
          useRomanizedMetadata={useRomanizedMetadata}
        />
      );
    },
    [downloadedIds, isInQueue, onSongPress, useRomanizedMetadata],
  );

  return (
    <>
      <Text style={styles.sectionLabel}>Song List</Text>
      <FlatList
        style={styles.songsList}
        data={songs}
        keyExtractor={(item) => `${item.sourceId}:${item.id}`}
        renderItem={renderItem}
        ListEmptyComponent={!loading && searchText ? <Text style={styles.emptyText}>No songs found</Text> : null}
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
            tintColor='#007AFF'
            colors={['#007AFF']}
          />
        }
      />
    </>
  );
};
