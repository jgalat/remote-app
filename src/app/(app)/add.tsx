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
import type { Session, AddTorrentParams } from "~/client";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SheetManager } from "react-native-actions-sheet";
import { Feather } from "@expo/vector-icons";

import TextInput from "~/components/text-input";
import View from "~/components/view";
import Pressable from "~/components/pressable";
import Button from "~/components/button";
import Screen from "~/components/screen";
import { useTheme } from "~/hooks/use-theme-color";
import { useAddTorrent, useSession } from "~/hooks/torrent";
import { useActiveServerId, useDirectories } from "~/hooks/use-settings";
import Toggle from "~/components/toggle";
import FileInput from "~/components/file-input";
import type { SelectOption } from "~/sheets/select";
import { SELECT_SHEET_ID } from "~/sheets/ids";
import SendIntent from "~/native/send-intent";
import {
  SettingsFieldRow,
  SettingsInlineGroup,
} from "~/components/settings";

type Form = z.infer<typeof Form>;
const Form = z
  .object({
    magnet: z.string().optional(),
    file: z.string().optional(),
    content: z.string().optional(),
    path: z
      .string()
      .min(1, "path cannot be empty")
      .regex(
        /^([a-zA-Z]:\\|\/)([^<>:"|?*\n\r]+(\/|\\)?)*$/,
        "invalid path format"
      ),
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

function values(
  session?: Session,
  magnet?: string
): Form | undefined {
  if (!session) {
    return undefined;
  }
  return {
    magnet: magnet,
    path: session["download-dir"],
    start: true,
  };
}

async function readSharedTorrent(filePath: string): Promise<{ name: string; content: string }> {
  const dst = FileSystem.cacheDirectory + "shared.torrent";
  await FileSystem.copyAsync({
    from: filePath,
    to: dst,
  });
  const content = await FileSystem.readAsStringAsync(dst, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const name = SendIntent.getDisplayName(filePath) ?? "file.torrent";
  return { name, content };
}

export default function AddTorrentScreen() {
  const router = useRouter();
  const { red, text, gray, lightGray, background } = useTheme();
  const { data: session } = useSession();
  const serverId = useActiveServerId();
  const directories = useDirectories(serverId);

  const { magnet, file, intent } = useLocalSearchParams<{
    magnet?: string;
    file?: string;
    intent?: string;
  }>();

  const goBack = React.useCallback(() => {
    if (intent) {
      router.dismissTo("/");
    } else {
      router.back();
    }
  }, [intent, router]);

  const { control, handleSubmit, setValue, reset } = useForm({
    mode: "onSubmit",
    resolver: zodResolver(Form),
    values: values(session, magnet),
  });

  const sharedTorrent = useQuery({
    queryKey: ["add-torrent", "shared-file", file],
    queryFn: async () => readSharedTorrent(file!),
    enabled: Boolean(file),
    staleTime: Infinity,
  });

  React.useEffect(() => {
    if (!sharedTorrent.data) return;
    setValue("file", sharedTorrent.data.name);
    setValue("content", sharedTorrent.data.content);
  }, [sharedTorrent.data, setValue]);

  React.useEffect(() => {
    if (!sharedTorrent.error) return;
    const message =
      sharedTorrent.error instanceof Error
        ? sharedTorrent.error.message
        : "Unknown error";
    ToastAndroid.show(`Failed to read shared file: ${message}`, ToastAndroid.SHORT);
  }, [sharedTorrent.error]);

  const onPickDirectory = React.useCallback(() => {
    const defaultDir = session?.["download-dir"];
    const allDirs = [
      ...(defaultDir ? [defaultDir] : []),
      ...directories,
    ];
    const unique = [...new Set(allDirs)];
    if (unique.length === 0) return;

    const options: SelectOption[] = unique.map((dir) => ({
      label: dir,
      value: dir,
      left: "folder" as const,
    }));

    SheetManager.show(SELECT_SHEET_ID, {
      payload: {
        title: "Select directory",
        options,
        onSelect: (value) => setValue("path", String(value)),
      },
    });
  }, [session, directories, setValue]);

  const addTorrent = useAddTorrent();

  const onPickDocument = React.useCallback(async () => {
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

    reset();
    setValue("file", file.name);
    setValue("content", content);
    setValue("magnet", "");
  }, [setValue, reset]);

  const onSubmit = React.useCallback(
    async (f: Form) => {
      try {
        if (!f.magnet && !f.file && !f.content) {
          return;
        }

        const options: Partial<AddTorrentParams> = {
          ...(f.path ? { "download-dir": f.path } : {}),
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
    [addTorrent, goBack]
  );

  return (
    <Screen>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        bottomOffset={8}
        showsVerticalScrollIndicator={false}
      >
        <Controller
          name="magnet"
          control={control}
          render={({ field, fieldState }) => (
            <SettingsFieldRow
              label="Magnet link"
              error={fieldState.error?.message}
              reserveErrorSpace
            >
              <TextInput
                variant="settings"
                placeholder="magnet:?xt=urn:btih:..."
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
          title="add torrent"
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
