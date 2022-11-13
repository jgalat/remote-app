import * as React from "react";
import { StyleSheet, FlatList, GestureResponderEvent } from "react-native";
import _ActionSheet, {
  SheetProps as _SheetProps,
  ActionSheetRef,
} from "react-native-actions-sheet";

import Text from "./text";
import View from "./view";
import { useTheme } from "../hooks/use-theme-color";
import Option, { OptionProps } from "./option";

export type SheetProps<T = any> = _SheetProps<T>;

export type ActionSheetProps = {
  title?: string;
  options?: OptionProps[];
} & _SheetProps;

export default function ActionSheet({
  title,
  options = [],
  sheetId,
}: ActionSheetProps) {
  const ref = React.useRef<ActionSheetRef>(null);
  const { background, gray, text } = useTheme();

  return (
    <_ActionSheet
      id={sheetId}
      ref={ref}
      containerStyle={{
        backgroundColor: background,
        borderWidth: 2,
        borderColor: gray,
        borderBottomWidth: 0,
      }}
      indicatorStyle={{
        backgroundColor: text,
        marginTop: 12,
        height: 4,
      }}
      openAnimationConfig={{ speed: 50, bounciness: 0 }}
      closeAnimationConfig={{ speed: 50, bounciness: 0 }}
      gestureEnabled
    >
      <View style={styles.container}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        <FlatList
          data={options}
          renderItem={({ item: { style, onPress, ...props } }) => (
            <Option
              {...props}
              onPress={(event: GestureResponderEvent) => {
                ref.current?.hide();
                onPress?.(event);
              }}
              style={[styles.option, style]}
            />
          )}
          keyExtractor={(item) => item.label}
        />
      </View>
    </_ActionSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  option: {
    marginBottom: 4,
  },
});
