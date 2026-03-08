CREATE TABLE purchases (
  tx_hash TEXT PRIMARY KEY,
  chain_id INTEGER NOT NULL,
  app_id TEXT NOT NULL,
  wallet_address TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
