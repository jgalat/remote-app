import * as React from "react";
import { StyleSheet, TextStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SheetManager } from "react-native-actions-sheet";

import Text from "./text";
import Pressable, { PressableProps } from "./pressable";
import { useTheme } from "../hooks/use-theme-color";
import { useTranslation } from "react-i18next";
import type { SelectOption } from "../sheets/select";

export type SelectInputProps = {
  title?: string;
  placeholder?: string;
  value?: string | number;
  options: SelectOption[];
  onChange?: (value: string | number) => void;
  titleStyle?: TextStyle;
} & Omit<PressableProps, "onPress">;

export default React.memo(function SelectInput({
  style,
  title,
  placeholder,
  value,
  options = [],
  onChange,
  disabled,
  titleStyle,
  ...props
}: SelectInputProps) {
  const { text, lightGray, background, gray } = useTheme();
  const { t } = useTranslation();

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption?.label || placeholder || t("select_an_option");

  const handlePress = () => {
    SheetManager.show("select", {
      payload: {
        title,
        options,
        onSelect: (selectedValue: string | number) => {
          onChange?.(selectedValue);
        },
      },
    });
  };

  return (
    <Pressable
      style={[
        styles.button,
        {
          borderWidth: 2,
          backgroundColor: background,
          borderColor: disabled ? lightGray : text,
        },
        style,
      ]}
      disabled={disabled}
      onPress={disabled ? undefined : handlePress}
      {...props}
    >
      <Text
        color={selectedOption ? text : gray}
        style={[styles.buttonText, titleStyle]}
      >
        {displayText}
      </Text>
      <Feather
        color={disabled ? lightGray : gray}
        size={16}
        name="chevron-down"
      />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 8,
  },
  buttonText: {
    flex: 1,
  },
});
