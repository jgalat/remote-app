import * as React from "react";
import { StyleSheet } from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  KeyboardAwareScrollView,
} from "react-native-keyboard-controller";
import { z } from "zod";

import Button from "~/components/button";
import ConnectionTest from "~/components/connection-test";
import Screen from "~/components/screen";
import { SettingsFieldRow, SettingsSectionTitle } from "~/components/settings";
import Text from "~/components/text";
import TextInput from "~/components/text-input";
import Toggle from "~/components/toggle";
import { useTheme } from "~/hooks/use-theme-color";
import { useServersStore } from "~/hooks/use-settings";
import { useTestConnection } from "~/hooks/use-test-connection";
import { debugHref } from "~/lib/debug-href";
import { defaultPortForSSL, typeDefaults } from "~/utils/server-connection-defaults";
import {
  comparableServerAddress,
  parseServerAddress,
  renderServerAddress,
} from "~/utils/server-address";
import { usePro } from "@remote-app/pro";

const AddressForm = z.object({
  host: z.string().trim().min(1, "host / IP address is required"),
  port: z.coerce
    .number()
    .int()
    .min(1, "minimum port is 1")
    .max(65_535, "maximum port is 65535"),
  path: z.string(),
  useSSL: z.boolean(),
});

type AddressForm = z.infer<typeof AddressForm>;

function Required() {
  const { tint } = useTheme();
  return <Text color={tint}>*</Text>;
}

export default function ConnectionAddressScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const inset = useSafeAreaInsets();
  const { serverId, address } = useLocalSearchParams<{
    serverId: string;
    address: string;
  }>();
  const { servers, store } = useServersStore();
  const { isPro } = usePro();
  const { red } = useTheme();

  const server = servers.find((item) => item.id === serverId);
  const isPrimary = address === "primary";
  const isNew = address === "new";
  const alternativeIndex = isPrimary || isNew ? -1 : Number(address);
  const existingUrl = isPrimary
    ? server?.url
    : alternativeIndex >= 0
      ? server?.alternativeUrls[alternativeIndex]
      : undefined;
  const type = server?.type ?? "transmission";
  const defaults = existingUrl
    ? parseServerAddress(existingUrl, type)
    : {
        host: "",
        port: typeDefaults[type].port,
        path: typeDefaults[type].path,
        useSSL: false,
      };

  const {
    control,
    getValues,
    handleSubmit,
    setError,
    setValue,
  } = useForm<AddressForm>({
    mode: "onSubmit",
    resolver: zodResolver(AddressForm),
    defaultValues: defaults,
  });

  const {
    data,
    isPending,
    mutate: test,
    reset: resetTest,
  } = useTestConnection();

  React.useEffect(() => {
    navigation.setOptions({
      title: isPrimary ? "Primary Address" : isNew ? "Add Address" : "Alternative Address",
    });
  }, [isNew, isPrimary, navigation]);

  React.useEffect(() => {
    const invalidAlternative =
      !isPrimary && !isNew &&
      (!Number.isInteger(alternativeIndex) || !existingUrl);
    if (!server || server.type === "local" || invalidAlternative) {
      router.dismissTo("/settings/servers");
      return;
    }

    if (!isPrimary && !isPro) {
      router.replace("/paywall");
    }
  }, [alternativeIndex, existingUrl, isNew, isPrimary, isPro, router, server]);

  if (!server || server.type === "local") return null;

  const onSSLChange = (enabled: boolean) => {
    resetTest();
    setValue("useSSL", enabled);
    setValue("port", defaultPortForSSL(server.type, enabled));
  };

  const connectionParams = (form: AddressForm) => ({
    type: server.type,
    name: server.name,
    url: renderServerAddress(form),
    username: server.username,
    password: server.password,
    requestTimeoutMs: server.connectionTimeoutMs ?? 30_000,
  });

  const onTest = (form: AddressForm) => {
    test(connectionParams(form));
  };

  const onSave = (form: AddressForm) => {
    const url = renderServerAddress(form);
    const comparable = comparableServerAddress(url);
    const addresses = [server.url, ...server.alternativeUrls];
    const currentIndex = isPrimary ? 0 : isNew ? -1 : alternativeIndex + 1;
    const duplicate = addresses.some(
      (item, index) =>
        index !== currentIndex && comparableServerAddress(item) === comparable,
    );

    if (duplicate) {
      setError("host", { message: "this address is already configured" });
      return;
    }

    const alternativeUrls = [...server.alternativeUrls];
    const primaryUrl = isPrimary ? url : server.url;
    if (isNew) {
      alternativeUrls.push(url);
    } else if (!isPrimary) {
      alternativeUrls[alternativeIndex] = url;
    }

    const updated = servers.map((item) =>
      item.id === server.id
        ? {
            ...item,
            url: primaryUrl,
            alternativeUrls,
            updatedAt: Date.now(),
          }
        : item,
    );
    store({ servers: updated }, { onSuccess: () => router.back() });
  };

  const openTestDetails = () => {
    if (!data?.error) return;
    const params = connectionParams(getValues());
    router.push(
      debugHref({
        url: params.url,
        username: params.username,
        password: params.password,
        errorName: data.error.name,
        errorMessage: data.error.message,
        errorStatus: data.error.status,
        errorBody: data.error.body,
      }),
    );
  };

  return (
    <Screen>
      <KeyboardAwareScrollView
        style={styles.scroll}
        bottomOffset={8}
        contentInset={{ bottom: inset.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSectionTitle title="Address" first />

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
                style={fieldState.error ? { borderColor: red } : undefined}
                value={field.value}
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
                keyboardType="numeric"
                style={fieldState.error ? { borderColor: red } : undefined}
                value={field.value?.toString() ?? ""}
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
                placeholder={typeDefaults[server.type].path || "/"}
                autoCapitalize="none"
                autoCorrect={false}
                style={fieldState.error ? { borderColor: red } : undefined}
                value={field.value}
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

        <SettingsSectionTitle title="Connection test" />
        <ConnectionTest
          data={data}
          isPending={isPending}
          onPress={handleSubmit(onTest)}
          onDetails={data?.error ? openTestDetails : undefined}
        />
        <Button
          title="save address"
          onPress={handleSubmit(onSave)}
          style={styles.saveButton}
        />
      </KeyboardAwareScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  label: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 13,
  },
  saveButton: {
    marginTop: 32,
    marginBottom: 16,
  },
});
