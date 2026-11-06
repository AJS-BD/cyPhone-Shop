import { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { COLORS, TerminalWindow } from "./src/components/Terminal";
import { HomeScreen } from "./src/screens/HomeScreen";
import { QueryScreen } from "./src/screens/QueryScreen";
import { DetailsScreen } from "./src/screens/DetailsScreen";

type Screen = "home" | "query" | "details";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [query, setQuery] = useState("");
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TerminalWindow title="cyphone@shop:~">
          {screen === "home" ? <HomeScreen onStart={() => setScreen("query")} /> : null}
          {screen === "query" ? (
            <QueryScreen
              value={query}
              onChange={setQuery}
              onNext={(name) => {
                setQuery(name);
                setScreen("details");
              }}
              onBack={() => setScreen("home")}
            />
          ) : null}
          {screen === "details" ? (
            <DetailsScreen name={query} onSearchAgain={() => setScreen("query")} onHome={() => setScreen("home")} />
          ) : null}
        </TerminalWindow>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, paddingBottom: 40 },
});
