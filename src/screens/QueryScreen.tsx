import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { BlinkCursor, COLORS, T, TermButton } from "../components/Terminal";

const CHIPS = ["Galaxy S25", "iPhone 16 Pro", "Pixel 9 Pro"];

export function QueryScreen(props: { value: string; onChange: (value: string) => void; onNext: (name: string) => void; onBack: () => void }) {
  const [input, setInput] = useState(props.value);
  const [error, setError] = useState(false);
  const handleNext = () => {
    if (input.trim().length === 0) {
      setError(true);
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
      <Text style={[T.line, { fontSize: 20, fontWeight: "bold" }]}>{"> WHICH PHONE DO YOU WANT"}</Text>
      <Text style={[T.line, { fontSize: 20, fontWeight: "bold" }]}>{"TO KNOW ABOUT?"}</Text>
      <View style={T.inputRow}>
        <Text style={T.inputPrompt}>{"> "}</Text>
        <TextInput style={T.input} value={input} onChangeText={(t) => { setInput(t); setError(false); props.onChange(t); }} placeholder="e.g. Galaxy S25" placeholderTextColor={COLORS.dim} autoCapitalize="none" autoCorrect={false} returnKeyType="go" onSubmitEditing={handleNext} />
        <BlinkCursor />
      </View>
      <Text style={[T.dimLine, { marginTop: 14 }]}>{"[ QUICK TRY ]"}</Text>
      <View style={T.chipRow}>
        {CHIPS.map((chip) => (
          <TouchableOpacity key={chip} style={T.chip} onPress={() => handleChip(chip)}>
            <Text style={T.chipText}>{chip}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {error ? (
        <Text style={[T.redLine, { marginTop: 16 }]}>{"> ERROR: ENTER A PHONE NAME FIRST"}</Text>
      ) : null}
      <TermButton label="[ NEXT > ]" onPress={handleNext} />
      <TermButton label="[ < BACK ]" onPress={props.onBack} secondary />
    </View>
  );
}
