---
title: Quickstart
description: Run a local Patchkite server, create an app, and ship your first update.
sidebar:
  order: 2
---

This walkthrough runs everything on your machine. For a real deployment, follow [Deploy to production](../../self-hosting/production/) instead.

## 1. Start a server

You need Docker with Docker Compose.

```bash
git clone https://github.com/patchkite/patchkite.git
cd patchkite/docker
docker compose --profile full up -d --build
```

This starts PostgreSQL, RustFS (S3-compatible storage), and the Patchkite server at `http://localhost:3000`. The dashboard is at `http://localhost:3000/web/`.

## 2. Install the CLI and create an account

```bash
npm install -g @patchkite/cli
patchkite register http://localhost:3000
```

The first account on a server automatically becomes an **admin**. Later, you can log in again with `patchkite login http://localhost:3000`.

:::note
An Android emulator reaches your machine at `http://10.0.2.2:3000`, not `localhost`. Use that address as the server URL in the app's configuration.
:::

## 3. Register your app

Create one Patchkite app per platform:

```bash
patchkite app add MyApp-Android android react-native   # or: flutter
patchkite deployment ls MyApp-Android -k               # shows the Staging and Production keys
```

## 4. Add the SDK

Follow the guide for your framework, using the **Staging** key and your server URL:

- [React Native](../../guides/react-native/)
- [Flutter](../../guides/flutter/)

Build and install a **release** build of the app. Debug builds load code from Metro or the Flutter tool, not from Patchkite.

## 5. Release an update

Change some visible text in your app, then:

```bash
patchkite release-react MyApp-Android android --description "My first update"
# Flutter: patchkite release-flutter MyApp-Android android --description "My first update"
```

Open the app, close it completely, and open it again. The default install mode applies updates on the next restart, so you should now see your change. The release also shows up as installed in the dashboard.

## Next steps

- [Deployments and releases](../../guides/releases/): Staging → Production, rollouts, and target versions.
- [Code signing](../../guides/code-signing/): make devices reject packages you didn't sign.
- [Releasing from CI](../../guides/ci/): automate releases with an access key.
