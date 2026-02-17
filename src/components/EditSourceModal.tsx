import { Modal, Pressable, Text, View, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { styles } from '../styles/AppStyles';
import { updateSource } from '../services/sources';
import type { Source } from '../types';

interface EditSourceModalProps {
  visible: boolean;
  source: Source | null;
  onClose: () => void;
  onSourceUpdated: () => void;
}

export const EditSourceModal = ({ visible, source, onClose, onSourceUpdated }: EditSourceModalProps) => {
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [updating, setUpdating] = useState(false);

  // Update form when source changes
  useEffect(() => {
    if (source) {
      setSourceName(source.name);
      setSourceUrl(source.baseUrl);
    }
  }, [source]);

  const handleUpdate = async () => {
    if (!sourceName.trim() || !sourceUrl.trim()) {
      Alert.alert('Error', 'Please fill in both name and URL');
      return;
    }

    if (!source) return;

    setUpdating(true);
    try {
      await updateSource(source.id, {
        name: sourceName.trim(),
        baseUrl: sourceUrl.trim(),
      });
      
      onSourceUpdated();
      onClose();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update source');
    } finally {
      setUpdating(false);
    }
  };

  const handleClose = () => {
    // Reset to original values
    if (source) {
      setSourceName(source.name);
      setSourceUrl(source.baseUrl);
    }
    onClose();
  };

  if (!source) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.helpModalOverlay}>
        <View 
          style={styles.helpModalContent}
          onStartShouldSetResponder={() => true}
        >
          <Text style={styles.helpModalTitle}>Edit Source</Text>
          
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: '#9aa3b2', fontSize: 14, marginBottom: 8 }}>Source Name</Text>
            <TextInput
              style={{
                backgroundColor: '#2a2d35',
                color: '#fff',
                padding: 12,
                borderRadius: 8,
                fontSize: 14,
                marginBottom: 16,
              }}
              placeholder="e.g., My Custom Source"
              placeholderTextColor="#9aa3b2"
              value={sourceName}
              onChangeText={setSourceName}
              autoCapitalize="words"
            />

            <Text style={{ color: '#9aa3b2', fontSize: 14, marginBottom: 8 }}>Base URL</Text>
            <TextInput
              style={{
                backgroundColor: '#2a2d35',
                color: '#fff',
                padding: 12,
                borderRadius: 8,
                fontSize: 14,
              }}
              placeholder="https://example.com/api"
              placeholderTextColor="#9aa3b2"
              value={sourceUrl}
              onChangeText={setSourceUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          <View style={{ gap: 8 }}>
            <Pressable
              style={[
                styles.helpModalCloseButton,
                { backgroundColor: '#007AFF' },
                updating && { opacity: 0.6 },
              ]}
              onPress={handleUpdate}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.helpModalCloseButtonText}>Update Source</Text>
              )}
            </Pressable>

            <Pressable
              style={styles.helpModalCloseButton}
              onPress={handleClose}
            >
              <Text style={styles.helpModalCloseButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
