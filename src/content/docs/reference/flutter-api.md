---
title: Flutter API
description: Classes and options exported by package:patchkite.
sidebar:
  order: 3
---

```dart
import 'package:patchkite/patchkite.dart';
```

## `Patchkite`

| Method | Description |
|---|---|
| `sync({options, onStatus, onProgress, onBinaryVersionMismatch, context})` | Check for, download, and install an update. Returns a `SyncStatus`. |
| `checkForUpdate({deploymentKey, onBinaryVersionMismatch})` | Returns a `RemotePackage?`. |
| `getUpdateMetadata([UpdateState])` | Returns a `LocalPackage?` (`null` means the binary's code is running). |
| `notifyAppReady()` | Mark the running update as successful, preventing automatic rollback. |
| `restartApp({onlyIfUpdateIsPending})` | Restart the app process to load an update. |
| `allowRestart()` / `disallowRestart()` / `clearPendingRestart()` | Defer `immediate` restarts during critical flows. |
| `clearUpdates()` | Remove all updates; the binary's `libapp.so` is used on the next start. |
| `configure({deploymentKey, serverUrl})` | Override the manifest configuration. |
| `getConfiguration()` | App version, deployment key, server URL, and engine revision. |

Errors during download and verification are thrown as `PatchkiteException`.

## `SyncOptions`

| Option | Default | Description |
|---|---|---|
| `deploymentKey` | from the manifest | Override the key. |
| `installMode` | `onNextRestart` | Install mode for optional updates. |
| `mandatoryInstallMode` | `immediate` | Install mode for mandatory updates. |
| `minimumBackgroundDuration` | `Duration.zero` | For `onNextResume` and `onNextSuspend`. |
| `updateDialog` | `null` | An `UpdateDialog(...)` to ask the user first; requires `context`. |
| `ignoreFailedUpdates` | `true` | Skip updates that were rolled back on this device. |
| `rollbackRetryOptions` | `null` | `RollbackRetryOptions(delayInHours: 24, maxRetryAttempts: 1)`. |

## `PatchkiteApp`

| Parameter | Default |
|---|---|
| `child` | required |
| `checkFrequency` | `CheckFrequency.onAppStart` (`onAppResume`, `manual`) |
| `syncOptions` | `SyncOptions()` |
| `onStatus`, `onProgress`, `onBinaryVersionMismatch` | optional |

## Android activities

| Class | Use with |
|---|---|
| `PatchkiteFlutterActivity` | Apps whose `MainActivity` extends `FlutterActivity`. |
| `PatchkiteFlutterFragmentActivity` | Apps whose `MainActivity` extends `FlutterFragmentActivity`. |
