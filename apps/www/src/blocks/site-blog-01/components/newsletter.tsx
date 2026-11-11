import { Cta } from "@vamos-ui/react/blocks";
import { copyFor, type SiteLocale } from "./content";

/** The newsletter band, shared by the home and article pages. Dark band, plain form. */
export function NewsletterBand({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  return (
    <Cta
      locale={intl}
      labels={labels}
      anchor="newsletter"
      variant="newsletter"
      theme={{ mode: "dark", surface: "surface" }}
      eyebrow={t({ en: "The letter", tr: "Mektup" })}
      title={t({ en: "One essay, every *Sunday* morning", tr: "Her *pazar* sabahı bir deneme" })}
      lead={t({
        en: "The best piece of the week, a photograph and three links we argued about. 21,400 readers; no tracking pixels.",
        tr: "Haftanın en iyi yazısı, bir fotoğraf ve üzerine tartıştığımız üç bağlantı. 21.400 okur; takip pikseli yok.",
      })}
      newsletter={{
        action: "/api/newsletter",
        placeholder: t({ en: "you@example.com", tr: "siz@example.com" }),
        buttonLabel: t({ en: "Subscribe", tr: "Abone ol" }),
        consent: t({ en: "Unsubscribe with one click. We never share your address.", tr: "Tek tıkla abonelikten çıkın. Adresinizi kimseyle paylaşmayız." }),
      }}
    />
  );
}
