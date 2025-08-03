import { loadSettings } from "~/store/settings";

export async function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}) {
  const { server, authentication } = loadSettings();

  if (!server) {
    return path;
  }

  let redirect = "/";

  switch (true) {
    case path.startsWith("magnet:"):
      redirect = "/add?magnet=" + encodeURIComponent(path);
      break;
    case path.startsWith("file:") || path.startsWith("content:"):
      redirect = "/add?file=" + encodeURIComponent(path);
      break;
  }

  if (initial && authentication) {
    redirect = "/sign-in?href=" + encodeURIComponent(redirect);
  }

  return redirect;
}
