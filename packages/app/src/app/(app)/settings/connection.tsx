import * as React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { router, useNavigation } from "expo-router";
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

import Text from "~/components/text";
import View from "~/components/view";
import Screen from "~/components/screen";
import TextInput from "~/components/text-input";
import Button from "~/components/button";
import Toggle from "~/components/toggle";
import useThemeColor, { useTheme } from "~/hooks/use-theme-color";
import useSettings from "~/hooks/use-settings";
import type { Server } from "~/store/settings";
import { isTestingServer } from "~/utils/mock-transmission-client";
import ActionIcon from "~/components/action-icon";
import ProgressBar from "~/components/progress-bar";

type Form = z.infer<typeof Form>;
const Form = z
  .object({
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

function renderUrl(form: Form): string {
  if (isTestingServer({ name: form.name, url: form.host })) {
    return form.host;
  }

  const protocol = form.useSSL ? "https" : "http";
  const port =
    (form.useSSL && form.port === 443) || (!form.useSSL && form.port === 80)
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
    return "Connected";
  }

  const client = new TransmissionClient(creds);
  try {
    await client.request({ method: "session-get" });
    return "Connected";
  } catch (e: any) {
    if (e instanceof HTTPError) {
      return `HTTP Error: ${e.message}`;
    } else if (e instanceof TransmissionError) {
      return `Transmission Error: ${e.message}`;
    } else if ("message" in e) {
      return `Error: ${e.message}`;
    }
    return "Unknown error";
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

function Required() {
  const color = useThemeColor("tint");
  return <Text style={{ color }}>*</Text>;
}

export default function ConnectionScreen() {
  const {
    settings: { server },
    store,
  } = useSettings();
  const { red, gray, green } = useTheme();

  const inset = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onSubmit",
    resolver: zodResolver(Form),
    defaultValues: defaultValues(server),
  });

  const useAuth = watch("useAuth");
  const scroll = React.useRef<ScrollView>(null);

  const navigation = useNavigation();
  const remove = React.useCallback(async () => {
    store({ server: undefined });
    router.dismissTo("/settings");
  }, [store]);

  React.useEffect(() => {
    if (!server) return;
    navigation.setOptions({
      headerRight: () => (
        <ActionIcon onPress={remove} name="trash-2" color={red} />
      ),
    });
  }, [server, remove, navigation, red]);

  const onSubmit = React.useCallback(
    (f: Form) => {
      store({
        server: {
          url: renderUrl(f),
          ...f,
        },
      });
      router.dismissAll();
    },
    [store]
  );

  const { data, isPending, mutate } = useMutation({
    mutationFn: testConnection,
  });

  const status = isPending ? "Connecting..." : data ? data : "Not connected";
  const statusColor =
    status === "Not connected" || status === "Connecting..."
      ? gray
      : status === "Connected"
        ? green
        : red;

  const onTest = React.useCallback(
    (f: Form) => {
      mutate(f, {
        onSettled: () => {
          scroll.current?.scrollToEnd({ animated: true });
        },
      });
    },
    [mutate]
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
            Name <Required />
          </Text>
          <TextInput
            name="name"
            control={control}
            placeholder="remote server"
            style={[styles.input, errors.name ? { borderColor: red } : {}]}
          />
          <Text style={[styles.error, { color: red }]}>
            {errors.name?.message}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>
            HOST / IP ADDRESS <Required />
          </Text>
          <TextInput
            name="host"
            control={control}
            placeholder="192.168.1.100"
            style={[styles.input, errors.host ? { borderColor: red } : {}]}
          />
          <Text style={[styles.error, { color: red }]}>
            {errors.host?.message}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>PORT</Text>
          <TextInput
            name="port"
            control={control}
            placeholder="9091"
            style={[styles.input, errors.port ? { borderColor: red } : {}]}
          />
          <Text style={[styles.error, { color: red }]}>
            {errors.port?.message}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>PATH</Text>
          <TextInput
            name="path"
            control={control}
            placeholder="/transmission/rpc"
            style={[styles.input, errors.path ? { borderColor: red } : {}]}
          />
          <Text style={[styles.error, { color: red }]}>
            {errors.path?.message}
          </Text>
        </View>

        <View style={[styles.row, styles.toggle]}>
          <View>
            <Text style={[styles.label, { marginBottom: 4 }]}>
              Use SSL/HTTPS
            </Text>
            <Text style={{ color: gray }}>Enable secure connection</Text>
          </View>
          <Controller
            name="useSSL"
            control={control}
            render={({ field }) => (
              <Toggle value={field.value} onPress={field.onChange} />
            )}
          />
        </View>
        <Text style={[styles.error, { color: red }]}>
          {errors.useSSL?.message}
        </Text>

        <View style={[styles.row, styles.toggle]}>
          <View>
            <Text style={[styles.label, { marginBottom: 4 }]}>
              AUTHENTICATION
            </Text>
            <Text style={{ color: gray }}>Username and password required</Text>
          </View>
          <Controller
            name="useAuth"
            control={control}
            render={({ field }) => (
              <Toggle value={field.value} onPress={field.onChange} />
            )}
          />
        </View>
        <Text style={[styles.error, { color: red }]}>
          {errors.useAuth?.message}
        </Text>

        {useAuth && (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>
                USERNAME <Required />
              </Text>
              <TextInput
                name="username"
                control={control}
                placeholder=""
                style={[
                  styles.input,
                  errors.username ? { borderColor: red } : {},
                ]}
              />
              <Text style={[styles.error, { color: red }]}>
                {errors.username?.message}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>
                PASSWORD <Required />
              </Text>
              <TextInput
                name="password"
                control={control}
                placeholder=""
                secureTextEntry={true}
                style={[
                  styles.input,
                  errors.password ? { borderColor: red } : {},
                ]}
              />
              <Text style={[styles.error, { color: red }]}>
                {errors.password?.message}
              </Text>
            </View>
          </>
        )}

        <View style={[styles.row, styles.connection, { borderColor: gray }]}>
          <Text style={styles.label}>CONNECTION STATUS</Text>
          <Text>{status}</Text>
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
          style={{ marginTop: 8 }}
        />
      </KeyboardAwareScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 12,
  },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
