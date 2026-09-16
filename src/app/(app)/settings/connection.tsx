import * as React from "react";
import { StyleSheet, ToastAndroid } from "react-native";
import { useRouter, useNavigation, useLocalSearchParams } from "expo-router";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import * as Notifications from "expo-notifications";
import Text from "~/components/text";
import View from "~/components/view";
import Screen from "~/components/screen";
import TextInput from "~/components/text-input";
import Button from "~/components/button";
import Toggle from "~/components/toggle";
import SelectInput from "~/components/select-input";
import {
  SettingsFieldRow,
  SettingsInsetDivider,
  SettingsSectionTitle,
} from "~/components/settings";
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
import ConnectionTest from "~/components/connection-test";
import Pressable from "~/components/pressable";
import Badge from "~/components/badge";
import { Feather } from "@expo/vector-icons";
import { debugHref } from "~/lib/debug-href";
import ConnectionAddressRow from "~/components/connection-address-row";
import { SheetManager } from "react-native-actions-sheet";
import { SELECT_SHEET_ID } from "~/sheets/ids";
import type { SelectOption } from "~/sheets/select";
import {
  parseServerAddress,
  promoteServerAddress,
  renderServerAddress,
} from "~/utils/server-address";
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
    host: z.string().trim(),
    port: z.coerce
      .number()
      .int()
      .max(65_535, "maximum port is 65535")
      .optional(),
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
    if (data.type !== "local" && (!data.port || data.port < 1)) {
      ctx.addIssue({
        path: ["port"],
        code: z.ZodIssueCode.custom,
        message: "minimum port is 1",
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

function renderUrl(form: Form): string {
  if (isTestingServer({ name: form.name, url: form.host })) {
    return form.host;
  }

  return renderServerAddress({
    host: form.host,
    port: form.port ?? typeDefaults[form.type].port,
    path: form.path ?? "",
    useSSL: form.useSSL,
  });
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

  const parsed = parseServerAddress(server.url, server.type);

  return {
    type: server.type,
    name: server.name,
    host: parsed.host,
    port: parsed.port,
    path: parsed.path,
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
  const { red, gray, green, lightestGray, text } = useTheme();

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
  const {
    data,
    isPending,
    mutate: test,
    reset: resetTest,
  } = useTestConnection();

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
      resetTest();
      setValue("useSSL", enabled);
      const selectedType = getValues("type") ?? "transmission";
      setValue("port", defaultPortForSSL(selectedType, enabled));
    },
    [getValues, resetTest, setValue]
  );

  const onTypeChange = React.useCallback(
    (value: string | number) => {
      resetTest();
      const t = (
        value === "qbittorrent"
          ? "qbittorrent"
          : value === "local"
          ? "local"
          : "transmission"
      ) as "transmission" | "qbittorrent" | "local";
      setValue("type", t);
      if (t === "local") {
        setValue("port", 0);
        return;
      }
      const defaults = typeDefaults[t];
      if (!useSSL) setValue("port", defaults.port);
      setValue("path", defaults.path);
    },
    [resetTest, setValue, useSSL]
  );

  const onUseAuthChange = React.useCallback(
    (enabled: boolean) => {
      resetTest();
      setValue("useAuth", enabled);
      if (!enabled) {
        setValue("username", "");
        setValue("password", "");
      }
    },
    [resetTest, setValue]
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

  const storeRemoteServer = React.useCallback(
    (f: Form, onSuccess: () => void) => {
      const now = Date.now();
      const url = editServer?.url ?? renderUrl(f);
      const username = f.useAuth ? (f.username?.trim() || undefined) : undefined;
      const password = f.useAuth ? (f.password || undefined) : undefined;
      const connectionTimeoutMs = editServer?.connectionTimeoutMs ?? 30_000;

      if (editServer) {
        const updated = servers.map((s) =>
          s.id === editServer.id
            ? {
                ...s,
                name: f.name,
                url,
                type: f.type,
                username,
                password,
                connectionTimeoutMs,
                updatedAt: now,
              }
            : s,
        );
        store({ servers: updated }, { onSuccess });
        return;
      }

      const newServer: Server = {
        id: generateServerId(),
        name: f.name,
        url,
        type: f.type,
        username,
        password,
        alternativeUrls: [],
        connectionTimeoutMs,
        createdAt: now,
        updatedAt: now,
      };
      store(
        {
          servers: [...servers, newServer],
          activeServerId: newServer.id,
        },
        { onSuccess },
      );
    },
    [editServer, servers, store],
  );

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

      storeRemoteServer(f, () => router.back());
    },
    [ensureLocalServer, isPro, router, storeRemoteServer],
  );

  const onTest = React.useCallback(
    (f: Form) => {
      const username = f.useAuth ? (f.username?.trim() || undefined) : undefined;
      const password = f.useAuth ? (f.password || undefined) : undefined;
      test({
        type: f.type,
        name: f.name,
        url: renderUrl(f),
        username,
        password,
        requestTimeoutMs: editServer?.connectionTimeoutMs ?? 30_000,
      });
    },
    [editServer?.connectionTimeoutMs, test]
  );

  const openTestDetails = React.useCallback(() => {
    if (!data?.error) return;
    const form = getValues();
    const url = renderUrl({
      ...form,
      type: form.type ?? "transmission",
    });
    const username = form.useAuth
      ? form.username?.trim() || undefined
      : undefined;
    const password = form.useAuth ? form.password || undefined : undefined;
    router.push(
      debugHref({
        url,
        username,
        password,
        errorName: data.error.name,
        errorMessage: data.error.message,
        errorStatus: data.error.status,
        errorBody: data.error.body,
      }),
    );
  }, [data, getValues, router]);

  const openAddress = React.useCallback(
    (address: "primary" | "new" | number) => {
      if (!editServer) return;
      void handleSubmit((form) =>
        storeRemoteServer(form, () =>
          router.push({
            pathname: "/settings/connection-address",
            params: {
              serverId: editServer.id,
              address: String(address),
            },
          }),
        ),
      )();
    },
    [editServer, handleSubmit, router, storeRemoteServer],
  );

  const updateAlternativeUrls = React.useCallback(
    (url: string, alternativeUrls: string[]) => {
      if (!editServer) return;
      const updated = servers.map((server) =>
        server.id === editServer.id
          ? {
              ...server,
              url,
              alternativeUrls,
              updatedAt: Date.now(),
            }
          : server,
      );
      store({ servers: updated });
    },
    [editServer, servers, store],
  );

  const makePrimary = React.useCallback(
    (index: number) => {
      if (!editServer) return;
      const promoted = promoteServerAddress(
        editServer.url,
        editServer.alternativeUrls,
        index,
      );
      if (!promoted) return;
      updateAlternativeUrls(promoted.url, promoted.alternativeUrls);
    },
    [editServer, updateAlternativeUrls],
  );

  const removeAlternative = React.useCallback(
    (index: number) => {
      if (!editServer) return;
      const alternativeUrls = editServer.alternativeUrls.filter(
        (_url, itemIndex) => itemIndex !== index,
      );
      updateAlternativeUrls(editServer.url, alternativeUrls);
    },
    [editServer, updateAlternativeUrls],
  );

  const openAddressActions = React.useCallback(
    (index: number) => {
      const options: SelectOption[] = [
        {
          id: "edit",
          label: "Edit",
          left: "edit-2",
          value: "edit",
        },
        {
          id: "primary",
          label: "Make primary",
          left: "home",
          value: "primary",
        },
        {
          id: "remove",
          label: "Remove",
          left: "trash-2",
          color: red,
          value: "remove",
        },
      ];

      SheetManager.show(SELECT_SHEET_ID, {
        payload: {
          title: `Alternative ${index + 1}`,
          options,
          onSelect: (value) => {
            if (value === "edit") {
              openAddress(index);
              return;
            }
            if (value === "primary") {
              makePrimary(index);
              return;
            }
            removeAlternative(index);
          },
        },
      });
    },
    [makePrimary, openAddress, red, removeAlternative],
  );

  return (
    <Screen>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        bottomOffset={8}
        contentInset={{ bottom: inset.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSectionTitle title="Connection" first />

        <SettingsFieldRow label="Client type">
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
                disabled={isEdit}
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
                  onChangeText={(value) => {
                    resetTest();
                    field.onChange(value);
                  }}
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
            {!isEdit ? (
              <>
                <SettingsSectionTitle title="Primary address" />

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
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={
                          fieldState.error ? { borderColor: red } : undefined
                        }
                        value={field.value?.toString() || ""}
                        onChangeText={(value) => {
                          resetTest();
                          field.onChange(value);
                        }}
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
                        placeholder={
                          useSSL ? "443" : String(typeDefaults[type].port)
                        }
                        keyboardType="numeric"
                        style={
                          fieldState.error ? { borderColor: red } : undefined
                        }
                        value={field.value?.toString() || ""}
                        onChangeText={(value) => {
                          resetTest();
                          field.onChange(value);
                        }}
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
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={
                          fieldState.error ? { borderColor: red } : undefined
                        }
                        value={field.value?.toString() || ""}
                        onChangeText={(value) => {
                          resetTest();
                          field.onChange(value);
                        }}
                      />
                    </SettingsFieldRow>
                  )}
                />

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
              </>
            ) : null}

            <SettingsSectionTitle title="Security" />

            <SettingsFieldRow>
              <Controller
                name="useAuth"
                control={control}
                render={({ field }) => (
                  <Toggle
                    variant="settings"
                    label="Authentication"
                    description="Shared by every connection address."
                    value={field.value}
                    onPress={onUseAuthChange}
                  />
                )}
              />
            </SettingsFieldRow>

            {useAuth ? (
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
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={
                          fieldState.error ? { borderColor: red } : undefined
                        }
                        value={field.value?.toString() || ""}
                        onChangeText={(value) => {
                          resetTest();
                          field.onChange(value);
                        }}
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
                        style={
                          fieldState.error ? { borderColor: red } : undefined
                        }
                        value={field.value?.toString() || ""}
                        onChangeText={(value) => {
                          resetTest();
                          field.onChange(value);
                        }}
                        secureTextEntry
                      />
                    </SettingsFieldRow>
                  )}
                />
              </>
            ) : null}

            {isEdit && editServer ? (
              <>
                <SettingsSectionTitle title="Connection addresses" />
                <View
                  style={[styles.addressList, { borderColor: lightestGray }]}
                >
                  <ConnectionAddressRow
                    label="Primary"
                    url={editServer.url}
                    primary
                    onPress={() => openAddress("primary")}
                  />
                  {editServer.alternativeUrls.map((url, index) => (
                    <React.Fragment key={url}>
                      <SettingsInsetDivider inset={12} />
                      <ConnectionAddressRow
                        label={`Alternative ${index + 1}`}
                        url={url}
                        onPress={() =>
                          isPro ? openAddress(index) : router.push("/paywall")
                        }
                        onMore={
                          isPro ? () => openAddressActions(index) : undefined
                        }
                      />
                    </React.Fragment>
                  ))}
                </View>

                {isPro ? (
                  <Button
                    title="add address"
                    variant="outline"
                    onPress={() => openAddress("new")}
                    style={styles.addAddressButton}
                  />
                ) : (
                  <Pressable
                    style={[
                      styles.proFeatureCard,
                      { borderColor: lightestGray },
                    ]}
                    onPress={() => router.push("/paywall")}
                    accessibilityRole="button"
                    accessibilityLabel="Learn about multiple connection addresses in Pro"
                  >
                    <Feather name="repeat" size={22} color={text} />
                    <View style={styles.proFeatureCopy}>
                      <View style={styles.proFeatureTitle}>
                        <Text style={styles.label}>Multiple addresses</Text>
                        <Badge label="PRO" style={styles.proBadge} />
                      </View>
                      <Text color={gray} style={styles.proFeatureDescription}>
                        Add LAN, VPN, or public addresses with automatic
                        failover.
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={20} color={gray} />
                  </Pressable>
                )}
              </>
            ) : (
              <>
                <SettingsSectionTitle title="Connection test" />
                <ConnectionTest
                  data={data}
                  isPending={isPending}
                  onPress={handleSubmit(onTest)}
                  onDetails={data?.error ? openTestDetails : undefined}
                />
              </>
            )}
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
            style={isEdit ? styles.editSaveButton : styles.saveButton}
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
  addressList: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  addAddressButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  proFeatureCard: {
    minHeight: 76,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  proFeatureCopy: {
    flex: 1,
    gap: 4,
  },
  proFeatureTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  proFeatureDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  proBadge: {
    height: 20,
    paddingHorizontal: 6,
  },
  saveButton: {
    marginTop: 32,
    marginBottom: 16,
  },
  editSaveButton: {
    marginBottom: 16,
  },
});
