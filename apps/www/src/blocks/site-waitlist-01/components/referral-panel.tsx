"use client";

import * as React from "react";
import { ArrowUp, Check, Copy, Mail, MessageCircle, UserPlus } from "lucide-react";
import { Badge, Button, Field, Input, Progress, toast, useReducedMotion } from "@vamos-ui/react";
import { BlockHeading } from "@vamos-ui/react/blocks";
import { copyFor, FIRST_WAVE, PER_REFERRAL, SITE_URL, type SiteLocale } from "./content";
import { EMAIL_RE, inviteCode, useWaitlist } from "./waitlist-provider";

/** Eases a number towards `target` (900 ms, ease-out). Instant with reduced motion. */
function useTween(target: number, from: number) {
  const reduced = useReducedMotion();
  const [value, setValue] = React.useState(from);
  const current = React.useRef(from);
  React.useEffect(() => {
    if (reduced) {
      current.current = target;
      setValue(target);
      return;
    }
    const start = current.current;
    const t0 = performance.now();
    const dur = Math.min(1600, 500 + Math.abs(target - start) * 0.12);
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      const eased = 1 - (1 - k) ** 3;
      const v = Math.round(start + (target - start) * eased);
      current.current = v;
      setValue(v);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced]);
  return value;
}

/**
 * The signature of the waitlist: your place in line. It counts in from the back of the queue
 * when you arrive, and every friend who joins with your link moves you up 250 places — the
 * number rolls, a "↑ 250" chip appears and the progress to the first wave fills.
 */
