import { Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { SongItem, DownloadState } from '../types';
import { isMajdataSong } from '../utils/fileSystem';
import { styles } from '../styles/AppStyles';

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

export const SongListItem = ({
  item,
  downloading,
  downloaded,
  isSelectionMode,
  isSelected,
  onPress,
  onLongPress,
  useRomanizedMetadata,
}: SongListItemProps) => {
  const isMajdata = isMajdataSong(item);
  const id = item.folderId || item.majdataId;
  const isDownloading = downloading[id!];

  const displayTitle = useRomanizedMetadata && item.romanizedTitle ? item.romanizedTitle : item.title;
  const displayArtist = useRomanizedMetadata && item.romanizedArtist ? item.romanizedArtist : item.artist;
  const displayDesigner = useRomanizedMetadata && item.romanizedDesigner ? item.romanizedDesigner : item.designer;

  return (
    <TouchableOpacity
      style={[
        styles.resultButton,
        isMajdata && styles.resultButtonMajdata,
        isDownloading && styles.resultButtonDisabled,
        isSelectionMode && isSelected && styles.resultButtonSelected,
      ]}
      onPress={() => onPress(item)}
      onLongPress={() => onLongPress(item)}
      disabled={isDownloading && !isSelectionMode}
    >
      <View style={styles.resultContent}>
        {isSelectionMode && (
          <View style={styles.selectionCheckbox}>
            {isSelected && <Ionicons name="checkmark" size={18} color="#007AFF" />}
          </View>
        )}
        <View style={styles.resultTextGroup}>
          <Text style={styles.resultText}>{displayTitle}</Text>
          <Text style={styles.resultSubtext}>{displayArtist}{isMajdata ? `\nDesigned by: ${displayDesigner}` : ''}</Text>
        </View>
        {isDownloading
          ? <ActivityIndicator size="small" color="#007AFF" style={styles.downloadIndicator} />
          : downloaded
            ? <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
            : null}
      </View>
    </TouchableOpacity>
  );
};
