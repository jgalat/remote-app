import { requireNativeModule } from "expo-modules-core";

export default requireNativeModule<{
  getDisplayName(uri: string): string | null;
  cleanupSharedFile(uri: string): boolean;
}>("SendIntent");
