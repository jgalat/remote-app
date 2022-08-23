export type MagnetData = {
  name?: string;
};

export function parseMagnet(uri: string): MagnetData {
  const toks = uri.split("&");
  const dn = toks.find((token) => token.startsWith("dn="));
  const parts = dn?.split("=");
  if (!parts || parts.length !== 2) {
    return {};
  }

  const name = decodeURIComponent(parts[1]).replace(/\+/g, " ");
  return { name };
}
