import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

/*
Unfortunately, on Expo Go on iOS, this will "throw" an error at the user,
but not in the code. Just tell users to ignore this specifc error about
"native modules not loading in Expo Go". Luckily, it only appears once:
the next time you perform a(n) (un)zip-requiring action, the visual error
does not appear again.
*/
const loadZipArchiveModule = async () => {
  try {
    const module = await import('react-native-zip-archive');
    if (!module)
      return undefined;
    return module;
  } catch {
    return undefined;
  }
};

const collectFolderFiles = async (folderUri: string): Promise<Record<string, Uint8Array>> => {
  const legacyFileSystem = await import('expo-file-system/legacy');
  const contents = await legacyFileSystem.readDirectoryAsync(folderUri);
  const filesToZip: Record<string, Uint8Array> = {};

  for (const itemName of contents) {
    const itemPath = `${folderUri}/${itemName}`;
    const itemInfo = await legacyFileSystem.getInfoAsync(itemPath);

    if (itemInfo.exists && itemInfo.isDirectory) {
      const songFiles = await legacyFileSystem.readDirectoryAsync(itemPath);
      for (const fileName of songFiles) {
        const filePath = `${itemPath}/${fileName}`;
        const file = new File(filePath);
        if (file.exists)
          filesToZip[`${itemName}/${fileName}`] = file.bytesSync();
      }
    }
  }

  return filesToZip;
};

export const zipFolderToFile = async (folder: Directory, outputFile: File): Promise<void> => {
  if (!folder.exists)
    throw new Error(`Song folder does not exist: ${folder.uri}`);

  const zipArchiveModule = await loadZipArchiveModule();

  if (zipArchiveModule?.zip) {
    try {
      await zipArchiveModule.zip(folder.uri, outputFile.uri);
      return;
    } catch {
      // Fall through to fflate fallback
    }
  }

  const fflate = await import('fflate');
  const filesToZip = await collectFolderFiles(folder.uri);
  const zipped = fflate.zipSync(filesToZip);
  outputFile.write(zipped);
};

export const zipFoldersToFile = async (folders: Directory[], outputFile: File): Promise<void> => {
  const zipArchiveModule = await loadZipArchiveModule();

  if (zipArchiveModule?.zip) {
    try {
      if (Platform.OS === 'ios') {
        const originalUris = folders.map(f => f.uri);

        // move the folders into a temp dir for zipping,
        // to trigger https://github.com/mockingbot/react-native-zip-archive/blob/e6b5f63876563b825b942fd38003606dfc3f823a/index.js#L60-L63
        // instead of https://github.com/mockingbot/react-native-zip-archive/blob/e6b5f63876563b825b942fd38003606dfc3f823a/index.js#L56-L59
        // to avoid https://github.com/ZipArchive/ZipArchive/blob/acc61be58181e635ae77718e66530b4ee7dea4be/SSZipArchive/SSZipArchive.m#L868-L870
        // and instead make use of https://github.com/ZipArchive/ZipArchive/blob/acc61be58181e635ae77718e66530b4ee7dea4be/SSZipArchive/SSZipArchive.m#L917
        // awesome 😃
        const tempDir = new Directory(Paths.cache, 'temp_dir_for_zipping');
        for (const dir of folders) {
          dir.move(new Directory(tempDir, dir.name));
        }

        await zipArchiveModule.zip(tempDir.uri, outputFile.uri);

        // move the folders back to their original locations!
        for (let i = 0; i < originalUris.length; ++i) {
          folders[i].move(new Directory(originalUris[i]));
        }
      } else if (Platform.OS === 'android') {
        // both RNZA and zip4j ensure that folder paths are recursed.
        // no need to worry about it, unlike above.
        const folderPaths = folders.map((folder) => folder.uri);
        await zipArchiveModule.zip(folderPaths, outputFile.uri);
      } else {
        throw new Error('Unsupported platform');
      }

      /*
      yes, if you're wondering, i reported this inconsistency to RNZA:
      https://github.com/mockingbot/react-native-zip-archive/issues/339
      */

      return;
    } catch {
      // Fall through to fflate fallback
    }
  }

  const fflate = await import('fflate');
  const filesToZip: Record<string, Uint8Array> = {};

  for (const folder of folders) {
    const folderFiles = await collectFolderFiles(folder.uri);
    Object.assign(filesToZip, folderFiles);
  }

  const zipped = fflate.zipSync(filesToZip);
  outputFile.write(zipped);
};

export const unzipFileToFolder = async (archiveFile: File, outputFolder: Directory): Promise<void> => {
  if (!archiveFile.exists)
    throw new Error(`ADX file does not exist: ${archiveFile.uri}`);

  outputFolder.create({ intermediates: true, idempotent: true });

  const zipArchiveModule = await loadZipArchiveModule();

  if (zipArchiveModule?.unzip) {
    try {
      await zipArchiveModule.unzip(archiveFile.uri, outputFolder.uri);
      return;
    } catch {
      // Fall through to fflate fallback
    }
  }

  const fflate = await import('fflate');
  const bytes = archiveFile.bytesSync();
  const unzippedFiles = fflate.unzipSync(bytes);

  for (const [path, content] of Object.entries(unzippedFiles)) {
    const pathParts = path.split('/');
    if (pathParts.length > 1) {
      const parentPath = pathParts.slice(0, -1).join('/');
      const parentDir = new Directory(outputFolder, parentPath);
      parentDir.create({ intermediates: true, idempotent: true });
    }

    const file = new File(outputFolder, path);
    file.write(content);
  }
};