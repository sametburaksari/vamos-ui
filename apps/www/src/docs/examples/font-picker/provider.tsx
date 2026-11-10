"use client";

import { Card } from "@vamos-cms/ui";
import { FontPairingPicker, FontProvider, useFontPairing } from "@vamos-cms/ui/fonts";

function Article() {
  const { pairing } = useFontPairing();
  return (
    <Card className="p-5">
      <div className="font-mono text-[11.5px] uppercase tracking-[0.08em] text-fg-subtle">Journal · 6 min read</div>
      <h3 className="mt-2 font-display text-[length:calc(36px*var(--display-scale))] leading-[1.05] text-fg">
        How we cut onboarding from <em>nine days</em> to two
      </h3>
      <p className="mt-3 text-[14.5px] leading-relaxed text-fg-muted">
        Our HR team rebuilt the first week around one checklist, three owners and a shared calendar. Here is what changed.
      </p>
      <p className="mt-4 text-[12px] text-fg-subtle">Set in {pairing.label}</p>
    </Card>
  );
}

function Switcher() {
  const { pairing, setPairing } = useFontPairing();
  return <FontPairingPicker layout="list" value={pairing.id} onValueChange={(id) => setPairing(id)} className="max-h-80 overflow-y-auto" />;
}

export default function FontProviderScoped() {
  return (
    <FontProvider defaultPairing="newsroom" className="grid w-full gap-4 md:grid-cols-[15rem_minmax(0,1fr)]">
      <Switcher />
      <Article />
    </FontProvider>
  );
}
