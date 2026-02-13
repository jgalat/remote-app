import "~/store/migrations";
import { loadServers, getActiveServer } from "~/store/servers";
import { loadPreferences } from "~/store/preferences";
import { normalize } from "~/utils/magnet";

export async function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}) {
  const serversData = loadServers();
  const server = getActiveServer(serversData);

  if (!server) {
    return path;
  }

  let redirect = "/";

  switch (true) {
    case path.startsWith("magnet:"):
      path = normalize(path);
      redirect = "/add?magnet=" + encodeURIComponent(path);
      break;
    case path.startsWith("file:") || path.startsWith("content:"):
      redirect = "/add?file=" + encodeURIComponent(path);
      break;
  }

  if (initial && loadPreferences().authentication) {
    redirect = "/sign-in?href=" + encodeURIComponent(redirect);
  }

  return redirect;
}
