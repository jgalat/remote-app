import * as React from "react";
import { ToastAndroid } from "react-native";
import { useGlobalSearchParams } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { z } from "zod";
import { Mode, Priority } from "~/client";

import Toggle from "~/components/toggle";
import TextInput from "~/components/text-input";
import Screen from "~/components/screen";
import SelectInput from "~/components/select-input";
import { SettingsFieldRow, SettingsSectionTitle } from "~/components/settings";
import { useHeaderAction } from "~/contexts/header-action";
import { useTorrentSettings, useTorrentSet } from "~/hooks/torrent";
import { useServer } from "~/hooks/use-settings";
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
    bandwidthPriority: z.number().optional(),

    honorsSessionLimits: z.boolean().optional(),
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
  const server = useServer();
  const { data: torrent, error, isLoading, refetch } = useTorrentSettings(id);

  const { mutate } = useTorrentSet(id);
  const { red } = useTheme();
  const isTransmission = server?.type !== "qbittorrent";
  const inset = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { setAction } = useHeaderAction();

  const { control, handleSubmit, watch, reset } = useForm({
    mode: "onBlur",
    resolver: zodResolver(Form),
    values: torrent,
    resetOptions: { keepDirtyValues: true },
  });
  const downloadLimited = watch("downloadLimited");
  const uploadLimited = watch("uploadLimited");
  const seedRatioMode = watch("seedRatioMode");
  const seedIdleMode = watch("seedIdleMode");

  const onSubmit = handleSubmit(
    React.useCallback(
      (f: Form) => {
        const params: Form = isTransmission ? f : {
          ...f,
          downloadLimited: f.downloadLimit > 0,
          uploadLimited: f.uploadLimit > 0,
        };
        mutate(params, {
          onSuccess: () => {
            ToastAndroid.show(
              "Torrent settings updated successfully",
              ToastAndroid.SHORT
            );
          },
          onError: () => {
            ToastAndroid.show("Failed to update server", ToastAndroid.SHORT);
          },
        });
      },
      [mutate, isTransmission]
    )
  );

  const onSubmitRef = React.useRef(onSubmit);
  onSubmitRef.current = onSubmit;

  React.useEffect(() => {
    if (isFocused) {
      setAction(() => () => onSubmitRef.current());
    } else {
      setAction(null);
      reset();
    }
    return () => setAction(null);
  }, [isFocused, setAction, reset]);

  if (error) {
    return <NetworkErrorScreen error={error} refetch={refetch} />;
  }

  if (isLoading || !torrent) {
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
        <SettingsSectionTitle title="Bandwidth" first />

        {isTransmission && (
          <>
            <SettingsFieldRow label="Transfer priority">
              <Controller
                name="bandwidthPriority"
                control={control}
                render={({ field }) => (
                  <SelectInput
                    variant="settings"
                    value={field.value ?? Priority.NORMAL}
                    onChange={field.onChange}
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
            </SettingsFieldRow>

            <SettingsFieldRow>
              <Controller
                name="honorsSessionLimits"
                control={control}
                render={({ field }) => (
                  <Toggle
                    variant="settings"
                    value={field.value ?? true}
                    onPress={field.onChange}
                    label="Honor session limits"
                    description="Use server-wide speed limits for this torrent."
                  />
                )}
              />
            </SettingsFieldRow>
          </>
        )}

        {isTransmission ? (
          <>
            <SettingsFieldRow>
              <Controller
                name="downloadLimited"
                control={control}
                render={({ field }) => (
                  <Toggle
                    variant="settings"
                    value={field.value}
                    onPress={field.onChange}
                    label="Enable download limit"
                  />
                )}
              />
            </SettingsFieldRow>

            <Controller
              name="downloadLimit"
              control={control}
              render={({ field, fieldState }) => (
                <SettingsFieldRow
                  label="Download limit (KB/s)"
                  error={fieldState.error?.message}
                  reserveErrorSpace
                >
                  <TextInput
                    variant="settings"
                    keyboardType="numeric"
                    editable={downloadLimited}
                    value={field.value?.toString() || ""}
                    onChangeText={field.onChange}
                    style={fieldState.error ? { borderColor: red } : undefined}
                  />
                </SettingsFieldRow>
              )}
            />

            <SettingsFieldRow>
              <Controller
                name="uploadLimited"
                control={control}
                render={({ field }) => (
                  <Toggle
                    variant="settings"
                    value={field.value}
                    onPress={field.onChange}
                    label="Enable upload limit"
                  />
                )}
              />
            </SettingsFieldRow>

            <Controller
              name="uploadLimit"
              control={control}
              render={({ field, fieldState }) => (
                <SettingsFieldRow
                  label="Upload limit (KB/s)"
                  error={fieldState.error?.message}
                  reserveErrorSpace
                >
                  <TextInput
                    variant="settings"
                    keyboardType="numeric"
                    editable={uploadLimited}
                    value={field.value?.toString() || ""}
                    onChangeText={field.onChange}
                    style={fieldState.error ? { borderColor: red } : undefined}
                  />
                </SettingsFieldRow>
              )}
            />
          </>
        ) : (
          <>
            <Controller
              name="downloadLimit"
              control={control}
              render={({ field, fieldState }) => (
                <SettingsFieldRow
                  label="Download limit (KB/s, 0 = unlimited)"
                  error={fieldState.error?.message}
                  reserveErrorSpace
                >
                  <TextInput
                    variant="settings"
                    keyboardType="numeric"
                    value={field.value?.toString() || ""}
                    onChangeText={field.onChange}
                    style={fieldState.error ? { borderColor: red } : undefined}
                  />
                </SettingsFieldRow>
              )}
            />

            <Controller
              name="uploadLimit"
              control={control}
              render={({ field, fieldState }) => (
                <SettingsFieldRow
                  label="Upload limit (KB/s, 0 = unlimited)"
                  error={fieldState.error?.message}
                  reserveErrorSpace
                >
                  <TextInput
                    variant="settings"
                    keyboardType="numeric"
                    value={field.value?.toString() || ""}
                    onChangeText={field.onChange}
                    style={fieldState.error ? { borderColor: red } : undefined}
                  />
                </SettingsFieldRow>
              )}
            />
          </>
        )}

        <SettingsSectionTitle title="Seed" />

        <SettingsFieldRow label="Stop seeding at ratio">
          <Controller
            name="seedRatioMode"
            control={control}
            render={({ field }) => (
              <SelectInput
                variant="settings"
                value={field.value}
                onChange={field.onChange}
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
        </SettingsFieldRow>

        <Controller
          name="seedRatioLimit"
          control={control}
          render={({ field, fieldState }) => (
            <SettingsFieldRow
              label="Ratio limit"
              error={fieldState.error?.message}
              reserveErrorSpace
            >
              <TextInput
                variant="settings"
                keyboardType="numeric"
                editable={seedRatioMode === Mode.SINGLE}
                value={field.value?.toString() || ""}
                onChangeText={field.onChange}
                style={fieldState.error ? { borderColor: red } : undefined}
              />
            </SettingsFieldRow>
          )}
        />

        <SettingsFieldRow label="Stop seeding if idle">
          <Controller
            name="seedIdleMode"
            control={control}
            render={({ field }) => (
              <SelectInput
                variant="settings"
                value={field.value}
                onChange={field.onChange}
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
        </SettingsFieldRow>

        <Controller
          name="seedIdleLimit"
          control={control}
          render={({ field, fieldState }) => (
            <SettingsFieldRow
              label="Idle seeding limit (minutes)"
              error={fieldState.error?.message}
              reserveErrorSpace
            >
              <TextInput
                variant="settings"
                keyboardType="numeric"
                editable={seedIdleMode === Mode.SINGLE}
                value={field.value?.toString() || ""}
                onChangeText={field.onChange}
                style={fieldState.error ? { borderColor: red } : undefined}
              />
            </SettingsFieldRow>
          )}
        />
      </KeyboardAwareScrollView>
    </Screen>
  );
}
