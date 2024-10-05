import { AuthContext } from "~/contexts/auth";
import useNonNullContext from "./use-non-null-context";

export default function useAuth() {
  return useNonNullContext(AuthContext)
}
