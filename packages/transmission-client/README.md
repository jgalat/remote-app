# @remote-app/transmission-client

![npm](https://img.shields.io/npm/v/@remote-app/transmission-client)

A lightweight [Transmission](https://transmissionbt.com/) RPC client for Node.js and React Native.

## Install

```bash
npm install @remote-app/transmission-client
```

## Usage

```typescript
import TransmissionClient from "@remote-app/transmission-client";

const client = new TransmissionClient({
  url: "http://localhost:9091/transmission/rpc",
  username: "admin",
  password: "admin",
});

// Get all torrents
const response = await client.request({
  method: "torrent-get",
  arguments: {
    fields: ["id", "name", "status", "percentDone", "rateDownload"],
  },
});

console.log(response.arguments.torrents);

// Add a torrent
await client.request({
  method: "torrent-add",
  arguments: { filename: "magnet:?xt=urn:btih:..." },
});

// Update session settings
await client.request({
  method: "session-set",
  arguments: { "alt-speed-down": 500 },
});
```

The client handles Transmission's CSRF protection automatically (409 session-id negotiation).

## API

The client exposes a single typed `request` method. The `method` field determines which arguments are accepted and what the response looks like.

### Torrent methods

- `torrent-start` / `torrent-start-now` / `torrent-stop`
- `torrent-verify` / `torrent-reannounce`
- `torrent-set` / `torrent-get`
- `torrent-add` / `torrent-remove`
- `torrent-set-location` / `torrent-rename-path`

### Session methods

- `session-get` / `session-set`
- `session-stats` / `session-close`

### Queue methods

- `queue-move-top` / `queue-move-up` / `queue-move-down` / `queue-move-bottom`

### Other

- `blocklist-update`
- `port-test`
- `free-space`
- `group-get` / `group-set`

## Error handling

```typescript
import TransmissionClient, {
  HTTPError,
  TransmissionError,
  ResponseParseError,
} from "@remote-app/transmission-client";

try {
  await client.request({ method: "session-stats" });
} catch (error) {
  if (error instanceof HTTPError) {
    // Non-200 HTTP response (e.g. 401 Unauthorized)
    console.error(error.status, error.message);
  } else if (error instanceof TransmissionError) {
    // Transmission returned result !== "success"
    console.error(error.message);
  } else if (error instanceof ResponseParseError) {
    // Response body was not valid JSON
    console.error(error.status, error.body);
  }
}
```

## License

MIT
