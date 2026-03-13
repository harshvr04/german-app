# Installable Builds

Pre-built app binaries for direct installation.

## Android

- **`german-practice.apk`** — Install directly on any Android device. Enable "Install from unknown sources" if prompted.

## iOS

- **`german-practice-simulator.tar.gz`** — For iOS Simulator only. Extract and drag the `.app` into the Simulator.

> For physical iOS devices, use EAS Ad Hoc distribution (`eas build --profile preview --platform ios` without `simulator: true`), which requires registered device UDIDs and an Apple Developer account.

## Rebuilding

```bash
cd packages/mobile

# Android APK
eas build --profile preview --platform android

# iOS Simulator
eas build --profile preview --platform ios
```

After the build completes, download the artifact and place it here.
