import type { Torrent } from "~/hooks/torrent";
import type { Direction, Sort } from "~/store/settings";

type Compare = (t1: Torrent, t2: Torrent) => number;

function asNumericId(value: Torrent["id"]): number | undefined {
  if (typeof value === "number" && Number.isSafeInteger(value)) return value;
  if (typeof value === "string" && /^-?\d+$/.test(value)) {
    const parsed = Number(value);
    if (Number.isSafeInteger(parsed)) return parsed;
  }
  return undefined;
}

const direction = (d: Direction, compare: Compare): Compare => {
  return (t1: Torrent, t2: Torrent) => (d === "asc" ? 1 : -1) * compare(t1, t2);
};

const id: Compare = (t1: Torrent, t2: Torrent) => {
  const n1 = asNumericId(t1.id);
  const n2 = asNumericId(t2.id);
  if (n1 !== undefined && n2 !== undefined) {
    return n1 - n2;
  }
  return String(t1.id).localeCompare(String(t2.id));
};

const queue: Compare = (t1: Torrent, t2: Torrent) => {
  return t1.queuePosition - t2.queuePosition;
};

const activity: Compare = (t1: Torrent, t2: Torrent) => {
  return t1.activityDate - t2.activityDate || status(t1, t2);
};

const age: Compare = (t1: Torrent, t2: Torrent) => {
  return t1.addedDate - t2.addedDate;
};

const name: Compare = (t1: Torrent, t2: Torrent) => {
  return (
    t1.name.toLowerCase().localeCompare(t2.name.toLowerCase()) || id(t1, t2)
  );
};

const progress: Compare = (t1: Torrent, t2: Torrent) => {
  return t1.percentDone - t2.percentDone || ratio(t1, t2);
};

const size: Compare = (t1: Torrent, t2: Torrent) => {
  return t1.totalSize - t2.totalSize || name(t1, t2);
};

const status: Compare = (t1: Torrent, t2: Torrent) => {
  return t1.status - t2.status || queue(t1, t2);
};

const time: Compare = (t1: Torrent, t2: Torrent) => {
  const t1Complete = t1.leftUntilDone <= 0 && t1.sizeWhenDone > 0;
  const t2Complete = t2.leftUntilDone <= 0 && t2.sizeWhenDone > 0;

  if (t1Complete && !t2Complete) {
    return -1;
  }
  if (!t1Complete && t2Complete) {
    return 1;
  }

  if (t1.eta < 0 && t2.eta >= 0) {
    return 1;
  }
  if (t2.eta < 0 && t1.eta >= 0) {
    return -1;
  }

  return t1.eta - t2.eta;
};

const ratio: Compare = (t1: Torrent, t2: Torrent) => {
  return t1.uploadRatio - t2.uploadRatio || status(t1, t2);
};

const map = {
  queue: queue,
  activity: activity,
  age: age,
  name: name,
  progress: progress,
  size: size,
  status: status,
  "time-remaining": time,
  ratio: ratio,
};

export default function (d: Direction, s: Sort): Compare {
  return direction(d, map[s]);
}
