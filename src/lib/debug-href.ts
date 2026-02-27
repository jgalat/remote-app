import { File, Paths } from "expo-file-system/next";

const RESPONSE_FILE = "debug-response.txt";

export type DebugParams = {
  url: string;
  username?: string;
  password?: string;
  errorName: string;
  errorMessage?: string;
  errorStatus?: number;
  errorBody?: string;
};

export function debugHref(p: DebugParams) {
  if (p.errorBody) {
    const file = new File(Paths.cache, RESPONSE_FILE);
    file.write(p.errorBody);
  }
  return {
    pathname: "/settings/debug" as const,
    params: {
      url: p.url,
      ...(p.username && { username: p.username }),
      ...(p.password && { password: p.password }),
      errorName: p.errorName,
      ...(p.errorMessage && { errorMessage: p.errorMessage }),
      ...(p.errorStatus != null && { errorStatus: String(p.errorStatus) }),
      ...(p.errorBody && { hasBody: "1" }),
    },
  };
}
