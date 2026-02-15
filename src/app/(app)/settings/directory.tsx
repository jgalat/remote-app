import * as React from "react";
import { StyleSheet, ToastAndroid } from "react-native";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Text from "~/components/text";
import View from "~/components/view";
import TextInput from "~/components/text-input";
import Button from "~/components/button";
import Toggle from "~/components/toggle";
import Screen from "~/components/screen";
import ActionIcon from "~/components/action-icon";
import Required from "~/components/required";
import {
  useServers,
  useDirectoriesStore,
} from "~/hooks/use-settings";
import { useServerSessionSet } from "~/hooks/transmission";
import { useTheme } from "~/hooks/use-theme-color";
import { usePro } from "@remote-app/pro";
import { useTranslation } from "react-i18next";

type Form = z.infer<typeof Form>;
const Form = z.object({
  path: z
    .string()
    .min(1, "validation_path_empty")
    .regex(
      /^([a-zA-Z]:\\|\/)([^<>:"|?*\n\r]+(\/|\\)?)*$/,
      "validation_path_format"
    ),
  global: z.boolean(),
});

export default function DirectoryScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { red } = useTheme();
  const inset = useSafeAreaInsets();
  const { t } = useTranslation();

  const { serverId, path: initialPath, isDefault } = useLocalSearchParams<{
    serverId: string;
    path?: string;
    isDefault?: string;
  }>();

  const servers = useServers();
  const server = servers.find((s) => s.id === serverId);
  const { mutate: setSession } = useServerSessionSet(server);
  const { directories, store } = useDirectoriesStore();

  const { canUse } = usePro();
  const showGlobal = !isDefault && canUse("multi-server");

  const isDefaultDir = isDefault === "true";
  const isNew = !initialPath;

  const existingIsGlobal = !isNew && !isDefaultDir
    ? directories.global.includes(initialPath)
    : false;

  const { control, handleSubmit } = useForm({
    mode: "onSubmit",
    resolver: zodResolver(Form),
    defaultValues: {
      path: initialPath ?? "/",
      global: existingIsGlobal,
    },
  });

  const onDelete = React.useCallback(() => {
    if (!serverId || !initialPath) return;

    const serverDirs = directories.servers[serverId] ?? [];
    store({
      global: directories.global.filter((d) => d !== initialPath),
      servers: {
        ...directories.servers,
        [serverId]: serverDirs.filter((d) => d !== initialPath),
      },
    });

    router.back();
  }, [serverId, initialPath, directories, store, router]);

  React.useEffect(() => {
    if (isDefaultDir || isNew) return;

    navigation.setOptions({
      headerRight: () => (
        <ActionIcon onPress={onDelete} name="trash-2" color={red} />
      ),
    });
  }, [isDefaultDir, isNew, onDelete, navigation, red]);

  const onSubmit = React.useCallback(
    (f: Form) => {
      const trimmed = f.path.trim();

      if (isDefaultDir) {
        setSession(
          { "download-dir": trimmed },
          {
            onSuccess: () => {
              ToastAndroid.show(t("default_dir_updated"), ToastAndroid.SHORT);
              router.back();
            },
            onError: () => {
              ToastAndroid.show(t("failed_to_update"), ToastAndroid.SHORT);
            },
          }
        );
        return;
      }

      const serverDirs = directories.servers[serverId] ?? [];

      if (isNew) {
        if (f.global) {
          if (!directories.global.includes(trimmed)) {
            store({ global: [...directories.global, trimmed] });
          }
        } else {
          if (!serverDirs.includes(trimmed)) {
            store({
              servers: {
                ...directories.servers,
                [serverId]: [...serverDirs, trimmed],
              },
            });
          }
        }
        router.back();
        return;
      }

      const newGlobal = directories.global.filter((d) => d !== initialPath);
      const newServerDirs = serverDirs.filter((d) => d !== initialPath);

      if (f.global) {
        if (!newGlobal.includes(trimmed)) newGlobal.push(trimmed);
      } else {
        if (!newServerDirs.includes(trimmed)) newServerDirs.push(trimmed);
      }

      store({
        global: newGlobal,
        servers: {
          ...directories.servers,
          [serverId]: newServerDirs,
        },
      });

      router.back();
    },
    [isDefaultDir, isNew, serverId, initialPath, directories, store, setSession, router, t]
  );

  if (!server) {
    return (
      <Screen>
        <Text>{t("server_not_found")}</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        bottomOffset={8}
        contentInset={{ bottom: inset.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.row}>
          <Text style={styles.label}>
            {t("path")} <Required />
          </Text>
          <Controller
            name="path"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <TextInput
                  placeholder="/downloads"
                  icon="folder"
                  value={field.value}
                  onChangeText={field.onChange}
                  style={fieldState.error ? { borderColor: red } : {}}
                />
                <Text style={[styles.error, { color: red }]}>
                  {fieldState.error?.message && t(fieldState.error.message)}
                </Text>
              </>
            )}
          />
        </View>

        {showGlobal && (
          <View style={styles.row}>
            <Controller
              name="global"
              control={control}
              render={({ field }) => (
                <Toggle
                  label={t("global_directory")}
                  description={t("shared_across_servers")}
                  value={field.value}
                  onPress={field.onChange}
                />
              )}
            />
          </View>
        )}

        <Button
          title={t("save")}
          onPress={handleSubmit(onSubmit)}
        />
      </KeyboardAwareScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  error: {
    fontSize: 12,
    textTransform: "lowercase",
    marginTop: 4,
  },
});
