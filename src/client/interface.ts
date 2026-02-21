import type {
  TorrentId,
  Torrent,
  ExtTorrent,
  AddTorrentParams,
  AddTorrentResult,
  SetTorrentParams,
  SetLocationParams,
  Session,
  SessionStats,
} from "./types";

export interface TorrentClient {
  getTorrents(): Promise<Torrent[]>;
  getTorrent(id: TorrentId): Promise<ExtTorrent | undefined>;
  addTorrent(params: AddTorrentParams): Promise<AddTorrentResult | null>;
  removeTorrents(ids: TorrentId[], deleteData?: boolean): Promise<void>;
  startTorrents(ids: TorrentId[]): Promise<void>;
  startTorrentsNow(ids: TorrentId[]): Promise<void>;
  stopTorrents(ids: TorrentId[]): Promise<void>;
  verifyTorrents(ids: TorrentId[]): Promise<void>;
  reannounceTorrents(ids: TorrentId[]): Promise<void>;
  setTorrent(ids: TorrentId[], params: SetTorrentParams): Promise<void>;
  setLocation(params: SetLocationParams): Promise<void>;
  queueMoveTop(ids: TorrentId[]): Promise<void>;
  queueMoveUp(ids: TorrentId[]): Promise<void>;
  queueMoveDown(ids: TorrentId[]): Promise<void>;
  queueMoveBottom(ids: TorrentId[]): Promise<void>;
  getSession(): Promise<Session>;
  setSession(params: Partial<Session>): Promise<void>;
  getPreferences(): Promise<Record<string, unknown>>;
  setPreferences(prefs: Record<string, unknown>): Promise<void>;
  getSessionStats(): Promise<SessionStats>;
  getFreeSpace(path: string): Promise<number>;
  ping(): Promise<void>;
}
