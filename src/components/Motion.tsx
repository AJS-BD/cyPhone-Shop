import { useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, Easing, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { BlinkCursor, COLORS, FONT, TermButton } from "./Terminal";

const GLYPHS = "01<>/#$%&@!?*+=~^";

function randomGlyph(): string {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

/** Types text one character at a time, with a blinking cursor. */
export function TypingText(props: {
  text: string;
  style?: StyleProp<TextStyle>;
  speed?: number;
  delay?: number;
  cursor?: boolean;
  onDone?: () => void;
}) {
  const speed = props.speed ?? 25;
  const delay = props.delay ?? 0;
  const showCursor = props.cursor ?? true;
  const [count, setCount] = useState(0);
  const doneRef = useRef(props.onDone);
  doneRef.current = props.onDone;
  useEffect(() => {
    const text = props.text;
    if (text.length === 0) {
      const timer = setTimeout(() => doneRef.current?.(), delay);
      return () => clearTimeout(timer);
    }
    let typed = 0;
    let interval: ReturnType<typeof setInterval> | null = null;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        typed += 1;
        setCount(typed);
        if (typed >= text.length) {
          if (interval !== null) {
            clearInterval(interval);
          }
          doneRef.current?.();
        }
      }, speed);
    }, delay);
    return () => {
      clearTimeout(start);
      if (interval !== null) {
        clearInterval(interval);
      }
    };
  }, [props.text, speed, delay]);
  return (
    <Text style={props.style}>
      {props.text.slice(0, count)}
      {showCursor ? <BlinkCursor /> : null}
    </Text>
  );
}

/** Decrypt effect: random hacker glyphs resolve left-to-right into the real text. */
export function ScrambleText(props: {
  text: string;
  style?: StyleProp<TextStyle>;
  duration?: number;
  delay?: number;
  onDone?: () => void;
}) {
  const duration = props.duration ?? 900;
  const delay = props.delay ?? 0;
  const [display, setDisplay] = useState("");
  const doneRef = useRef(props.onDone);
  doneRef.current = props.onDone;
  useEffect(() => {
    const text = props.text;
    const total = text.length;
    if (total === 0) {
      setDisplay("");
      const timer = setTimeout(() => doneRef.current?.(), delay);
      return () => clearTimeout(timer);
    }
    const stepMs = Math.max(24, Math.floor(duration / (total + 3)));
    let locked = 0;
    let start: ReturnType<typeof setTimeout> | null = null;
    let interval: ReturnType<typeof setInterval> | null = null;
    const render = () => {
      let out = "";
      for (let i = 0; i < total; i++) {
        if (i < locked || text[i] === " ") {
          out += text[i];
        } else {
          out += randomGlyph();
        }
      }
      setDisplay(out);
    };
    start = setTimeout(() => {
      render();
      interval = setInterval(() => {
        locked += 1;
        if (locked >= total) {
          if (interval !== null) {
            clearInterval(interval);
          }
          setDisplay(text);
          doneRef.current?.();
          return;
        }
        render();
      }, stepMs);
    }, delay);
    return () => {
      if (start !== null) {
        clearTimeout(start);
      }
      if (interval !== null) {
        clearInterval(interval);
      }
    };
  }, [props.text, duration, delay]);
  return <Text style={props.style}>{display}</Text>;
}

/** Fades in and slides up slightly, with a stagger delay. */
export function FadeSlideIn(props: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  slide?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const delay = props.delay ?? 0;
  const duration = props.duration ?? 300;
  const slide = props.slide ?? 10;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(slide)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY, duration, delay]);
  return (
    <Animated.View style={[props.style, { opacity, transform: [{ translateY }] }]}>
      {props.children}
    </Animated.View>
  );
}

/** Brief opacity/offset flicker, like a glitch, on mount and when trigger changes. */
export function GlitchView(props: { children: ReactNode; trigger?: number | boolean; style?: StyleProp<ViewStyle> }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const trigger = props.trigger;
  useEffect(() => {
    opacity.setValue(1);
    translateX.setValue(0);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.25, duration: 45, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 45, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.55, duration: 55, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 65, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(translateX, { toValue: 3, duration: 45, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: -3, duration: 55, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: 1, duration: 55, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: 0, duration: 55, useNativeDriver: true }),
      ]),
    ]).start();
  }, [opacity, translateX, trigger]);
  return (
    <Animated.View style={[props.style, { opacity, transform: [{ translateX }] }]}>
      {props.children}
    </Animated.View>
  );
}

const BLOCKS = 10;

/** Animated 0-100% hacker bar. */
export function HackerProgressBar(props: { duration?: number; onDone?: () => void; style?: StyleProp<ViewStyle> }) {
  const duration = props.duration ?? 900;
  const progress = useRef(new Animated.Value(0)).current;
  const [pct, setPct] = useState(0);
  const doneRef = useRef(props.onDone);
  doneRef.current = props.onDone;
  useEffect(() => {
    const id = progress.addListener((v) => {
      setPct(Math.round(v.value));
    });
    Animated.timing(progress, {
      toValue: 100,
      duration,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        doneRef.current?.();
      }
    });
    return () => {
      progress.removeListener(id);
    };
  }, [progress, duration]);
  const filled = Math.round((pct / 100) * BLOCKS);
  const bar = `[` + `█`.repeat(filled) + `░`.repeat(BLOCKS - filled) + `] ` + pct + `%`;
  const width = progress.interpolate({ inputRange: [0, 100], outputRange: [`0%`, `100%`] });
  return (
    <View style={props.style}>
      <View style={barStyles.track}>
        <Animated.View style={[barStyles.fill, { width }]} />
      </View>
      <Text style={barStyles.text}>{bar}</Text>
    </View>
  );
}

const barStyles = StyleSheet.create({
  track: { height: 10, borderWidth: 1, borderColor: COLORS.green, backgroundColor: COLORS.bg },
  fill: { height: `100%`, backgroundColor: COLORS.green },
  text: { color: COLORS.green, fontFamily: FONT, fontSize: 16, lineHeight: 26, marginTop: 6 },
});

/** Terminal button with a subtle pulse; glitches briefly when pressed (never delays the tap). */
export function PulseButton(props: { label: string; onPress: () => void; secondary?: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  const [glitchKey, setGlitchKey] = useState(0);
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.04, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [scale]);
  return (
    <GlitchView trigger={glitchKey}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <TermButton
          label={props.label}
          secondary={props.secondary}
          onPress={() => {
            setGlitchKey((k) => k + 1);
            props.onPress();
          }}
        />
      </Animated.View>
    </GlitchView>
  );
}

/** Quick fade plus slide plus brief glitch flicker when a screen appears (about 250ms). */
export function ScreenTransition(props: { children: ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 250, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(translateX, { toValue: 3, duration: 40, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: -3, duration: 40, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: 1, duration: 40, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]),
    ]).start();
  }, [opacity, translateY, translateX]);
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }, { translateX }] }}>
      {props.children}
    </Animated.View>
  );
}
