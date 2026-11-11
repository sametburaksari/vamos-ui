"use client";

import * as React from "react";
import { BellRing, CalendarClock, Mail, MessageSquare, Moon, Send, Sparkles, Zap } from "lucide-react";
import {
  Alert,
  Badge,
  Button,
  DatePicker,
  Field,
  Input,
  RadioGroup,
  Select,
  Switch,
  Textarea,
  TimePicker,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from "@vamos-ui/react";
import { CountUp } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { TODAY, channelInfo, cities, mergeTags, segments, senders, smsSegments, throttles, type CampaignDraft, type Channel } from "./data";
import { estimate } from "./reach";

export type Errors = Partial<Record<"segment" | "cities" | "subject" | "body" | "url" | "sms" | "pushTitle" | "date" | "time", string>>;

interface StepProps {
  draft: CampaignDraft;
  set: <K extends keyof CampaignDraft>(key: K, value: CampaignDraft[K]) => void;
  errors: Errors;
}

const channelIcon: Record<Channel, React.ReactNode> = { email: <Mail />, sms: <MessageSquare />, push: <BellRing /> };

/* 1 · Audience ----------------------------------------------------------------- */

export function AudienceStep({ draft, set, errors }: StepProps) {
  const { c, t, f } = useBlockFormat();
  const est = estimate(draft);
  return (
    <div className="grid gap-7">
      <fieldset>
        <legend className="mb-1 text-[14px] font-medium text-fg">{c("Who should get it?", "Kime gitsin?")}</legend>
        <p className="mb-3 text-[13px] text-fg-muted">{c("Segments update every night at 03:00.", "Segmentler her gece 03:00'te güncellenir.")}</p>
        <div role="radiogroup" aria-label={c("Segment", "Segment")} aria-invalid={Boolean(errors.segment)} className="grid gap-2">
          {segments.map((s) => {
            const on = draft.segment === s.id;
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => set("segment", s.id)}
                className={cn(
                  "focus-ring grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 rounded-ui border px-4 py-3 text-start transition-colors",
                  on ? "border-fg bg-surface shadow-[inset_3px_0_0_var(--color-accent)]" : "border-line hover:border-field-border-hover hover:bg-hover",
                )}
              >
                <span className="min-w-0">
                  <span className="block text-[14px] font-medium text-fg">{t(s.name)}</span>
                  <span className="block truncate text-[12.5px] text-fg-muted">{t(s.rule)}</span>
                </span>
                <span className="tabular text-end">
                  <span className="block text-[14px] text-fg">{f.number(s.size)}</span>
                  <span className="block text-[11.5px] text-fg-subtle">{c(`${f.percent(s.engaged)} engaged`, `%${Math.round(s.engaged * 100)} etkin`)}</span>
                </span>
              </button>
            );
          })}
        </div>
        {errors.segment ? <p className="mt-2 text-[12.5px] text-danger">{errors.segment}</p> : null}
      </fieldset>

      <div>
        <p id="aud-cities" className="mb-1 text-[14px] font-medium text-fg">{c("Cities", "Şehirler")}</p>
        <p className="mb-3 text-[13px] text-fg-muted">{c("Based on the shipping address of the last order.", "Son siparişin teslimat adresine göre.")}</p>
        <ToggleGroup type="multiple" variant="outline" size="sm" value={draft.cities} onValueChange={(v) => set("cities", v)} aria-labelledby="aud-cities" className="flex flex-wrap gap-1.5">
          {cities.map((ci) => (
            <ToggleGroupItem key={ci.id} value={ci.id}>
              {ci.id === "other" ? c("Elsewhere", "Diğer") : ci.name} <span className="tabular text-fg-muted">{f.percent(ci.share)}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {errors.cities ? <p className="mt-2 text-[12.5px] text-danger">{errors.cities}</p> : null}
      </div>

      <div className="grid gap-3">
        <p className="text-[14px] font-medium text-fg">{c("Leave out", "Hariç tut")}</p>
        <Switch
          checked={draft.excludeRecentBuyers}
          onCheckedChange={(v) => set("excludeRecentBuyers", v)}
          label={c("People who ordered in the last 7 days", "Son 7 günde sipariş verenler")}
          description={c("They just paid full price — an offer now feels unfair.", "Az önce tam fiyat ödediler — şimdi gelen indirim haksız hissettirir.")}
        />
        <Switch
          checked={draft.excludeFatigued}
          onCheckedChange={(v) => set("excludeFatigued", v)}
          label={c("Anyone messaged in the last 3 days", "Son 3 günde ileti alan herkes")}
          description={c("Frequency cap shared with every campaign and flow.", "Tüm kampanya ve akışlarla ortak sıklık sınırı.")}
        />
      </div>

      <div className="rounded-ui border border-dashed border-line px-4 py-3 text-[13px] text-fg-muted">
        <span className="tabular text-fg">
          <CountUp value={est.afterExclusions} duration={500} />
        </span>{" "}
        {c("people match", "kişi eşleşiyor")} · {c(`${f.number(est.matched - est.afterExclusions)} left out by the rules above`, `${f.number(est.matched - est.afterExclusions)} kişi yukarıdaki kurallarla çıkarıldı`)}
      </div>
    </div>
  );
}

/* 2 · Content ------------------------------------------------------------------ */

function TagButtons({ onInsert }: { onInsert: (tag: string) => void }) {
  const { c, t } = useBlockFormat();
  return (
    <span className="flex flex-wrap gap-1" role="group" aria-label={c("Insert personalisation", "Kişiselleştirme ekle")}>
      {mergeTags.map((m) => (
        <Button key={m.tag} type="button" size="xs" variant="ghost" onClick={() => onInsert(m.tag)} className="font-mono text-[11px]" aria-label={c(`Insert ${m.label.en}`, `${m.label.tr} ekle`)} title={t(m.label)}>
          {m.tag}
        </Button>
      ))}
    </span>
  );
}

export function ContentStep({ draft, set, errors }: StepProps) {
  const { c, t, money } = useBlockFormat();
  const subjectRef = React.useRef<HTMLInputElement>(null);
  const smsInfo = smsSegments(fillLength(draft.sms));
  const insert = (key: "subject" | "sms" | "body", tag: string) => set(key, `${draft[key]}${draft[key].endsWith(" ") || !draft[key] ? "" : " "}${tag}`);

  return (
    <div className="grid gap-6">
      <fieldset>
        <legend className="mb-3 text-[14px] font-medium text-fg">{c("Channel", "Kanal")}</legend>
        <RadioGroup
          variant="card"
          aria-label={c("Channel", "Kanal")}
          value={draft.channel}
          onValueChange={(v) => set("channel", v)}
          className="grid gap-2"
          items={(["email", "sms", "push"] as const).map((ch) => ({
            value: ch,
            icon: channelIcon[ch],
            label: t(channelInfo[ch].label),
            description: `${t(channelInfo[ch].hint)}${channelInfo[ch].unitCost ? ` · ${money(channelInfo[ch].unitCost!)}` : ""}`,
          }))}
        />
      </fieldset>

      {draft.channel === "email" ? (
        <>
          <Field label={c("From", "Gönderen")}>
            <Select value={draft.sender} onValueChange={(v) => v && set("sender", v)} items={senders} />
          </Field>
          <Field label={c("Subject", "Konu")} error={errors.subject} hint={c("Under 50 characters reads in full on phones.", "50 karakterin altı telefonda tam görünür.")} required labelAction={<TagButtons onInsert={(tag) => (insert("subject", tag), subjectRef.current?.focus())} />}>
            <Input ref={subjectRef} value={draft.subject} onChange={(e) => set("subject", e.target.value)} maxLength={90} showCount />
          </Field>
          <Field label={c("Preview text", "Önizleme metni")} optional hint={c("Shown after the subject in most inboxes.", "Çoğu gelen kutusunda konunun ardından görünür.")}>
            <Input value={draft.preheader} onChange={(e) => set("preheader", e.target.value)} maxLength={120} />
          </Field>
          <Field label={c("Message", "İleti")} error={errors.body} required labelAction={<TagButtons onInsert={(tag) => insert("body", tag)} />}>
            <Textarea rows={7} value={draft.body} onChange={(e) => set("body", e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <Field label={c("Button", "Buton")}>
              <Input value={draft.cta} onChange={(e) => set("cta", e.target.value)} maxLength={28} />
            </Field>
            <Field label={c("Button link", "Buton bağlantısı")} error={errors.url} hint={c("UTM tags are added for you.", "UTM etiketleri otomatik eklenir.")}>
              <Input type="url" value={draft.url} onChange={(e) => set("url", e.target.value)} spellCheck={false} />
            </Field>
          </div>
        </>
      ) : draft.channel === "sms" ? (
        <Field
          label={c("Message", "İleti")}
          required
          error={errors.sms}
          labelAction={<TagButtons onInsert={(tag) => insert("sms", tag)} />}
          hint={
            <span className="tabular">
              {c(`${smsInfo.length} characters · ${smsInfo.count} segment${smsInfo.count > 1 ? "s" : ""} of ${smsInfo.per}`, `${smsInfo.length} karakter · ${smsInfo.per} karakterlik ${smsInfo.count} parça`)}
              {smsInfo.unicode ? c(" · Turkish letters use the 70-character limit", " · Türkçe harfler 70 karakter sınırını kullanır") : ""}
            </span>
          }
        >
          <Textarea rows={4} value={draft.sms} onChange={(e) => set("sms", e.target.value)} />
        </Field>
      ) : (
        <>
          <Field label={c("Title", "Başlık")} required error={errors.pushTitle}>
            <Input value={draft.pushTitle} onChange={(e) => set("pushTitle", e.target.value)} maxLength={48} showCount />
          </Field>
          <Field label={c("Message", "İleti")} hint={c("Lock screens show about 110 characters.", "Kilit ekranı yaklaşık 110 karakter gösterir.")}>
            <Textarea rows={3} value={draft.preheader} onChange={(e) => set("preheader", e.target.value)} maxLength={180} />
          </Field>
        </>
      )}
    </div>
  );
}

/** Length after merge tags are filled with typical values (names run ~6 characters). */
const fillLength = (text: string) => text.replace(/\{first_name\}/g, "Elif__").replace(/\{city\}/g, "Ankara").replace(/\{last_product\}/g, "Linen napkin set");

/* 3 · Schedule ----------------------------------------------------------------- */

export const inQuietHours = (time: string | null) => Boolean(time && (time >= "22:00" || time < "09:00"));

export function ScheduleStep({ draft, set, errors }: StepProps) {
  const { c, t } = useBlockFormat();
  return (
    <div className="grid gap-6">
      <RadioGroup
        variant="card"
        aria-label={c("When to send", "Ne zaman gönderilsin")}
        value={draft.mode}
        onValueChange={(v) => set("mode", v)}
        items={[
          { value: "now" as const, icon: <Zap />, label: c("Send now", "Hemen gönder"), description: c("Starts within a minute of launch.", "Başlattıktan sonra bir dakika içinde çıkar.") },
          { value: "later" as const, icon: <CalendarClock />, label: c("Pick a date and time", "Tarih ve saat seç"), description: c("Istanbul time (GMT+3).", "İstanbul saati (GMT+3).") },
          { value: "smart" as const, icon: <Sparkles />, label: c("Best hour per person", "Kişiye göre en iyi saat"), description: c("Each person gets it when they usually open, over the next 24 hours.", "Herkes, önümüzdeki 24 saatte genelde açtığı saatte alır.") },
        ]}
      />

      {draft.mode === "later" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={c("Date", "Tarih")} error={errors.date} required>
            <DatePicker value={draft.date} onValueChange={(v) => set("date", v)} min={TODAY} />
          </Field>
          <Field label={c("Time", "Saat")} error={errors.time} required>
            <TimePicker value={draft.time} onValueChange={(v) => set("time", v)} hourCycle={24} step={15} />
          </Field>
        </div>
      ) : null}

      <div className="grid gap-4 border-t border-line pt-5">
        <Switch
          checked={draft.quietHours}
          onCheckedChange={(v) => set("quietHours", v)}
          label={
            <span className="inline-flex items-center gap-1.5">
              <Moon aria-hidden className="size-3.5 text-fg-subtle" /> {c("Respect quiet hours", "Sessiz saatlere uy")}
            </span>
          }
          description={c("Nothing goes out between 22:00 and 09:00; those sends wait until morning.", "22:00 ile 09:00 arası gönderim yapılmaz; bekleyenler sabah çıkar.")}
        />
        {draft.mode === "later" && draft.quietHours && inQuietHours(draft.time) ? (
          <Alert tone="warning" size="sm">
            {c(`${draft.time} falls in quiet hours, so this campaign will start at 09:00.`, `${draft.time} sessiz saatlere denk geliyor; kampanya 09:00'da başlayacak.`)}
          </Alert>
        ) : null}
        <Field label={c("Sending speed", "Gönderim hızı")} hint={c("Spreading out protects the site from a traffic spike.", "Yaymak siteyi ani trafik artışından korur.")}>
          <Select value={draft.throttle} onValueChange={(v) => v && set("throttle", v)} items={throttles.map((th) => ({ value: th.value, label: t(th.label) }))} />
        </Field>
      </div>
    </div>
  );
}

/* 4 · Review ------------------------------------------------------------------- */

export function ReviewStep({ draft, onEdit, onTest }: { draft: CampaignDraft; onEdit: (step: number) => void; onTest: () => void }) {
  const { c, t, f, money } = useBlockFormat();
  const est = estimate(draft);
  const when =
    draft.mode === "now"
      ? c("Right after launch", "Başlatınca hemen")
      : draft.mode === "smart"
        ? c("Best hour per person, over 24 hours", "Kişiye göre en iyi saat, 24 saat içinde")
        : draft.date && draft.time
          ? `${f.date(draft.date, "full")} · ${inQuietHours(draft.time) && draft.quietHours ? "09:00" : draft.time}`
          : "—";
  const checks = [
    { ok: est.reach > 0, label: c(`${f.number(est.reach)} people can receive it`, `${f.number(est.reach)} kişi alabilir`) },
    draft.channel === "email" ? { ok: draft.subject.length <= 50, warn: true, label: draft.subject.length <= 50 ? c("Subject fits on a phone", "Konu telefona sığıyor") : c(`Subject is ${draft.subject.length} characters — phones cut it at ~50`, `Konu ${draft.subject.length} karakter — telefonlar ~50'de keser`) } : null,
    draft.channel === "email" ? { ok: true, label: c("Unsubscribe link and postal address added", "Abonelikten çıkma bağlantısı ve posta adresi eklendi") } : null,
    draft.channel === "sms" ? { ok: est.parts <= 2, warn: true, label: c(`${est.parts} SMS segment${est.parts > 1 ? "s" : ""} per person`, `Kişi başı ${est.parts} SMS parçası`) } : null,
    { ok: draft.excludeFatigued, warn: true, label: draft.excludeFatigued ? c("Frequency cap on", "Sıklık sınırı açık") : c("Frequency cap is off — some people may get two messages today", "Sıklık sınırı kapalı — bazı kişiler bugün iki ileti alabilir") },
  ].filter(Boolean) as Array<{ ok: boolean; warn?: boolean; label: string }>;

  const rows: Array<{ step: number; k: string; v: React.ReactNode }> = [
    { step: 0, k: c("Audience", "Kitle"), v: `${est.seg ? t(est.seg.name) : "—"} · ${draft.cities.length === cities.length ? c("all cities", "tüm şehirler") : f.list(cities.filter((x) => draft.cities.includes(x.id)).map((x) => (x.id === "other" ? c("Elsewhere", "Diğer") : x.name)))}` },
    { step: 1, k: c("Channel", "Kanal"), v: t(channelInfo[draft.channel].label) },
    { step: 1, k: draft.channel === "email" ? c("Subject", "Konu") : c("Message", "İleti"), v: draft.channel === "email" ? draft.subject : draft.channel === "sms" ? draft.sms : draft.pushTitle },
    { step: 2, k: c("Sends", "Gönderim"), v: when },
  ];

  return (
    <div className="grid gap-6">
      <dl className="divide-y divide-line rounded-ui border border-line">
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-0.5 px-4 py-3 sm:grid-cols-[8rem_minmax(0,1fr)_auto]">
            <dt className="text-[12.5px] text-fg-subtle sm:pt-px">{r.k}</dt>
            <dd className="col-start-1 min-w-0 text-[13.5px] break-words text-fg sm:col-start-2 sm:row-start-1">{r.v}</dd>
            <dd className="col-start-2 row-span-2 row-start-1 self-center sm:col-start-3 sm:row-span-1">
              <Button size="xs" variant="ghost" onClick={() => onEdit(r.step)} aria-label={c(`Edit ${r.k.toLowerCase()}`, `${r.k} düzenle`)}>
                {c("Edit", "Düzenle")}
              </Button>
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-ui border border-line bg-line">
        {[
          { k: c("Recipients", "Alıcı"), v: <CountUp value={est.reach} duration={700} /> },
          { k: draft.channel === "sms" ? c("Delivered & read", "Teslim & okunma") : c("Likely opens", "Tahmini açılma"), v: <CountUp value={est.opens} duration={700} /> },
          { k: c("Cost", "Maliyet"), v: est.cost === "0" || Number(est.cost) === 0 ? c("Free", "Ücretsiz") : money({ amount: est.cost, currency: "TRY" }, { whole: Number(est.cost) > 1000 }) },
        ].map((s) => (
          <div key={s.k} className="bg-surface px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.08em] text-fg-subtle">{s.k}</p>
            <p className="tabular mt-1 font-display text-[1.35rem] leading-none text-fg">{s.v}</p>
          </div>
        ))}
      </div>

      <ul className="grid gap-1.5" aria-label={c("Pre-send checks", "Gönderim öncesi kontroller")}>
        {checks.map((k, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px]">
            <Badge tone={k.ok ? "success" : k.warn ? "warning" : "danger"} shape="square" className="mt-px w-14 justify-center">
              {k.ok ? c("OK", "Tamam") : k.warn ? c("Check", "Bak") : c("Fix", "Düzelt")}
            </Badge>
            <span className={k.ok ? "text-fg-muted" : "text-fg"}>{k.label}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3 rounded-ui bg-surface-2 px-4 py-3">
        <Send aria-hidden className="size-4 text-fg-subtle" />
        <p className="min-w-0 flex-1 basis-48 text-[13px] text-fg-muted">{c("Send a test to yourself or a colleague before launching.", "Başlatmadan önce kendinize veya bir iş arkadaşınıza test gönderin.")}</p>
        <Button size="sm" onClick={onTest}>
          {c("Send a test", "Test gönder")}
        </Button>
      </div>
    </div>
  );
}
