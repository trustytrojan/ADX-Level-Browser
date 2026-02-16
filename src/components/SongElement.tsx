import { Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { SongItem, DownloadJobItem } from '../types';
import { isMajdataSong } from '../utils/fileSystem';
import { styles } from '../styles/AppStyles';

type ElementItem = SongItem | DownloadJobItem;

interface SongElementProps {
  item: ElementItem;
  downloading?: boolean; // For SongItem
  downloaded?: boolean; // For SongItem
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onPress?: (item: ElementItem) => void;
  onLongPress?: (item: ElementItem) => void;
  useRomanizedMetadata?: boolean;
}

const isSongItem = (item: ElementItem): item is SongItem => {
  return 'folderId' in item || 'majdataId' in item;
};

const isDownloadJobItem = (item: ElementItem): item is DownloadJobItem => {
  return 'status' in item && typeof (item as DownloadJobItem).status === 'string';
};

export const SongElement = ({
  item,
  downloading = false,
  downloaded = false,
  isSelectionMode = false,
  isSelected = false,
  onPress,
  onLongPress,
  useRomanizedMetadata = false,
}: SongElementProps) => {
  const isSong = isSongItem(item);
  const isJob = isDownloadJobItem(item);

  // Determine majdata status
  let isMajdata = false;
  let designer = '';
  let romanizedDesigner = '';

  if (isSong) {
    isMajdata = isMajdataSong(item);
    designer = item.designer || '';
    romanizedDesigner = item.romanizedDesigner || '';
  } else if (isJob) {
    isMajdata = item.isMajdata || false;
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
  } else {
    // For SongItem, show download/downloaded status
    if (downloading) {
      rightIcon = (
        <ActivityIndicator size="small" color="#007AFF" style={styles.downloadIndicator} />
      );
    } else if (downloaded) {
      rightIcon = <Ionicons name="checkmark-circle" size={20} color="#4caf50" />;
    }
  }

  return (
    <TouchableOpacity
      style={[
        styles.resultButton,
        isMajdata && styles.resultButtonMajdata,
        downloading && styles.resultButtonDisabled,
        isSelectionMode && isSelected && styles.resultButtonSelected,
      ]}
      onPress={() => onPress?.(item)}
      onLongPress={() => onLongPress?.(item)}
      disabled={downloading && !isSelectionMode}
    >
      <View style={styles.resultContent}>
        {isSelectionMode && (
          <View style={styles.selectionCheckbox}>
            {isSelected && <Ionicons name="checkmark" size={18} color="#007AFF" />}
          </View>
        )}
        <View style={styles.resultTextGroup}>
          <Text style={styles.resultText}>{displayTitle}</Text>
          <Text style={styles.resultSubtext}>
            {displayArtist}
            {isMajdata && displayDesigner ? `\nDesigned by: ${displayDesigner}` : ''}
          </Text>
        </View>
        {rightIcon}
      </View>
    </TouchableOpacity>
  );
};
