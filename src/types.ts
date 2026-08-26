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
   * Source ID
   */
  sourceId: string;

  /**
   * Google Drive folder ID, or Majdata ID
   */
  id: string;

  /**
   * Zetaraku `songId`.
   */
  zetarakuId: string;

  /**
   * Song title
   */
  title: string;

  /**
   * Song artist
   */
  artist: string;

  /**
   * Zetaraku `notesDesigner`, or Majdata `designer`
   */
  designer?: string;

  /**
   * Zetaraku `releaseDate`.
   */
  releaseDate: string;

  /**
   * Array of difficulty levels as strings, with the index indicating the
   * difficulty name (basic, advanced, expert, master, remaster).
   * If no chart is available for a diff, the value is falsy.
   * (This is how Majdata.net provides difficulty level data.)
   */
  levels: string[];

  /**
   * Romanized title. Not present if `title` does not contain Japanese characters.
   */
  romanizedTitle?: string;

  /**
   * Romanized artist. Not present if `artist` does not contain Japanese characters.
   */
  romanizedArtist?: string;

  /**
   * Romanized designer. Not present if `designer` does not contain Japanese characters.
   */
  romanizedDesigner?: string;

  /**
   * Also known as "aliases". Sourced from [GCM-Bot](https://github.com/lomotos10/GCM-bot/blob/main/data/aliases/en/maimai.tsv).
   */
  communityNames?: string[];
}

// Type alias used throughout the codebase
export type SongItem = Song;

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
