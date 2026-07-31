import { z } from "zod";

const ServerTypeSchema = z.enum(["transmission", "qbittorrent", "local"]);
export type ServerType = z.infer<typeof ServerTypeSchema>;

function comparableUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function normalizeAlternativeUrls(
  primaryUrl: string,
  alternativeUrls: string[] | undefined,
  fallbackUrl: string | undefined,
): string[] {
  const seen = new Set([comparableUrl(primaryUrl)]);
  const urls = [...(alternativeUrls ?? []), ...(fallbackUrl ? [fallbackUrl] : [])];

  return urls.filter((url) => {
    const value = comparableUrl(url);
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

export const ServerSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    type: ServerTypeSchema.default("transmission"),
    username: z.string().optional(),
    password: z.string().optional(),
    alternativeUrls: z.array(z.string()).optional(),
    fallbackUrl: z.string().optional(),
    connectionTimeoutMs: z.number().int().min(1_000).max(120_000).optional(),
    createdAt: z.number(),
    updatedAt: z.number(),
  })
  .transform(({ fallbackUrl, alternativeUrls, ...server }) => ({
    ...server,
    alternativeUrls: normalizeAlternativeUrls(
      server.url,
      alternativeUrls,
      fallbackUrl,
    ),
  }));

export type Server = z.output<typeof ServerSchema>;

export const ServersSchema = z.object({
  servers: z.array(ServerSchema),
  activeServerId: z.string().optional(),
});

export type ServersData = z.output<typeof ServersSchema>;
