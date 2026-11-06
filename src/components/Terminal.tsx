import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const COLORS = {
  bg: "#050505",
  panel: "#0A0F0A",
  green: "#00FF41",
  cyan: "#00E5FF",
  dim: "#00AA33",
  red: "#FF3355",
  amber: "#FFAA00",
  text: "#E8FFE8",
};

export const FONT = "monospace";

const styles = StyleSheet.create({
  window: {
    borderWidth: 1,
    borderColor: COLORS.green,
    backgroundColor: COLORS.panel,
    margin: 12,
    marginTop: 16,
  },
  titleBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.green,
  },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
  title: { color: COLORS.green, fontFamily: FONT, fontSize: 16, fontWeight: "bold", marginLeft: 4 },
  body: { padding: 16 },
  line: { color: COLORS.green, fontFamily: FONT, fontSize: 16, lineHeight: 26 },
  dimLine: { color: COLORS.dim, fontFamily: FONT, fontSize: 15, lineHeight: 24 },
  redLine: { color: COLORS.red, fontFamily: FONT, fontSize: 16, fontWeight: "bold", lineHeight: 26 },
  section: { borderWidth: 1, borderColor: COLORS.green, padding: 12, marginTop: 18 },
  sectionTitle: { color: COLORS.cyan, fontFamily: FONT, fontSize: 17, fontWeight: "bold", letterSpacing: 1 },
  button: { borderWidth: 2, borderColor: COLORS.green, backgroundColor: "#0A1A0A", paddingVertical: 16, paddingHorizontal: 16, alignItems: "center", marginTop: 18, minHeight: 60 },
  buttonText: { color: COLORS.green, fontFamily: FONT, fontSize: 19, fontWeight: "bold", letterSpacing: 1 },
  buttonSecondary: { borderColor: COLORS.dim, backgroundColor: "#050505" },
  buttonSecondaryText: { color: COLORS.dim },
  chip: { borderWidth: 1, borderColor: COLORS.cyan, paddingVertical: 10, paddingHorizontal: 14 },
  chipText: { color: COLORS.cyan, fontFamily: FONT, fontSize: 15 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 12, gap: 8 },
  inputRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: COLORS.green, paddingHorizontal: 12, marginTop: 16, minHeight: 58 },
  inputPrompt: { color: COLORS.green, fontFamily: FONT, fontSize: 18, fontWeight: "bold" },
  input: { flex: 1, color: COLORS.green, fontFamily: FONT, fontSize: 18, paddingVertical: 12, paddingHorizontal: 6 },
  specRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  specLabel: { color: COLORS.dim, fontFamily: FONT, fontSize: 16, flex: 1 },
  specValue: { color: COLORS.green, fontFamily: FONT, fontSize: 16, flex: 1, textAlign: "right" },
});

export const T = styles;

export function TerminalWindow(props: { title: string; children: ReactNode }) {
  return (
    <View style={styles.window}>
      <View style={styles.titleBar}>
        <View style={[styles.dot, { backgroundColor: COLORS.red }]} />
        <View style={[styles.dot, { backgroundColor: COLORS.amber }]} />
        <View style={[styles.dot, { backgroundColor: COLORS.green }]} />
        <Text style={styles.title}>{props.title}</Text>
      </View>
      <View style={styles.body}>{props.children}</View>
    </View>
  );
}

export function SectionBox(props: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{"[ " + props.title + " ]"}</Text>
      {props.children}
    </View>
  );
}

export function TermButton(props: { label: string; onPress: () => void; secondary?: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.button, props.secondary === true ? styles.buttonSecondary : null]}
      onPress={props.onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.buttonText, props.secondary === true ? styles.buttonSecondaryText : null]}>
        {props.label}
      </Text>
    </TouchableOpacity>
  );
}

export function BlinkCursor() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const id = setInterval(() => {
      setShow((v) => !v);
    }, 600);
    return () => clearInterval(id);
  }, []);
  return <Text style={[styles.line, { color: COLORS.cyan }]}>{show ? "_" : " "}</Text>;
}
