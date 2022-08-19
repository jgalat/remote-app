import * as React from "react";
import Constants from "expo-constants";
import { View, Animated, StyleSheet } from "react-native";

type AnimatedSplashProps = {
  children: React.ComponentProps<React.FC>["children"];
};

export default function ({ children }: AnimatedSplashProps) {
  const animation = React.useMemo(() => new Animated.Value(1), []);
  const [animationComplete, setAnimationComplete] = React.useState(false);

  React.useEffect(() => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => setAnimationComplete(true));
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {children}
      {!animationComplete ? (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: Constants?.manifest?.splash?.backgroundColor,
              opacity: animation,
            },
          ]}
        >
          <Animated.Image
            style={{
              width: "100%",
              height: "100%",
              resizeMode: "contain",
              transform: [
                {
                  scale: animation,
                },
              ],
            }}
            source={require("../assets/images/splash.png")}
            fadeDuration={0}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}
