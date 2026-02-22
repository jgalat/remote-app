import type {
  TorrentId,
  TorrentListItem,
  TorrentInfoDetail,
  TorrentSettingsDetail,
  TorrentFilesDetail,
  TorrentPeersDetail,
  TorrentTrackersDetail,
  TorrentPiecesDetail,
  AddTorrentParams,
  AddTorrentResult,
  SetTorrentParams,
  SetLocationParams,
  Session,
  SessionStats,
} from "./types";

export interface TorrentClient {
  getTorrents(): Promise<TorrentListItem[]>;
  getTorrentInfo(id: TorrentId): Promise<TorrentInfoDetail | undefined>;
  getTorrentSettings(id: TorrentId): Promise<TorrentSettingsDetail | undefined>;
  getTorrentFiles(id: TorrentId): Promise<TorrentFilesDetail | undefined>;
  getTorrentPeers(id: TorrentId): Promise<TorrentPeersDetail | undefined>;
  getTorrentTrackers(id: TorrentId): Promise<TorrentTrackersDetail | undefined>;
  getTorrentPieces(id: TorrentId): Promise<TorrentPiecesDetail | undefined>;
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
  ping(): Promise<void>;
}
