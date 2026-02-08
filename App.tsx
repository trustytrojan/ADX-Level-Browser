import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';

interface ResultItem {
  id: string;
  title: string;
}

const API_BASE_URL = 'https://api.trustytrojan.dev';

export default function App() {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
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

  const handleResultPress = (item: ResultItem) => {
    console.log('Pressed:', item.title, 'Folder ID:', item.id);
    // Add your result selection logic here
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
            style={styles.resultButton}
            onPress={() => handleResultPress(item)}
          >
            <Text style={styles.resultText}>{item.title}</Text>
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
  resultText: {
    fontSize: 16,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#999',
  },
});
