export interface Song {
  /**
   * Google Drive folder ID.
   * If present, then `majdataId` should not be, and this song is a convert hosted
   * in the [Google Drive folder](https://drive.google.com/drive/u/0/folders/1NiZ9rL19qKLqt0uNcP5tIqc0fUrksAPs).
   */
  folderId?: string;
  /**
   * Majdata song ID.
   * If present, then `folderId` should not be, and this song is a fanmade chart hosted on [Majdata.net](https://majdata.net).
   */
  majdataId?: string;
  /**
   * Zetaraku `songId`. Not present on Majdata songs.
   */
  zetarakuId?: string;
  title: string;
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
   * Also known as "aliases". Sourced from [GCM-Bot](https://github.com/lomotos10/GCM-bot/blob/main/data/aliases/en/maimai.tsv).
   */
  communityNames?: string[];
  /**
   * Chart designer name. Not present on convert songs.
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
  id: string; // Either folderId or majdataId
  title: string;
  artist?: string;
  designer?: string;
  romanizedDesigner?: string;
  isMajdata?: boolean;
  status: 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED';
  percentDone?: number;
}

export interface SelectionState {
  isSelectionMode: boolean;
  selectedIds: Set<string>;
}
