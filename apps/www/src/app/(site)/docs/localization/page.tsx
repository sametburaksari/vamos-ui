import { Badge } from "@vamos-cms/ui";
import { C, Code, DocPage, H2, P, Table } from "@/components/docs/prose";
import { LocaleSamples } from "@/components/docs/locale-samples";

export const metadata = { title: "Localization" };

export default function LocalizationPage() {
  return (
    <DocPage
      eyebrow="Docs"
      title="Localization"
      description="English is the default. Built-in strings and all formatting come from a locale you can swap — Turkish is the first extra locale."
      toc={[
        { id: "provider", title: "LocaleProvider" },
        { id: "overrides", title: "Partial overrides" },
        { id: "formatting", title: "Formatting" },
        { id: "packs", title: "Locale packs" },
        { id: "rtl", title: "Right-to-left" },
      ]}
      prev={{ href: "/docs/theming", title: "Theming" }}
      next={{ href: "/docs/cli", title: "CLI & registry" }}
    >
      <H2 id="provider">LocaleProvider</H2>
      <P>
        No i18n library is required. The kit works with zero config in English. To change the locale, wrap your app in{" "}
        <C>LocaleProvider</C> and pass a messages object of type <C>Messages</C>.
      </P>
      <Code code={`import { LocaleProvider } from "@vamos-cms/ui";
import { tr } from "./locales/tr"; // same shape as the built-in \`en\`

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider locale="tr-TR" messages={tr}>
      {children}
    </LocaleProvider>
  );
}`} />
      <P>Inside components, read strings and formatters with hooks:</P>
      <Code code={`import { useMessages, useFormat } from "@vamos-cms/ui";

function Footer({ page, total, amount }: { page: number; total: number; amount: number }) {
  const t = useMessages();
  const f = useFormat();
  return (
    <p>
      {t.pagination.page(page, total)} · {f.currency(amount, "TRY")}
    </p>
  );
}`} />
      <P>The built-in dictionary currently covers <C>common</C>, <C>pagination</C> and <C>command</C>; it grows with each component.</P>

      <H2 id="overrides">Partial overrides</H2>
      <P>
        Rename one string without writing a full locale: any prop that shows built-in text (<C>closeLabel</C>,{" "}
        <C>emptyLabel</C>, <C>labels</C>) wins over the dictionary. Deep-merged partial dictionaries are{" "}
        <Badge tone="outline">Planned</Badge>.
      </P>

      <H2 id="formatting">Formatting</H2>
      <P>
        Numbers, money, dates and relative times go through the browser&apos;s <C>Intl</C> APIs with the active locale. The
        same values in two locales, computed live:
      </P>
      <LocaleSamples />
      <P>Dates without a time are sent as <C>YYYY-MM-DD</C>, money as a decimal string, and the time zone is always explicit.</P>

      <H2 id="packs">Locale packs</H2>
      <P>Some rules are country-specific, so they ship as optional packs. The Turkish pack is first:</P>
      <Table
        head={["Pack content", "Used by", "Status"]}
        rows={[
          ["TCKN / VKN validation", "Formatted inputs", <Badge key="1" tone="outline">Planned</Badge>],
          ["TR IBAN validation and mask, +90 phone mask", "Formatted inputs", <Badge key="2" tone="outline">Planned</Badge>],
          ["KDV rates, withholding codes, rounding", "Line items", <Badge key="3" tone="outline">Planned</Badge>],
          ["Public holidays", "Calendar, resource calendar", <Badge key="4" tone="outline">Planned</Badge>],
          ["Provinces and districts", "Address field", <Badge key="5" tone="outline">Planned</Badge>],
          ["Turkish-aware search and slugs (İ/ı, ş, ğ)", "Combobox, pickers, slug input", <Badge key="6" tone="outline">Planned</Badge>],
        ]}
      />

      <H2 id="rtl">Right-to-left</H2>
      <P>
        Components use logical properties (<C>ps</C>/<C>pe</C>, <C>start</C>/<C>end</C>, <C>text-start</C>) so they mirror
        under <C>dir=&quot;rtl&quot;</C>. Motion that must flip reads the <C>--dir</C> variable.
      </P>
    </DocPage>
  );
}
