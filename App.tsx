import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { File, Directory, Paths } from 'expo-file-system';
import { getContentUriAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';

interface ResultItem {
  id: string;
  title: string;
}

interface DownloadState {
  [key: string]: boolean;
}

const API_BASE_URL = 'https://api.trustytrojan.dev';

export default function App() {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<DownloadState>({});
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/adx/search?q=${encodeURIComponent(query)}`);
      const data: Record<string, string> = await response.json();
      
      // Convert the response to ResultItem array
      const resultItems: ResultItem[] = Object.entries(data).map(([songName, folderId]) => ({
        id: folderId,
        title: songName,
      }));
      
      setResults(resultItems);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    
    // Clear existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set new timeout for 500ms
    searchTimeout.current = setTimeout(() => {
      performSearch(text);
    }, 500);
  };

  const handleSubmitEditing = () => {
    // Clear timeout and search immediately
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    performSearch(searchText);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  const openWithAstroDX = async (file: File, songTitle: string) => {
    if (Platform.OS === 'android') {
      try {
        const contentUri = await getContentUriAsync(file.uri);
        console.log(contentUri);
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          flags: 1,
          packageName: 'com.Reflektone.AstroDX',
        });
      } catch (error) {
        console.error('Intent error:', error);
        Alert.alert(
          'Cannot Open File',
          'AstroDX app not found. Would you like to share instead?',
          [
            {
              text: 'Share',
              onPress: async () => {
                if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(file.uri);
                }
              }
            },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    } else {
      Alert.alert(
        'Download Complete',
        `${songTitle} ready to share!`,
        [
          {
            text: 'Share',
            onPress: async () => {
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(file.uri);
              }
            }
          },
          { text: 'OK', style: 'cancel' }
        ]
      );
    }
  };

  const handleResultPress = async (item: ResultItem) => {
    setDownloading(prev => ({ ...prev, [item.id]: true }));
    
    try {
      const sanitizedTitle = item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileName = `${sanitizedTitle}.adx`;
      const downloadsDir = new Directory(Paths.document, 'adx-downloads');
      downloadsDir.create({ intermediates: true, idempotent: true });
      
      const file = new File(downloadsDir, fileName);
      
      // Check if file already exists
      if (file.exists) {
        console.log('File already exists, opening:', file.uri);
        await openWithAstroDX(file, item.title);
        return;
      }

      // Download the file
      console.log('Downloading:', item.title);
      const downloadUrl = `${API_BASE_URL}/adx/download/${item.id}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);
      
      try {
        const response = await fetch(downloadUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        file.write(new Uint8Array(arrayBuffer));
        
        console.log('Download complete:', file.uri);
        await openWithAstroDX(file, item.title);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error 
        ? (error.name === 'AbortError' ? 'Download timed out (90s limit)' : error.message)
        : 'An unknown error occurred';
      Alert.alert('Error', errorMessage);
    } finally {
      setDownloading(prev => {
        const newState = { ...prev };
        delete newState[item.id];
        return newState;
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search for songs..."
          value={searchText}
          onChangeText={handleSearch}
          onSubmitEditing={handleSubmitEditing}
          returnKeyType="search"
        />
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}

      <FlatList
        style={styles.resultsList}
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.resultButton,
              downloading[item.id] && styles.resultButtonDisabled
            ]}
            onPress={() => handleResultPress(item)}
            disabled={downloading[item.id]}
          >
            <View style={styles.resultContent}>
              <Text style={styles.resultText}>{item.title}</Text>
              {downloading[item.id] && (
                <ActivityIndicator size="small" color="#007AFF" style={styles.downloadIndicator} />
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading && searchText ? (
            <Text style={styles.emptyText}>No results found</Text>
          ) : null
        }
      />

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  resultsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  resultButtonDisabled: {
    opacity: 0.5,
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  downloadIndicator: {
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#999',
  },
});
