import { Badge, Button, DescriptionList } from "@vamos-ui/react";
import { Container, Faq, PageIntro, Section, SectionHeader, sitePageHref } from "@vamos-ui/react/blocks";
import { awards, boilerplate, description, DOMAIN, faqPress, GAME, PRESS_EMAIL, RELEASE, shots, STUDIO, team, type Copy, type ShotId } from "./content";
import { CopyButton } from "./copy-button";
import { PressDownloads, type PressAsset, type PressLabels } from "./press-downloads";

/** Press kit page: fact sheet, copy-ready texts, the downloads, team, review keys and FAQ. */
export function PressPage({ c }: { c: Copy }) {
  const { t, f, eur } = c;
  const common = { locale: c.intl, labels: c.labels };
  const release = f.date(RELEASE, "long");
  const embargo = f.dateTime("2027-03-09T16:00:00+01:00", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Europe/Berlin", timeZoneName: "short" });

  const sheet: [string, string][] = [
    [t({ en: "Developer", tr: "Geliştirici" }), t({ en: `${STUDIO}, six people`, tr: `${STUDIO}, altı kişi` })],
    [t({ en: "Publisher", tr: "Yayıncı" }), t({ en: "Self-published", tr: "Kendi yayını" })],
    [t({ en: "Release date", tr: "Çıkış tarihi" }), release],
    [t({ en: "Platforms", tr: "Platformlar" }), t({ en: "PC and current-generation consoles", tr: "PC ve güncel nesil konsollar" })],
    [t({ en: "Price", tr: "Fiyat" }), t({ en: `${eur(24.99)} · 15% off in launch week`, tr: `${eur(24.99)} · çıkış haftasında %15 indirim` })],
    [t({ en: "Players", tr: "Oyuncu" }), t({ en: "1 (asynchronous embers from other players)", tr: "1 (diğer oyunculardan eşzamansız közler)" })],
    [t({ en: "Languages", tr: "Diller" }), t({ en: "English, Turkish, German, Japanese, Spanish", tr: "İngilizce, Türkçe, Almanca, Japonca, İspanyolca" })],
    [t({ en: "Review embargo", tr: "İnceleme ambargosu" }), embargo],
    [t({ en: "Website", tr: "Web sitesi" }), DOMAIN],
    [t({ en: "Press contact", tr: "Basın iletişimi" }), `Mira Kestane · ${PRESS_EMAIL}`],
  ];

  const factText = [`${GAME} — ${t({ en: "fact sheet", tr: "bilgi notu" })}`, "", ...sheet.map(([k, v]) => `${k}: ${v}`), "", t(description), "", t(boilerplate), ""].join("\n");
  const releaseText = [
    t({ en: `FOR IMMEDIATE RELEASE — ${f.date("2026-11-04", "long")}`, tr: `HEMEN YAYIMLANABİLİR — ${f.date("2026-11-04", "long")}` }),
    "",
    t({ en: `${GAME} carries its last fire to PC and consoles on ${release}`, tr: `${GAME}, son ateşini ${release} tarihinde PC ve konsollara taşıyor` }),
    "",
    t(description),
    "",
    t({ en: `“We deleted the compass in the second month and never put it back,” says director Mira Kestane. “If you want to know where you are, you have to bring light there.”`, tr: `“Pusulayı ikinci ay sildik ve bir daha geri koymadık,” diyor yönetmen Mira Kestane. “Nerede olduğunuzu bilmek istiyorsanız, oraya ışık götürmeniz gerekir.”` }),
    "",
    t(boilerplate),
    "",
    `${t({ en: "Press", tr: "Basın" })}: ${PRESS_EMAIL}`,
    "",
  ].join("\n");

  const shotIds: ShotId[] = ["summit", "tide", "cloudsea", "deep", "lights", "ridges"];
  const assets: PressAsset[] = [
    { id: "factsheet", kind: "text", file: "ember-atlas-fact-sheet.txt", name: t({ en: "Fact sheet", tr: "Bilgi notu" }), note: t({ en: "plain text", tr: "düz metin" }), content: factText },
    { id: "release", kind: "text", file: "ember-atlas-press-release.txt", name: t({ en: "Press release, 4 November", tr: "Basın bülteni, 4 Kasım" }), note: t({ en: "plain text", tr: "düz metin" }), content: releaseText },
    { id: "logo-dark", kind: "logo", file: "ember-atlas-logo-on-dark.svg", name: t({ en: "Logo for dark backgrounds", tr: "Koyu zemin için logo" }), note: "SVG", variant: "on-dark" },
    { id: "logo-light", kind: "logo", file: "ember-atlas-logo-on-light.svg", name: t({ en: "Logo for light backgrounds", tr: "Açık zemin için logo" }), note: "SVG", variant: "on-light" },
    { id: "keyart", kind: "keyart", file: "ember-atlas-key-art.svg", name: t({ en: "Key art — the atlas", tr: "Ana görsel — atlas" }), note: "SVG · 3840 × 2160" },
    ...shotIds.map((id, i): PressAsset => ({
      id: `shot-${id}`,
      kind: "image",
      file: `ember-atlas-screenshot-${String(i + 1).padStart(2, "0")}-${id}.jpg`,
      name: `${t({ en: "Screenshot", tr: "Ekran görüntüsü" })} ${i + 1} — ${t(shots[id].region)}`,
      note: "JPEG · 1920 × 1080",
      src: shots[id].src,
      preview: shots[id].src.replace("w=1920", "w=160"),
    })),
  ];

  const labels: PressLabels = {
    title: t({ en: "Downloads", tr: "İndirmeler" }),
    selectAll: t({ en: "Select all", tr: "Tümünü seç" }),
    downloadSelected: t({ en: "Download selected ({n}) as ZIP", tr: "Seçilenleri indir ({n}) · ZIP" }),
    download: t({ en: "Download", tr: "İndir" }),
    downloadOne: t({ en: "Download {name}", tr: "İndir: {name}" }),
    preparing: t({ en: "Preparing files…", tr: "Dosyalar hazırlanıyor…" }),
    saved: t({ en: "Saved {file} ({size})", tr: "{file} kaydedildi ({size})" }),
    selected: t({ en: "{n} of {total} selected", tr: "{total} dosyadan {n} seçili" }),
    failed: t({ en: "Couldn’t fetch {file}. Try again or email us.", tr: "{file} alınamadı. Tekrar deneyin ya da bize yazın." }),
    vector: t({ en: "vector", tr: "vektör" }),
    generated: t({ en: "Logos and key art are generated as SVG in your browser, in the site’s own colours.", tr: "Logolar ve ana görsel tarayıcınızda, sitenin kendi renkleriyle SVG olarak üretilir." }),
  };

  return (
    <>
      <PageIntro
        {...common}
        variant="ruled"
        breadcrumb={[{ label: "Ember Atlas", href: sitePageHref("home") }, { label: t({ en: "Press kit", tr: "Basın kiti" }) }]}
        eyebrow={t({ en: "For press and creators", tr: "Basın ve içerik üreticileri için" })}
        title={t({ en: "Press *kit*", tr: "Basın *kiti*" })}
        lead={t({ en: "Everything you need to write about Ember Atlas, in one place. Use anything here for coverage — no need to ask.", tr: "Ember Atlas hakkında yazmak için gereken her şey tek yerde. Haberleriniz için buradaki her şeyi kullanabilirsiniz; sormanıza gerek yok." })}
        meta={[
          { label: t({ en: "Release", tr: "Çıkış" }), value: release },
          { label: t({ en: "Embargo", tr: "Ambargo" }), value: embargo },
          { label: t({ en: "Contact", tr: "İletişim" }), value: PRESS_EMAIL },
        ]}
      />

      <Section anchor="facts" headingId="ea-sheet-title" theme={{ rhythm: "tight" }}>
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <SectionHeader headingId="ea-sheet-title" eyebrow={t({ en: "Fact sheet", tr: "Bilgi notu" })} title={t({ en: "The *short* version", tr: "*Kısa* hâli" })} />
              <DescriptionList className="mt-8" layout="horizontal" divided size="sm" labelWidth="9rem" items={sheet.map(([label, value], i) => ({ key: String(i), label, value }))} />
            </div>
            <div className="grid content-start gap-10 lg:col-span-7">
              <TextBlock c={c} title={t({ en: "Description", tr: "Tanım" })} text={t(description)} />
              <TextBlock c={c} title={t({ en: `About ${STUDIO}`, tr: `${STUDIO} hakkında` })} text={t(boilerplate)} />
              <div>
                <h3 className="m-0 font-mono text-xs font-semibold text-fg-muted">{t({ en: "Recognition", tr: "Ödüller" })}</h3>
                <ul className="m-0 mt-3 grid list-none gap-2 p-0">
                  {awards.map((a, i) => (
                    <li key={i} className="flex items-start gap-3 text-small text-fg">
                      <span aria-hidden className="mt-1.5 size-2 shrink-0 rotate-45 bg-accent" />
                      {t(a)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section anchor="downloads" headingId="ea-dl-title" theme={{ surface: "surface-2" }}>
        <Container>
          <SectionHeader
            headingId="ea-dl-title"
            align="split"
            eyebrow={t({ en: "Downloads", tr: "İndirmeler" })}
            title={t({ en: "Take *what you need*", tr: "*İhtiyacınızı* alın" })}
            lead={t({ en: "Save files one by one, or tick what you want and get a single ZIP. Please don’t crop the logo or recolour the key art.", tr: "Dosyaları tek tek kaydedin ya da istediklerinizi işaretleyip tek bir ZIP alın. Lütfen logoyu kırpmayın, ana görselin rengini değiştirmeyin." })}
          />
          <div className="mt-10">
            <PressDownloads assets={assets} labels={labels} game={GAME} intl={c.intl} zipName="ember-atlas-press-kit" />
          </div>
        </Container>
      </Section>

      <Section anchor="team" headingId="ea-team-title">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <SectionHeader headingId="ea-team-title" eyebrow={STUDIO} title={t({ en: "Who to *quote*", tr: "Kimden *alıntı* yapılır" })} />
            </div>
            <ul className="m-0 grid list-none gap-0 p-0 sm:grid-cols-2 lg:col-span-7">
              {team.map((m) => (
                <li key={m.name} className="border-t border-line py-4 sm:odd:pe-6">
                  <p className="m-0 font-display text-xl text-fg">{m.name}</p>
                  <p className="m-0 text-small text-fg-muted">{t(m.role)}</p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      <Section anchor="keys" headingId="ea-keys-title" theme={{ surface: "surface-2", rhythm: "tight" }}>
        <Container>
          <div className="flex flex-col gap-6 rounded-ui border border-line bg-surface p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <Badge tone="accent" size="md">
                {t({ en: "Review keys", tr: "İnceleme anahtarları" })}
              </Badge>
              <h2 id="ea-keys-title" className="m-0 mt-3 font-display text-display-m text-fg">
                {t({ en: "Keys go out on 2 February", tr: "Anahtarlar 2 Şubat’ta gönderiliyor" })}
              </h2>
              <p className="m-0 mt-2 max-w-[56ch] text-small text-fg-muted">
                {t({ en: "Tell us your outlet or channel, platform and an address we can send to. We answer every request within two working days.", tr: "Yayın organınızı ya da kanalınızı, platformu ve gönderebileceğimiz bir adresi yazın. Her talebe iki iş günü içinde dönüyoruz." })}
              </p>
            </div>
            <Button asChild variant="primary" size="lg">
              <a href={`mailto:${PRESS_EMAIL}?subject=${encodeURIComponent("Ember Atlas review key")}`}>{t({ en: "Request a key", tr: "Anahtar iste" })}</a>
            </Button>
          </div>
        </Container>
      </Section>

      <Faq {...common} anchor="press-faq" variant="split" eyebrow="FAQ" title={t({ en: "Embargo & *usage*", tr: "Ambargo ve *kullanım*" })} items={faqPress.map((x) => ({ q: t(x.q), a: t(x.a) }))} deepLink={false} />
    </>
  );
}

function TextBlock({ c, title, text }: { c: Copy; title: string; text: string }) {
  const { t } = c;
  return (
    <div>
      <div className="flex items-center justify-between gap-4 border-b border-line pb-2">
        <h3 className="m-0 font-mono text-xs font-semibold text-fg-muted">{title}</h3>
        <CopyButton text={text} label={t({ en: "Copy", tr: "Kopyala" })} done={t({ en: "Copied", tr: "Kopyalandı" })} />
      </div>
      <p className="m-0 mt-4 text-body text-fg">{text}</p>
    </div>
  );
}
