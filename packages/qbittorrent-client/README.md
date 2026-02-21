# @remote-app/qbittorrent-client

![npm](https://img.shields.io/npm/v/@remote-app/qbittorrent-client)

A lightweight [qBittorrent](https://www.qbittorrent.org/) WebUI API client for Node.js and React Native.

## Install

```bash
npm install @remote-app/qbittorrent-client
```

## Usage

```typescript
import QBittorrentClient from "@remote-app/qbittorrent-client";

const client = new QBittorrentClient({
  url: "http://localhost:8080",
  username: "admin",
  password: "adminadmin",
});

// List all torrents
const torrents = await client.info();

// List torrents with filters
const downloading = await client.info({ filter: "downloading" });

// Add a torrent by URL
await client.add({ urls: "magnet:?xt=urn:btih:..." });

// Start and stop torrents
await client.start(["<hash>"]);
await client.stop(["<hash>"]);

// Get transfer info
const transfer = await client.transferInfo();
console.log(transfer.dl_info_speed, transfer.up_info_speed);
```

The client handles cookie-based authentication automatically and re-authenticates on 403 responses.

## API

### Torrents

| Method | Description |
|---|---|
| `info(params?)` | List torrents (with optional filters, sorting, pagination) |
| `properties(hash)` | Get torrent properties |
| `files(hash)` | Get torrent files |
| `trackers(hash)` | Get torrent trackers |
| `pieceStates(hash)` | Get piece download states |
| `add(params)` | Add torrent (by URL or `.torrent` Blob) |
| `delete(hashes, deleteFiles?)` | Delete torrents |
| `start(hashes)` | Start torrents |
| `stop(hashes)` | Stop torrents |
| `recheck(hashes)` | Recheck torrents |
| `reannounce(hashes)` | Reannounce torrents |
| `setDownloadLimit(hashes, limit)` | Set per-torrent download limit (bytes/s) |
| `setUploadLimit(hashes, limit)` | Set per-torrent upload limit (bytes/s) |
| `setShareLimits(hashes, ratio, seedingTime, inactiveTime)` | Set share limits |
| `setLocation(hashes, location)` | Move torrents to a new location |
| `rename(hash, name)` | Rename a torrent |
| `filePrio(hash, fileIds, priority)` | Set file priority |
| `setForceStart(hashes, value)` | Force start torrents |
| `topPrio(hashes)` / `bottomPrio(hashes)` | Move to top/bottom of queue |
| `increasePrio(hashes)` / `decreasePrio(hashes)` | Move up/down in queue |

### Transfer

| Method | Description |
|---|---|
| `transferInfo()` | Get global transfer info |
| `speedLimitsMode()` | Get alternative speed limits mode (0 or 1) |
| `toggleSpeedLimitsMode()` | Toggle alternative speed limits |
| `setGlobalDownloadLimit(limit)` | Set global download limit (bytes/s) |
| `setGlobalUploadLimit(limit)` | Set global upload limit (bytes/s) |

### App

| Method | Description |
|---|---|
| `version()` | Get qBittorrent version |
| `webapiVersion()` | Get WebUI API version |
| `preferences()` | Get application preferences |
| `setPreferences(prefs)` | Set application preferences |
| `defaultSavePath()` | Get default save path |
| `shutdown()` | Shutdown qBittorrent |

### Peers

| Method | Description |
|---|---|
| `torrentPeers(hash, rid?)` | Get torrent peers data |

## Error handling

```typescript
import QBittorrentClient, {
  HTTPError,
  QBittorrentError,
} from "@remote-app/qbittorrent-client";

try {
  await client.info();
} catch (error) {
  if (error instanceof HTTPError) {
    // Non-200 HTTP response (e.g. 403 Forbidden)
    console.error(error.status, error.message);
  } else if (error instanceof QBittorrentError) {
    // API-level error (e.g. login failure, failed to add torrent)
    console.error(error.message);
  }
}
```

## License

MIT
