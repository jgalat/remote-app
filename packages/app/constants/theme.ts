import {
  DarkTheme as _DarkTheme,
  DefaultTheme as _DefaultTheme,
} from "@react-navigation/native";

import colors from "./colors";

export const DarkTheme = {
  ..._DarkTheme,
  colors: {
    ..._DarkTheme.colors,
    ...colors.dark,
  },
};

export const DefaultTheme = {
  ..._DefaultTheme,
  colors: {
    ..._DefaultTheme.colors,
    ...colors.light,
  },
};
