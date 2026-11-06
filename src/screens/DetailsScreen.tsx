import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { COLORS, SectionBox, T, TermButton } from "../components/Terminal";
import { findPhone, resolvePhone } from "../data/phones";

export function DetailsScreen(props: { name: string; onSearchAgain: () => void; onHome: () => void }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setReady(true), 1200);
    return () => clearTimeout(id);
  }, []);
  const phone = useMemo(() => resolvePhone(props.name), [props.name]);
  const found = findPhone(props.name) !== null;
  if (!ready) {
    return (
      <View>
        <Text style={T.line}>{"> QUERYING DATABASE..."}</Text>
        <Text style={[T.line, { marginTop: 8 }]}>{"> FETCHING SPECS FOR " + props.name.toUpperCase() + "..."}</Text>
        <Text style={[T.dimLine, { marginTop: 16 }]}>{"[ SYSTEM ] please wait_"}</Text>
      </View>
    );
  }
  return (
    <View>
      <Text style={[T.line, { color: COLORS.cyan, fontSize: 26, fontWeight: "bold" }]}>{phone.name.toUpperCase()}</Text>
      <Text style={[T.dimLine, { marginTop: 6 }]}>{"> DATABASE MATCH: " + (found ? "FOUND" : "NOT IN DATABASE")}</Text>
      <SectionBox title="DESCRIPTION">
        {phone.description.map((line) => (
          <Text key={line} style={[T.line, { marginTop: 6 }]}>{"> " + line}</Text>
        ))}
      </SectionBox>
      <SectionBox title="SPECIFICATIONS">
        <SpecRow label="RAM" value={phone.specs.ram} />
        <SpecRow label="ROM / STORAGE" value={phone.specs.storage} />
        <SpecRow label="DISPLAY" value={phone.specs.display} />
        <SpecRow label="CHIPSET" value={phone.specs.chipset} />
        <SpecRow label="CAMERA" value={phone.specs.camera} />
        <SpecRow label="BATTERY" value={phone.specs.battery} />
        <SpecRow label="OS" value={phone.specs.os} />
      </SectionBox>
      <SectionBox title="GLOBAL REVIEWS">
        <Text style={[T.dimLine, { marginTop: 4 }]}>{"[ SAMPLE DATA ]"}</Text>
        {phone.reviews.map((review) => (
          <View key={review.text} style={{ marginTop: 12 }}>
            <Text style={[T.line, { color: COLORS.amber }]}>{"★".repeat(review.stars) + "☆".repeat(5 - review.stars)}</Text>
            <Text style={[T.line, { marginTop: 4 }]}>{"> " + review.text}</Text>
            <Text style={T.dimLine}>{"— " + review.source}</Text>
          </View>
        ))}
      </SectionBox>
      <TermButton label="[ SEARCH AGAIN ]" onPress={props.onSearchAgain} />
      <TermButton label="[ HOME ]" onPress={props.onHome} secondary />
    </View>
  );
}

function SpecRow(props: { label: string; value: string }) {
  return (
    <View style={T.specRow}>
      <Text style={T.specLabel}>{props.label}</Text>
      <Text style={T.specValue}>{props.value}</Text>
    </View>
  );
}
