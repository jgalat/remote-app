import * as React from "react";
import { StyleSheet, ToastAndroid } from "react-native";
import { z } from "zod";
import { Feather } from "@expo/vector-icons";
import { SheetManager } from "react-native-actions-sheet";
import { useTranslation } from "react-i18next";

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
    "speed-limit-down": z.coerce.number({ message: "validation_number" }),
    "speed-limit-up-enabled": z.boolean(),
    "speed-limit-up": z.coerce.number({ message: "validation_number" }),
    "alt-speed-enabled": z.boolean(),
    "alt-speed-down": z.coerce.number({ message: "validation_number" }),
    "alt-speed-up": z.coerce.number({ message: "validation_number" }),

    "seedRatioLimited": z.boolean(),
    "seedRatioLimit": z.coerce.number({ message: "validation_number" }),

    "idle-seeding-limit-enabled": z.boolean(),
    "idle-seeding-limit": z.coerce.number({ message: "validation_number" }),

    "download-queue-enabled": z.boolean(),
    "download-queue-size": z.coerce.number({ message: "validation_number" }),
    "seed-queue-enabled": z.boolean(),
    "seed-queue-size": z.coerce.number({ message: "validation_number" }),

    "dht-enabled": z.boolean(),
    "lpd-enabled": z.boolean(),
    "pex-enabled": z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data["speed-limit-down-enabled"] && !data["speed-limit-down"]) {
      ctx.addIssue({
        path: ["speed-limit-down"],
        code: z.ZodIssueCode.custom,
        message: "validation_required",
      });
    }
    if (data["speed-limit-up-enabled"] && !data["speed-limit-up"]) {
      ctx.addIssue({
        path: ["speed-limit-up"],
        code: z.ZodIssueCode.custom,
        message: "validation_required",
      });
    }
    if (data["seedRatioLimited"] && !data["seedRatioLimit"]) {
      ctx.addIssue({
        path: ["seedRatioLimit"],
        code: z.ZodIssueCode.custom,
        message: "validation_required",
      });
    }
    if (data["idle-seeding-limit-enabled"] && !data["idle-seeding-limit"]) {
      ctx.addIssue({
        path: ["idle-seeding-limit"],
        code: z.ZodIssueCode.custom,
        message: "validation_required",
      });
    }
    if (data["download-queue-enabled"] && !data["download-queue-size"]) {
      ctx.addIssue({
        path: ["download-queue-size"],
        code: z.ZodIssueCode.custom,
        message: "validation_required",
      });
    }
    if (data["seed-queue-enabled"] && !data["seed-queue-size"]) {
      ctx.addIssue({
        path: ["seed-queue-size"],
        code: z.ZodIssueCode.custom,
        message: "validation_required",
      });
    }
  });

function ConfigurationForm({ server }: { server: Server }) {
  const { data: session, isLoading, error, refetch } = useServerSession(server);
  const { mutate } = useServerSessionSet(server);
  const { red } = useTheme();
  const inset = useSafeAreaInsets();
  const { t } = useTranslation();

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
            ToastAndroid.show(t("server_updated"), ToastAndroid.SHORT);
          },
          onError: () => {
            ToastAndroid.show(t("server_update_failed"), ToastAndroid.SHORT);
          },
        });
      },
      [mutate, t]
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
        <Text style={[styles.title, { marginTop: 0 }]}>{t("speed_limits")}</Text>

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
                  label={t("download_kbs")}
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
                  {fieldState.error?.message && t(fieldState.error.message)}
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
                  label={t("upload_kbs")}
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
                  {fieldState.error?.message && t(fieldState.error.message)}
                </Text>
              </>
            )}
          />
        </View>

        <Text style={styles.title}>{t("alt_speed_limits")}</Text>

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
                label={t("enable_alt_speed")}
              />
            )}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>{t("alt_download_kbs")}</Text>
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
                  {fieldState.error?.message && t(fieldState.error.message)}
                </Text>
              </>
            )}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>{t("alt_upload_kbs")}</Text>
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
                  {fieldState.error?.message && t(fieldState.error.message)}
                </Text>
              </>
            )}
          />
        </View>

        <Text style={styles.title}>{t("seed")}</Text>

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
                  label={t("stop_seeding_at_ratio")}
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
                  {fieldState.error?.message && t(fieldState.error.message)}
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
                  label={t("stop_seeding_if_idle")}
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
                  {fieldState.error?.message && t(fieldState.error.message)}
                </Text>
              </>
            )}
          />
        </View>

        <Text style={styles.title}>{t("queue")}</Text>

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
                  label={t("download_queue_size")}
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
                  {fieldState.error?.message && t(fieldState.error.message)}
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
                  label={t("seed_queue_size")}
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
                  {fieldState.error?.message && t(fieldState.error.message)}
                </Text>
              </>
            )}
          />
        </View>

        <Text style={styles.title}>{t("peer_discovery")}</Text>

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
                label={t("enable_dht")}
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
                label={t("enable_lpd")}
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
                label={t("enable_pex")}
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
  const { t } = useTranslation();

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
        title: t("select_server"),
        options,
        onSelect: (value) => setSelectedId(String(value)),
      },
    });
  }, [servers, selectedId, t]);

  if (servers.length === 0) {
    return (
      <Screen>
        <Text>{t("no_servers_configured")}</Text>
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {servers.length > 1 && (
        <Pressable style={styles.serverSelector} onPress={onPickServer}>
          <Feather name="server" size={16} color={text} />
          <Text style={styles.serverName}>{server?.name ?? t("select_server")}</Text>
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
