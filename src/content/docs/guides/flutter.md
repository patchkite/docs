---
title: Flutter
description: Add the Patchkite SDK to a Flutter app and ship Dart code updates on Android.
sidebar:
  order: 2
---

## How it works

Flutter release builds compile your Dart code ahead of time into a native library, `libapp.so`. Patchkite updates **Dart code** by replacing that library: the CLI builds a release APK, extracts `libapp.so` for each ABI, and uploads it together with the Flutter *engine revision*. The SDK downloads the new library and tells the Flutter engine to load it the next time the app starts.

Before you start, be aware of these limits:

- **Android only.** iOS doesn't allow loading new native code. On iOS every API can still be called, but it always reports "up to date", so you can keep one codebase.
- **The Flutter version must match exactly.** Updates are only offered to binaries built with the same engine revision. Always release updates with the same Flutter SDK version as your store build — pin it with FVM or a fixed CI image.
- **Only Dart code can be updated.** Assets declared in `pubspec.yaml`, fonts, native code, new plugins, and Flutter upgrades still need a store release.
- **Updates apply on the next app start.** `InstallMode.immediate` restarts the app process.
- Check that your use complies with Google Play's policy on downloading executable code.

| | |
|---|---|
| Flutter | 3.35 or newer |
| Android | minSdk 24 |

## 1. Register the app

```bash
patchkite app add MyApp-Android android flutter
patchkite deployment ls MyApp-Android -k
```

## 2. Install the SDK

```bash
flutter pub add patchkite
```

## 3. Android setup

### Activity

In `android/app/src/main/kotlin/.../MainActivity.kt`:

```kotlin
import io.github.patchkite.flutter.PatchkiteFlutterActivity

class MainActivity : PatchkiteFlutterActivity()
```

Apps that extend `FlutterFragmentActivity` (for example for `local_auth`) use `PatchkiteFlutterFragmentActivity` instead. The activity tells the engine to load `libapp.so` from the latest update when there is one.

### Configuration

In `android/app/src/main/AndroidManifest.xml`, inside `<application>`:

```xml
<meta-data android:name="PatchkiteServerUrl" android:value="https://patchkite.example.com" />
<meta-data android:name="PatchkiteDeploymentKey" android:value="${patchkiteKey}" />
<!-- Code signing (recommended for production): public.pem on one line, with \n -->
<meta-data android:name="PatchkitePublicKey" android:value="-----BEGIN PUBLIC KEY-----\nMIIB...\n-----END PUBLIC KEY-----" />
```

The plugin already declares the `INTERNET` permission. To use different keys per flavor, see [Deployment keys per build](../releases/#deployment-keys-per-build).

## 4. Dart

### The simplest setup

```dart
import 'package:patchkite/patchkite.dart';

void main() {
  runApp(const PatchkiteApp(
    checkFrequency: CheckFrequency.onAppResume,
    syncOptions: SyncOptions(installMode: InstallMode.onNextRestart),
    child: MyApp(),
  ));
}
```

`PatchkiteApp` runs `sync` after the first frame (and when the app returns to the foreground with `onAppResume`), and calls `notifyAppReady()` for you.

### Manual control

```dart
// main(): runApp(const PatchkiteApp(checkFrequency: CheckFrequency.manual, child: MyApp()));

Future<void> checkForUpdates(BuildContext context) async {
  final status = await Patchkite.sync(
    options: const SyncOptions(
      installMode: InstallMode.immediate,
      updateDialog: UpdateDialog(appendReleaseDescription: true),
    ),
    context: context, // required to show the dialog
    onStatus: (s) => debugPrint('status $s'),
    onProgress: (p) => debugPrint('${p.receivedBytes}/${p.totalBytes}'),
  );
}
```

Without `PatchkiteApp`, call `Patchkite.notifyAppReady()` once the app has rendered successfully. An update that never calls it is rolled back the next time the app starts.

### Step by step, without `sync`

```dart
final update = await Patchkite.checkForUpdate();
if (update != null) {
  final local = await update.download((p) => setState(() => progress = p.receivedBytes / p.totalBytes));
  await local.install(installMode: InstallMode.onNextRestart);
}
```

Download and verification errors are thrown as `PatchkiteException`. See the [Flutter API reference](../../reference/flutter-api/) for everything else.

## 5. Release an update

```bash
patchkite release-flutter MyApp-Android android -d Staging --description "Fix receipt layout" -k private.pem
```

- The CLI runs `flutter build apk --release` for `arm64-v8a`, `armeabi-v7a`, and `x86_64`, then extracts `libapp.so` and the engine revision. Choose ABIs with `--targetAbis`.
- Pass the same build arguments as your store build with `--buildArgs`, for example `--buildArgs "--flavor production --dart-define=ENV=prod --obfuscate --split-debug-info=build/symbols"`. The update must be built from the same configuration.
- Already have an APK from CI? Use `--apk path/to/app-release.apk` to skip the build.
- The target binary version defaults to `version` in `pubspec.yaml`. Override it with `-t 1.4.x`.

## 6. Verify the integration

Test with a **release** build on an Android device or emulator:

- [ ] After releasing to Staging, opening the app, closing it completely, and opening it again, your Dart change is visible and `getUpdateMetadata()` returns the release label.
- [ ] `patchkite debug android` shows Patchkite log lines.
- [ ] The dashboard shows the release as installed.
- [ ] With `PatchkitePublicKey` set, a release made without `-k` is rejected.
- [ ] Automatic rollback: release Dart code that crashes on start, open the app twice, and confirm it returns to the previous version.
- [ ] After upgrading Flutter for the next store build, old updates are no longer offered to the new binary (different engine revision).

## Download size

An update package contains `libapp.so` for every released ABI. Between releases, devices only download a binary patch (bsdiff) of the files that changed. Release only the ABIs your app actually ships (for example `--targetAbis arm64-v8a,armeabi-v7a`) to keep the first update small.
