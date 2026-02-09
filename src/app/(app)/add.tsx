import * as React from "react";
import { StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ToastAndroid } from "react-native";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  SessionGetResponse,
  TorrentAddRequest,
} from "@remote-app/transmission-client";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import Text from "~/components/text";
import TextInput from "~/components/text-input";
import View from "~/components/view";
import Button from "~/components/button";
import Screen from "~/components/screen";
import { useTheme } from "~/hooks/use-theme-color";
import { useAddTorrent, useSession } from "~/hooks/use-transmission";
import Toggle from "~/components/toggle";
import FileInput from "~/components/file-input";

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
  session?: Required<SessionGetResponse>,
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

export default function AddTorrentScreen() {
  const router = useRouter();
  const { red, text } = useTheme();
  const { data: session } = useSession();
  const inset = useSafeAreaInsets();

  const { magnet, file } = useLocalSearchParams<{
    magnet?: string;
    file?: string;
  }>();

  const { control, handleSubmit, setValue, reset } = useForm({
    mode: "onSubmit",
    resolver: zodResolver(Form),
    values: values(session, magnet),
  });

  React.useEffect(() => {
    async function read() {
      if (!file) return;
      const dst = FileSystem.cacheDirectory + "shared.torrent";
      await FileSystem.copyAsync({
        from: file,
        to: dst,
      });
      const content = await FileSystem.readAsStringAsync(dst, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setValue("file", "file.torrent");
      setValue("content", content);
    }

    read();
  }, [file, setValue]);

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

        const options: Partial<TorrentAddRequest> = {
          ...(f.path ? { "download-dir": f.path } : {}),
          paused: !f.start,
        };

        let params: TorrentAddRequest | null = null;

        if (f.magnet) {
          params = { filename: f.magnet.trim(), ...options };
        } else if (f.file && f.content) {
          params = { metainfo: f.content, ...options };
        }

        if (params === null) {
          return;
        }

        await addTorrent.mutateAsync(params);
        router.dismissTo("/");
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
    [addTorrent, router]
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
                <TextInput
                  placeholder="/downloads"
                  icon="link"
                  style={[
                    styles.input,
                    fieldState.error ? { borderColor: red } : {},
                  ]}
                  value={field.value?.toString() || ""}
                  onChangeText={field.onChange}
                />
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
          onPress={() => router.dismissTo("/")}
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
  error: {
    fontSize: 12,
    textTransform: "lowercase",
    marginTop: 4,
  },
});
