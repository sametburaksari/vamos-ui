import { A, C, Callout, Code, DocPage, H2, P, Table, UL } from "@/components/docs/prose";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "KVKK consent records",
  description: "A server-side helper that records which privacy notice a person saw and which consents they gave, hash-chained in a store you implement — and what it leaves to you under KVKK.",
  path: "/docs/kvkk/",
});

export default function KvkkPage() {
  return (
    <DocPage
      eyebrow="Docs"
      title="KVKK consent records"
      description="@vamos-ui/react/compliance builds an auditable record from a submitted form: the notice version and the hash of its text, each consent granted or refused, the time, and the IP address or user agent only when you pass them. You implement the store."
      toc={[
        { id: "record", title: "What a record holds" },
        { id: "contact-form", title: "With the contact form" },
        { id: "store", title: "The store" },
        { id: "verify", title: "Verifying records" },
        { id: "kvkk", title: "Kit vs. KVKK" },
      ]}
      prev={{ href: "/docs/localization", title: "Localization" }}
      next={{ href: "/docs/payments", title: "Payments (iyzico, PayTR)" }}
    >
      <Callout title="Scope">
        This page describes what the code does and lists the KVKK provisions it relates to. It does not say whether a given
        form needs consent, what a notice must contain for your processing, or how long to keep records.
      </Callout>

      <H2 id="record">What a record holds</H2>
      <P>
        <C>buildConsentRecord(input)</C> returns a plain JSON object; <C>recordConsent(store, input)</C> also chains it to the
        store&apos;s last record and appends it. Web Crypto only, so it runs in Node 20+, edge runtimes, Deno and Bun.
      </P>
      <Table
        head={["Field", "Content", "Notes"]}
        rows={[
          [<C key="1">notice</C>, "id, version, SHA-256 of the exact text, url, locale, acknowledged", "The text is hashed, never stored. acknowledged is the \"I have read the notice\" box, when the form has one."],
          [<C key="2">consents[]</C>, "purpose id, granted, SHA-256 of the statement next to the box, version", "A refused consent is recorded too (granted: false)."],
          [<C key="3">event</C>, "\"submission\" or \"withdrawal\"", "A withdrawal is a new record, not an edit."],
          [<C key="4">recordedAt</C>, "ISO 8601, UTC", "Server time of the call."],
          [<C key="5">subject</C>, "identifiers you choose (an e-mail, a customer id)", "Nothing by default except what you pass; contactConsentInput keeps the e-mail unless told otherwise."],
          [<C key="6">context</C>, "form, page, ip, userAgent", "ip and userAgent appear only if you pass them; the kit never reads request headers."],
          [<C key="7">prevHash / hash</C>, "SHA-256 of the canonical JSON; the previous record's hash", "Editing or deleting a record breaks the chain."],
        ]}
      />
      <Code code={`import { recordConsent } from "@vamos-ui/react/compliance";

await recordConsent(store, {
  notice: { id: "kvkk-aydinlatma", version: "2026-11-01", text: NOTICE_TEXT, url: "https://ornek.com.tr/kvkk", locale: "tr-TR" },
  noticeAcknowledged: true,
  consents: [{ purpose: { id: "marketing", statement: MARKETING_TEXT, version: "1" }, granted: false }],
  subject: { email: "deniz@ornek.com.tr" },
  form: "contact",
});`} />

      <H2 id="contact-form">With the contact form</H2>
      <P>
        <A href="/docs/components/contact-form">ContactForm</A> already keeps the notice and the marketing consent apart: a
        linked notice, an &quot;I have read it&quot; box that is never pre-checked, and a separate optional marketing box. Give the
        notice a version and the form posts it in a hidden <C>_notice</C> field, so a visitor who opened the page before you
        published a new notice is recorded against the version they saw. <C>resolveNotice</C> accepts only versions you list.
      </P>
      <Code code={`"use server";
import { headers } from "next/headers";
import { validateContactForm, site2LabelsTr, type SiteFormState } from "@vamos-ui/react/blocks";
import { contactConsentInput, recordConsent } from "@vamos-ui/react/compliance";
import { contactFields } from "../contact-fields";
import { consentStore, NOTICES } from "@/lib/consent"; // NOTICES: current version first

export async function sendContact(prev: SiteFormState, data: FormData): Promise<SiteFormState> {
  const v = validateContactForm(contactFields, data, { privacyCheckbox: true });
  if (v.spam) return { status: "success" };
  if (!v.ok) return v.state;
  const h = await headers();
  await recordConsent(consentStore, contactConsentInput(v, {
    notices: NOTICES,
    marketing: { id: "marketing", statement: site2LabelsTr.marketingConsent },
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim(), // only if you decided to keep it
  }));
  // … send the message
  return { status: "success" };
}

// page: <ContactForm action={sendContact} privacyLink={{ href: "/kvkk", version: NOTICES[0].version }} privacyCheckbox marketingConsent />`} />

      <H2 id="store">The store</H2>
      <P>
        A store is <C>{"{ append(record) }"}</C>, plus an optional <C>last()</C> that returns the most recent record so new
        ones chain to it. Keep it append-only (no update or delete permission for the application user). Under concurrent
        writes, take <C>last()</C> and <C>append()</C> in one transaction, or two records can share a <C>prevHash</C>.
      </P>
      <Code code={`import type { ConsentRecordStore } from "@vamos-ui/react/compliance";

export const consentStore: ConsentRecordStore = {
  append: (r) => db.insert(consentRecords).values({ id: r.id, recordedAt: r.recordedAt, hash: r.hash, body: r }),
  last: async () => (await db.select().from(consentRecords).orderBy(desc(consentRecords.recordedAt)).limit(1))[0]?.body ?? null,
};`} />
      <P><C>memoryConsentStore()</C> exists for tests and previews; it forgets everything on restart.</P>

      <H2 id="verify">Verifying records</H2>
      <UL>
        <li><C>verifyConsentRecord(record)</C> recomputes the hash.</li>
        <li><C>verifyConsentRecord(record, {"{ notice }"})</C> also checks that the archived notice text hashes to what the record says was shown — keep every published version of the notice text.</li>
        <li><C>verifyConsentChain(records)</C> checks every hash and every <C>prevHash</C> link, oldest first, and returns the index of the first break.</li>
      </UL>
      <P>A hash chain shows that records were not changed after the fact by someone who could not rewrite the whole chain. It is not a timestamp from a third party.</P>

      <H2 id="kvkk">Kit vs. KVKK</H2>
      <P>Law No. 6698 on the Protection of Personal Data (KVKK), and the rules made under it, as they relate to this helper:</P>
      <Table
        head={["Provision", "What it is about", "What the kit does", "Left to you"]}
        rows={[
          ["Art. 10, Communiqué on the obligation to inform (2018)", "Informing people at collection: controller, purposes, recipients, method and legal basis, rights. Informing is a separate act from obtaining consent.", "Links the notice from the form; records its version and text hash, and whether the box was ticked.", "Writing the notice; publishing every version; one notice per processing activity."],
          ["Art. 3 and 5 (explicit consent)", "Explicit consent: specific, informed, freely given. It is one processing condition among several (contract, legal obligation, legitimate interest…).", "Separate, unticked boxes per purpose; records granted and refused, with the statement hash.", "Deciding which processing relies on consent at all and which statement covers which purpose."],
          ["Withdrawal of consent", "Consent can be withdrawn; processing based on it stops from then on.", "event: \"withdrawal\" records.", "A way to withdraw, and acting on it."],
          ["Art. 7, Regulation on erasure, destruction or anonymisation (2017)", "Data is erased or anonymised when the purpose ends; a retention and destruction policy applies to many controllers.", "Nothing. Records are personal data too (e-mail, IP).", "Retention periods, deletion of records and of the data they refer to."],
          ["Art. 9 (amended by Law No. 7499, 2024)", "Transfers abroad: adequacy decisions, appropriate safeguards such as standard contracts, or limited incidental cases.", "Nothing. The store is yours, wherever it runs.", "Where records and form data are stored and processed."],
          ["Art. 11 and 13", "Rights of the data subject (access, correction, erasure…); controllers answer applications within 30 days.", "Records can be found by the subject identifiers you chose.", "The application channel and the answers."],
          ["Art. 12", "Technical and administrative security measures; breaches are notified to the Board and the people concerned.", "Hashes notice texts instead of storing them; IP and user agent are opt-in.", "Access control, encryption at rest, breach procedures."],
          ["Art. 16 (VERBİS)", "Registration in the data controllers' registry, with exemptions set by Board decisions.", "Nothing.", "Registration, where it applies."],
          ["Law No. 6563 and its regulation (İYS)", "Commercial electronic messages (SMS, calls, e-mail) need prior approval, and approvals are kept in the Message Management System (İYS).", "Records the marketing box as a consent; it does not register anything in İYS.", "Registering approvals and opt-outs in İYS when you send such messages."],
        ]}
      />
      <P>
        The kit&apos;s Turkish strings for the notice and marketing boxes are neutral templates; see{" "}
        <A href="/docs/localization">Localization</A>.
      </P>
    </DocPage>
  );
}
