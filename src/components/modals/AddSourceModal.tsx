import { Pressable, Text, View, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { styles } from '../../styles/AppStyles';
import { addSource } from '../../services/sources';
import MyModal from './MyModal';

interface AddSourceModalProps {
  visible: boolean;
  onClose: () => void;
  onSourceAdded: () => void;
}

export const AddSourceModal = ({ visible, onClose, onSourceAdded }: AddSourceModalProps) => {
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!sourceName.trim() || !sourceUrl.trim()) {
      Alert.alert('Error', 'Please fill in both name and URL');
      return;
    }

    // Generate a simple ID from the name (lowercase, no spaces)
    const sourceId = sourceName.toLowerCase().replace(/\s+/g, '-');

    setAdding(true);
    try {
      await addSource({
        id: sourceId,
        name: sourceName.trim(),
        baseUrl: sourceUrl.trim(),
        enabled: true,
      });
      
      // Reset form and notify parent
      setSourceName('');
      setSourceUrl('');
      onSourceAdded();
      onClose();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add source');
    } finally {
      setAdding(false);
    }
  };

  const handleClose = () => {
    setSourceName('');
    setSourceUrl('');
    onClose();
  };

  return (
    <MyModal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.helpModalOverlay}>
        <View 
          style={styles.helpModalContent}
          onStartShouldSetResponder={() => true}
        >
          <Text style={styles.helpModalTitle}>Add Source</Text>
          
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
                adding && { opacity: 0.6 },
              ]}
              onPress={handleAdd}
              disabled={adding}
            >
              {adding ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.helpModalCloseButtonText}>Add Source</Text>
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
    </MyModal>
  );
};
