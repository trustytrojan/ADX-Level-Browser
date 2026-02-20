# ADX Level Browser
An [Expo](https://expo.dev) app providing an all-in-one interface for searching, downloading, and importing levels to [AstroDX](https://www.astrodx.com/).

## Features
- Downloaded levels **open directly in AstroDX** on your mobile device, **no file management hassle!**
- You can find levels from **multiple level sources** by adding them to the app
- Video downloads are **optional** to save bandwidth and storage space
- If sources provide it, displays **romanized level metadata** so you can find Japanese-titled songs or artists quickly
- You can download and import **multiple songs at once!**
- Levels that have been already downloaded are cached in the app's storage and can be quickly imported to AstroDX **without redownloading again** (you can clear the download cache if desired)
- **[Majdata.net](https://majdata.net) is added as a default source,** so you can find levels right away!

## Installing/Running the app
For both **Android and iOS/iPadOS,** you can download the latest build [here](https://nightly.link/trustytrojan/ADX-Level-Browser/workflows/build/master). Make sure to download the correct build artifact `.zip` file for your platform. The `.apk` or `.ipa` file is inside the respective `.zip` file, so extract it first.

### iOS/iPadOS Sideloading
The IPAs built on GitHub Actions **must be sideloaded.** I personally recommend using [SideStore](https://sidestore.io/); you can read installation instructions on its website.

### Expo Go
If for some reason you cannot install the APK/IPA files from above, your last option is to run the app within **Expo Go** ([Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent), [App Store](https://apps.apple.com/us/app/expo-go/id982107779)). I will be hosting a tunneled Expo development server to make this possible. Once you have Expo Go installed, simply scan the QR code below (may not always work, [report](#submitting-bug-reports-and-feature-requests) if broken) with your device's camera app.
```
(not available at the moment, please wait)
```

**There is one caveat to running in Expo Go,** however. Since Expo Go can't dynamically link to native libraries, the unzipping/zipping process of ADX files has to happen synchronously in pure JavaScript code, which will be a lot slower than native builds. Everything else should function as intended.

## Submitting bug reports and feature requests
[Submit an issue](https://github.com/trustytrojan/ADX-Level-Browser/issues) in this repository, or ping @trustytrojan in the [official AstroDX Discord server](https://discord.gg/6fpETgpvjZ).

## Creating your own source
See [SOURCES.md](./SOURCES.md) for details.

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

### iOS/iPadOS
See the dedicated Github Actions [workflow file](.github/workflows/build-ios.yml).
