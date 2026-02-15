import * as React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useRouter, useNavigation, useLocalSearchParams } from "expo-router";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import TransmissionClient, {
  HTTPError,
  TransmissionError,
} from "@remote-app/transmission-client";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import Text from "~/components/text";
import View from "~/components/view";
import Screen from "~/components/screen";
import TextInput from "~/components/text-input";
import Button from "~/components/button";
import Toggle from "~/components/toggle";
import { useTheme } from "~/hooks/use-theme-color";
import { useServersStore } from "~/hooks/use-settings";
import type { Server } from "~/store/settings";
import { generateServerId } from "~/store/settings";
import { useServerDeleteConfirmSheet } from "~/hooks/use-action-sheet";
import { isTestingServer } from "~/utils/mock-transmission-client";
import ActionIcon from "~/components/action-icon";
import Required from "~/components/required";
import ProgressBar from "~/components/progress-bar";

type Form = z.infer<typeof Form>;
const Form = z
  .object({
    name: z
      .string()
      .min(1, "validation_name_required")
      .max(16, "validation_name_max"),
    host: z.string().min(1, "validation_host_required"),
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
          message: "validation_username_required",
        });
      }
      if (!data.password) {
        ctx.addIssue({
          path: ["password"],
          code: z.ZodIssueCode.custom,
          message: "validation_password_required",
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

function renderUrl(form: Form): string {
  if (isTestingServer({ name: form.name, url: form.host })) {
    return form.host;
  }

  const protocol = form.useSSL ? "https" : "http";
  const port =
    !form.port || (form.useSSL && form.port === 443) || (!form.useSSL && form.port === 80)
      ? ""
      : `:${form.port}`;
  const path = form.path?.startsWith("/") ? form.path : `/${form.path}`;

  return `${protocol}://${form.host}${port}${path}`;
}

async function testConnection(f: Form): Promise<string> {
  const creds = {
    url: renderUrl(f),
    ...f,
  };

  if (isTestingServer(creds)) {
    return "connected";
  }

  const client = new TransmissionClient(creds);
  try {
    await client.request({ method: "session-get" });
    return "connected";
  } catch (e) {
    if (e instanceof HTTPError) {
      return `http_error::${e.message}`;
    } else if (e instanceof TransmissionError) {
      return `transmission_error_msg::${e.message}`;
    } else if (e instanceof Error) {
      return `error_msg::${e.message}`;
    }
    return "unknown_error";
  }
}

function defaultValues(server?: Server): Form {
  if (!server) {
    return {
      name: "",
      host: "",
      port: 9091,
      path: "/transmission/rpc",
      useSSL: false,
      useAuth: false,
      username: "",
      password: "",
    };
  }

  if (isTestingServer(server)) {
    return {
      name: "app",
      host: "app-testing-url",
      port: 9091,
      path: "/transmission/rpc",
      useSSL: false,
      useAuth: false,
      username: "",
      password: "",
    };
  }

  return {
    ...parseUrl(server.url),
    ...server,
    useAuth: Boolean(server.username || server.password),
  };
}


export default function ConnectionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { servers, store } = useServersStore();
  const { red, gray, green } = useTheme();
  const { t } = useTranslation();

  const editServer = id ? servers.find((s) => s.id === id) : undefined;
  const isEdit = Boolean(editServer);
  const deleteSheet = useServerDeleteConfirmSheet();

  const inset = useSafeAreaInsets();

  const { control, handleSubmit, watch, setValue } = useForm({
    mode: "onSubmit",
    resolver: zodResolver(Form),
    defaultValues: defaultValues(editServer),
  });

  const useAuth = watch("useAuth");
  const useSSL = watch("useSSL");
  const scroll = React.useRef<ScrollView>(null);

  const onSSLChange = React.useCallback(
    (enabled: boolean) => {
      setValue("useSSL", enabled);
      setValue("port", enabled ? ("" as unknown as number) : 9091);
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

      if (editServer) {
        const updated = servers.map((s) =>
          s.id === editServer.id
            ? { ...s, name: f.name, url, username: f.username, password: f.password, updatedAt: now }
            : s
        );
        store({ servers: updated });
      } else {
        const newServer: Server = {
          id: generateServerId(),
          name: f.name,
          url,
          username: f.username,
          password: f.password,
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
  } = useMutation({
    mutationFn: testConnection,
  });

  const statusText = React.useMemo(() => {
    if (isPending) return t("connecting");
    if (!data) return t("not_connected");
    if (data === "connected") return t("connected");
    if (data === "unknown_error") return t("unknown_error");
    if (data.includes("::")) {
      const [key, msg] = data.split("::");
      return t(key, { message: msg });
    }
    return data;
  }, [isPending, data, t]);

  const statusColor =
    isPending || !data
      ? gray
      : data === "connected"
      ? green
      : red;

  const onTest = React.useCallback(
    (f: Form) => {
      test(f, {
        onSettled: () => {
          scroll.current?.scrollToEnd({ animated: true });
        },
      });
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
        <View style={styles.row}>
          <Text style={styles.label}>
            {t("name")} <Required />
          </Text>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <TextInput
                  placeholder="remote server"
                  style={[
                    styles.input,
                    fieldState.error ? { borderColor: red } : {},
                  ]}
                  onChangeText={field.onChange}
                  value={field.value?.toString() || ""}
                />
                <Text style={[styles.error, { color: red }]}>
                  {fieldState.error?.message && t(fieldState.error.message)}
                </Text>
              </>
            )}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>
            {t("host_ip")} <Required />
          </Text>
          <Controller
            name="host"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <TextInput
                  placeholder="192.168.1.100"
                  style={[
                    styles.input,
                    fieldState.error ? { borderColor: red } : {},
                  ]}
                  value={field.value?.toString() || ""}
                  onChangeText={field.onChange}
                />
                <Text style={[styles.error, { color: red }]}>
                  {fieldState.error?.message && t(fieldState.error.message)}
                </Text>
              </>
            )}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>{t("port")}</Text>
          <Controller
            name="port"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <TextInput
                  placeholder={useSSL ? "443" : "9091"}
                  keyboardType="numeric"
                  style={[
                    styles.input,
                    fieldState.error ? { borderColor: red } : {},
                  ]}
                  value={field.value?.toString() || ""}
                  onChangeText={field.onChange}
                />
                <Text style={[styles.error, { color: red }]}>
                  {fieldState.error?.message && t(fieldState.error.message)}
                </Text>
              </>
            )}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>{t("path")}</Text>
          <Controller
            name="path"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <TextInput
                  placeholder="/transmission/rpc"
                  style={[
                    styles.input,
                    fieldState.error ? { borderColor: red } : {},
                  ]}
                  value={field.value?.toString() || ""}
                  onChangeText={field.onChange}
                />
                <Text style={[styles.error, { color: red }]}>
                  {fieldState.error?.message && t(fieldState.error.message)}
                </Text>
              </>
            )}
          />
        </View>

        <View style={[styles.row]}>
          <Controller
            name="useSSL"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <Toggle
                  label={t("use_ssl")}
                  description={t("enable_secure_connection")}
                  value={field.value}
                  onPress={onSSLChange}
                />
                <Text style={[styles.error, { color: red }]}>
                  {fieldState.error?.message && t(fieldState.error.message)}
                </Text>
              </>
            )}
          />
        </View>

        <View style={[styles.row]}>
          <Controller
            name="useAuth"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <Toggle
                  label={t("authentication")}
                  description={t("enable_local_authentication")}
                  value={field.value}
                  onPress={field.onChange}
                />
                <Text style={[styles.error, { color: red }]}>
                  {fieldState.error?.message && t(fieldState.error.message)}
                </Text>
              </>
            )}
          />
        </View>

        {useAuth && (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>
                {t("username")} <Required />
              </Text>
              <Controller
                name="username"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <TextInput
                      style={[
                        styles.input,
                        fieldState.error ? { borderColor: red } : {},
                      ]}
                      value={field.value?.toString() || ""}
                      onChangeText={field.onChange}
                    />
                    <Text style={[styles.error, { color: red }]}>
                      {fieldState.error?.message && t(fieldState.error.message)}
                    </Text>
                  </>
                )}
              />
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>
                {t("password")} <Required />
              </Text>
              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <TextInput
                      style={[
                        styles.input,
                        fieldState.error ? { borderColor: red } : {},
                      ]}
                      value={field.value?.toString() || ""}
                      onChangeText={field.onChange}
                      secureTextEntry
                    />
                    <Text style={[styles.error, { color: red }]}>
                      {fieldState.error?.message && t(fieldState.error.message)}
                    </Text>
                  </>
                )}
              />
            </View>
          </>
        )}

        <View style={[styles.row, styles.connection, { borderColor: gray }]}>
          <Text style={styles.label}>{t("connection_status")}</Text>
          <Text>{statusText}</Text>
          <ProgressBar progress={100} color={statusColor} />
        </View>

        <Button
          title={t("test_connection")}
          onPress={handleSubmit(onTest)}
          style={{ marginTop: 8, marginBottom: 8, backgroundColor: green }}
        />

        <Button
          title={t("save")}
          onPress={handleSubmit(onSubmit)}
          style={{ marginTop: 8, marginBottom: 16 }}
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
  input: {},
  error: {
    fontSize: 12,
    textTransform: "lowercase",
    marginTop: 4,
  },
  connection: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
});
