import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { SongItem } from '../../../types';
import { styles } from '../../../styles';
import { getFileForSong, getFolderForSong } from '../../../utils/fileSystem';
import { ModalSongElement } from '../ModalSongElement';

interface ReviewSelectionContainerProps {
  selectedSongs: SongItem[];
  onRemoveSong: (songId: string) => void;
  onClearSelection: () => void;
  onDownload: () => void;
  onDownloadOnly?: () => void;
  onClose: () => void;
  useRomanizedMetadata?: boolean;
}

export const ReviewSelectionContainer = ({
  selectedSongs,
  onRemoveSong,
  onClearSelection,
  onDownload,
  onDownloadOnly,
  onClose,
  useRomanizedMetadata = false,
}: ReviewSelectionContainerProps) => {
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const downloaded = new Set<string>();
    selectedSongs.forEach((song) => {
      const file = getFileForSong(song);
      const folder = getFolderForSong(song);
      if (file.exists || folder.exists)
        downloaded.add(song.id || '');
    });
    setDownloadedIds(downloaded);
  }, [selectedSongs]);

  if (selectedSongs.length === 0)
    return null;

  const allDownloaded = selectedSongs.every((song) => downloadedIds.has(song.id || ''));
  const hasUncachedSongs = selectedSongs.some((song) => !downloadedIds.has(song.id || ''));

  return (
    <View style={styles.reviewModalOverlay}>
      <View style={styles.reviewModalContent}>
        <View style={styles.reviewModalHeader}>
          <Text style={styles.reviewModalTitle}>Review Selection</Text>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <MaterialCommunityIcons name='close' size={24} color='#9aa3b2' />
          </TouchableOpacity>
        </View>

        <Text style={styles.reviewModalCount}>
          {selectedSongs.length} song{selectedSongs.length !== 1 ? 's' : ''} selected
        </Text>

        <ScrollView style={styles.reviewModalList}>
          {selectedSongs.map((song) => {
            const displayTitle = useRomanizedMetadata && song.romanizedTitle ? song.romanizedTitle : song.title;
            const displayArtist = useRomanizedMetadata && song.romanizedArtist ? song.romanizedArtist : song.artist;
            const songId = song.id || '';
            const isDownloaded = downloadedIds.has(songId);

            return (
              <ModalSongElement
                key={`${song.sourceId}:${song.id}`}
                title={displayTitle}
                subtitle={displayArtist}
                downloaded={isDownloaded}
                showRemoveButton
                onRemove={() => onRemoveSong(songId)}
                variant='review'
              />
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

          {hasUncachedSongs && onDownloadOnly && (
            <TouchableOpacity
              style={styles.reviewModalDownloadOnlyButton}
              onPress={onDownloadOnly}
            >
              <Text style={styles.reviewModalDownloadOnlyButtonText}>Download Only</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.reviewModalDownloadButton}
            onPress={onDownload}
          >
            <MaterialCommunityIcons
              name={allDownloaded ? 'import' : 'download'}
              size={20}
              color='#fff'
            />
            <Text style={styles.reviewModalDownloadButtonText}>
              {allDownloaded ? 'Import' : 'Download & Import'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
