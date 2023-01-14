import * as React from "react";
import { Keyboard } from "react-native";

export default function useKeyboard() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setVisible(true)
    );

    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setVisible(false)
    );

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return { visible };
}
