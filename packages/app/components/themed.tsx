import {
  Text as DefaultText,
  View as DefaultView,
  ScrollView as DefaultScrollView,
  TextInput as DefaultTextInput,
  Button as DefaultButton,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import Colors from "../constants/colors";
import { useColorScheme } from "../hooks/use-settings";

function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText["props"];
export type ViewProps = ThemeProps & DefaultView["props"];
export type ScreenProps = ThemeProps &
  DefaultView["props"] & {
    scroll?: boolean;
  };
export type TextInputProps = DefaultTextInput["props"];
export type ButtonProps = TouchableOpacity["props"] & {
  title: string;
};

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <DefaultText
      style={[{ color, fontFamily: "roboto-mono" }, style]}
      {...otherProps}
    />
  );
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function Screen(props: ScreenProps) {
  const { style, lightColor, darkColor, scroll = false, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );

  const Component = scroll ? DefaultScrollView : DefaultView;

  return (
    <Component
      style={[{ backgroundColor }, styles.screen, style]}
      {...otherProps}
    />
  );
}

export function TextInput(props: TextInputProps) {
  const { style, ...otherProps } = props;
  const backgroundColor = useThemeColor({}, "background");
  const color = useThemeColor({}, "text");
  const placeholder = useThemeColor({}, "placeholder");

  return (
    <DefaultTextInput
      autoCapitalize="none"
      style={[
        {
          backgroundColor,
          color,
          borderColor: color,
          fontFamily: "roboto-mono",
        },
        styles.input,
        style,
      ]}
      placeholderTextColor={placeholder}
      {...otherProps}
    />
  );
}

export function Button(props: ButtonProps) {
  const { style, title, ...otherProps } = props;
  const color = useThemeColor({}, "background");
  const backgroundColor = useThemeColor({}, "text");

  return (
    <TouchableOpacity
      style={[{ backgroundColor }, styles.button, style]}
      {...otherProps}
    >
      <Text style={[{ color }, styles.buttonText]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 16,
    paddingRight: 16,
  },
  input: {
    borderWidth: 2,
    padding: 8,
    height: 48,
    marginBottom: 24,
  },
  button: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0,
    padding: 8,
    height: 48,
    marginBottom: 24,
  },
  buttonText: {
    textTransform: "uppercase",
    fontWeight: "500",
    fontSize: 16,
  },
});
