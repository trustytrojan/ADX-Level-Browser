# ADX Level Browser
A React Native/Expo app to have an all-in-one interface for searching, downloading, and importing levels for AstroDX.

## Architecture

The app now uses a **source-based architecture** that supports multiple level sources with a majdata.net-like API interface. Songs are loaded from configurable sources stored in `sources.json` in the app's private data directory.

For backwards compatibility, the existing database is automatically loaded as a "legacy-db" source on first launch. See [MIGRATION.md](MIGRATION.md) for details on the architectural changes.

## Features

- **Multiple Sources**: Add and manage multiple level sources
- **Video Downloads**: Optional video downloads to save bandwidth and storage
- **Romanized Metadata**: Display romanized titles/artists when available
- **Selection Mode**: Download multiple songs at once
- **Download Cache**: Avoid re-downloading songs you already have
- **Direct Import**: Downloads open directly in AstroDX

## Installing/Running the app

### Android
APKs are built on every commit with GitHub Actions. You can download the latest build [here](https://nightly.link/trustytrojan/adx-convert-browser/workflows/build-android/master/android-build.zip).

### iOS/iPadOS
Since I don't own a new enough Mac, and I don't want to give Apple my personal info, I'm going to be hosting a tunneled Expo development server. This means you can simply install [Expo Go from the App Store](https://apps.apple.com/us/app/expo-go/id982107779), scan the QR code below (whenever it is there) with the Camera app, and the app should download and run within Expo Go.

```
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ▄▄▄▄▄ █▄▄▄ ▀ ▄██ ▀▀██ ▄▄▄▄▄ █
█ █   █ ██▄▀ █ ▄█▄▀▀▄▄█ █   █ █
█ █▄▄▄█ ██▀▄ ▄▀▄█▄▀▄▄▀█ █▄▄▄█ █
█▄▄▄▄▄▄▄█ ▀▄█ ▀▄█▄█▄█▄█▄▄▄▄▄▄▄█
█▄▄▀  █▄█▀▄▀█▄█▄▀▄ ▄▀█▀▄█▀██▀▄█
█   █▄▀▄▄▀▄██▄██▄█  █▀▄▀▄███▄▀█
█▄  ▀▀▄▄█ ▄ █▀▄   █▄█▄▄  ▀▄█  █
█▀▀▀▀█▀▄█▀ ▄█▀▀  ▄█ ▄ ▀▀ ██ █ █
█ ▀▀▄▀ ▄ █ ▄ ▄██▀▀█▄ ▀██▄▀▀▀ ▄█
█  █ ██▄ ▄▄█▀▄ ▄▄▄▄ ▄▄ ▄▄▄█▀▀▄█
█▄▄█▄█▄▄█ ▄▀▄▀ █ █▄▄█ ▄▄▄ ▄▄█▄█
█ ▄▄▄▄▄ ███▀ ▀ █▄▀ ▄  █▄█ ▄█▀██
█ █   █ █ ▀▄▄▄ ▀▀▀▀ ▄▄ ▄ ▄▀▀█ █
█ █▄▄▄█ █▀ ▄ ▄▄█▄█▄▀█▄ █  ▄▀▄ █
█▄▄▄▄▄▄▄█▄▄▄███▄▄███▄▄▄▄█▄▄████
```

## API Requirements for Custom Sources

To add a custom source, it must implement the following majdata.net-like API:

- `GET /list?page={page}&search={search}` - List/search songs
- `GET /{id}/track` - Download MP3 audio
- `GET /{id}/image` - Download JPG/PNG image
- `GET /{id}/chart` - Download TXT chart file
- `GET /{id}/video` - Download MP4 video (optional)

See [MIGRATION.md](MIGRATION.md) for detailed API specifications and examples.

## Development
Have Node.js and NPM installed, then run `npm i`. Run the Expo dev server with `npx expo`.

### Build for Android
I only built an APK on Linux, but given that Android tooling is available for all OSes, you can follow these steps.

1. Get [sdkmanager](https://developer.android.com/tools/sdkmanager) on your system.
2. Install the necessary packages with `sdkmanager`:
   ```sh
   sdkmanager 'build-tools;35.0.0' 'build-tools;36.0.0' 'cmake;3.22.1' 'ndk;27.1.12297006' 'platforms;android-36'
   ```
3. Run `expo prebuild -p android` to let Expo generate the Android build environment.
4. Run `cd android` then `./gradlew assemble`. The APK is located at `android/app/build/outputs/apk/release/app-release.apk` relative to the project root.
  - Download endpoints: `/<song-id>/<track|chart|video>`
- Maybe switch to [NativeScript](https://nativescript.org/) once you're familiar with it, though this will be a big workload
