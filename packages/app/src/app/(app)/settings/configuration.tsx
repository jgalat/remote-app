import * as React from "react";
import { StyleSheet, ToastAndroid } from "react-native";
import { z } from "zod";

import Toggle from "~/components/toggle";
import Text from "~/components/text";
import View from "~/components/view";
import TextInput from "~/components/text-input";
import Screen from "~/components/screen";
import { useSession, useSessionSet } from "~/hooks/use-transmission";
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
    "speed-limit-down-enabled": z.boolean(),
    "speed-limit-down": z.coerce.number({ message: "Expected a number" }),
    "speed-limit-up-enabled": z.boolean(),
    "speed-limit-up": z.coerce.number({ message: "Expected a number" }),
    "alt-speed-enabled": z.boolean(),
    "alt-speed-down": z.coerce.number({ message: "Expected a number" }),
    "alt-speed-up": z.coerce.number({ message: "Expected a number" }),
    "download-queue-enabled": z.boolean(),
    "download-queue-size": z.coerce.number({ message: "Expected a number" }),
    "seed-queue-enabled": z.boolean(),
    "seed-queue-size": z.coerce.number({ message: "Expected a number" }),
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

export default function ServerConfigurationScreen() {
  const { data: session, isLoading, error, refetch } = useSession();
  const { mutate } = useSessionSet();
  const { red } = useTheme();
  const inset = useSafeAreaInsets();

  const { control, handleSubmit, watch } = useForm({
    mode: "onBlur",
    resolver: zodResolver(Form),
    defaultValues: session,
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

        <View style={[styles.row]}>
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
      </KeyboardAwareScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
