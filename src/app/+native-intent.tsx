import { loadSettings, getActiveServer } from "~/store/settings";
import { normalize } from "~/utils/magnet";

export async function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}) {
  const settings = loadSettings();
  const server = getActiveServer(settings);

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

  if (initial && settings.authentication) {
    redirect = "/sign-in?href=" + encodeURIComponent(redirect);
  }

  return redirect;
}
