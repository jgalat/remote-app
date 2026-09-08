import * as React from "react";
import { StyleSheet, GestureResponderEvent } from "react-native";
import _ActionSheet, {
  FlatList,
  SheetProps,
  SheetManager,
} from "react-native-actions-sheet";

import Text from "./text";
import View from "./view";
import { useTheme } from "~/hooks/use-theme-color";
import Option, { OptionProps } from "./option";

export { SheetProps } from "react-native-actions-sheet";

export type ActionSheetProps = {
  title?: string;
  options?: OptionProps[];
} & SheetProps;

export default function ActionSheet({
  title,
  options = [],
  sheetId,
}: ActionSheetProps) {
  const { background, text } = useTheme();

  return (
    <_ActionSheet
      id={sheetId}
      containerStyle={{
        backgroundColor: background,
        borderWidth: 2,
        borderColor: text,
        borderBottomWidth: 0,
      }}
      indicatorStyle={{
        backgroundColor: text,
        marginTop: 12,
        height: 4,
      }}
      useBottomSafeAreaPadding
      gestureEnabled
    >
      <View style={styles.container}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        <FlatList
          showsVerticalScrollIndicator={false}
          data={options}
          renderItem={({ item: { style, onPress, ...props } }) => (
            <Option
              {...props}
              onPress={async (event: GestureResponderEvent) => {
                await SheetManager.hide(sheetId);
                onPress?.(event);
              }}
              style={[styles.option, style]}
            />
          )}
          keyExtractor={(item) => item.id ?? item.label}
        />
      </View>
    </_ActionSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 1,
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  option: {
    marginBottom: 4,
  },
});
