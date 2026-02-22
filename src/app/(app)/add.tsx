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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SheetManager } from "react-native-actions-sheet";
import { Feather } from "@expo/vector-icons";

import Text from "~/components/text";
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
import SelectSheet from "~/sheets/select";
import type { SelectOption } from "~/sheets/select";
import SendIntent from "~/native/send-intent";

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
  const { red, text } = useTheme();
  const { data: session } = useSession();
  const inset = useSafeAreaInsets();
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

    SheetManager.show(SelectSheet.sheetId, {
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
        contentInset={{ bottom: inset.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.row}>
          <Text style={styles.label}>MAGNET LINK</Text>
          <Controller
            name="magnet"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <TextInput
                  placeholder="magnet:?xt=urn:btih:..."
                  icon="link"
                  style={[
                    styles.input,
                    fieldState.error ? { borderColor: red } : {},
                  ]}
                  value={field.value?.toString() || ""}
                  onChangeText={(v) => {
                    setValue("file", undefined);
                    setValue("content", undefined);
                    field.onChange(v);
                  }}
                />
                <Text style={[styles.error, { color: red }]}>
                  {fieldState.error?.message}
                </Text>
              </>
            )}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>TORRENT FILE</Text>
          <Controller
            name="file"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <FileInput
                  title={
                    field.value && field.value.length > 24
                      ? field.value.slice(0, 24) + "..."
                      : field.value || "or select a .torrent file"
                  }
                  style={fieldState.error ? { borderColor: red } : {}}
                  titleStyle={field.value ? { color: text } : {}}
                  onPress={onPickDocument}
                />
                <Text style={[styles.error, { color: red }]}>
                  {fieldState.error?.message}
                </Text>
              </>
            )}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>DOWNLOAD PATH</Text>
          <Controller
            name="path"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <View style={styles.pathRow}>
                  <TextInput
                    placeholder="/downloads"
                    icon="folder"
                    style={[
                      styles.input,
                      fieldState.error ? { borderColor: red } : {},
                    ]}
                    containerStyle={{ flex: 1 }}
                    value={field.value?.toString() || ""}
                    onChangeText={field.onChange}
                  />
                  <Pressable style={styles.pickButton} onPress={onPickDirectory}>
                    <Feather name="book" size={20} color={text} />
                  </Pressable>
                </View>
                <Text style={[styles.error, { color: red }]}>
                  {fieldState.error?.message}
                </Text>
              </>
            )}
          />
        </View>

        <View style={[styles.row]}>
          <Controller
            name="start"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <Toggle
                  label="START AUTOMATICALLY"
                  description="Begin download immediately"
                  value={field.value}
                  onPress={field.onChange}
                />
                <Text style={[styles.error, { color: red }]}>
                  {fieldState.error?.message}
                </Text>
              </>
            )}
          />
        </View>

        <Button
          title="add torrent"
          onPress={handleSubmit(onSubmit)}
          style={{ marginTop: 8, marginBottom: 8 }}
        />

        <Button
          title="cancel"
          variant="outline"
          onPress={goBack}
        />
      </KeyboardAwareScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  free: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 16,
  },
  row: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  input: {},
  pathRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pickButton: {
    height: 48,
    width: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    fontSize: 12,
    textTransform: "lowercase",
    marginTop: 4,
  },
});
