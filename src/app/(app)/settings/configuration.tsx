import * as React from "react";
import { StyleSheet, ToastAndroid } from "react-native";
import { z } from "zod";
import { Feather } from "@expo/vector-icons";
import { SheetManager } from "react-native-actions-sheet";

import Toggle from "~/components/toggle";
import Text from "~/components/text";
import View from "~/components/view";
import Pressable from "~/components/pressable";
import Screen from "~/components/screen";
import TextInput from "~/components/text-input";
import {
  NetworkErrorScreen,
  LoadingScreen,
} from "~/components/utility-screens";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "~/hooks/use-theme-color";
import { useServers, useActiveServerId } from "~/hooks/use-settings";
import { useServerSession, useServerSessionSet } from "~/hooks/transmission";
import SelectSheet from "~/sheets/select";
import type { SelectOption } from "~/sheets/select";
import type { Server } from "~/store/settings";

type Form = z.infer<typeof Form>;
const Form = z
  .object({
    "speed-limit-down-enabled": z.boolean(),
    "speed-limit-down": z.coerce.number({ message: "Expected a number" }),
    "speed-limit-up-enabled": z.boolean(),
    "speed-limit-up": z.coerce.number({ message: "Expected a number" }),
    "alt-speed-enabled": z.boolean(),
    "alt-speed-down": z.coerce.number({ message: "Expected a number" }),
    "alt-speed-up": z.coerce.number({ message: "Expected a number" }),

    "seedRatioLimited": z.boolean(),
    "seedRatioLimit": z.coerce.number({ message: "Expected a number" }),

    "idle-seeding-limit-enabled": z.boolean(),
    "idle-seeding-limit": z.coerce.number({ message: "Expected a number" }),

    "download-queue-enabled": z.boolean(),
    "download-queue-size": z.coerce.number({ message: "Expected a number" }),
    "seed-queue-enabled": z.boolean(),
    "seed-queue-size": z.coerce.number({ message: "Expected a number" }),

    "dht-enabled": z.boolean(),
    "lpd-enabled": z.boolean(),
    "pex-enabled": z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data["speed-limit-down-enabled"] && !data["speed-limit-down"]) {
      ctx.addIssue({
        path: ["speed-limit-down"],
        code: z.ZodIssueCode.custom,
        message: "Field is required",
      });
    }
    if (data["speed-limit-up-enabled"] && !data["speed-limit-up"]) {
      ctx.addIssue({
        path: ["speed-limit-up"],
        code: z.ZodIssueCode.custom,
        message: "Field is required",
      });
    }
    if (data["seedRatioLimited"] && !data["seedRatioLimit"]) {
      ctx.addIssue({
        path: ["seedRatioLimit"],
        code: z.ZodIssueCode.custom,
        message: "Field is required",
      });
    }
    if (data["idle-seeding-limit-enabled"] && !data["idle-seeding-limit"]) {
      ctx.addIssue({
        path: ["idle-seeding-limit"],
        code: z.ZodIssueCode.custom,
        message: "Field is required",
      });
    }
    if (data["download-queue-enabled"] && !data["download-queue-size"]) {
      ctx.addIssue({
        path: ["download-queue-size"],
        code: z.ZodIssueCode.custom,
        message: "Field is required",
      });
    }
    if (data["seed-queue-enabled"] && !data["seed-queue-size"]) {
      ctx.addIssue({
        path: ["seed-queue-size"],
        code: z.ZodIssueCode.custom,
        message: "Field is required",
      });
    }
  });

