import {
  Text as DefaultText,
  View as DefaultView,
  ScrollView as DefaultScrollView,
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

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <DefaultText
      style={[style, { color, fontFamily: "roboto-mono" }]}
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
      style={[
        { backgroundColor },
        styles.screen,
        style,
      ]}
      {...otherProps}
    />
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
});
