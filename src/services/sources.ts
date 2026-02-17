import { File, Directory, Paths } from 'expo-file-system';
import type { Source, Song } from '../types';

const SOURCES_FILENAME = 'sources.json';

/**
 * Default sources that ship with the app
 */
const DEFAULT_SOURCES: Source[] = [
  {
    id: 'majdata',
    name: 'Majdata.net',
    baseUrl: 'https://majdata.net/api3/api/maichart',
    enabled: true,
  },
  {
    id: 'converts',
    name: 'Converts',
    baseUrl: 'http://10.0.0.115:4000/adx/converts',
    enabled: true
  }
];

/**
 * Get the sources file
 */
function getSourcesFile(): File {
  const dataDir = new Directory(Paths.document, 'data');
  dataDir.create({ intermediates: true, idempotent: true });
  return new File(dataDir, SOURCES_FILENAME);
}

/**
 * Load sources from storage
 * If sources.json doesn't exist, creates it with default sources
 */
export async function loadSources(): Promise<Source[]> {
  const sourcesFile = getSourcesFile();

  if (!sourcesFile.exists) {
    // Create default sources file
    await saveSources(DEFAULT_SOURCES);
    return DEFAULT_SOURCES;
  }

  try {
    const jsonText = await sourcesFile.text();
    const sources = JSON.parse(jsonText) as Source[];
    return sources;
  } catch (error) {
    console.error('Error loading sources:', error);
    // Return default sources on error
    return DEFAULT_SOURCES;
  }
}

/**
 * Save sources to storage
 */
export async function saveSources(sources: Source[]): Promise<void> {
  const sourcesFile = getSourcesFile();
  const jsonText = JSON.stringify(sources, null, 2);
  sourcesFile.write(jsonText);
}

/**
 * Add a new source
 */
export async function addSource(source: Source): Promise<void> {
  const sources = await loadSources();
  
  // Check if source with this ID already exists
  if (sources.some(s => s.id === source.id)) {
    throw new Error(`Source with id "${source.id}" already exists`);
  }
  
  sources.push(source);
  await saveSources(sources);
}

/**
 * Update an existing source
 */
export async function updateSource(sourceId: string, updatedSource: Partial<Source>): Promise<void> {
  const sources = await loadSources();
  const index = sources.findIndex(s => s.id === sourceId);
  
  if (index === -1) {
    throw new Error(`Source with id "${sourceId}" not found`);
  }
  
  // Update the source while keeping the original ID
  sources[index] = {
    ...sources[index],
    ...updatedSource,
    id: sourceId, // Preserve original ID
  };
  
  await saveSources(sources);
}

/**
 * Delete a source
 */
export async function deleteSource(sourceId: string): Promise<void> {
  const sources = await loadSources();
  const filtered = sources.filter(s => s.id !== sourceId);
  
  if (filtered.length === sources.length) {
    throw new Error(`Source with id "${sourceId}" not found`);
  }
  
  await saveSources(filtered);
}

/**
 * State for tracking pagination across sources
 */
export interface SourcePaginationState {
  [sourceId: string]: {
    currentPage: number;
    hasMore: boolean;
  };
}

/**
 * Fetch the list of songs from a source
 * @param source - The source to fetch from
 * @param page - Page number (0-indexed)
 * @param search - Search query (optional)
 */
export async function fetchSongList(
  source: Source,
  page: number = 0,
  search: string = ''
): Promise<Song[]> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  if (search) {
    params.set('search', search);
  }

  const url = `${source.baseUrl}/list?${params}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch from ${source.name}: ${response.status} ${response.statusText}`);
  }

  const songs = await response.json();

  // Add sourceId to each song
  const processedSongs = songs.map((song: any) => ({
    ...song,
    sourceId: source.id,
    id: song.id || song.songId || '',
    title: song.title || 'Unknown',
    artist: song.artist || '',
  }));

  return processedSongs;
}

/**
 * Get the URL for a song's track (MP3)
 */
export function getTrackUrl(source: Source, songId: string): string {
  return `${source.baseUrl}/${songId}/track`;
}

/**
 * Get the URL for a song's image (JPG/PNG)
 */
export function getImageUrl(source: Source, songId: string): string {
  return `${source.baseUrl}/${songId}/image?fullImage=true`;
}

/**
 * Get the URL for a song's chart (TXT)
 */
export function getChartUrl(source: Source, songId: string): string {
  return `${source.baseUrl}/${songId}/chart`;
}

/**
 * Get the URL for a song's video (MP4)
 */
export function getVideoUrl(source: Source, songId: string): string {
  return `${source.baseUrl}/${songId}/video`;
}

/**
 * Load songs from all enabled sources for a specific page
 * @param paginationState - Current pagination state for all sources
 * @param searchQuery - Optional search query
 * @returns Object containing new songs and updated pagination state
 */
export async function loadNextPage(
  paginationState: SourcePaginationState,
  searchQuery: string = ''
): Promise<{ songs: Song[]; paginationState: SourcePaginationState }> {
  const sources = await loadSources();
  const enabledSources = sources.filter(s => s.enabled);

  if (enabledSources.length === 0) {
    return { songs: [], paginationState };
  }

  const newSongs: Song[] = [];
  const updatedPagination = { ...paginationState };

  // Fetch next page from each source that has more pages
  await Promise.allSettled(
    enabledSources.map(async (source) => {
      // Initialize pagination state for this source if not exists
      if (!updatedPagination[source.id]) {
        updatedPagination[source.id] = { currentPage: 0, hasMore: true };
      }

      const sourceState = updatedPagination[source.id];

      // console.log(`[loadNextPage] sourceState:`, sourceState);

      // Skip if no more pages
      if (!sourceState.hasMore) {
        return;
      }

      try {
        const songs = await fetchSongList(source, sourceState.currentPage, searchQuery);
        
        if (songs.length > 0) {
          newSongs.push(...songs);
          
          // Update pagination state - keep hasMore true since we got results
          updatedPagination[source.id] = {
            currentPage: sourceState.currentPage + 1,
            hasMore: true, // We got results, so there might be more
          };
        } else {
          // console.log(`[loadNextPage] empty array`);
          // No songs returned (empty array []), mark as no more pages
          updatedPagination[source.id] = {
            ...sourceState,
            hasMore: false,
          };
        }
      } catch (error) {
        console.error(`Failed to fetch from ${source.name}:`, error);
        // Don't change hasMore on error - keep current state to allow retry
        // (or could set to false to prevent infinite retries)
        updatedPagination[source.id] = {
          ...sourceState,
          hasMore: false,
        };
      }
    })
  );

  // console.log(`[loadNextPage] updatedPagination:`, updatedPagination);

  return { songs: newSongs, paginationState: updatedPagination };
}

/**
 * Reset pagination state for all sources
 */
export function resetPaginationState(): SourcePaginationState {
  return {};
}

/**
 * Get a source by ID
 */
export async function getSource(sourceId: string): Promise<Source | undefined> {
  const sources = await loadSources();
  return sources.find(s => s.id === sourceId);
}
