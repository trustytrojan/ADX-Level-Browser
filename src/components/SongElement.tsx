import { Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { memo } from 'react';
import type { SongItem, DownloadJobItem } from '../types';
import { styles } from '../styles/AppStyles';

type ElementItem = SongItem | DownloadJobItem;

interface SongElementProps<T extends ElementItem = ElementItem> {
  item: T;
  downloaded?: boolean; // For SongItem
  isSelected?: boolean;
  onPress?: (item: T) => void;
  useRomanizedMetadata?: boolean;
}

const isSongItem = (item: ElementItem): item is SongItem => {
  return 'id' in item && 'sourceId' in item;
};

const isDownloadJobItem = (item: ElementItem): item is DownloadJobItem => {
  return 'status' in item && typeof (item as DownloadJobItem).status === 'string';
};

export const SongElement = memo(<T extends ElementItem = ElementItem>({
  item,
  downloaded = false,
  isSelected = false,
  onPress,
  useRomanizedMetadata = false,
}: SongElementProps<T>) => {
  const isSong = isSongItem(item);
  const isJob = isDownloadJobItem(item);

  // Determine designer
  let designer = '';
  let romanizedDesigner = '';

  if (isSong) {
    designer = item.designer || '';
    romanizedDesigner = item.romanizedDesigner || '';
  } else if (isJob) {
    designer = item.designer || '';
    romanizedDesigner = item.romanizedDesigner || '';
  }

  // Get display text with romanization preference
  const displayTitle =
    useRomanizedMetadata && isSong && item.romanizedTitle
      ? item.romanizedTitle
      : item.title;
  const displayArtist =
    useRomanizedMetadata && isSong && item.romanizedArtist
      ? item.romanizedArtist
      : item.artist;
  const displayDesigner =
    useRomanizedMetadata && romanizedDesigner ? romanizedDesigner : designer;

  // Determine right-side icon
  let rightIcon: React.ReactNode = null;

  if (isJob) {
    // For DownloadJobItem, show status icon
    if (item.status === 'COMPLETED') {
      rightIcon = <Ionicons name="checkmark-circle" size={20} color="#4caf50" />;
    } else {
      rightIcon = (
        <ActivityIndicator size="small" color="#007AFF" style={styles.downloadIndicator} />
      );
    }
  } else if (downloaded) {
    // For SongItem that's already downloaded
    rightIcon = <Ionicons name="checkmark-circle" size={20} color="#4caf50" />;
  }

  // Check if song has a designer (for styling purposes)
  const isMajdata = item.sourceId.includes('majdata');

  return (
    <TouchableOpacity
      style={[
        styles.resultButton,
        isMajdata && styles.resultButtonMajdata,
        isSelected && styles.resultButtonSelectedNew,
      ]}
      onPress={() => onPress?.(item)}
    >
      <View style={styles.resultContent}>
        <View style={styles.resultTextGroup}>
          <Text style={[styles.resultText, isSelected && styles.resultTextBold]}>
            {displayTitle}
          </Text>
          <Text style={[styles.resultSubtext, isSelected && styles.resultSubtextBold]}>
            {displayArtist}
            {isMajdata && displayDesigner ? `\nDesigned by: ${displayDesigner}` : ''}
          </Text>
        </View>
        {rightIcon}
      </View>
    </TouchableOpacity>
  );
}) as <T extends ElementItem = ElementItem>(props: SongElementProps<T>) => React.ReactElement;
