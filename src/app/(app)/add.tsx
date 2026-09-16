import * as React from "react";
import { StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ToastAndroid } from "react-native";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import type { AddTorrentParams } from "~/client";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SheetManager } from "react-native-actions-sheet";
import { Feather } from "@expo/vector-icons";

import TextInput from "~/components/text-input";
import View from "~/components/view";
import Pressable from "~/components/pressable";
import Button from "~/components/button";
import Screen from "~/components/screen";
import TorrentDestination, {
  torrentDestinationDescription,
  torrentDestinationName,
} from "~/components/torrent-destination";
import { useTheme } from "~/hooks/use-theme-color";
import {
  useDirectoryFreeSpace,
  useServerAddTorrent,
  useServerSession,
} from "~/hooks/torrent";
import {
  useActiveServerId,
  useDirectories,
  useServers,
} from "~/hooks/use-settings";
import Toggle from "~/components/toggle";
import FileInput from "~/components/file-input";
import type { SelectOption } from "~/sheets/select";
import { SELECT_SHEET_ID } from "~/sheets/ids";
import SendIntent from "~/native/send-intent";
import {
  SettingsFieldRow,
  SettingsInlineGroup,
} from "~/components/settings";
import { formatAvailableSpace } from "~/utils/free-space";

type Form = z.infer<typeof Form>;
const Form = z
  .object({
    magnet: z.string().optional(),
    file: z.string().optional(),
    content: z.string().optional(),
    path: z.string().optional(),
    start: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.magnet && !data.file) {
      ctx.addIssue({
        path: ["magnet"],
        code: z.ZodIssueCode.custom,
        message: "either magnet or file is required",
      });
      ctx.addIssue({
        path: ["file"],
        code: z.ZodIssueCode.custom,
        message: "either magnet or file is required",
      });
    }
  });

async function readSharedTorrent(filePath: string): Promise<{ name: string; content: string }> {
  const name = SendIntent.getDisplayName(filePath) ?? "file.torrent";
  try {
    const content = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return { name, content };
  } finally {
    SendIntent.cleanupSharedFile(filePath);
  }
}

