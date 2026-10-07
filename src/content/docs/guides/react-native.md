---
title: React Native
description: Add the Patchkite SDK to a React Native app, from installation to the first update.
sidebar:
  order: 1
---

## Requirements

| | |
|---|---|
| React Native | 0.80 or newer with the New Architecture (bridgeless). Tested on 0.87. |
| Android | minSdk 24 |
| iOS | Follows React Native's `min_ios_version_supported` |
| Hermes | Supported (default). JSC works too. |
| Expo | Not supported yet |

## 1. Register the app

Create one Patchkite app per platform and note the deployment keys:

```bash
patchkite app add MyApp-Android android react-native
patchkite app add MyApp-iOS ios react-native
patchkite deployment ls MyApp-Android -k
```

## 2. Install the SDK

```bash
npm install @patchkite/react-native
cd ios && pod install
```

Autolinking registers the native module; you don't need to edit `settings.gradle` or register a package by hand.

## 3. Android setup

### Load the bundle through Patchkite

In `android/app/src/main/java/.../MainApplication.kt`:

```kotlin
import io.github.patchkite.reactnative.Patchkite

class MainApplication : Application(), ReactApplication {
  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList = PackageList(this).packages,
      // Latest update bundle, or null to use the bundle inside the APK.
      jsBundleFilePath = Patchkite.getJSBundleFile(applicationContext),
    )
  }
  // ...
}
```

If your bundle isn't named `index.android.bundle`, pass the name: `Patchkite.getJSBundleFile(applicationContext, "main.android.bundle")`.

### Configuration

In `android/app/src/main/res/values/strings.xml`:

```xml
<resources>
  <string moduleConfig="true" name="PatchkiteServerUrl">https://patchkite.example.com</string>
  <string moduleConfig="true" name="PatchkiteDeploymentKey">DEPLOYMENT_KEY</string>
  <!-- Code signing (recommended for production): public.pem on one line, with \n -->
  <string moduleConfig="true" name="PatchkitePublicKey">-----BEGIN PUBLIC KEY-----\nMIIB...\n-----END PUBLIC KEY-----</string>
</resources>
```

To use different keys for internal and store builds, see [Deployment keys per build](../releases/#deployment-keys-per-build).

## 4. iOS setup

### Load the bundle through Patchkite

In `ios/<App>/AppDelegate.swift`:

```swift
import PatchkiteReactNative

override func bundleURL() -> URL? {
#if DEBUG
  RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
  Patchkite.bundleURL()   // latest update, or the app's built-in main.jsbundle
#endif
}
```

For a different bundle name: `Patchkite.bundleURL(forResource: "main", withExtension: "jsbundle")`.

### Configuration

In `Info.plist`:

```xml
<key>PatchkiteServerURL</key>
<string>https://patchkite.example.com</string>
<key>PatchkiteDeploymentKey</key>
<string>$(PATCHKITE_DEPLOYMENT_KEY)</string>
<key>PatchkitePublicKey</key>
<string>-----BEGIN PUBLIC KEY-----
MIIB...
-----END PUBLIC KEY-----</string>
```

:::note
The iOS key is `PatchkiteServerURL` (uppercase `URL`); the Android key is `PatchkiteServerUrl`.
:::

## 5. JavaScript

### The simplest setup

Wrap your root component:

```tsx
import patchkite from "@patchkite/react-native";

function App() {
  return <Root />;
}

export default patchkite({
  checkFrequency: patchkite.CheckFrequency.ON_APP_RESUME,
  installMode: patchkite.InstallMode.ON_NEXT_RESUME,
  minimumBackgroundDuration: 60,
})(App);
```

The wrapper runs `sync` when the app starts (and when it returns to the foreground with `ON_APP_RESUME`), and calls `notifyAppReady()` for you.

### Manual control

```tsx
import patchkite, { SyncStatus } from "@patchkite/react-native";

export default patchkite({ checkFrequency: patchkite.CheckFrequency.MANUAL })(App);

// For example, a "Check for updates" button in your settings screen
async function checkForUpdates() {
  const status = await patchkite.sync(
    { installMode: patchkite.InstallMode.IMMEDIATE, updateDialog: { appendReleaseDescription: true } },
    (s) => console.log("status", SyncStatus[s]),
    ({ receivedBytes, totalBytes }) => console.log(`${receivedBytes}/${totalBytes}`),
  );
}
```

With `MANUAL`, the wrapper only calls `notifyAppReady()`. Without the wrapper, call `patchkite.notifyAppReady()` yourself once the app has rendered successfully — an update that never calls it is rolled back on the next restart.

### Step by step, without `sync`

```ts
const update = await patchkite.checkForUpdate();
if (update) {
  const local = await update.download((p) => setProgress(p.receivedBytes / p.totalBytes));
  await local.install(patchkite.InstallMode.ON_NEXT_RESTART);
}
```

See the [React Native API reference](../../reference/react-native-api/) for every function and option.

## 6. Release an update

```bash
patchkite release-react MyApp-Android android -d Staging --description "Fix checkout button" -k private.pem
patchkite release-react MyApp-iOS ios -d Staging --description "Fix checkout button" -k private.pem
```

- The target binary version defaults to `versionName` (Android) or `CFBundleShortVersionString` (iOS). Override it with `-t 1.4.x`.
- Hermes is detected from `gradle.properties`/`Podfile` and compiled with the same flags Gradle and Xcode use.
- Register your store build's bundle from CI so that a fresh install's first update is a small patch instead of a full bundle: `patchkite binary add MyApp-Android app-release.aab`. See [Releasing from CI](../ci/#register-store-binaries-react-native).

## 7. Verify the integration

Test with a **release** build; debug builds load JavaScript from Metro.

- [ ] `patchkite debug android` (or `ios`) shows Patchkite log lines when the app starts.
- [ ] After releasing to Staging and restarting the app twice, `getUpdateMetadata()` returns the release label.
- [ ] The dashboard shows the release as installed.
- [ ] With `PatchkitePublicKey` set, a release made without `-k` is rejected by the device.
- [ ] Automatic rollback: release a bundle that crashes on start, open the app twice, and confirm it returns to the previous version and the dashboard counts a rollback.

## Limitations

- Only JavaScript and assets can be updated. Native changes need a store release with a new `versionName`/`CFBundleShortVersionString`.
- Updates are limited by their target binary version: an update for `1.4.x` is never sent to a `1.5.0` binary.
- On the first update after a store install, assets are downloaded in full; the JS bundle is sent as a patch if the store build's bundle was registered with `patchkite binary add`.