function ConfigurationForm({ server }: { server: Server }) {
  const { data: session, isLoading, error, refetch } = useServerSession(server);
  const { mutate } = useServerSessionSet(server);
  const { red } = useTheme();
  const inset = useSafeAreaInsets();

  const { control, handleSubmit, watch } = useForm({
    mode: "onBlur",
    resolver: zodResolver(Form),
    values: session,
  });

  const onSubmit = handleSubmit(
    React.useCallback(
      (f: Form) => {
        mutate(f, {
          onSuccess: () => {
            ToastAndroid.show(
              "Server updated successfully",
              ToastAndroid.SHORT
            );
          },
          onError: () => {
            ToastAndroid.show("Failed to update server", ToastAndroid.SHORT);
          },
        });
      },
      [mutate]
    )
  );

  if (error) {
    return <NetworkErrorScreen error={error} refetch={refetch} />;
  }

  if (isLoading || !session) {
    return <LoadingScreen />;
  }

  return (
    <Screen>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        bottomOffset={8}
        contentInset={{ bottom: inset.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { marginTop: 0 }]}>Speed limits</Text>

        <View style={styles.row}>
          <View style={styles.label}>
            <Controller
              name="speed-limit-down-enabled"
              control={control}
              render={({ field }) => (
                <Toggle
                  value={field.value}
                  onPress={(v) => {
                    field.onChange(v);
                    onSubmit();
                  }}
                  label="DOWNLOAD (KB/S)"
                />
              )}
            />
          </View>
          <Controller
            name="speed-limit-down"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <TextInput
                  keyboardType="numeric"
                  editable={watch("speed-limit-down-enabled")}
                  value={field.value?.toString() || ""}
                  onChangeText={field.onChange}
                  style={[fieldState.error ? { borderColor: red } : {}]}
                  onEndEditing={onSubmit}
                />
                <Text style={[styles.error, { color: red }]}>
                  {fieldState.error?.message}
                </Text>
              </>
            )}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.label}>
            <Controller
              name="speed-limit-up-enabled"
              control={control}
              render={({ field }) => (
                <Toggle
                  value={field.value}
                  onPress={(v) => {
                    field.onChange(v);
                    onSubmit();
                  }}
                  label="UPLOAD (KB/S)"
                />
              )}
            />
          </View>
          <Controller
            name="speed-limit-up"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <TextInput
                  keyboardType="numeric"
                  editable={watch("speed-limit-up-enabled")}
                  value={field.value?.toString() || ""}
                  onChangeText={field.onChange}
                  style={[fieldState.error ? { borderColor: red } : {}]}
                  onEndEditing={onSubmit}
                />
                <Text style={[styles.error, { color: red }]}>
                  {fieldState.error?.message}
                </Text>
              </>
            )}
          />
        </View>

        <Text style={styles.title}>Alternative speed limits</Text>

        <View style={styles.row}>
          <Controller
            name="alt-speed-enabled"
            control={control}
            render={({ field }) => (
              <Toggle
                value={field.value}
                onPress={(v) => {
                  field.onChange(v);
                  onSubmit();
                }}
                label="Enable alternative speed limits"
              />
            )}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Download (kB/s)</Text>
          <Controller
            name="alt-speed-down"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <TextInput
                  keyboardType="numeric"
                  value={field.value?.toString() || ""}
                  onChangeText={field.onChange}
                  style={[fieldState.error ? { borderColor: red } : {}]}
                  onEndEditing={onSubmit}
                />
                <Text style={[styles.error, { color: red }]}>
                  {fieldState.error?.message}
                </Text>
              </>
            )}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Upload (kB/s)</Text>
          <Controller
            name="alt-speed-up"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <TextInput
                  keyboardType="numeric"
                  value={field.value?.toString() || ""}
                  onChangeText={field.onChange}
                  style={[fieldState.error ? { borderColor: red } : {}]}
                  onEndEditing={onSubmit}
                />
                <Text style={[styles.error, { color: red }]}>
                  {fieldState.error?.message}
                </Text>
              </>
            )}
          />
        </View>

        <Text style={styles.title}>Seed</Text>

        <View style={styles.row}>
          <View style={styles.label}>
            <Controller
              name="seedRatioLimited"
              control={control}
              render={({ field }) => (
                <Toggle
                  value={field.value}
                  onPress={(v) => {
                    field.onChange(v);
                    onSubmit();
                  }}
                  label="STOP SEEDING AT RATIO"
                />
              )}
            />
          </View>
          <Controller
            name="seedRatioLimit"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <TextInput
                  keyboardType="numeric"
                  editable={watch("seedRatioLimited")}
                  value={field.value?.toString() || ""}
                  onChangeText={field.onChange}
                  style={[fieldState.error ? { borderColor: red } : {}]}
                  onEndEditing={onSubmit}
                />
                <Text style={[styles.error, { color: red }]}>
                  {fieldState.error?.message}
                </Text>
              </>
            )}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.label}>
            <Controller
              name="idle-seeding-limit-enabled"
              control={control}
              render={({ field }) => (
                <Toggle
                  value={field.value}
                  onPress={(v) => {
                    field.onChange(v);
                    onSubmit();
                  }}
                  label="STOP SEEDING IF IDLE (MINUTES)"
                />
              )}
            />
          </View>
          <Controller
            name="idle-seeding-limit"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <TextInput
                  keyboardType="numeric"
                  editable={watch("idle-seeding-limit-enabled")}
                  value={field.value?.toString() || ""}
                  onChangeText={field.onChange}
                  style={[fieldState.error ? { borderColor: red } : {}]}
                  onEndEditing={onSubmit}
                />
                <Text style={[styles.error, { color: red }]}>
                  {fieldState.error?.message}
                </Text>
              </>
            )}
          />
        </View>

        <Text style={styles.title}>Queue</Text>

        <View style={styles.row}>
          <View style={styles.label}>
            <Controller
              name="download-queue-enabled"
              control={control}
              render={({ field }) => (
                <Toggle
                  value={field.value}
                  onPress={(v) => {
                    field.onChange(v);
                    onSubmit();
                  }}
                  label="DOWNLOAD QUEUE SIZE"
                />
              )}
            />
          </View>
          <Controller
            name="download-queue-size"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <TextInput
                  keyboardType="numeric"
                  editable={watch("download-queue-enabled")}
                  value={field.value?.toString() || ""}
                  onChangeText={field.onChange}
                  style={[fieldState.error ? { borderColor: red } : {}]}
                  onEndEditing={onSubmit}
                />
                <Text style={[styles.error, { color: red }]}>
                  {fieldState.error?.message}
                </Text>
              </>
            )}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.label}>
            <Controller
              name="seed-queue-enabled"
              control={control}
              render={({ field }) => (
                <Toggle
                  value={field.value}
                  onPress={(v) => {
                    field.onChange(v);
                    onSubmit();
                  }}
                  label="SEED QUEUE SIZE"
                />
              )}
            />
          </View>
          <Controller
            name="seed-queue-size"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <TextInput
                  keyboardType="numeric"
                  editable={watch("seed-queue-enabled")}
                  value={field.value?.toString() || ""}
                  onChangeText={field.onChange}
                  style={[fieldState.error ? { borderColor: red } : {}]}
                  onEndEditing={onSubmit}
                />
                <Text style={[styles.error, { color: red }]}>
                  {fieldState.error?.message}
                </Text>
              </>
            )}
          />
        </View>

        <Text style={styles.title}>Peer discovery</Text>

        <View style={[styles.row, { gap: 16 }]}>
          <Controller
            name="dht-enabled"
            control={control}
            render={({ field }) => (
              <Toggle
                value={field.value}
                onPress={(v) => {
                  field.onChange(v);
                  onSubmit();
                }}
                label="Enable Distributed Hash Table"
              />
            )}
          />
          <Controller
            name="lpd-enabled"
            control={control}
            render={({ field }) => (
              <Toggle
                value={field.value}
                onPress={(v) => {
                  field.onChange(v);
                  onSubmit();
                }}
                label="Enable Local Peer Discovery"
              />
            )}
          />
          <Controller
            name="pex-enabled"
            control={control}
            render={({ field }) => (
              <Toggle
                value={field.value}
                onPress={(v) => {
                  field.onChange(v);
                  onSubmit();
                }}
                label="Enable Peer Exchange"
              />
            )}
          />
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
}

