import type { ServersData } from "~/store/servers";

export function removeServersById(
  data: ServersData,
  ids: ReadonlySet<string>,
): ServersData {
  const servers = data.servers.filter((server) => !ids.has(server.id));
  const activeServerId =
    data.activeServerId && ids.has(data.activeServerId)
      ? servers[0]?.id
      : data.activeServerId;

  return { servers, activeServerId };
}
