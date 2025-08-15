# @remote-app/transmission-client

![npm](https://img.shields.io/npm/v/@remote-app/transmission-client)

A lightweight Transmission RPC client.

## Install

```bash
$ npm install @remote-app/transmission-client
```

## Supported methods

### Torrent methods
- Torrent actions
  - [x] torrent-start
  - [x] torrent-start-now
  - [x] torrent-stop
  - [x] torrent-verify
  - [x] torrent-reannounce
- Torrent mutator
  - [x] torrent-set
- Torrent accessor
  - [x] torrent-get
- Torrent addition
  - [x] torrent-add
- Torrent removal
  - [x] torrent-remove
- Move torrent
  - [x] torrent-set-location
- Renaming torrent
  - [x] torrent-rename-path

### Session methods
- Session accessor
  - [x] session-get
- Session mutator
   - [x] session-set
- Session statistics
  - [x] session-stats
- Session shutdown
  - [x] session-close
- Queue movement
  - [x] queue-move-top
  - [x] queue-move-up
  - [x] queue-move-down
  - [x] queue-move-bottom

### Blocklist
- Mutator
  - [x] blocklist-update

### Port
- Check
  - [x] port-test

### Space
- Check
  - [x] free-space

### Groups
- Group accessor
  - [x] group-get
- Group mutator
  - [x] group-set
