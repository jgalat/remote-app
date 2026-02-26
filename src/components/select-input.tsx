import * as React from "react";
import { StyleSheet, TextStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SheetManager } from "react-native-actions-sheet";

import Text from "./text";
import Pressable, { PressableProps } from "./pressable";
import { useTheme } from "~/hooks/use-theme-color";
import type { SelectOption } from "~/sheets/select";

export type SelectInputProps = {
  title?: string;
  placeholder?: string;
  value?: string | number;
  options: SelectOption[];
  onChange?: (value: string | number) => void;
  titleStyle?: TextStyle;
  variant?: "default" | "settings";
} & Omit<PressableProps, "onPress">;

export default React.memo(function SelectInput({
  style,
  title,
  placeholder = "Select an option",
  value,
  options = [],
  onChange,
  disabled,
  titleStyle,
  variant = "default",
  ...props
}: SelectInputProps) {
  const { text, lightGray, background, gray } = useTheme();
  const settings = variant === "settings";

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption?.label || placeholder;

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
        settings ? styles.settingsButton : styles.button,
        {
          backgroundColor: background,
          borderColor: disabled ? lightGray : settings ? lightGray : text,
        },
        style,
      ]}
      disabled={disabled}
      onPress={disabled ? undefined : handlePress}
      {...props}
    >
      <Text
        color={selectedOption ? text : gray}
        style={[
          styles.buttonText,
          settings && styles.settingsButtonText,
          titleStyle,
        ]}
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
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 8,
  },
  settingsButton: {
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
  },
  buttonText: {
    flex: 1,
  },
  settingsButtonText: {
    fontSize: 14,
  },
});
