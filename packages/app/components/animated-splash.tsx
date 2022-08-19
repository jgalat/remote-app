import * as React from "react";
import Constants from "expo-constants";
import { Animated, StyleSheet, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";

type AnimatedSplashProps = {
  children: React.ComponentProps<React.FC>["children"];
};

SplashScreen.preventAutoHideAsync();

export default function ({ children }: AnimatedSplashProps) {
  const [translateY] = React.useState(new Animated.Value(100));
  const [opacity] = React.useState(new Animated.Value(1));
  const [finished, setFinished] = React.useState(false);

  const onLoad = () => {
    SplashScreen.hideAsync();
    Animated.spring(translateY, {
      toValue: 0,
      stiffness: 100,
      useNativeDriver: true,
    }).start(() =>
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setFinished(true))
    );
  };

  return (
    <>
      {children}
      {!finished ? (
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill,styles.container , { opacity }]}
        >
          <Animated.Image
            style={styles.splash}
            source={require("../assets/images/splash.png")}
            fadeDuration={0}
            onLoad={onLoad}
          />
          <View style={styles.textContainer}>
            <Animated.Text
              style={[
                styles.text,
                {
                  transform: [
                    {
                      translateY,
                    },
                  ],
                },
              ]}
            >
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
