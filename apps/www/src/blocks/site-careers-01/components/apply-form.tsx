"use client";

import * as React from "react";
import { addIsoDays, Alert, Button, Checkbox, Field, FileUpload, Input, RadioGroup, Select, Textarea, type UploadFile } from "@vamos-ui/react";
import { CircleCheck } from "lucide-react";
import { useCareers } from "./careers-provider";
import { copyFor, places, TODAY, type Job, type PlaceId, type SiteLocale } from "./content";

type Auth = "yes" | "eor" | "visa";
interface Values {
  name: string;
  email: string;
  phone: string;
  base: PlaceId | "elsewhere" | null;
  cv: UploadFile[];
  link: string;
  note: string;
  auth: Auth | null;
  consent: boolean;
}
type Errors = Partial<Record<keyof Values, string>>;

const initial: Values = { name: "", email: "", phone: "", base: null, cv: [], link: "", note: "", auth: null, consent: false };
const NOTE_MIN = 40;
const NOTE_MAX = 1200;

/** Five working days after `iso` (Mon–Fri). */
function workingDaysAfter(iso: string, n: number) {
  let d = iso;
  let left = n;
  while (left > 0) {
    d = addIsoDays(d, 1);
    const day = new Date(`${d}T12:00:00Z`).getUTCDay();
    if (day !== 0 && day !== 6) left--;
  }
  return d;
}

/**
 * Apply for one role: name, email, CV (PDF, one file), a short note, where you are based and
 * the right to work, plus consent for CV storage. Validates on submit, then on change; focuses
 * the first invalid field; ends in a confirmation with a reference and a reply-by date.
 */
