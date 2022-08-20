import * as React from "react";
import Constants from "expo-constants";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { View, StyleSheet } from "react-native";
import * as SplashScreen from "expo-splash-screen";

type AnimatedSplashProps = {
  children: React.ComponentProps<React.FC>["children"];
};

SplashScreen.preventAutoHideAsync();

export default function ({ children }: AnimatedSplashProps) {
  const translateY = useSharedValue(150);
  const opacity = useSharedValue(1);
  const finished = useSharedValue(false);

  const onLoad = () => {
    translateY.value = 0;
    SplashScreen.hideAsync();
  };

  const translateAnimationStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withSpring(
          translateY.value,
          { stiffness: 150 },
          () => (opacity.value = 0)
        ),
      },
    ],
  }));

  const opacityAnimationStyles = useAnimatedStyle(() => ({
    opacity: withDelay(
      1000,
      withTiming(
        opacity.value,
        { duration: 500 },
        () => (finished.value = true)
      )
    ),
  }));

  return (
    <>
      {children}
      {!finished.value ? (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            styles.container,
            opacityAnimationStyles,
          ]}
        >
          <Animated.Image
            style={styles.splash}
            source={require("../assets/images/splash.png")}
            fadeDuration={0}
            onLoad={onLoad}
          />
          <View style={styles.textContainer}>
            <Animated.Text style={[styles.text, translateAnimationStyles]}>
              remote
            </Animated.Text>
          </View>
        </Animated.View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: "roboto-mono",
    fontSize: 64,
    color: "#000",
  },
  textContainer: {
    position: "absolute",
    bottom: "35%",
    width: "100%",
    alignItems: "center",
    overflow: "hidden",
  },
  splash: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  container: {
    backgroundColor: Constants?.manifest?.splash?.backgroundColor,
  },
});
