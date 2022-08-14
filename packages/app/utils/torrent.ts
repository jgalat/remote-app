enum TorrentStatus {
  TorrentStopped = "Stopped",
  QueuedToCheckFiles = "Queued to verify local data",
  CheckingFiles = "Verifying local data",
  QueueToDownload = "Queued",
  Downloading = "Downloading",
  QueueToSeed = `Queued to Seed`,
  Seeding = "Seeding",
}

export function status(n: 0 | 1 | 2 | 3 | 4 | 5 | 6): string {
  switch (n) {
    case 0:
      return "stopped";
    case 1:
      return "queued to verify local data";
    case 2:
      return "verifying local data";
    case 3:
      return "queued to download";
    case 4:
      return "downloading";
    case 5:
      return "queued to seed";
    case 6:
      return "seeding";
  }
}
