import * as React from "react";
import { StyleSheet, FlatList, GestureResponderEvent } from "react-native";
import BottomSheet, {
  useBottomSheetDynamicSnapPoints,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";

import Text from "./text";
import { useTheme } from "../hooks/use-theme-color";
import Option, { OptionProps } from "./option";

type SheetMenuProps = {
  innerRef: React.RefObject<BottomSheet>;
  title?: string;
  options?: OptionProps[];
} & React.ComponentProps<typeof BottomSheet>;

export default function SheetMenu({
  innerRef,
  title,
  options = [],
}: SheetMenuProps) {
  const { background, gray, text } = useTheme();
  const snaps = React.useMemo(() => ["CONTENT_HEIGHT"], []);

  const {
    animatedHandleHeight,
    animatedSnapPoints,
    animatedContentHeight,
    handleContentLayout,
  } = useBottomSheetDynamicSnapPoints(snaps);

  return (
    <Portal name="Root">
      <BottomSheet
        ref={innerRef}
        index={-1}
        snapPoints={animatedSnapPoints}
        handleHeight={animatedHandleHeight}
        contentHeight={animatedContentHeight}
        enablePanDownToClose={true}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            pressBehavior="close"
          />
        )}
        handleIndicatorStyle={{ backgroundColor: text, marginTop: 8 }}
        backgroundStyle={{
          backgroundColor: background,
          borderWidth: 2,
          borderColor: gray,
        }}
      >
        <BottomSheetView
          style={styles.container}
          onLayout={handleContentLayout}
        >
          {title ? <Text style={styles.title}>{title}</Text> : null}
          <FlatList
            data={options}
            renderItem={({ item: { style, onPress, ...props } }) => (
              <Option
                {...props}
                onPress={(event: GestureResponderEvent) => {
                  onPress?.(event);
                  innerRef.current?.close();
                }}
                style={[styles.option, style]}
              />
            )}
            keyExtractor={(item) => item.label}
          />
        </BottomSheetView>
      </BottomSheet>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
  },
  option: {
    marginBottom: 20,
  },
});
