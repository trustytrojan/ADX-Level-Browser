import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { SongItem } from '../../types';
import { styles } from '../../styles/AppStyles';
import MyModal from './MyModal';

interface ReviewSelectionModalProps {
  visible: boolean;
  selectedSongs: SongItem[];
  onRemoveSong: (songId: string) => void;
  onClearSelection: () => void;
  onDownload: () => void;
  onClose: () => void;
  useRomanizedMetadata?: boolean;
}

export const ReviewSelectionModal = ({
  visible,
  selectedSongs,
  onRemoveSong,
  onClearSelection,
  onDownload,
  onClose,
  useRomanizedMetadata = false,
}: ReviewSelectionModalProps) => {
  return (
    <MyModal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.reviewModalOverlay}>
        <View
          style={styles.reviewModalContent}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.reviewModalHeader}>
            <Text style={styles.reviewModalTitle}>Review Selection</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <MaterialCommunityIcons name="close" size={24} color="#9aa3b2" />
            </TouchableOpacity>
          </View>

          <Text style={styles.reviewModalCount}>
            {selectedSongs.length} song{selectedSongs.length !== 1 ? 's' : ''} selected
          </Text>

          <ScrollView style={styles.reviewModalList}>
            {selectedSongs.map((song) => {
              const displayTitle =
                useRomanizedMetadata && song.romanizedTitle
                  ? song.romanizedTitle
                  : song.title;
              const displayArtist =
                useRomanizedMetadata && song.romanizedArtist
                  ? song.romanizedArtist
                  : song.artist;

              return (
                <View key={`${song.sourceId}:${song.id}`} style={styles.reviewModalItem}>
                  <View style={styles.reviewModalItemContent}>
                    <Text style={styles.reviewModalItemTitle} numberOfLines={1}>
                      {displayTitle}
                    </Text>
                    <Text style={styles.reviewModalItemSubtitle} numberOfLines={1}>
                      {displayArtist}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => onRemoveSong(song.id || '')}
                    hitSlop={12}
                    style={styles.reviewModalItemRemove}
                  >
                    <MaterialCommunityIcons name="close" size={20} color="#ff6b6b" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.reviewModalButtons}>
            <TouchableOpacity
              style={styles.reviewModalClearButton}
              onPress={onClearSelection}
            >
              <Text style={styles.reviewModalClearButtonText}>Clear Selection</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.reviewModalDownloadButton}
              onPress={onDownload}
            >
              <MaterialCommunityIcons name="download" size={20} color="#fff" />
              <Text style={styles.reviewModalDownloadButtonText}>Download</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </MyModal>
  );
};
