import { Text, View } from "react-native";
import { BlinkCursor, COLORS, T, TermButton } from "../components/Terminal";

const BOOT = [
  "> cyPhone Shop v1.0",
  "> initializing terminal...",
  "> connection: SECURE",
];

const ABOUT = [
  "> WHOAMI: Abu Jafor Md Shaleh",
  "> ROLE: Founder, XLab — Digital AI Agency",
  "> WORK: Boosting & Marketing / Web Development / App Building",
  "> BASE: Gazipur, Dhaka, Bangladesh",
  "> MISSION: Find your phone. Know it inside out.",
];

export function HomeScreen(props: { onStart: () => void }) {
  return (
    <View>
      {BOOT.map((line) => (
        <Text key={line} style={T.line}>{line}</Text>
      ))}
      <Text style={[T.line, { color: COLORS.cyan, fontSize: 22, fontWeight: "bold", marginTop: 20 }]}>
        {"[ ABOUT ME ]"}
      </Text>
      {ABOUT.map((line) => (
        <Text key={line} style={[T.line, { marginTop: 8 }]}>{line}</Text>
      ))}
      <TermButton label="[ > START ]" onPress={props.onStart} />
      <Text style={[T.dimLine, { marginTop: 14 }]}>{"> Press START to begin "}<BlinkCursor /></Text>
    </View>
  );
}
