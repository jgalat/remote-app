import * as React from "react";
import { StyleSheet } from "react-native";

import Text from "~/components/text";
import { useTheme } from "~/hooks/use-theme-color";

type SectionTitleProps = {
  title: string;
  first?: boolean;
  variant?: "settings";
};

export default React.memo(function SectionTitle({
  title,
  first = false,
  variant,
}: SectionTitleProps) {
  const { gray } = useTheme();
  const isSettings = variant === "settings";

  return (
    <Text
      color={isSettings ? gray : undefined}
      style={[styles.title, !isSettings && styles.formTitle, first && styles.first]}
    >
      {title}
    </Text>
  );
});

const styles = StyleSheet.create({
  title: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 14,
    marginTop: 18,
    marginBottom: 8,
  },
  formTitle: {
    fontSize: 24,
  },
  first: {
    marginTop: 0,
  },
});
