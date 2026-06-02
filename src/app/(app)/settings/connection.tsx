import * as React from "react";
import { StyleSheet, ToastAndroid } from "react-native";
import { useRouter, useNavigation, useLocalSearchParams } from "expo-router";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  KeyboardAwareScrollView,
  type KeyboardAwareScrollViewRef,
} from "react-native-keyboard-controller";
import * as Notifications from "expo-notifications";
import Text from "~/components/text";
import View from "~/components/view";
import Screen from "~/components/screen";
import TextInput from "~/components/text-input";
import Button from "~/components/button";
import Toggle from "~/components/toggle";
import SelectInput from "~/components/select-input";
import { SettingsFieldRow, SettingsSectionTitle } from "~/components/settings";
import useThemeColor, { useTheme } from "~/hooks/use-theme-color";
import { useServersStore } from "~/hooks/use-settings";
import type { Server } from "~/store/settings";
import { generateServerId } from "~/store/settings";
import { useServerDeleteConfirmSheet } from "~/hooks/use-action-sheet";
import { isTestingServer } from "~/utils/mock-transmission-client";
import { useTestConnection } from "~/hooks/use-test-connection";
import { defaultPortForSSL, typeDefaults } from "~/utils/server-connection-defaults";
import ActionIcon from "~/components/action-icon";
import ProgressBar from "~/components/progress-bar";
import Pressable from "~/components/pressable";
import { Feather } from "@expo/vector-icons";
import { debugHref } from "~/lib/debug-href";
import {
  isLocalEngineAvailable,
  useEnsureLocalServer,
  useResumeLocalEngine,
  useStopLocalEngine,
  useLocalEngineStatus,
  useBatteryOptIgnored,
  usePro,
  LOCAL_SERVER_ID,
} from "@remote-app/pro";

type Form = z.infer<typeof Form>;
const Form = z
  .object({
    type: z
      .enum(["transmission", "qbittorrent", "local"])
      .default("transmission"),
    name: z.string().max(16, "max. of 16 characters"),
    host: z.string(),
    port: z.coerce.number().optional(),
    path: z.string().optional(),
    useSSL: z.boolean(),
    useAuth: z.boolean(),
    username: z.string().optional(),
    password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type !== "local" && data.name.trim().length === 0) {
      ctx.addIssue({
        path: ["name"],
        code: z.ZodIssueCode.custom,
        message: "name is required",
      });
    }
    if (data.type !== "local" && !data.host) {
      ctx.addIssue({
        path: ["host"],
        code: z.ZodIssueCode.custom,
        message: "host / IP address is required",
      });
    }
    if (data.type !== "local" && data.useAuth) {
      if (!data.username) {
        ctx.addIssue({
          path: ["username"],
          code: z.ZodIssueCode.custom,
          message: "username is required",
        });
      }
      if (!data.password) {
        ctx.addIssue({
          path: ["password"],
          code: z.ZodIssueCode.custom,
          message: "password is required",
        });
      }
    }
  });

function parseUrl(input: string) {
  const url = new URL(input);
  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : url.protocol === "https:" ? 443 : 80,
    path: url.pathname,
    useSSL: url.protocol === "https:",
  };
}

