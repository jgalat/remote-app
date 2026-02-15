import * as React from "react";
import Text from "~/components/text";
import useThemeColor from "~/hooks/use-theme-color";

export default function Required() {
  const color = useThemeColor("tint");
  return <Text style={{ color }}>*</Text>;
}
