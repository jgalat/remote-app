export function normalize(uri: string) {
  uri = uri.trim();
  uri = uri.replace(/^magnet:\/*\?+/, "magnet:?");
  return uri;
}
