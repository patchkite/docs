---
title: React Native API
description: Functions, options, and types exported by @patchkite/react-native.
sidebar:
  order: 2
---

```ts
import patchkite, { SyncStatus, InstallMode, CheckFrequency, UpdateState } from "@patchkite/react-native";
```

## Functions

| Function | Description |
|---|---|
| `patchkite(options)(Component)` | Wraps the root component and syncs automatically. |
| `sync(options?, onStatus?, onProgress?, onBinaryMismatch?)` | Check for, download, and install an update. Resolves to a `SyncStatus`. |
| `checkForUpdate(deploymentKey?)` | Resolves to a `RemotePackage`, or `null` when up to date. |
| `getUpdateMetadata(UpdateState.RUNNING \| PENDING \| LATEST)` | Resolves to a `LocalPackage`, or `null` when the binary's bundle is running. |
| `notifyAppReady()` | Mark the running update as successful, preventing automatic rollback. |
| `restartApp(onlyIfUpdateIsPending?)` | Reload JavaScript with the latest bundle. |
| `allowRestart()` / `disallowRestart()` | Defer `IMMEDIATE` restarts during critical flows such as checkout. A deferred restart runs on `allowRestart()`. |
| `clearUpdates()` | Remove all updates; the app returns to the binary's bundle on the next restart. |
| `getConfiguration()` | App version, deployment key, server URL, and client ID. |

## Sync and wrapper options

| Option | Default | Description |
|---|---|---|
| `checkFrequency` | `ON_APP_START` | `ON_APP_START`, `ON_APP_RESUME`, or `MANUAL` (wrapper only). |
| `deploymentKey` | from native config | Override the key, for example for an in-app beta channel. |
| `installMode` | `ON_NEXT_RESTART` | Install mode for optional updates. |
| `mandatoryInstallMode` | `IMMEDIATE` | Install mode for mandatory updates. |
| `minimumBackgroundDuration` | `0` | Seconds the app must spend in the background before `ON_NEXT_RESUME`/`ON_NEXT_SUSPEND` installs. |
| `updateDialog` | `null` | `true`, or an `UpdateDialog` object, to ask the user before installing. |
| `ignoreFailedUpdates` | `true` | Skip updates that were rolled back on this device. |
| `rollbackRetryOptions` | `null` | `{ delayInHours: 24, maxRetryAttempts: 1 }` to retry a failed update later. |

## Install modes

| Mode | When the update is applied |
|---|---|
| `IMMEDIATE` | Right away; JavaScript reloads. |
| `ON_NEXT_RESTART` | The next time the app is started from scratch. |
| `ON_NEXT_RESUME` | When the app returns to the foreground after `minimumBackgroundDuration`. |
| `ON_NEXT_SUSPEND` | While the app has been in the background for `minimumBackgroundDuration`. |

## `SyncStatus`

`CHECKING_FOR_UPDATE`, `AWAITING_USER_ACTION`, `DOWNLOADING_PACKAGE`, `INSTALLING_UPDATE`, `UP_TO_DATE`, `UPDATE_INSTALLED`, `UPDATE_IGNORED`, `UNKNOWN_ERROR`, `SYNC_IN_PROGRESS`.

## Lifecycle methods

A root class component wrapped with `patchkite(...)` can receive sync events:

```tsx
class App extends React.Component {
  patchkiteStatusDidChange(status: SyncStatus) {}
  patchkiteDownloadDidProgress({ receivedBytes, totalBytes }: DownloadProgress) {}
  render() { return <Root />; }
}
export default patchkite(App);
```

## Native configuration overrides

Instead of `strings.xml`/`Info.plist`, you can configure the SDK from native code before React Native starts:

```kotlin
Patchkite.configure(applicationContext, deploymentKey = "KEY", serverUrl = "https://…")   // Android
```

```swift
Patchkite.configure(deploymentKey: "KEY", serverURL: "https://…")   // iOS
```
