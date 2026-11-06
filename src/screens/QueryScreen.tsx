import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { BlinkCursor, COLORS, T, TermButton } from "../components/Terminal";
import { FadeSlideIn, GlitchView, TypingText } from "../components/Motion";

const CHIPS = ["Galaxy S25", "iPhone 16 Pro", "Pixel 9 Pro"];

export function QueryScreen(props: { value: string; onChange: (value: string) => void; onNext: (name: string) => void; onBack: () => void }) {
  const [input, setInput] = useState(props.value);
  const [error, setError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const handleNext = () => {
    if (input.trim().length === 0) {
      setError(true);
      setErrorCount((c) => c + 1);
      return;
    }
    props.onNext(input.trim());
  };
  const handleChip = (chip: string) => {
    setInput(chip);
    setError(false);
    props.onChange(chip);
  };
  return (
    <View>
      <TypingText text="> WHICH PHONE DO YOU WANT" style={[T.line, { fontSize: 20, fontWeight: "bold" }]} speed={20} cursor={false} />
      <TypingText text="TO KNOW ABOUT?" style={[T.line, { fontSize: 20, fontWeight: "bold" }]} speed={20} delay={560} />
      <FadeSlideIn delay={900}>
        <View style={T.inputRow}>
          <Text style={T.inputPrompt}>{"> "}</Text>
          <TextInput style={T.input} value={input} onChangeText={(t) => { setInput(t); setError(false); props.onChange(t); }} placeholder="e.g. Galaxy S25" placeholderTextColor={COLORS.dim} autoCapitalize="none" autoCorrect={false} returnKeyType="go" onSubmitEditing={handleNext} />
          <BlinkCursor />
        </View>
      </FadeSlideIn>
      <FadeSlideIn delay={1020}>
        <Text style={[T.dimLine, { marginTop: 14 }]}>{"[ QUICK TRY ]"}</Text>
      </FadeSlideIn>
      <FadeSlideIn delay={1120}>
        <View style={T.chipRow}>
          {CHIPS.map((chip) => (
            <TouchableOpacity key={chip} style={T.chip} onPress={() => handleChip(chip)}>
              <Text style={T.chipText}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </FadeSlideIn>
      {error ? (
        <GlitchView trigger={errorCount}>
          <Text style={[T.redLine, { marginTop: 16 }]}>{"> ERROR: ENTER A PHONE NAME FIRST"}</Text>
        </GlitchView>
      ) : null}
      <FadeSlideIn delay={1250}>
        <TermButton label="[ NEXT > ]" onPress={handleNext} />
      </FadeSlideIn>
      <FadeSlideIn delay={1350}>
        <TermButton label="[ < BACK ]" onPress={props.onBack} secondary />
      </FadeSlideIn>
    </View>
  );
}
