import { Text, View } from "react-native";
import { BlinkCursor, COLORS, T } from "../components/Terminal";
import { FadeSlideIn, PulseButton, TypingText } from "../components/Motion";

const BOOT = [
  "> cyPhone Shop v1.0",
  "> initializing terminal...",
  "> connection: SECURE",
];

// Boot lines type at about 18ms per char: 342ms, 468ms, 378ms.
const BOOT_DELAYS = [0, 420, 960];

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
      {BOOT.map((line, i) => (
        <TypingText key={line} text={line} style={T.line} speed={18} delay={BOOT_DELAYS[i]} cursor={i === BOOT.length - 1} />
      ))}
      <FadeSlideIn delay={1250}>
        <Text style={[T.line, { color: COLORS.cyan, fontSize: 22, fontWeight: "bold", marginTop: 20 }]}>
          {"[ ABOUT ME ]"}
        </Text>
      </FadeSlideIn>
      {ABOUT.map((line, i) => (
        <FadeSlideIn key={line} delay={1350 + i * 90}>
          <Text style={[T.line, { marginTop: 8 }]}>{line}</Text>
        </FadeSlideIn>
      ))}
      <PulseButton label="[ > START ]" onPress={props.onStart} />
      <FadeSlideIn delay={1800}>
        <Text style={[T.dimLine, { marginTop: 14 }]}>{"> Press START to begin "}<BlinkCursor /></Text>
      </FadeSlideIn>
    </View>
  );
}
