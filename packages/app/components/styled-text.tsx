import { Text, TextProps } from "../components/themed";

export function MonoText(props: TextProps) {
  return (
    <Text {...props} style={[props.style, { fontFamily: "roboto-mono" }]} />
  );
}
