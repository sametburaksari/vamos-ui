"use client";

import * as React from "react";
import { Badge, Button, Card, Field } from "@vamos-ui/react";
import { FontPicker, FontProvider, createFontPairing, getFontPairing } from "@vamos-ui/react/fonts";

const start = getFontPairing("bistro")!;

/** CMS → Site settings → Brand: pick three families and preview the homepage hero live. */
export default function BrandTypography() {
  const [fonts, setFonts] = React.useState({ heading: start.heading, body: start.body, mono: start.mono });
  const pairing = React.useMemo(() => createFontPairing({ ...fonts, id: "brand", label: "Brand" }), [fonts]);
  const set = (key: keyof typeof fonts) => (family: string) => setFonts((f) => ({ ...f, [key]: family }));

  return (
    <div className="grid w-full gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <div className="grid content-start gap-3">
        <Field label="Headings">
          <FontPicker value={fonts.heading} onValueChange={set("heading")} />
        </Field>
        <Field label="Body & navigation">
          <FontPicker value={fonts.body} onValueChange={set("body")} categories={["sans", "serif", "rounded"]} />
        </Field>
        <Field label="Prices & opening hours">
          <FontPicker value={fonts.mono} onValueChange={set("mono")} categories={["mono"]} />
        </Field>
        <Button variant="primary" className="mt-1">Publish to karakoy-bistro.com</Button>
      </div>

      <FontProvider pairing={pairing}>
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-line px-5 py-3 text-[13px] text-fg-muted">
            <span className="font-display text-[18px] text-fg">Karaköy Bistro</span>
            <span className="hidden gap-4 sm:flex"><span>Menu</span><span>Events</span><span>Book a table</span></span>
          </div>
          <div className="grid gap-4 px-5 py-8">
            <Badge tone="outline" className="w-fit">Autumn menu · from 12 November</Badge>
            <h3 className="font-display text-[length:calc(46px*var(--display-scale))] leading-[1.02] text-fg">
              Slow-cooked lamb, <em>wood-fired</em> bread and Aegean wines
            </h3>
            <p className="max-w-prose text-[15px] leading-relaxed text-fg-muted">
              Ağaç fırında pişen ekmek, şef İlkay Şahin’in mevsim menüsü ve Bozcaada bağlarından seçilmiş şaraplar.
            </p>
            <dl className="grid grid-cols-3 gap-3 border-t border-line pt-4 font-mono text-[12.5px]">
              <div><dt className="text-fg-subtle">Tue–Sun</dt><dd className="text-fg">18:00–23:30</dd></div>
              <div><dt className="text-fg-subtle">Tasting menu</dt><dd className="text-fg">₺2.450</dd></div>
              <div><dt className="text-fg-subtle">Seats</dt><dd className="text-fg">48</dd></div>
            </dl>
          </div>
        </Card>
      </FontProvider>
    </div>
  );
}
