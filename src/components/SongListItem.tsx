import { memo } from 'react';
import type { SongItem } from '../types';
import { SongElement } from './SongElement';

interface SongListItemProps {
  item: SongItem;
  downloaded: boolean;
  isInQueue: boolean;
  onPress: (item: SongItem) => void;
  useRomanizedMetadata: boolean;
}

export const SongListItem = memo(({
  item,
  downloaded,
  isInQueue,
  onPress,
  useRomanizedMetadata,
}: SongListItemProps) => {
  return (
    <SongElement
      item={item}
      downloaded={downloaded}
      isSelected={isInQueue}
      onPress={(songItem) => onPress(songItem as SongItem)}
      useRomanizedMetadata={useRomanizedMetadata}
    />
  );
});