export default function AddTorrentScreen() {
  const router = useRouter();
  const { red, text, gray, lightGray, background } = useTheme();
  const servers = useServers();
  const activeServerId = useActiveServerId();

  const { magnet, file, intent, serverId } = useLocalSearchParams<{
    magnet?: string;
    file?: string;
    intent?: string;
    serverId?: string;
  }>();

  const initialDestinationId =
    servers.find((server) => server.id === serverId)?.id ??
    servers.find((server) => server.id === activeServerId)?.id ??
    servers[0]?.id;
  const [destinationId, setDestinationId] =
    React.useState(initialDestinationId);
  const destination = servers.find((server) => server.id === destinationId);
  const isLocal = destination?.type === "local";
  const directories = useDirectories(destinationId);
  const { data: session } = useServerSession(destination);
  const defaultDir = session?.["download-dir"];
  const downloadDirectories = React.useMemo(
    () => [...new Set([...(defaultDir ? [defaultDir] : []), ...directories])],
    [defaultDir, directories],
  );
  const { load: loadDirectoryFreeSpace } = useDirectoryFreeSpace(
    destination,
    downloadDirectories,
    defaultDir,
    { enabled: false },
  );

  React.useEffect(() => {
    if (destination) return;
    setDestinationId(initialDestinationId);
  }, [destination, initialDestinationId]);

  const goBack = React.useCallback(() => {
    if (intent) {
      router.dismissTo("/");
    } else {
      router.back();
    }
  }, [intent, router]);

  const sharedTorrent = useQuery({
    queryKey: ["add-torrent", "shared-file", file],
    queryFn: async () => readSharedTorrent(file!),
    enabled: Boolean(file),
    staleTime: Infinity,
  });

  const { control, handleSubmit, setValue, getValues } = useForm({
    mode: "onSubmit",
    resolver: zodResolver(Form),
    defaultValues: {
      magnet,
      file: undefined,
      content: undefined,
      path: undefined,
      start: true,
    },
  });

  React.useEffect(() => {
    setValue("path", undefined);
  }, [destinationId, setValue]);

  React.useEffect(() => {
    if (!session || getValues("path")) return;
    setValue("path", isLocal ? undefined : session["download-dir"]);
  }, [getValues, isLocal, session, setValue]);

  React.useEffect(() => {
    if (!sharedTorrent.data) return;
    setValue("file", sharedTorrent.data.name);
    setValue("content", sharedTorrent.data.content);
    setValue("magnet", "");
  }, [setValue, sharedTorrent.data]);

  React.useEffect(() => {
    if (!sharedTorrent.error) return;
    const message =
      sharedTorrent.error instanceof Error
        ? sharedTorrent.error.message
        : "Unknown error";
    ToastAndroid.show(`Failed to read shared file: ${message}`, ToastAndroid.SHORT);
  }, [sharedTorrent.error]);

  const onPickDestination = React.useCallback(() => {
    if (servers.length < 2) return;

    const options: SelectOption[] = servers.map((server) => ({
      id: server.id,
      label: torrentDestinationName(server),
      description: torrentDestinationDescription(server),
      left: server.type === "local" ? "hard-drive" : "server",
      right: server.id === destinationId ? "check" : undefined,
      value: server.id,
    }));

    SheetManager.show(SELECT_SHEET_ID, {
      payload: {
        options,
        onSelect: (value) => setDestinationId(String(value)),
      },
    });
  }, [destinationId, servers]);

  const onPickDirectory = React.useCallback(async () => {
    if (downloadDirectories.length === 0) return;

    const freeSpace = await loadDirectoryFreeSpace();
    const options: SelectOption[] = downloadDirectories.map((dir) => {
      const state = freeSpace[dir];
      const description =
        state?.status === "available"
          ? formatAvailableSpace(state.bytes)
          : state?.status === "unavailable"
            ? "space unavailable"
            : undefined;

      return {
        label: dir,
        description,
        value: dir,
        left: "folder" as const,
      };
    });

    SheetManager.show(SELECT_SHEET_ID, {
      payload: {
        title: "Select directory",
        options,
        onSelect: (value) => setValue("path", String(value)),
      },
    });
  }, [downloadDirectories, loadDirectoryFreeSpace, setValue]);

  const addTorrent = useServerAddTorrent(destination);

  const onPickDocument = React.useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/x-bittorrent",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        return;
      }

      const [file] = result.assets;

      const content = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setValue("file", file.name);
      setValue("content", content);
      setValue("magnet", "");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      ToastAndroid.show(`Failed to read file: ${message}`, ToastAndroid.SHORT);
    }
  }, [setValue]);

  const onSubmit = React.useCallback(
    async (f: Form) => {
      try {
        if (!f.magnet && !f.file && !f.content) {
          return;
        }

        // Remote servers (Transmission/qBittorrent) need a real path; local
        // doesn't render the path field because its destination is fixed.
        const trimmedPath = (f.path ?? "").trim();
        if (!isLocal && trimmedPath.length === 0) {
          ToastAndroid.show("path is required", ToastAndroid.SHORT);
          return;
        }

        const options: Partial<AddTorrentParams> = {
          ...(trimmedPath ? { "download-dir": trimmedPath } : {}),
          paused: !f.start,
        };

        let params: AddTorrentParams | null = null;

        if (f.magnet) {
          params = { filename: f.magnet.trim(), ...options };
        } else if (f.file && f.content) {
          params = { metainfo: f.content, ...options };
        }

        if (params === null) {
          return;
        }

        await addTorrent.mutateAsync(params);
        goBack();
      } catch (e) {
        let message = "Something went wrong";
        if (e instanceof Error) {
          message = e.message;
        }
        ToastAndroid.show(
          `Failed to add torrent: ${message}`,
          ToastAndroid.SHORT
        );
      }
    },
    [addTorrent, goBack, isLocal]
  );

  return (
    <Screen>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        bottomOffset={8}
        showsVerticalScrollIndicator={false}
      >
        {destination ? (
          <SettingsFieldRow label="Destination">
            <TorrentDestination
              server={destination}
              selectable={servers.length > 1}
              onPress={onPickDestination}
            />
          </SettingsFieldRow>
        ) : null}

        <Controller
          name="magnet"
          control={control}
          render={({ field, fieldState }) => (
            <SettingsFieldRow
              label="Torrent URL"
              error={fieldState.error?.message}
              reserveErrorSpace
            >
              <TextInput
                variant="settings"
                placeholder="magnet:… or https://…"
                icon="link"
                style={fieldState.error ? { borderColor: red } : undefined}
                value={field.value?.toString() || ""}
                onChangeText={(v) => {
                  setValue("file", undefined);
                  setValue("content", undefined);
                  field.onChange(v);
                }}
              />
            </SettingsFieldRow>
          )}
        />

        <Controller
          name="file"
          control={control}
          render={({ field, fieldState }) => (
            <SettingsFieldRow
              label="Torrent file"
              error={fieldState.error?.message}
              reserveErrorSpace
            >
              <FileInput
                variant="settings"
                title={
                  field.value && field.value.length > 24
                    ? field.value.slice(0, 24) + "..."
                    : field.value || "or select a .torrent file"
                }
                style={fieldState.error ? { borderColor: red } : undefined}
                titleStyle={field.value ? { color: text } : undefined}
                onPress={onPickDocument}
              />
            </SettingsFieldRow>
          )}
        />

        {!isLocal && (
          <Controller
            name="path"
            control={control}
            render={({ field, fieldState }) => (
              <SettingsFieldRow
                label="Download path"
                error={fieldState.error?.message}
                reserveErrorSpace
              >
                <SettingsInlineGroup>
                  <TextInput
                    variant="settings"
                    placeholder="/downloads"
                    icon="folder"
                    style={fieldState.error ? { borderColor: red } : undefined}
                    containerStyle={{ flex: 1 }}
                    value={field.value?.toString() || ""}
                    onChangeText={field.onChange}
                  />
                  <Pressable
                    style={[
                      styles.pickButton,
                      {
                        borderColor: lightGray,
                        backgroundColor: background,
                      },
                    ]}
                    onPress={onPickDirectory}
                  >
                    <Feather name="book" size={16} color={gray} />
                  </Pressable>
                </SettingsInlineGroup>
              </SettingsFieldRow>
            )}
          />
        )}

        <SettingsFieldRow>
          <Controller
            name="start"
            control={control}
            render={({ field }) => (
              <Toggle
                variant="settings"
                label="Start automatically"
                description="Begin downloading immediately after adding."
                value={field.value}
                onPress={field.onChange}
              />
            )}
          />
        </SettingsFieldRow>

      </KeyboardAwareScrollView>

      <View style={styles.footer}>
        <Button
          title="add"
          disabled={!destination || addTorrent.isPending}
          onPress={handleSubmit(onSubmit)}
        />
        <Button
          title="cancel"
          variant="outline"
          onPress={goBack}
          style={{ marginTop: 8 }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pickButton: {
    height: 44,
    width: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    paddingVertical: 16,
  },
});