export default function ServerConfigurationScreen() {
  const servers = useServers();
  const activeServerId = useActiveServerId();
  const { text } = useTheme();

  const [selectedId, setSelectedId] = React.useState<string | undefined>(
    activeServerId ?? servers[0]?.id
  );

  const server = selectedId
    ? servers.find((s) => s.id === selectedId)
    : undefined;

  const onPickServer = React.useCallback(() => {
    const options: SelectOption[] = servers.map((s) => ({
      id: s.id,
      label: s.name,
      value: s.id,
      left: "server" as const,
      right: s.id === selectedId ? ("check" as const) : undefined,
    }));

    SheetManager.show(SelectSheet.sheetId, {
      payload: {
        title: "Select server",
        options,
        onSelect: (value) => setSelectedId(String(value)),
      },
    });
  }, [servers, selectedId]);

  if (servers.length === 0) {
    return (
      <Screen>
        <Text>No servers configured</Text>
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {servers.length > 1 && (
        <Pressable style={styles.serverSelector} onPress={onPickServer}>
          <Feather name="server" size={16} color={text} />
          <Text style={styles.serverName}>{server?.name ?? "Select server"}</Text>
          <Feather name="chevron-down" size={16} color={text} />
        </Pressable>
      )}
      {server && <ConfigurationForm server={server} />}
    </View>
  );
}

const styles = StyleSheet.create({
  serverSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  serverName: {
    flex: 1,
    fontFamily: "RobotoMono-Medium",
    fontSize: 15,
  },
  title: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 20,
    marginBottom: 12,
    marginTop: 12,
  },
  row: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  error: {
    fontSize: 12,
    textTransform: "lowercase",
    marginTop: 4,
  },
});
