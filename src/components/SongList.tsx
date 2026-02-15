import { Text, FlatList, RefreshControl } from 'react-native';
import { useRef } from 'react';
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
  refreshing: boolean;
  onRefresh: () => void;
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
  refreshing,
  onRefresh,
}: SongListProps) => {
  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<{ item: SongItem }> }) => {
    setDownloadedMap((prev) => {
      let next = prev;
      viewableItems.forEach(({ item }) => {
        const songId = item.folderId || item.majdataId || '';
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

  return (
    <>
      <Text style={styles.sectionLabel}>Song List</Text>
      <FlatList
        style={styles.songsList}
        data={songs}
        keyExtractor={(item) => item.folderId || item.majdataId || ''}
        renderItem={({ item }) => {
          const songId = item.folderId || item.majdataId || '';
          return (
            <SongListItem
              item={item}
              downloading={downloading}
              downloaded={downloadedMap[songId] || false}
              isSelectionMode={isSelectionMode}
              isSelected={isSelected(songId)}
              onPress={onSongPress}
              onLongPress={onSongLongPress}
            />
          );
        }}
        ListEmptyComponent={
          !loading && searchText ? (
            <Text style={styles.emptyText}>No songs found</Text>
          ) : null
        }
        onViewableItemsChanged={viewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig}
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
