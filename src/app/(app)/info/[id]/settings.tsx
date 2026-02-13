import * as React from "react";
import { StyleSheet, ToastAndroid } from "react-native";
import { useGlobalSearchParams } from "expo-router";
import { z } from "zod";
import { Mode, Priority } from "@remote-app/transmission-client";

import Toggle from "~/components/toggle";
import Text from "~/components/text";
import View from "~/components/view";
import TextInput from "~/components/text-input";
import Screen from "~/components/screen";
import SelectInput from "~/components/select-input";
import { useTorrent, useTorrentSet } from "~/hooks/transmission";
import {
  NetworkErrorScreen,
  LoadingScreen,
} from "~/components/utility-screens";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "~/hooks/use-theme-color";

type Form = z.infer<typeof Form>;
const Form = z
  .object({
    bandwidthPriority: z.number(),

    honorsSessionLimits: z.boolean(),
    downloadLimited: z.boolean(),
    downloadLimit: z.coerce.number({ message: "Expected a number" }),
    uploadLimited: z.boolean(),
    uploadLimit: z.coerce.number({ message: "Expected a number" }),

    seedIdleMode: z.number(),
    seedIdleLimit: z.coerce.number({ message: "Expected a number" }),
    seedRatioMode: z.number(),
    seedRatioLimit: z.coerce.number({ message: "Expected a number" }),
  })
  .superRefine((data, ctx) => {
    if (data["downloadLimited"] && !data["downloadLimit"]) {
      ctx.addIssue({
        path: ["downloadLimit"],
        code: z.ZodIssueCode.custom,
        message: "Field is required",
      });
    }
    if (data["uploadLimited"] && !data["uploadLimit"]) {
      ctx.addIssue({
        path: ["uploadLimit"],
        code: z.ZodIssueCode.custom,
        message: "Field is required",
      });
    }
    if (data["seedRatioMode"] === Mode.SINGLE && !data["seedRatioLimit"]) {
      ctx.addIssue({
        path: ["seedRatioLimit"],
        code: z.ZodIssueCode.custom,
        message: "Field is required",
      });
    }
    if (data["seedIdleMode"] === Mode.SINGLE && !data["seedIdleLimit"]) {
      ctx.addIssue({
        path: ["seedIdleLimit"],
        code: z.ZodIssueCode.custom,
        message: "Field is required",
      });
    }
  });

export default function TorrentSettingsScreen() {
  const { id } = useGlobalSearchParams<{ id: string }>();
  const { data: torrents, error, isLoading, refetch } = useTorrent(+id);

  const { mutate } = useTorrentSet(+id);
  const { red } = useTheme();
  const inset = useSafeAreaInsets();

  const { control, handleSubmit, watch } = useForm({
    mode: "onBlur",
    resolver: zodResolver(Form),
    values: torrents?.[0],
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

  if (isLoading || !torrents || torrents.length !== 1) {
    return <LoadingScreen />;
  }

  return (
    <Screen style={styles.container}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        bottomOffset={8}
        contentInset={{ bottom: inset.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { marginTop: 0 }]}>Bandwidth</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Transfer Priority</Text>
          <Controller
            name="bandwidthPriority"
            control={control}
            render={({ field }) => (
              <SelectInput
                value={field.value}
                onChange={(v) => {
                  field.onChange(v);
                  onSubmit();
                }}
                options={[
                  {
                    label: "High",
                    left: "chevrons-up" as const,
                    value: Priority.HIGH,
                  },
                  {
                    label: "Normal",
                    left: "minus" as const,
                    value: Priority.NORMAL,
                  },
                  {
                    label: "Low",
                    left: "chevrons-down" as const,
                    value: Priority.LOW,
                  },
                ]}
                title="Transfer Priority"
              />
            )}
          />
        </View>

        <View style={styles.row}>
          <Controller
            name="honorsSessionLimits"
            control={control}
            render={({ field }) => (
              <Toggle
                value={field.value}
                onPress={(v) => {
                  field.onChange(v);
                  onSubmit();
                }}
                label="Honors session limits"
              />
            )}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.label}>
            <Controller
              name="downloadLimited"
              control={control}
              render={({ field }) => (
                <Toggle
                  value={field.value}
                  onPress={(v) => {
                    field.onChange(v);
                    onSubmit();
                  }}
                  label="DOWNLOAD LIMIT (KB/S)"
                />
              )}
            />
          </View>
          <Controller
            name="downloadLimit"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <TextInput
                  keyboardType="numeric"
                  editable={watch("downloadLimited")}
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
              name="uploadLimited"
              control={control}
              render={({ field }) => (
                <Toggle
                  value={field.value}
                  onPress={(v) => {
                    field.onChange(v);
                    onSubmit();
                  }}
                  label="UPLOAD LIMIT (KB/S)"
                />
              )}
            />
          </View>
          <Controller
            name="uploadLimit"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <TextInput
                  keyboardType="numeric"
                  editable={watch("uploadLimited")}
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
          <Text style={styles.label}>Stop seeding at ratio</Text>
          <Controller
            name="seedRatioMode"
            control={control}
            render={({ field }) => (
              <SelectInput
                value={field.value}
                onChange={(v) => {
                  field.onChange(v);
                  onSubmit();
                }}
                options={[
                  {
                    label: "Global settings",
                    left: "globe" as const,
                    value: Mode.GLOBAL,
                  },
                  {
                    label: "Stop at ratio",
                    left: "sliders" as const,
                    value: Mode.SINGLE,
                  },
                  {
                    label: "Unlimited",
                    left: "zap" as const,
                    value: Mode.UNLIMITED,
                  },
                ]}
                title="Ratio Limit Mode"
              />
            )}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Ratio limit</Text>
          <Controller
            name="seedRatioLimit"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <TextInput
                  keyboardType="numeric"
                  editable={watch("seedRatioMode") === Mode.SINGLE}
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
          <Text style={styles.label}>Stop seeding if idle</Text>
          <Controller
            name="seedIdleMode"
            control={control}
            render={({ field }) => (
              <SelectInput
                value={field.value}
                onChange={(v) => {
                  field.onChange(v);
                  onSubmit();
                }}
                options={[
                  {
                    label: "Global settings",
                    left: "globe" as const,
                    value: Mode.GLOBAL,
                  },
                  {
                    label: "Stop when inactive",
                    left: "sliders" as const,
                    value: Mode.SINGLE,
                  },
                  {
                    label: "Unlimited",
                    left: "zap" as const,
                    value: Mode.UNLIMITED,
                  },
                ]}
                title="Idle Mode"
              />
            )}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Idle seeding limit (minutes)</Text>
          <Controller
            name="seedIdleLimit"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <TextInput
                  keyboardType="numeric"
                  editable={watch("seedIdleMode") === Mode.SINGLE}
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
      </KeyboardAwareScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "stretch",
    paddingTop: 16,
    paddingBottom: 24,
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
