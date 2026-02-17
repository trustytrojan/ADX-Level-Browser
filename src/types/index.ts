/**
 * Source configuration for a majdata.net-like API endpoint
 */
export interface Source {
  /**
   * Unique identifier for the source
   */
  id: string;
  /**
   * Display name for the source
   */
  name: string;
  /**
   * Base URL of the API endpoint (without trailing slash)
   * Example: https://majdata.net/api3/api/maichart
   */
  baseUrl: string;
  /**
   * Whether this source is enabled
   */
  enabled: boolean;
}

export interface Song {
  /**
   * Unique song ID from the source API
   */
  id: string;
  /**
   * ID of the source this song comes from
   */
  sourceId: string;
  /**
   * Song title
   */
  title: string;
  /**
   * Song artist
   */
  artist: string;
  /**
   * Romanized title. Not present if `title` does not contain Japanese characters.
   */
  romanizedTitle?: string;
  /**
   * Romanized artist. Not present if `artist` does not contain Japanese characters.
   */
  romanizedArtist?: string;
  /**
   * Also known as "aliases". Alternative names for the song.
   */
  communityNames?: string[];
  /**
   * Chart designer name.
   */
  designer?: string;
  /**
   * Romanized designer. Not present if `designer` does not contain Japanese characters.
   */
  romanizedDesigner?: string;
}

// Type alias for backwards compatibility with components
export type SongItem = Song;

export interface DownloadState {
  [key: string]: boolean;
}

export interface DownloadJobItem {
  id: string; // Unique song ID
  sourceId: string; // Source this song comes from
  title: string;
  artist?: string;
  designer?: string;
  romanizedDesigner?: string;
  status: 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED';
  percentDone?: number;
}

export interface SelectionState {
  isSelectionMode: boolean;
  selectedIds: Set<string>;
}

export interface AppSettings {
  /**
   * Whether to download video files for songs
   */
  downloadVideos: boolean;
  /**
   * Whether to use romanized metadata when available
   */
  useRomanizedMetadata: boolean;
}
