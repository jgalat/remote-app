#!/bin/bash
CONFIG_DIR="/config/qBittorrent"
CONF_FILE="$CONFIG_DIR/qBittorrent.conf"

# Wait for the config file to be created by qBittorrent on first run
for i in $(seq 1 30); do
  [ -f "$CONF_FILE" ] && break
  sleep 1
done

# PBKDF2-HMAC-SHA512 hash of "test" (base64 encoded salt and hash)
HASH='@ByteArray(ASNFZ4mrze8BI0VniavN7w==:WAj+fpK1cLWzIbTeTZ4mWeT3r4REPZCCzugyRuZmG8/SRYyn2+EA2uz+k3CzieP9Rmxe7RFtxeb372216CSsbQ==)'

if grep -q "^\[Preferences\]" "$CONF_FILE" 2>/dev/null; then
  sed -i '/^WebUI\\Username=/d' "$CONF_FILE"
  sed -i '/^WebUI\\Password_PBKDF2=/d' "$CONF_FILE"
  sed -i '/^WebUI\\CSRFProtection=/d' "$CONF_FILE"
  sed -i "/^\[Preferences\]/a WebUI\\\\Username=test" "$CONF_FILE"
  sed -i "/^WebUI\\\\Username=test/a WebUI\\\\Password_PBKDF2=\"$HASH\"" "$CONF_FILE"
  sed -i "/^WebUI\\\\Password_PBKDF2=/a WebUI\\\\CSRFProtection=false" "$CONF_FILE"
else
  printf '\n[Preferences]\nWebUI\\Username=test\nWebUI\\Password_PBKDF2="%s"\nWebUI\\CSRFProtection=false\n' "$HASH" >> "$CONF_FILE"
fi
