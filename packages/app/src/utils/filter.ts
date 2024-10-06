import { Torrent, TorrentStatus } from "@remote-app/transmission-client";
import type { Filter } from "~/store/settings";

type Predicate = (t: Torrent) => boolean;

const all: Predicate = () => true;

const active: Predicate = (t: Torrent) =>
  t.peersGettingFromUs > 0 ||
  t.peersSendingToUs > 0 ||
  t.webseedsSendingToUs > 0 ||
  [
    TorrentStatus.VERIFYING_LOCAL_DATA,
    TorrentStatus.DOWNLOADING,
    TorrentStatus.SEEDING,
  ].includes(t.status);

const downloading: Predicate = (t: Torrent) =>
  [TorrentStatus.QUEUED_TO_DOWNLOAD, TorrentStatus.DOWNLOADING].includes(
    t.status
  );

const seeding: Predicate = (t: Torrent) =>
  [TorrentStatus.QUEUED_TO_SEED, TorrentStatus.SEEDING].includes(t.status);

const paused: Predicate = (t: Torrent) =>
  [TorrentStatus.STOPPED].includes(t.status);

const completed: Predicate = (t: Torrent) =>
  t.leftUntilDone <= 0 && t.sizeWhenDone > 0;

const finished: Predicate = (t: Torrent) => t.isFinished;

const map = {
  all: all,
  active: active,
  downloading: downloading,
  seeding: seeding,
  paused: paused,
  completed: completed,
  finished: finished,
};

export default function (f: Filter): Predicate {
  return map[f];
}
