"use client";

import * as React from "react";
import { CalendarClock, Check, Globe, Lock, MessageSquare } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  DescriptionList,
  RecordAside,
  RecordAsideSection,
  RecordHeader,
  RecordLayout,
  RecordMain,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  cn,
  toast,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { CertificationsPanel, certState } from "./certifications-panel";
import { MdfPanel, mdfTotals } from "./mdf-panel";
import { certs, manager, mdfClaims, nextReview, partner, registrations as seedRegs, tierBenefits, tierLabels, tierLadder, type MdfClaim, type Registration } from "./partner-data";
import { RegistrationsPanel } from "./registrations-panel";
import { TierLadder } from "./tier-ladder";

const tierTone = { registered: "neutral", silver: "info", gold: "warning", platinum: "accent" } as const;

/** Partner (PRM) record: tier ladder, deal registrations, MDF and certifications. */
export function PartnerView() {
  const { c, t, f, money } = useBlockFormat();
  const [regs, setRegs] = React.useState<Registration[]>(seedRegs);
  const [claims, setClaims] = React.useState<MdfClaim[]>(mdfClaims);
  const [tab, setTab] = React.useState("registrations");

  const toReview = regs.filter((r) => r.status === "submitted").length;
  const closed = regs.filter((r) => r.status === "won" || r.status === "expired" || r.status === "rejected");
  const won = regs.filter((r) => r.status === "won").length;
  const winRate = closed.length ? won / closed.length : 0;
  const certified = new Set(certs.filter((x) => certState(x) !== "expired").map((x) => x.holder)).size;
  const mdf = mdfTotals(claims);
  const claimsToReview = claims.filter((x) => x.status === "submitted").length;
  const tierIdx = tierLadder.findIndex((s) => s.tier === partner.tier);
  const platinum = tierLadder[tierLadder.length - 1]!;

  const decideRegs = (ids: string[], status: "approved" | "rejected", reason?: string) => {
    const before = regs;
    const names = regs.filter((r) => ids.includes(r.id)).map((r) => r.prospect);
    setRegs((all) => all.map((r) => (ids.includes(r.id) ? { ...r, status, note: reason ? { en: reason, tr: reason } : r.note } : r)));
    toast.success(
      status === "approved"
        ? c(`${names.length === 1 ? names[0] : `${names.length} registrations`} approved`, `${names.length === 1 ? names[0] : `${names.length} kayıt`} onaylandı`)
        : c(`${names.length === 1 ? names[0] : `${names.length} registrations`} rejected`, `${names.length === 1 ? names[0] : `${names.length} kayıt`} reddedildi`),
      {
        description: status === "approved" ? c("Protected for 90 days. Meridyen Digital is notified.", "90 gün korumada. Meridyen Digital’e bildirildi.") : c("The partner sees your note in their portal.", "Partner notunuzu portalında görür."),
        action: { label: c("Undo", "Geri al"), onClick: () => setRegs(before) },
      },
    );
  };

  const decideClaim = (id: string, status: "approved" | "rejected") => {
    const before = claims;
    const claim = claims.find((x) => x.id === id)!;
    setClaims((all) => all.map((x) => (x.id === id ? { ...x, status } : x)));
    toast.success(status === "approved" ? c(`${money(claim.amount, { whole: true })} approved`, `${money(claim.amount, { whole: true })} onaylandı`) : c("Claim rejected", "Talep reddedildi"), {
      description: t(claim.activity),
      action: { label: c("Undo", "Geri al"), onClick: () => setClaims(before) },
    });
  };

  return (
    <RecordLayout className="mx-auto max-w-[1440px]" defaultAsideWidth={320}>
      <RecordHeader
        back={{ href: "/work/partners", label: c("Partners", "Partnerler") }}
        media={<Avatar name={partner.name} size="xl" shape="square" />}
        title={partner.name}
        subtitle={c(`Reseller · ${t(partner.region)} · partner since ${f.date(partner.since, "month-year")}`, `Bayi · ${t(partner.region)} · ${f.date(partner.since, "month-year")} tarihinden beri partner`)}
        status={<Badge tone={tierTone[partner.tier]} dot>{t(tierLabels[partner.tier])}</Badge>}
        facts={[
          { label: c("Partner manager", "Partner yöneticisi"), value: manager.name },
          { label: c("Discount", "İndirim"), value: <span className="tabular">{tierLadder[tierIdx]!.discount}%</span> },
          { label: c("Next review", "Sonraki değerlendirme"), value: f.date(nextReview, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) },
          { label: c("Agreement", "Sözleşme"), value: c("Reseller 2025 · v2", "Bayilik 2025 · v2") },
        ]}
        actions={
          <>
            <Button onClick={() => toast(c("Message drafted in the partner portal", "Mesaj partner portalında taslak olarak açıldı"))}>
              <MessageSquare /> {c("Message", "Mesaj")}
            </Button>
            <Button
              variant="primary"
              disabled={toReview + claimsToReview === 0}
              onClick={() => {
                setTab(toReview ? "registrations" : "mdf");
                requestAnimationFrame(() => document.getElementById("partner-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" }));
              }}
            >
              <Check /> {c("Review queue", "İnceleme kuyruğu")} <span className="tabular opacity-70">{toReview + claimsToReview}</span>
            </Button>
          </>
        }
      />

      <RecordMain>
        <TierLadder certified={certified} wonCount={won} winRate={winRate} mdfLeft={mdf.left} />
        <Tabs value={tab} onValueChange={setTab} id="partner-tabs" className="scroll-mt-4">
          <TabsList aria-label={c("Partner records", "Partner kayıtları")}>
            <TabsTrigger value="registrations" count={toReview || undefined} badgeTone="warning">{c("Deal registrations", "Fırsat kayıtları")}</TabsTrigger>
            <TabsTrigger value="mdf" count={claimsToReview || undefined} badgeTone="warning">{c("MDF", "Pazarlama fonu")}</TabsTrigger>
            <TabsTrigger value="certs" count={certified}>{c("Certifications", "Sertifikalar")}</TabsTrigger>
          </TabsList>
          <TabsContent value="registrations" className="pt-4">
            <RegistrationsPanel items={regs} onDecide={decideRegs} />
          </TabsContent>
          <TabsContent value="mdf" className="pt-4">
            <MdfPanel
              claims={claims}
              onDecide={decideClaim}
              onAdd={(claim) => {
                setClaims((all) => [claim, ...all]);
                toast.success(c(`Claim for ${money(claim.amount, { whole: true })} filed`, `${money(claim.amount, { whole: true })} talep oluşturuldu`), { description: c("Waiting for proof of spend.", "Harcama belgesi bekleniyor.") });
              }}
            />
          </TabsContent>
          <TabsContent value="certs" className="pt-4">
            <CertificationsPanel certs={certs} needed={platinum.certified} />
          </TabsContent>
        </Tabs>
      </RecordMain>

      <RecordAside>
        <RecordAsideSection title={c("Partner manager", "Partner yöneticisi")}>
          <div className="flex items-center gap-3">
            <Avatar name={manager.name} size="lg" status={manager.status} />
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-medium text-fg">{manager.name}</p>
              <p className="truncate text-[12px] text-fg-muted">{t(manager.title)} · {manager.city}</p>
            </div>
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-ui bg-surface-2 px-3 py-2.5 text-[12.5px] text-fg-muted">
            <CalendarClock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span>
              {c("Quarterly business review", "Üç aylık iş değerlendirmesi")} · <span className="text-fg tabular">{f.dateTime(nextReview, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
            </span>
          </div>
        </RecordAsideSection>

        <RecordAsideSection title={c("Tier benefits", "Seviye avantajları")} collapsible>
          <ul className="grid gap-2">
            {tierBenefits.map((b) => {
              const has = tierLadder.findIndex((s) => s.tier === b.from) <= tierIdx;
              return (
                <li key={b.en} className={cn("flex items-start gap-2 text-[13px]", has ? "text-fg" : "text-fg-subtle")}>
                  {has ? <Check className="mt-0.5 size-3.5 shrink-0 text-accent-ink" aria-hidden /> : <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />}
                  <span>
                    {c(b.en, b.tr)}
                    {!has ? <span className="sr-only"> ({c(`from ${t(tierLabels[b.from])}`, `${t(tierLabels[b.from])} seviyesinden itibaren`)})</span> : null}
                  </span>
                  {!has ? <Badge tone="outline" className="ms-auto">{t(tierLabels[b.from])}</Badge> : null}
                </li>
              );
            })}
          </ul>
        </RecordAsideSection>

        <RecordAsideSection title={c("Details", "Ayrıntılar")} collapsible>
          <DescriptionList
            layout="vertical"
            size="sm"
            items={[
              { key: "domain", label: c("Website", "Web sitesi"), value: <span className="inline-flex items-center gap-1.5"><Globe className="size-3.5 text-fg-subtle" aria-hidden />{partner.domain}</span> },
              { key: "mdf", label: c("MDF share", "Pazarlama fonu payı"), value: t(tierLadder[tierIdx]!.mdfShare) },
              { key: "sourced", label: c("Sourced revenue (YTD)", "Getirdiği gelir (yıl başından)"), value: money(partner.sourcedRevenue, { whole: true }) },
              { key: "id", label: c("Partner ID", "Partner no"), value: <span className="font-mono text-[12.5px]">PRM-{partner.id.toUpperCase()}</span>, copyable: true },
            ]}
          />
        </RecordAsideSection>
      </RecordAside>
    </RecordLayout>
  );
}
