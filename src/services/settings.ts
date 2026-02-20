import { Directory, File, Paths } from 'expo-file-system';
import type { AppSettings } from '../types';

const SETTINGS_FILENAME = 'settings.json';

/**
 * Default app settings
 */
const DEFAULT_SETTINGS: AppSettings = {
  downloadVideos: true,
  useRomanizedMetadata: false,
};

/**
 * Get the settings file
 */
function getSettingsFile(): File {
  const dataDir = new Directory(Paths.document, 'data');
  dataDir.create({ intermediates: true, idempotent: true });
  return new File(dataDir, SETTINGS_FILENAME);
}

/**
 * Load app settings from storage
 * If settings.json doesn't exist, creates it with default settings
 */
export async function loadSettings(): Promise<AppSettings> {
  const settingsFile = getSettingsFile();

  if (!settingsFile.exists) {
    // Create default settings file
    saveSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }

  try {
    const jsonText = await settingsFile.text();
    const settings = JSON.parse(jsonText) as AppSettings;
    // Merge with defaults in case new settings were added
    return { ...DEFAULT_SETTINGS, ...settings };
  } catch (error) {
    console.error('Error loading settings:', error);
    // Return default settings on error
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save app settings to storage
 */
export function saveSettings(settings: AppSettings) {
  const settingsFile = getSettingsFile();
  const jsonText = JSON.stringify(settings, null, 2);
  settingsFile.write(jsonText);
}

/**
 * Update a specific setting
 */
export async function updateSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K],
): Promise<void> {
  const settings = await loadSettings();
  settings[key] = value;
  saveSettings(settings);
}