export function ReferralPanel({ locale }: { locale: SiteLocale }) {
  const { t, f } = copyFor(locale);
  const { email, referrals, addReferral, position, startPosition } = useWaitlist();
  const shown = useTween(position, startPosition + 1800);
  const me = email ?? t({ en: "deniz@example.com", tr: "deniz@example.com" });
  const link = `${SITE_URL.replace("https://", "")}/r/${inviteCode(me)}`;
  const uid = React.useId();

  const [friend, setFriend] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [bump, setBump] = React.useState(0);

  const toGo = Math.max(0, position - FIRST_WAVE);
  const friendsNeeded = Math.ceil(toGo / PER_REFERRAL);
  const progress = Math.min(100, Math.round(((startPosition - position) / (startPosition - FIRST_WAVE)) * 100));
  const inWave = position <= FIRST_WAVE;

  const invite = (e: React.FormEvent) => {
    e.preventDefault();
    const v = friend.trim();
    const err = !v
      ? t({ en: "Add a friend’s email.", tr: "Bir arkadaşınızın e-postasını ekleyin." })
      : !EMAIL_RE.test(v)
        ? t({ en: "Check the address — it needs an @ and a domain.", tr: "Adresi kontrol edin — @ ve alan adı gerekli." })
        : v.toLowerCase() === me.toLowerCase()
          ? t({ en: "That’s you — invite someone else.", tr: "Bu sizsiniz — başka birini davet edin." })
          : referrals.some((r) => r.email.toLowerCase() === v.toLowerCase())
            ? t({ en: "Already invited.", tr: "Zaten davet edildi." })
            : null;
    setError(err);
    if (err) return;
    addReferral(v);
    setFriend("");
    setBump((b) => b + 1);
    toast.success(t({ en: `${v.split("@")[0]} joined with your link`, tr: `${v.split("@")[0]} bağlantınızla katıldı` }), {
      description: t({ en: `You moved up ${PER_REFERRAL} places.`, tr: `${PER_REFERRAL} sıra yükseldiniz.` }),
    });
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${link}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      toast.success(t({ en: "Invite link copied", tr: "Davet bağlantısı kopyalandı" }));
    } catch {
      toast.danger(t({ en: "Couldn’t copy — select the link instead", tr: "Kopyalanamadı — bağlantıyı seçin" }));
    }
  };

  const shareText = encodeURIComponent(
    t({ en: `I’m planning next year’s garden with Loam. Join the waitlist with my link: https://${link}`, tr: `Gelecek yılın bahçesini Loam ile planlıyorum. Bağlantımla listeye katıl: https://${link}` }),
  );

  return (
    <div className="grid gap-px overflow-hidden rounded-ui-lg border border-line bg-line lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      {/* The counter */}
      <div className="surface-2 flex flex-col justify-between gap-8 p-6 sm:p-10" data-position={position}>
        <div>
          <p className="m-0 font-mono text-[11px] tracking-[0.12em] text-fg-muted uppercase">{t({ en: "Your place in line", tr: "Sıradaki yeriniz" })}</p>
          <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-2">
            <p className="m-0 font-display text-[clamp(4rem,2.4rem+7cqi,8.5rem)] leading-[0.9] tracking-[-0.03em] text-fg tabular" aria-hidden data-testid="position">
              <span className="text-accent-ink">#</span>
              {f.number(shown)}
            </p>
            {bump > 0 ? (
              <Badge key={bump} tone="success" size="lg" className="ui-fade mb-3" data-state="open">
                <ArrowUp aria-hidden />
                {f.number(PER_REFERRAL)}
              </Badge>
            ) : null}
          </div>
          <p className="sr-only" aria-live="polite">
            {t({ en: `Your place in line: number ${position}.`, tr: `Sıradaki yeriniz: ${position}.` })}
          </p>
          <p className="m-0 mt-4 max-w-[46ch] text-fg-muted">
            {inWave
              ? t({ en: "You’re in the first wave. We’ll email you on 1 March at 09:00.", tr: "İlk dalgadasınız. 1 Mart saat 09.00’da size e-posta göndereceğiz." })
              : t({
                  en: `The first ${f.number(FIRST_WAVE)} get in on 1 March. Every friend who joins with your link moves you up ${f.number(PER_REFERRAL)} places.`,
                  tr: `İlk ${f.number(FIRST_WAVE)} kişi 1 Mart’ta giriyor. Bağlantınızla katılan her arkadaşınız sizi ${f.number(PER_REFERRAL)} sıra yukarı taşır.`,
                })}
          </p>
        </div>
        <Progress
          label={t({ en: "Distance to the first wave", tr: "İlk dalgaya uzaklık" })}
          value={progress}
          showValue
          size="md"
          hint={
            inWave
              ? t({ en: "Made it.", tr: "Başardınız." })
              : t({ en: `${f.number(toGo)} places to go — about ${f.number(friendsNeeded)} friends.`, tr: `${f.number(toGo)} sıra kaldı — yaklaşık ${f.number(friendsNeeded)} arkadaş.` })
          }
        />
      </div>

      {/* Move up */}
      <div className="surface flex flex-col gap-7 rounded-none p-6 sm:p-10">
        <div>
          <BlockHeading level={2} size="display-m" text={t({ en: "Move *up* the line", tr: "Sırada *yükselin*" })} />
          <p className="m-0 mt-2 text-sm text-fg-muted">
            {t({ en: "Saved as", tr: "Kayıtlı adres" })} <span className="font-medium text-fg">{me}</span>
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={`${uid}-link`} className="text-sm font-medium text-fg">
            {t({ en: "Your invite link", tr: "Davet bağlantınız" })}
          </label>
          <div className="flex gap-2">
            <Input id={`${uid}-link`} readOnly value={link} onFocus={(e) => e.currentTarget.select()} className="min-w-0 flex-1 font-mono text-[13px]" />
            <Button onClick={copy} aria-label={t({ en: "Copy invite link", tr: "Davet bağlantısını kopyala" })}>
              {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
              <span className="hidden sm:inline">{copied ? t({ en: "Copied", tr: "Kopyalandı" }) : t({ en: "Copy", tr: "Kopyala" })}</span>
            </Button>
          </div>
          <div className="mt-1 flex flex-wrap gap-2">
            <Button asChild variant="ghost" size="sm">
              <a href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden />
                {t({ en: "Send on WhatsApp", tr: "WhatsApp’ta gönder" })}
              </a>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <a href={`mailto:?subject=${encodeURIComponent("Loam")}&body=${shareText}`}>
                <Mail aria-hidden />
                {t({ en: "Email it", tr: "E-postayla gönder" })}
              </a>
            </Button>
          </div>
        </div>

        <form noValidate onSubmit={invite} className="flex flex-col gap-2 border-t border-line pt-6" aria-label={t({ en: "Invite a friend", tr: "Arkadaş davet et" })}>
          <Field label={t({ en: "Or invite a friend directly", tr: "Ya da doğrudan davet edin" })} error={error ?? undefined} hint={t({ en: "Demo: an invite counts as joined straight away.", tr: "Demo: davet anında katılım sayılır." })}>
            <Input type="email" autoComplete="off" placeholder={t({ en: "friend@example.com", tr: "arkadas@example.com" })} value={friend} onChange={(e) => setFriend(e.target.value)} />
          </Field>
          <div>
            <Button type="submit" variant="primary">
              <UserPlus aria-hidden />
              {t({ en: "Invite", tr: "Davet et" })}
            </Button>
          </div>
        </form>

        {referrals.length ? (
          <ul className="m-0 flex list-none flex-col p-0" aria-label={t({ en: "Friends who joined", tr: "Katılan arkadaşlar" })}>
            {referrals.map((r) => (
              <li key={r.email} className="flex items-center justify-between gap-3 border-t border-line py-2.5 text-sm">
                <span className="min-w-0 truncate text-fg">{r.email}</span>
                <span className="shrink-0 font-mono text-xs text-accent-ink tabular">
                  {t({ en: "joined", tr: "katıldı" })} · ↑{f.number(PER_REFERRAL)}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
