import * as React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useRouter, useNavigation, useLocalSearchParams } from "expo-router";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
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
import type { Server, ServerType } from "~/store/settings";
import { generateServerId } from "~/store/settings";
import { useServerDeleteConfirmSheet } from "~/hooks/use-action-sheet";
import { isTestingServer } from "~/utils/mock-transmission-client";
import { useTestConnection } from "~/hooks/use-test-connection";
import { defaultPortForSSL, typeDefaults } from "~/utils/server-connection-defaults";
import ActionIcon from "~/components/action-icon";
import ProgressBar from "~/components/progress-bar";

type Form = z.infer<typeof Form>;
const Form = z
  .object({
    type: z.enum(["transmission", "qbittorrent"]).default("transmission"),
    name: z
      .string()
      .min(1, "Name is required")
      .max(16, "Max. of 16 characters"),
    host: z.string().min(1, "Host / IP address is required"),
    port: z.coerce.number().optional(),
    path: z.string().optional(),
    useSSL: z.boolean(),
    useAuth: z.boolean(),
    username: z.string().optional(),
    password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.useAuth) {
      if (!data.username) {
        ctx.addIssue({
          path: ["username"],
          code: z.ZodIssueCode.custom,
          message: "Username is required",
        });
      }
      if (!data.password) {
        ctx.addIssue({
          path: ["password"],
          code: z.ZodIssueCode.custom,
          message: "Password is required",
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
  const type = watch("type") ?? "transmission";
  const scroll = React.useRef<ScrollView>(null);

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
      const t = value as ServerType;
      setValue("type", t);
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
    [editServer, servers, router, store]
  );

  const {
    data,
    isPending,
    mutate: test,
  } = useTestConnection();

  const status = isPending ? "Connecting..." : data ? data : "Not connected";
  const statusColor =
    status === "Not connected" || status === "Connecting..."
      ? gray
      : status === "Connected"
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
                options={[
                  { label: "Transmission", left: "server" as const, value: "transmission" },
                  { label: "qBittorrent", left: "server" as const, value: "qbittorrent" },
                ]}
                title="Client Type"
              />
            )}
          />
        </SettingsFieldRow>

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
            <Text color={statusColor} style={styles.connectionState}>
              {status}
            </Text>
          </View>
          <ProgressBar progress={100} color={statusColor} />
        </View>

        <Button
          title="test connection"
          onPress={handleSubmit(onTest)}
          style={{ marginTop: 8, marginBottom: 8, backgroundColor: green }}
        />

        <Button
          title="save"
          onPress={handleSubmit(onSubmit)}
          style={{ marginTop: 8, marginBottom: 16 }}
        />
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
});
