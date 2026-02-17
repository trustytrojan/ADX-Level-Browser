import { memo } from 'react';
import type { SongItem, DownloadState } from '../types';
import { SongElement } from './SongElement';

interface SongListItemProps {
  item: SongItem;
  downloading: DownloadState;
  downloaded: boolean;
  isSelectionMode: boolean;
  isSelected: boolean;
  onPress: (item: SongItem) => void;
  onLongPress: (item: SongItem) => void;
  useRomanizedMetadata: boolean;
}

export const SongListItem = memo(({
  item,
  downloading,
  downloaded,
  isSelectionMode,
  isSelected,
  onPress,
  onLongPress,
  useRomanizedMetadata,
}: SongListItemProps) => {
  const id = item.id;
  const isDownloading = downloading[id!];

  return (
    <SongElement
      item={item}
      downloading={isDownloading}
      downloaded={downloaded}
      isSelectionMode={isSelectionMode}
      isSelected={isSelected}
      onPress={(songItem) => onPress(songItem as SongItem)}
      onLongPress={(songItem) => onLongPress(songItem as SongItem)}
      useRomanizedMetadata={useRomanizedMetadata}
    />
  );
});