function fallbackParsedUrl(server: Server) {
  const defaults = typeDefaults[server.type];
  const raw = server.url.trim();
  const withoutProtocol = raw.replace(/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//, "");
  const slashIndex = withoutProtocol.indexOf("/");
  const hostPort = slashIndex >= 0 ? withoutProtocol.slice(0, slashIndex) : withoutProtocol;
  const rawPath = slashIndex >= 0 ? withoutProtocol.slice(slashIndex) : "";
  const [host, rawPort] = hostPort.split(":");
  const parsedPort = rawPort ? Number(rawPort) : NaN;
  const path = rawPath && rawPath !== "/" ? rawPath : defaults.path;
  return {
    host: host || raw,
    port: Number.isFinite(parsedPort) ? parsedPort : defaults.port,
    path,
    useSSL: raw.startsWith("https://"),
  };
}

function renderUrl(form: Form): string {
  if (isTestingServer({ name: form.name, url: form.host })) {
    return form.host;
  }

  const protocol = form.useSSL ? "https" : "http";
  const port =
    !form.port || (form.useSSL && form.port === 443) || (!form.useSSL && form.port === 80)
      ? ""
      : `:${form.port}`;
  const pathInput = form.path?.trim() ?? "";
  const path = pathInput ? (pathInput.startsWith("/") ? pathInput : `/${pathInput}`) : "";

  return `${protocol}://${form.host}${port}${path}`;
}

function defaultValues(server?: Server): Form {
  const transmissionDefaults = typeDefaults.transmission;

  if (!server) {
    return {
      type: "transmission",
      name: "",
      host: "",
      port: transmissionDefaults.port,
      path: transmissionDefaults.path,
      useSSL: false,
      useAuth: false,
      username: "",
      password: "",
    };
  }

  if (server.type === "local") {
    return {
      type: "local",
      name: server.name,
      host: "",
      port: 0,
      path: "",
      useSSL: false,
      useAuth: false,
      username: "",
      password: "",
    };
  }

  if (isTestingServer(server)) {
    return {
      type: server.type,
      name: "app",
      host: "app-testing-url",
      port: transmissionDefaults.port,
      path: transmissionDefaults.path,
      useSSL: false,
      useAuth: false,
      username: "",
      password: "",
    };
  }

  let parsed: ReturnType<typeof parseUrl>;
  try {
    parsed = parseUrl(server.url);
  } catch {
    parsed = fallbackParsedUrl(server);
  }

  return {
    type: server.type,
    name: server.name,
    host: parsed.host,
    port: parsed.port,
    path: server.type === "qbittorrent" && parsed.path === "/" ? "" : parsed.path,
    useSSL: parsed.useSSL,
    useAuth: Boolean(server.username || server.password),
    username: server.username ?? "",
    password: server.password ?? "",
  };
}

function Required() {
  const color = useThemeColor("tint");
  return <Text style={{ color }}>*</Text>;
}

export default function ConnectionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { servers, store } = useServersStore();
  const { red, gray, green } = useTheme();

  const editServer = id ? servers.find((s) => s.id === id) : undefined;
  const isEdit = Boolean(editServer);
  const deleteSheet = useServerDeleteConfirmSheet();

  const inset = useSafeAreaInsets();

  const { control, handleSubmit, watch, setValue, getValues } = useForm({
    mode: "onSubmit",
    resolver: zodResolver(Form),
    defaultValues: defaultValues(editServer),
  });

  const useAuth = watch("useAuth");
  const useSSL = watch("useSSL");
  const watchedType = watch("type") ?? "transmission";
  const isLocal = watchedType === "local";
  const type: "transmission" | "qbittorrent" =
    watchedType === "qbittorrent" ? "qbittorrent" : "transmission";
  const scroll = React.useRef<KeyboardAwareScrollViewRef>(null);

  const { isPro, available } = usePro();
  const { mutate: ensureLocalServer } = useEnsureLocalServer();
  const { mutate: resumeLocalEngine, isPending: isResuming } =
    useResumeLocalEngine();
  const { mutate: stopLocalEngine, isPending: isStopping } =
    useStopLocalEngine();
  const engineStatus = useLocalEngineStatus();
  const batteryOpt = useBatteryOptIgnored();
  const localEngineAvailable = isLocalEngineAvailable();
  const hasLocalServer = servers.some((s) => s.type === "local");
  // Only offer the "Local (libtorrent4j)" option in the type picker when:
  //   - the native module is loaded (pro build), and
  //   - either there's no local server yet, or the user is editing the
  //     existing one.
  const canPickLocal =
    available &&
    localEngineAvailable &&
    (!hasLocalServer || editServer?.id === LOCAL_SERVER_ID);

  // Editing an existing local server: Save is replaced with Restart/Stop +
  // ignore-battery deep link. Creating a new local server keeps Save.
  const editingLocal = isLocal && editServer?.id === LOCAL_SERVER_ID;

  const typeOptions = React.useMemo(() => {
    const out: Array<{
      label: string;
      left: "server" | "hard-drive";
      value: "transmission" | "qbittorrent" | "local";
    }> = [
      { label: "Transmission", left: "server", value: "transmission" },
      { label: "qBittorrent", left: "server", value: "qbittorrent" },
    ];
    if (canPickLocal) {
      out.push({
        label: "Local (libtorrent4j) — beta",
        left: "hard-drive",
        value: "local",
      });
    }
    return out;
  }, [canPickLocal]);

  const onSSLChange = React.useCallback(
    (enabled: boolean) => {
      setValue("useSSL", enabled);
      const selectedType = getValues("type") ?? "transmission";
      setValue("port", defaultPortForSSL(selectedType, enabled));
    },
    [setValue, getValues]
  );

  const onTypeChange = React.useCallback(
    (value: string | number) => {
      const t = (
        value === "qbittorrent"
          ? "qbittorrent"
          : value === "local"
          ? "local"
          : "transmission"
      ) as "transmission" | "qbittorrent" | "local";
      setValue("type", t);
      if (t === "local") return;
      const defaults = typeDefaults[t];
      if (!useSSL) setValue("port", defaults.port);
      setValue("path", defaults.path);
    },
    [setValue, useSSL]
  );

  const onUseAuthChange = React.useCallback(
    (enabled: boolean) => {
      setValue("useAuth", enabled);
      if (!enabled) {
        setValue("username", "");
        setValue("password", "");
      }
    },
    [setValue]
  );

  const navigation = useNavigation();

  const remove = React.useCallback(() => {
    if (!editServer) return;
    deleteSheet({ ids: [editServer.id], label: editServer.name });
  }, [editServer, deleteSheet]);

  React.useEffect(() => {
    if (id && !editServer) {
      router.dismissTo("/settings/servers");
    }
  }, [id, editServer, router]);

  React.useEffect(() => {
    if (!isEdit) return;
    navigation.setOptions({
      headerRight: () => (
        <ActionIcon onPress={remove} name="trash-2" color={red} />
      ),
    });
  }, [isEdit, remove, navigation, red]);

  const onSubmit = React.useCallback(
    (f: Form) => {
      if (f.type === "local") {
        if (!isPro) {
          router.replace("/paywall");
          return;
        }
        // Best-effort: ensure POST_NOTIFICATIONS is granted so the foreground
        // service notification is visible. The system handles "already granted".
        Notifications.getPermissionsAsync()
          .then((perm) => {
            if (perm.status !== "granted") {
              return Notifications.requestPermissionsAsync();
            }
            return perm;
          })
          .catch(() => {});

        ensureLocalServer(f.name?.trim() || "remote", {
          onSuccess: () => router.back(),
          onError: () => {
            ToastAndroid.show("Failed to save local service", ToastAndroid.SHORT);
          },
        });
        return;
      }

      const now = Date.now();
      const url = renderUrl(f);
      const username = f.useAuth ? (f.username?.trim() || undefined) : undefined;
      const password = f.useAuth ? (f.password || undefined) : undefined;

      if (editServer) {
        const updated = servers.map((s) =>
          s.id === editServer.id
            ? { ...s, name: f.name, url, type: f.type, username, password, updatedAt: now }
            : s
        );
        store({ servers: updated });
      } else {
        const newServer: Server = {
          id: generateServerId(),
          name: f.name,
          url,
          type: f.type,
          username,
          password,
          createdAt: now,
          updatedAt: now,
        };
        store({
          servers: [...servers, newServer],
          activeServerId: newServer.id,
        });
      }
      router.back();
    },
    [editServer, servers, router, store, isPro, ensureLocalServer]
  );


  const {
    data,
    isPending,
    mutate: test,
  } = useTestConnection();

  const status = isPending ? "Connecting..." : data ? data.message : "Not connected";
  const hasError = data ? !data.connected : false;
  const statusColor =
    status === "Not connected" || status === "Connecting..."
      ? gray
      : data?.connected
      ? green
      : red;

  const onTest = React.useCallback(
    (f: Form) => {
      const username = f.useAuth ? (f.username?.trim() || undefined) : undefined;
      const password = f.useAuth ? (f.password || undefined) : undefined;
      test(
        { type: f.type, name: f.name, url: renderUrl(f), username, password },
        {
          onSettled: () => {
            scroll.current?.scrollToEnd({ animated: true });
          },
        }
      );
    },
    [test]
  );

  return (
    <Screen>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        ref={scroll}
        bottomOffset={8}
        contentInset={{ bottom: inset.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSectionTitle title="Connection" first />

        <SettingsFieldRow label="Client type" reserveErrorSpace>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <SelectInput
                variant="settings"
                value={field.value}
                onChange={onTypeChange}
                options={typeOptions}
                title="Client Type"
              />
            )}
          />
        </SettingsFieldRow>

        {!isLocal && (
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <SettingsFieldRow
                label={
                  <Text style={styles.label}>
                    Name <Required />
                  </Text>
                }
                error={fieldState.error?.message}
                reserveErrorSpace
              >
                <TextInput
                  variant="settings"
                  placeholder="remote server"
                  style={fieldState.error ? { borderColor: red } : undefined}
                  onChangeText={field.onChange}
                  value={field.value?.toString() || ""}
                />
              </SettingsFieldRow>
            )}
          />
        )}

        {isLocal && batteryOpt.available && (
          <>
            <SettingsSectionTitle title="Permissions" />
            <SettingsFieldRow>
              <Toggle
                variant="settings"
                label="Ignore battery optimization"
                description={
                  batteryOpt.ignored
                    ? "Doze won't throttle the engine."
                    : "Doze may throttle peer activity in the background."
                }
                value={batteryOpt.ignored}
                onPress={() => {
                  if (!batteryOpt.ignored) batteryOpt.request();
                }}
              />
            </SettingsFieldRow>
          </>
        )}

        {!isLocal && (
          <>
            <Controller
              name="host"
              control={control}
              render={({ field, fieldState }) => (
                <SettingsFieldRow
                  label={
                    <Text style={styles.label}>
                      Host / IP address <Required />
                    </Text>
                  }
                  error={fieldState.error?.message}
                  reserveErrorSpace
                >
                  <TextInput
                    variant="settings"
                    placeholder="192.168.1.100"
                    style={fieldState.error ? { borderColor: red } : undefined}
                    value={field.value?.toString() || ""}
                    onChangeText={field.onChange}
                  />
                </SettingsFieldRow>
              )}
            />

            <Controller
              name="port"
              control={control}
              render={({ field, fieldState }) => (
                <SettingsFieldRow
                  label="Port"
                  error={fieldState.error?.message}
                  reserveErrorSpace
                >
                  <TextInput
                    variant="settings"
                    placeholder={useSSL ? "443" : String(typeDefaults[type].port)}
                    keyboardType="numeric"
                    style={fieldState.error ? { borderColor: red } : undefined}
                    value={field.value?.toString() || ""}
                    onChangeText={field.onChange}
                  />
                </SettingsFieldRow>
              )}
            />

            <Controller
              name="path"
              control={control}
              render={({ field, fieldState }) => (
                <SettingsFieldRow
                  label="Path"
                  error={fieldState.error?.message}
                  reserveErrorSpace
                >
                  <TextInput
                    variant="settings"
                    placeholder={typeDefaults[type].path || "/"}
                    style={fieldState.error ? { borderColor: red } : undefined}
                    value={field.value?.toString() || ""}
                    onChangeText={field.onChange}
                  />
                </SettingsFieldRow>
              )}
            />

            <SettingsSectionTitle title="Security" />

        <SettingsFieldRow>
          <Controller
            name="useSSL"
            control={control}
            render={({ field }) => (
              <Toggle
                variant="settings"
                label="SSL/HTTPS"
                description="Use a secure HTTPS connection."
                value={field.value}
                onPress={onSSLChange}
              />
            )}
          />
        </SettingsFieldRow>

        <SettingsFieldRow>
          <Controller
            name="useAuth"
            control={control}
            render={({ field }) => (
              <Toggle
                variant="settings"
                label="Authentication"
                description="Require username and password."
                value={field.value}
                onPress={onUseAuthChange}
              />
            )}
          />
        </SettingsFieldRow>

        {useAuth && (
          <>
            <Controller
              name="username"
              control={control}
              render={({ field, fieldState }) => (
                <SettingsFieldRow
                  label={
                    <Text style={styles.label}>
                      Username <Required />
                    </Text>
                  }
                  error={fieldState.error?.message}
                  reserveErrorSpace
                >
                  <TextInput
                    variant="settings"
                    style={fieldState.error ? { borderColor: red } : undefined}
                    value={field.value?.toString() || ""}
                    onChangeText={field.onChange}
                  />
                </SettingsFieldRow>
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <SettingsFieldRow
                  label={
                    <Text style={styles.label}>
                      Password <Required />
                    </Text>
                  }
                  error={fieldState.error?.message}
                  reserveErrorSpace
                >
                  <TextInput
                    variant="settings"
                    style={fieldState.error ? { borderColor: red } : undefined}
                    value={field.value?.toString() || ""}
                    onChangeText={field.onChange}
                    secureTextEntry
                  />
                </SettingsFieldRow>
              )}
            />
          </>
        )}

            <View style={[styles.connectionCard, { borderColor: gray }]}>
              <View style={styles.connectionHeader}>
                <Text style={styles.label}>Connection</Text>
                {hasError && data?.error ? (
                  <Pressable
                    style={styles.statusPressable}
                    onPress={() => {
                      const f = getValues();
                      const url = renderUrl({ ...f, type: f.type ?? "transmission" });
                      const username = f.useAuth ? f.username?.trim() || undefined : undefined;
                      const password = f.useAuth ? f.password || undefined : undefined;
                      const e = data.error!;
                      router.push(debugHref({
                        url, username, password,
                        errorName: e.name, errorMessage: e.message,
                        errorStatus: e.status, errorBody: e.body,
                      }));
                    }}
                  >
                    <Text color={statusColor} style={styles.connectionState}>
                      {status}
                    </Text>
                    <Feather name="chevron-right" size={14} color={statusColor} />
                  </Pressable>
                ) : (
                  <Text color={statusColor} style={styles.connectionState}>
                    {status}
                  </Text>
                )}
              </View>
              <ProgressBar progress={100} color={statusColor} />
            </View>

            <Button
              title="test connection"
              onPress={handleSubmit(onTest)}
              style={{ marginTop: 8, marginBottom: 8, backgroundColor: green }}
            />
          </>
        )}

        {editingLocal ? (
          <>
            {(() => {
              const running = engineStatus.state === "running";
              const stateColor = running
                ? green
                : engineStatus.state === "stopped"
                  ? red
                  : gray;
              return (
                <View
                  style={[
                    styles.connectionCard,
                    { borderColor: gray, marginTop: 4 },
                  ]}
                >
                  <View style={styles.connectionHeader}>
                    <Text style={styles.label}>Service</Text>
                    <Text color={stateColor} style={styles.connectionState}>
                      {engineStatus.state}
                    </Text>
                  </View>
                  <ProgressBar progress={100} color={stateColor} />
                </View>
              );
            })()}

            <Button
              title={
                engineStatus.state === "running"
                  ? "restart local service"
                  : "start local service"
              }
              onPress={() => resumeLocalEngine(undefined)}
              disabled={isResuming || isStopping}
              style={{ marginTop: 8, marginBottom: 8, backgroundColor: green }}
            />
            {engineStatus.state !== "stopped" && (
              <Button
                title="stop local service"
                onPress={() => stopLocalEngine(undefined)}
                disabled={isStopping || isResuming}
                style={{ marginTop: 0, marginBottom: 16, backgroundColor: red }}
              />
            )}
          </>
        ) : (
          <Button
            title="save"
            onPress={handleSubmit(onSubmit)}
            style={{ marginTop: 8, marginBottom: 16 }}
          />
        )}
      </KeyboardAwareScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 13,
  },
  connectionCard: {
    marginTop: 4,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  connectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  connectionState: {
    fontSize: 12,
  },
  statusPressable: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 1,
  },
  localCallout: {
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 4,
    gap: 8,
  },
  localCalloutTitle: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 14,
  },
  localCalloutBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  localCalloutEmph: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 12,
  },
});
