import { Text, View, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Source } from '../types';

interface SourcesListProps {
  sources: Source[];
  onDelete: (sourceId: string) => void;
  onAddPress: () => void;
}

export const SourcesList = ({ sources, onDelete, onAddPress }: SourcesListProps) => {
  const handleDeletePress = (source: Source) => {
    Alert.alert(
      'Delete Source',
      `Are you sure you want to delete "${source.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(source.id),
        },
      ]
    );
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#fff' }}>Sources</Text>
        <Pressable
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
          onPress={onAddPress}
        >
          <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
          <Text style={{ color: '#007AFF', fontSize: 14 }}>Add Source</Text>
        </Pressable>
      </View>

      {sources.map((source) => (
        <View
          key={source.id}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 12,
            backgroundColor: '#2a2d35',
            borderRadius: 8,
            marginBottom: 8,
          }}
        >
          <View style={{ flexShrink: 1, minWidth: 0 }}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{source.name}</Text>
            <Text numberOfLines={1} ellipsizeMode="middle" style={{ color: '#9aa3b2', fontSize: 12, marginTop: 2 }}>{source.baseUrl}</Text>
          </View>
          <Pressable
            onPress={() => handleDeletePress(source)}
            hitSlop={12}
          >
            <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
          </Pressable>
        </View>
      ))}
    </View>
  );
};
