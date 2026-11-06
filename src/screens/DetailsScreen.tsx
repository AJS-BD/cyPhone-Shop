import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { COLORS, SectionBox, T, TermButton } from "../components/Terminal";
import { FadeSlideIn, GlitchView, HackerProgressBar, ScrambleText, TypingText } from "../components/Motion";
import { findPhone, resolvePhone } from "../data/phones";
import type { Phone } from "../data/phones";
import { fetchLiveSpecs } from "../lib/phoneApi";

type LoadPhase = "typing" | "bar" | "ready";

export function DetailsScreen(props: { name: string; onSearchAgain: () => void; onHome: () => void }) {
  const [phase, setPhase] = useState<LoadPhase>("typing");
  const [fetchTyped, setFetchTyped] = useState(false);
  const [barDone, setBarDone] = useState(false);
  const [liveChecked, setLiveChecked] = useState(false);
  const [livePhone, setLivePhone] = useState<Phone | null>(null);
  const offlinePhone = useMemo(() => resolvePhone(props.name), [props.name]);
  const found = findPhone(props.name) !== null;

  // Live specs first: try the GSMArena-backed Edge Function. On any error or
  // timeout (or when no function URL is configured) fall back to the local
  // database, and the screen says so. Reviews stay local sample data.
  useEffect(() => {
    let alive = true;
    fetchLiveSpecs(props.name)
      .then((phone) => {
        if (!alive) return;
        if (phone) setLivePhone(phone);
        setLiveChecked(true);
      })
      .catch(() => {
        if (alive) setLiveChecked(true);
      });
    return () => {
      alive = false;
    };
  }, [props.name]);

  // The loading animation runs first; the screen opens once the bar has
  // finished and the live lookup has settled (at most its 10s timeout).
  useEffect(() => {
    if (barDone && liveChecked) setPhase("ready");
  }, [barDone, liveChecked]);

  const phone = livePhone ?? offlinePhone;
  const live = livePhone !== null;
  const specRows = [
    { label: "RAM", value: phone.specs.ram },
    { label: "ROM / STORAGE", value: phone.specs.storage },
    { label: "DISPLAY", value: phone.specs.display },
    { label: "CHIPSET", value: phone.specs.chipset },
    { label: "CAMERA", value: phone.specs.camera },
    { label: "BATTERY", value: phone.specs.battery },
    { label: "OS", value: phone.specs.os },
  ];
  if (phase !== "ready") {
    return (
      <View>
        {phase === "typing" ? (
          <TypingText text="> FETCHING LIVE SPECS..." style={T.line} speed={20} onDone={() => setFetchTyped(true)} />
        ) : (
          <Text style={T.line}>{"> FETCHING LIVE SPECS..."}</Text>
        )}
        {phase === "typing" && fetchTyped ? (
          <TypingText text={"> FETCHING LIVE SPECS FOR " + props.name.toUpperCase() + "..."} style={[T.line, { marginTop: 8 }]} speed={10} onDone={() => setPhase("bar")} />
        ) : null}
        {phase === "bar" ? (
          <Text style={[T.line, { marginTop: 8 }]}>{"> FETCHING LIVE SPECS FOR " + props.name.toUpperCase() + "..."}</Text>
        ) : null}
        {phase === "bar" ? (
          <HackerProgressBar duration={900} onDone={() => setBarDone(true)} style={{ marginTop: 16 }} />
        ) : null}
        <Text style={[T.dimLine, { marginTop: 16 }]}>{"> [ SYSTEM ] please wait_"}</Text>
      </View>
    );
  }
  return (
    <View>
      <GlitchView>
        <ScrambleText text={phone.name.toUpperCase()} style={[T.line, { color: COLORS.cyan, fontSize: 26, fontWeight: "bold" }]} duration={800} />
      </GlitchView>
      <FadeSlideIn delay={200}>
        <Text style={[T.dimLine, { marginTop: 6 }]}>{"> SOURCE: " + (live ? "[ LIVE \u2022 GSMArena ]" : "[ OFFLINE \u2022 LOCAL DB ]")}</Text>
      </FadeSlideIn>
      {live ? null : (
        <FadeSlideIn delay={260}>
          <Text style={[T.dimLine, { marginTop: 4 }]}>{"> DATABASE MATCH: " + (found ? "FOUND" : "NOT IN DATABASE")}</Text>
        </FadeSlideIn>
      )}
      <FadeSlideIn delay={300}>
        <SectionBox title="DESCRIPTION">
          {phone.description.map((line, i) => (
            <FadeSlideIn key={line} delay={420 + i * 80}>
              <Text style={[T.line, { marginTop: 6 }]}>{"> " + line}</Text>
            </FadeSlideIn>
          ))}
        </SectionBox>
      </FadeSlideIn>
      <FadeSlideIn delay={520}>
        <SectionBox title="SPECIFICATIONS">
          {specRows.map((row, i) => (
            <FadeSlideIn key={row.label} delay={640 + i * 70}>
              <SpecRow label={row.label} value={row.value} />
            </FadeSlideIn>
          ))}
        </SectionBox>
      </FadeSlideIn>
      <FadeSlideIn delay={1180}>
        <SectionBox title="GLOBAL REVIEWS">
          <Text style={[T.dimLine, { marginTop: 4 }]}>{"[ SAMPLE DATA ]"}</Text>
          {phone.reviews.map((review, i) => (
            <FadeSlideIn key={review.text} delay={1280 + i * 120}>
              <View style={{ marginTop: 12 }}>
                <Text style={[T.line, { color: COLORS.amber }]}>{"\u2605".repeat(review.stars) + "\u2606".repeat(5 - review.stars)}</Text>
                <Text style={[T.line, { marginTop: 4 }]}>{"> " + review.text}</Text>
                <Text style={T.dimLine}>{"\u2014 " + review.source}</Text>
              </View>
            </FadeSlideIn>
          ))}
        </SectionBox>
      </FadeSlideIn>
      <FadeSlideIn delay={1680}>
        <TermButton label="[ SEARCH AGAIN ]" onPress={props.onSearchAgain} />
      </FadeSlideIn>
      <FadeSlideIn delay={1780}>
        <TermButton label="[ HOME ]" onPress={props.onHome} secondary />
      </FadeSlideIn>
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
