import Colors from "../constants/colors";
import { useColorScheme } from "./use-settings";

export function useTheme() {
  return Colors[useColorScheme()];
}

export default function useThemeColor(
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  return useTheme()[colorName];
}

