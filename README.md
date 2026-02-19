# ADX Level Browser
A React Native/Expo app providing an all-in-one interface for searching, downloading, and importing levels to AstroDX.

## Architecture

The app now uses a **source-based architecture** that supports multiple level sources with a majdata.net-like API interface. Songs are loaded from configurable sources stored in `sources.json` in the app's private data directory.

## Features

- **Multiple Sources**: Add and manage multiple level sources
- **Optional Video Downloads**: To save bandwidth and storage
- **Romanized Metadata**: Display romanized titles/artists when available
- **Batch Selection by Default**: Import multiple songs at once
- **Download Cache**: Avoid re-downloading songs that are in the app's cache
- **Direct Import**: Downloads open directly in AstroDX

## Creating your own Source

See [SOURCES.md](./SOURCES.md) for details.

## Installing/Running the app

### Android
APKs are built on every commit with GitHub Actions. You can download the latest build [here](https://nightly.link/trustytrojan/adx-convert-browser/workflows/build-android/master/android-build.zip).

### iOS/iPadOS
Since I don't own a new enough Mac, and I don't want to give Apple my personal info, I'm going to be hosting a tunneled Expo development server. This means you can simply install [Expo Go from the App Store](https://apps.apple.com/us/app/expo-go/id982107779), scan the QR code below (whenever it is there) with the Camera app, and the app should download and run within Expo Go.

### Expo Go
If for some reason you cannot install the APK/IPA files from above, your last option is to run the app within **Expo Go** ([Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent), [App Store](https://apps.apple.com/us/app/expo-go/id982107779)). Once you have Expo Go installed, simply scan the QR code below with your device's Camera app.
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

**There is one caveat to running in Expo Go,** however: since Expo Go can't relink native libraries, the unzipping/zipping process of ADX files has to happen synchronously in pure JavaScript code, which **will be slow.**

## Building
Before moving to the platform-specific instructions, make sure you `npm i` and `npx expo prebuild -p <android|ios>`.

### Android
I only built an APK on Linux, but given that Android tooling is available for all OSes, you can follow these steps.

1. Get [sdkmanager](https://developer.android.com/tools/sdkmanager) on your system.
2. Install the necessary packages with `sdkmanager`:
   ```sh
   sdkmanager 'build-tools;35.0.0' 'build-tools;36.0.0' 'cmake;3.22.1' 'ndk;27.1.12297006' 'platforms;android-36'
   ```
3. Run `expo prebuild -p android` to let Expo generate the Android build environment.
4. Run `cd android` then `./gradlew assembleRelease`. The APK is located at `android/app/build/outputs/apk/release/app-release.apk` relative to the project root.

### iOS
See the dedicated Github Actions [workflow file](.github/workflows/build-ios.yml).
