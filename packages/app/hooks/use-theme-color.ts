import Colors from "../constants/colors";
import { useColorScheme } from "./use-settings";

export default function useThemeColor(
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  return Colors[useColorScheme()][colorName];
}

export function useTheme() {
  return Colors[useColorScheme()];
}
