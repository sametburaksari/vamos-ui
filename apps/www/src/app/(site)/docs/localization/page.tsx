import { Badge } from "@vamos-ui/react";
import { A, C, Code, DocPage, H2, P, Table } from "@/components/docs/prose";
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
      <Code code={`import { LocaleProvider } from "@vamos-ui/react";
import { tr } from "@vamos-ui/react/locale/tr"; // same shape as the built-in \`en\`

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider locale="tr-TR" messages={tr} timeZone="Europe/Istanbul" currency="TRY">
      {children}
    </LocaleProvider>
  );
}`} />
      <P>Inside components, read strings and formatters with hooks:</P>
      <Code code={`import { useFormat, useLocale } from "@vamos-ui/react";

function Footer({ page, total, amount }: { page: number; total: number; amount: string }) {
  const { t } = useLocale();
  const f = useFormat();
  return (
    <p>
      {t("pagination.page", { page, total })} · {f.currency(amount)}
    </p>
  );
}`} />
      <P>
        Messages are plain string templates with named placeholders (<C>{"\"Page {page} of {total}\""}</C>), so a dictionary
        is serialisable JSON. The built-in dictionary covers <C>common</C>, <C>pagination</C>, <C>command</C> and the
        namespaces of each shipped component; it grows with each component.
      </P>

      <H2 id="overrides">Partial overrides</H2>
      <P>
        Rename one string without writing a full locale: any prop that shows built-in text (<C>closeLabel</C>,{" "}
        <C>emptyLabel</C>, <C>labels</C>) wins over the dictionary. Dictionaries are deep-merged, so a partial object only
        replaces the keys it names.
      </P>
      <Code code={`<LocaleProvider messages={{ common: { remove: "Move to bin" } }}>{children}</LocaleProvider>`} />

      <H2 id="formatting">Formatting</H2>
      <P>
        Numbers, money, dates and relative times go through the browser&apos;s <C>Intl</C> APIs with the active locale. The
        same values in two locales, computed live:
      </P>
      <LocaleSamples />
      <P>Dates without a time are sent as <C>YYYY-MM-DD</C>, money as a decimal string, and the time zone is always explicit.</P>

      <H2 id="packs">Locale packs</H2>
      <P>
        Some rules are country-specific, so they ship as optional, React-free data packs in{" "}
        <C>@vamos-ui/react/locale-data</C>. The Turkish pack is complete:
      </P>
      <Code code={`import { trPack, validateTckn, formatTrIban, computeKdv, trHolidaysForYear } from "@vamos-ui/react/locale-data";

validateTckn("10000000146").valid;      // true
formatTrIban("TR330006100519786457841326"); // "TR33 0006 1005 1978 6457 8413 26"`} />
      <Table
        head={["Pack content", "Used by", "Status"]}
        rows={[
          ["TCKN / VKN validation and masking", <A key="a1" href="/docs/components/formatted-input">Formatted inputs</A>, <Badge key="1" tone="success">Ready</Badge>],
          ["TR IBAN validation, mask and bank name; +90 phone format", <A key="a2" href="/docs/components/formatted-input">Formatted inputs</A>, <Badge key="2" tone="success">Ready</Badge>],
          ["KDV rates, withholding (tevkifat), rounding, amount in words", <A key="a3" href="/docs/components/line-items">Line items</A>, <Badge key="3" tone="success">Ready</Badge>],
          ["Public and religious holidays, work calendar", <A key="a4" href="/docs/components/calendar">Calendar</A>, <Badge key="4" tone="success">Ready</Badge>],
          ["Provinces, districts and postal codes", <A key="a5" href="/docs/components/address-field">Address field</A>, <Badge key="5" tone="success">Ready</Badge>],
          ["Turkish-aware search and slugs (İ/ı, ş, ğ)", "Combobox, pickers, slug input", <Badge key="6" tone="success">Ready</Badge>],
        ]}
      />
      <P>Other countries can add a pack with the same shape (<C>LocaleDataPack</C>): week start, holidays, ID and IBAN rules, phone format, money, tax scheme and address data.</P>

      <H2 id="rtl">Right-to-left</H2>
      <P>
        Components use logical properties (<C>ps</C>/<C>pe</C>, <C>start</C>/<C>end</C>, <C>text-start</C>) so they mirror
        under <C>dir=&quot;rtl&quot;</C>. Motion that must flip reads the <C>--dir</C> variable.
      </P>
    </DocPage>
  );
}
