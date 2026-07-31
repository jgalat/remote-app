import type { ServerType } from "~/store/settings";
import { typeDefaults } from "~/utils/server-connection-defaults";

export type ServerAddress = {
  host: string;
  port: number;
  path: string;
  useSSL: boolean;
};

export function parseServerAddress(
  input: string,
  type: ServerType,
): ServerAddress {
  try {
    const url = new URL(input);
    return {
      host: url.hostname,
      port: url.port ? Number(url.port) : url.protocol === "https:" ? 443 : 80,
      path: type === "qbittorrent" && url.pathname === "/" ? "" : url.pathname,
      useSSL: url.protocol === "https:",
    };
  } catch {
    const defaults = typeDefaults[type];
    const raw = input.trim();
    const withoutProtocol = raw.replace(
      /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//,
      "",
    );
    const slashIndex = withoutProtocol.indexOf("/");
    const hostPort =
      slashIndex >= 0 ? withoutProtocol.slice(0, slashIndex) : withoutProtocol;
    const rawPath = slashIndex >= 0 ? withoutProtocol.slice(slashIndex) : "";
    const [host, rawPort] = hostPort.split(":");
    const parsedPort = rawPort ? Number(rawPort) : NaN;
    const path = rawPath && rawPath !== "/" ? rawPath : defaults.path;

    return {
      host: host || raw,
      port: Number.isFinite(parsedPort) ? parsedPort : defaults.port,
      path,
      useSSL: raw.startsWith("https://"),
    };
  }
}

export function renderServerAddress(address: ServerAddress): string {
  const protocol = address.useSSL ? "https" : "http";
  const port =
    (address.useSSL && address.port === 443) ||
    (!address.useSSL && address.port === 80)
      ? ""
      : `:${address.port}`;
  const pathInput = address.path.trim();
  const path = pathInput
    ? pathInput.startsWith("/")
      ? pathInput
      : `/${pathInput}`
    : "";

  return `${protocol}://${address.host.trim()}${port}${path}`;
}

export function comparableServerAddress(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

export function displayServerAddress(url: string): string {
  try {
    const parsed = new URL(url);
    const port = parsed.port ? `:${parsed.port}` : "";
    const path = parsed.pathname === "/" ? "" : parsed.pathname;
    return `${parsed.hostname}${port}${path}`;
  } catch {
    return url;
  }
}

export function promoteServerAddress(
  primaryUrl: string,
  alternativeUrls: string[],
  index: number,
): { url: string; alternativeUrls: string[] } | undefined {
  const url = alternativeUrls[index];
  if (!url) return undefined;

  return {
    url,
    alternativeUrls: [
      primaryUrl,
      ...alternativeUrls.filter((_item, itemIndex) => itemIndex !== index),
    ],
  };
}
