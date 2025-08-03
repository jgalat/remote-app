import { loadSettings } from "~/store/settings";

export async function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}) {
  const { server, authentication } = loadSettings();

  let redirect = "/";

  if (!server) {
    return redirect;
  }

  switch (true) {
    case path.startsWith("magnet:"):
      redirect = "/add?magnet=" + encodeURIComponent(path);
      break;
    case path.startsWith("file:"):
      redirect = "/add?magnet=" + encodeURIComponent(path);
      break;
  }

  if (initial && authentication) {
    redirect = "/sign-in?href=" + encodeURIComponent(redirect);
  }

  return redirect;
}
