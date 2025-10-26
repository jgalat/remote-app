import {
  ConfigPlugin,
  AndroidConfig,
  withAndroidManifest,
  withDangerousMod,
} from "@expo/config-plugins";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const NETWORK_SECURITY_XML = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config xmlns:tools="http://schemas.android.com/tools">
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="user" />
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>`;

const plugin: ConfigPlugin = (config) => {
  const { getMainApplicationOrThrow } = AndroidConfig.Manifest;
  const { getResourceFolderAsync } = AndroidConfig.Paths;

  withDangerousMod(config, [
    "android",
    async (config) => {
      const { projectRoot } = config.modRequest;
      const resourcePath = await getResourceFolderAsync(projectRoot);

      await mkdir(join(resourcePath, "/xml"), { recursive: true });

      await writeFile(
        join(resourcePath, "/xml/network_security_config.xml"),
        NETWORK_SECURITY_XML,
        "utf8"
      );

      return config;
    },
  ]);

  withAndroidManifest(config, (config) => {
    const app = getMainApplicationOrThrow(config.modResults);

    app.$["android:networkSecurityConfig"] = "@xml/network_security_config";

    return config;
  });

  return config;
};

export default plugin;