export function ApplyForm({ job, locale }: { job: Job; locale: SiteLocale }) {
  const { t, f } = copyFor(locale);
  const { applied, markApplied } = useCareers();
  const [v, setV] = React.useState<Values>(initial);
  const [errors, setErrors] = React.useState<Errors>({});
  const [tried, setTried] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const doneRef = React.useRef<HTMLDivElement>(null);
  const reference = applied[job.id];

  // A different job: start a fresh form.
  React.useEffect(() => {
    setV(initial);
    setErrors({});
    setTried(false);
  }, [job.id]);

  const validate = (x: Values): Errors => {
    const e: Errors = {};
    if (x.name.trim().length < 2) e.name = t({ en: "Tell us your name.", tr: "Adınızı yazın." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(x.email.trim())) e.email = t({ en: "Enter an email like name@example.com.", tr: "ad@example.com gibi bir e-posta girin." });
    if (!x.base) e.base = t({ en: "Choose where you are based.", tr: "Nerede yaşadığınızı seçin." });
    if (!x.cv.length) e.cv = t({ en: "Attach your CV as a PDF.", tr: "CV’nizi PDF olarak ekleyin." });
    if (x.link.trim() && !/^https?:\/\/\S+\.\S+/.test(x.link.trim())) e.link = t({ en: "Start the link with https://", tr: "Bağlantıyı https:// ile başlatın." });
    if (x.note.trim().length < NOTE_MIN) e.note = t({ en: `A few sentences, please — at least ${NOTE_MIN} characters.`, tr: `Birkaç cümle lütfen — en az ${NOTE_MIN} karakter.` });
    if (!x.auth) e.auth = t({ en: "Choose one option.", tr: "Bir seçenek seçin." });
    if (!x.consent) e.consent = t({ en: "We need your consent to keep the CV during hiring.", tr: "İşe alım süresince CV’yi saklamak için onayınız gerekiyor." });
    return e;
  };

  const update = <K extends keyof Values>(key: K, value: Values[K]) => {
    setV((prev) => {
      const next = { ...prev, [key]: value };
      if (tried) setErrors(validate(next));
      return next;
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    const errs = validate(v);
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      const el = formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"] :is(input:not([type=hidden]),textarea,button,[role=combobox],[role=radio])`);
      el?.focus();
      return;
    }
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      const seq = String(400 + ((v.name.length * 37 + v.email.length * 11) % 600)).padStart(4, "0");
      markApplied(job.id, `${job.ref}-${seq}`);
      requestAnimationFrame(() => doneRef.current?.focus());
    }, 900);
  };

  if (reference) {
    const replyBy = workingDaysAfter(TODAY, 5);
    return (
      <div ref={doneRef} tabIndex={-1} role="status" className="flex flex-col gap-4 rounded-ui-lg border border-line bg-surface p-6 focus-ring" data-testid="apply-done">
        <CircleCheck aria-hidden className="size-7 text-success" />
        <h2 className="font-display text-[1.6rem] leading-tight text-fg">{t({ en: "Application sent", tr: "Başvurunuz gönderildi" })}</h2>
        <p className="text-small text-fg-muted">
          {t({ en: `${job.hiringManager} reads every application. You will hear from us by`, tr: `${job.hiringManager} her başvuruyu okur. En geç şu tarihte haber alırsınız:` })}{" "}
          <strong className="text-fg">{f.date(replyBy, { weekday: "long", day: "numeric", month: "long" })}</strong>.
        </p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-t border-line pt-4 font-mono text-xs">
          <dt className="text-fg-muted">{t({ en: "Reference", tr: "Referans" })}</dt>
          <dd className="text-fg">{reference}</dd>
          <dt className="text-fg-muted">{t({ en: "Role", tr: "Pozisyon" })}</dt>
          <dd className="text-fg">{t(job.title)}</dd>
        </dl>
      </div>
    );
  }

  const count = Object.keys(errors).length;
  return (
    <form ref={formRef} noValidate onSubmit={submit} aria-labelledby="np-apply-title" className="flex flex-col gap-5 rounded-ui-lg border border-line bg-surface p-5 sm:p-6">
      <div>
        <h2 id="np-apply-title" className="font-display text-[1.6rem] leading-tight text-fg">
          {t({ en: "Apply for this role", tr: "Bu pozisyona başvurun" })}
        </h2>
        <p className="mt-1 text-small text-fg-muted">{t({ en: "Takes about six minutes. No cover letter, no account.", tr: "Yaklaşık altı dakika sürer. Ön yazı yok, hesap yok." })}</p>
      </div>
      {tried && count > 0 ? (
        <Alert tone="danger" title={t({ en: count === 1 ? "One field needs a look" : `${count} fields need a look`, tr: `${count} alanı kontrol edin` })} />
      ) : null}

      <div data-field="name">
        <Field label={t({ en: "Full name", tr: "Ad soyad" })} required error={errors.name}>
          <Input autoComplete="name" value={v.name} onChange={(e) => update("name", e.target.value)} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div data-field="email">
          <Field label={t({ en: "Email", tr: "E-posta" })} required error={errors.email}>
            <Input type="email" autoComplete="email" value={v.email} onChange={(e) => update("email", e.target.value)} />
          </Field>
        </div>
        <div data-field="phone">
          <Field label={t({ en: "Phone", tr: "Telefon" })} optional>
            <Input type="tel" autoComplete="tel" placeholder="+90 216 000 00 00" value={v.phone} onChange={(e) => update("phone", e.target.value)} />
          </Field>
        </div>
      </div>
      <div data-field="base">
        <Field label={t({ en: "Where are you based?", tr: "Nerede yaşıyorsunuz?" })} required error={errors.base}>
          <Select<PlaceId | "elsewhere">
            value={v.base}
            onValueChange={(x) => update("base", x)}
            placeholder={t({ en: "Choose…", tr: "Seçin…" })}
            items={[
              { value: "istanbul", label: t({ en: "Istanbul", tr: "İstanbul" }) },
              { value: "izmir", label: t({ en: "Izmir", tr: "İzmir" }) },
              { value: "remote", label: t({ en: "Elsewhere in Europe (UTC−1 to +4)", tr: "Avrupa’da başka bir yer (UTC−1 ile +4)" }) },
              { value: "elsewhere", label: t({ en: "Somewhere else", tr: "Başka bir yer" }) },
            ]}
          />
        </Field>
        {v.base && v.base !== "elsewhere" && !job.places.includes(v.base) ? (
          <p className="mt-2 text-xs text-warning">{t({ en: `This role is ${job.places.map((p) => t(places[p].name)).join(" / ")}. You can still apply — say how you would make it work.`, tr: `Bu pozisyon ${job.places.map((p) => t(places[p].name)).join(" / ")}. Yine de başvurabilirsiniz — nasıl yürüteceğinizi yazın.` })}</p>
        ) : null}
      </div>
      <div data-field="cv">
        <Field label="CV" required error={errors.cv} hint={t({ en: "PDF, up to 5 MB.", tr: "PDF, en fazla 5 MB." })}>
          <FileUpload name="cv" accept=".pdf,application/pdf" maxFiles={1} maxSize={5_000_000} value={v.cv} onValueChange={(files) => update("cv", files)} variant="compact" invalid={!!errors.cv} />
        </Field>
      </div>
      <div data-field="link">
        <Field label={t({ en: "Portfolio, GitHub or LinkedIn", tr: "Portfolyo, GitHub ya da LinkedIn" })} optional error={errors.link}>
          <Input type="url" inputMode="url" placeholder="https://" value={v.link} onChange={(e) => update("link", e.target.value)} />
        </Field>
      </div>
      <div data-field="note">
        <Field label={t({ en: "Why this role, in your words", tr: "Neden bu pozisyon, kendi cümlelerinizle" })} required error={errors.note} hint={t({ en: "Three to six sentences is plenty.", tr: "Üç ila altı cümle yeterli." })}>
          <Textarea rows={5} maxLength={NOTE_MAX} value={v.note} onChange={(e) => update("note", e.target.value)} />
        </Field>
        <p className="mt-1 text-end font-mono text-[11px] text-fg-muted tabular" aria-hidden>
          {v.note.length} / {NOTE_MAX}
        </p>
      </div>
      <div data-field="auth">
        <Field label={t({ en: "Right to work", tr: "Çalışma izni" })} required error={errors.auth}>
          <RadioGroup<Auth>
            value={v.auth}
            onValueChange={(x) => update("auth", x)}
            items={[
              { value: "yes", label: t({ en: "I can work where I live without sponsorship", tr: "Yaşadığım yerde sponsorsuz çalışabilirim" }) },
              { value: "eor", label: t({ en: "I would join through an employer of record", tr: "Kayıtlı işveren (EOR) üzerinden katılırım" }) },
              { value: "visa", label: t({ en: "I would need a Turkish work permit", tr: "Türkiye çalışma iznine ihtiyacım olur" }) },
            ]}
          />
        </Field>
      </div>
      <div data-field="consent">
        <Field error={errors.consent}>
          <Checkbox
            checked={v.consent}
            onCheckedChange={(c) => update("consent", c === true)}
            label={t({ en: "Keep my CV for this hiring round and delete it after 12 months.", tr: "CV’mi bu işe alım süreci için saklayın ve 12 ay sonra silin." })}
            description={t({ en: "Only the hiring panel sees it. Ask any time to delete it sooner.", tr: "Yalnızca işe alım paneli görür. Daha önce silinmesini istediğiniz zaman isteyebilirsiniz." })}
          />
        </Field>
      </div>
      <Button type="submit" variant="primary" size="lg" loading={sending} loadingText={t({ en: "Sending…", tr: "Gönderiliyor…" })}>
        {t({ en: "Send application", tr: "Başvuruyu gönder" })}
      </Button>
    </form>
  );
}
