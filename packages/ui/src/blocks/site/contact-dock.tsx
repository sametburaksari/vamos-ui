import * as React from "react";
import { CalendarCheck, Mail, Navigation, Phone } from "lucide-react";
import { cn2 as cn } from "./shared/kit-2";
import type { BlockBaseProps } from "../types";
import type { OpeningHours } from "../schema/types";
import { site2Text, type Site2BlockLabels, type Site2Text } from "./shared/labels-2";
import { telHref } from "./shared/kit-2";
import { BrandIcon, BRAND_NAMES, waLink } from "./shared/brand-icons";
import { DockHours } from "./shared/dock-hours";
import { DockAvoid } from "./shared/dock-avoid";
import { nameWithLabel } from "./shared/tap";

export type ContactDockVariant = "fab" | "bar" | "both";
export type DockAction = "call" | "whatsapp" | "directions" | "booking" | "email";
export type MessagingProvider = "whatsapp" | "telegram" | "messenger";

export interface ContactDockProps extends Omit<BlockBaseProps, "variant" | "labels" | "headingLevel"> {
  /** fab: a round message button in the bottom-end corner. bar: a mobile bottom bar of 2–4 actions. both: fab on desktop, bar on mobile. */
  variant?: ContactDockVariant;
  /** Messaging network of the fab. Default `"whatsapp"`. */
  provider?: MessagingProvider;
  /** E.164 WhatsApp number. */
  whatsapp?: string;
  /** Telegram username (without @). */
  telegram?: string;
  /** Facebook page username for Messenger (`m.me/<page>`). */
  messenger?: string;
  /** Prefilled WhatsApp text ("Hi, I’d like to book a table."). */
  message?: string;
  /** Fab label on desktop. Default "Message us". */
  label?: string;
  /** E.164 phone for "Call". */
  phone?: string;
  directionsHref?: string;
  bookingHref?: string;
  email?: string;
  /** Bar actions, in order (max 4). Default: call · whatsapp · directions (those configured). */
  actions?: DockAction[];
  /** Logical side. Default `"end"`. */
  position?: "end" | "start";
  /** Opening hours for off-hours behaviour. */
  hours?: OpeningHours;
  /** show (default): nothing changes. label: "We’re closed — we’ll reply in the morning". hide: no dock while closed. */
  offHours?: "show" | "label" | "hide";
  /** Fixed "now" (ISO) for previews. */
  now?: string;
  /** Render inside the parent instead of fixed to the viewport (docs, builder canvas). */
  contained?: boolean;
  labels?: Site2BlockLabels;
}

interface ActionSpec {
  href: string;
  label: string;
  aria: string;
  icon: React.ReactNode;
  external?: boolean;
}

function actionSpec(a: DockAction, p: ContactDockProps, t: Site2Text): ActionSpec | null {
  const iconClass = "size-5";
  switch (a) {
    case "call":
      return p.phone ? { href: telHref(p.phone), label: t("call"), aria: t("callNumber", { phone: p.phone }), icon: <Phone aria-hidden strokeWidth={1.5} className={iconClass} /> } : null;
    case "whatsapp":
      return p.whatsapp
        ? { href: waLink(p.whatsapp, p.message), label: "WhatsApp", aria: `${t("messageUsOn", { network: "WhatsApp" })}, ${t("opensInNewTab").replace(/[()]/g, "")}`, icon: <BrandIcon name="whatsapp" className={iconClass} />, external: true }
        : null;
    case "directions":
      return p.directionsHref ? { href: p.directionsHref, label: t("directionsShort"), aria: t("directions"), icon: <Navigation aria-hidden strokeWidth={1.5} className={iconClass} />, external: true } : null;
    case "booking":
      return p.bookingHref ? { href: p.bookingHref, label: t("booking"), aria: t("booking"), icon: <CalendarCheck aria-hidden strokeWidth={1.5} className={iconClass} /> } : null;
    case "email":
      return p.email ? { href: `mailto:${p.email}`, label: t("emailShort"), aria: `${t("email")}: ${p.email}`, icon: <Mail aria-hidden strokeWidth={1.5} className={iconClass} /> } : null;
  }
}

function messagingHref(p: ContactDockProps): string | undefined {
  const provider = p.provider ?? "whatsapp";
  if (provider === "telegram") return p.telegram ? `https://t.me/${p.telegram.replace(/^@/, "")}` : undefined;
  if (provider === "messenger") return p.messenger ? `https://m.me/${p.messenger}` : undefined;
  return p.whatsapp ? waLink(p.whatsapp, p.message) : undefined;
}

/**
 * Floating messaging button and mobile action bar ("Call · Directions · WhatsApp") — the main
 * conversion channel for local businesses in Turkey and many other markets. Plain links with
 * `data-track` for the app's analytics, last in DOM order, ≥ 44px targets, safe-area aware.
 * Server component; off-hours behaviour is a ~0.4 KB island.
 *
 * ```tsx
 * <ContactDock variant="both" whatsapp="+902160000000" message="Hi, I’d like to book a table." phone="+902160000000" directionsHref="https://maps.app.goo.gl/…" />
 * ```
 */
export function ContactDock(props: ContactDockProps) {
  const { variant = "both", provider = "whatsapp", label, position = "end", hours, offHours = "show", now, contained, className, labels, locale = "en-US", id, editMode } = props;
  const t = site2Text(labels, locale);
  const network = BRAND_NAMES[provider];
  const href = messagingHref(props);
  const defaultActions: DockAction[] = ["call", "whatsapp", "directions", "booking", "email"];
  const actions = (props.actions ?? defaultActions).map((a) => [a, actionSpec(a, props, t)] as const).filter((x): x is readonly [DockAction, ActionSpec] => !!x[1]).slice(0, 4);
  const showFab = variant !== "bar" && href;
  const fabLabel = label ?? t("messageUs");
  const showBar = variant !== "fab" && actions.length >= 2;
  const hoursIsland = hours && offHours !== "show" ? <DockHours hours={hours} mode={offHours} text={t("offHours")} now={now} className="vb-dock-offhours" /> : null;

  return (
    <div
      data-contact-dock=""
      data-variant={variant}
      data-position={position}
      data-contained={contained ? "" : undefined}
      data-block-id={editMode ? id : undefined}
      className={cn("vb-dock", className)}
    >
      {showFab ? (
        <div className={cn("vb-dock-fab", variant === "both" && "vb-dock-desktop", position === "start" && "flex-row-reverse")}>
          {hoursIsland ? <span className="vb-dock-note surface-popover max-w-[16rem] rounded-ui px-3 py-2 text-xs text-fg empty:hidden [&:has(>span:empty)]:hidden">{hoursIsland}</span> : null}
          <span aria-hidden className="vb-dock-label surface-popover rounded-full px-3.5 py-2 text-sm font-medium text-fg">
            {fabLabel}
          </span>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            data-track={provider}
            aria-label={nameWithLabel(fabLabel, `${t("messageUsOn", { network })}, ${t("opensInNewTab").replace(/[()]/g, "")}`)}
            className="vb-dock-button inline-flex size-[52px] shrink-0 items-center justify-center rounded-full bg-fg text-scene transition-opacity hover:opacity-90 focus-ring"
          >
            <BrandIcon name={provider} className="size-6" />
          </a>
        </div>
      ) : null}
      {showBar ? (
        <nav aria-label={t("contactActions")} className={cn("vb-dock-bar surface-bar border-t border-line", variant === "both" && "vb-dock-mobile")}>
          {hoursIsland && !showFab ? <p className="px-4 pt-2 text-center text-xs text-fg-muted empty:hidden">{hoursIsland}</p> : null}
          <ul className="grid" style={{ gridTemplateColumns: `repeat(${actions.length}, minmax(0, 1fr))` }}>
            {actions.map(([a, s]) => (
              <li key={a}>
                <a
                  href={s.href}
                  target={s.external ? "_blank" : undefined}
                  rel={s.external ? "noopener noreferrer" : undefined}
                  data-track={a}
                  aria-label={nameWithLabel(s.label, s.aria)}
                  className="flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium text-fg transition-colors hover:bg-hover focus-ring"
                >
                  {s.icon}
                  <span aria-hidden>{s.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
      {!contained && (showFab || showBar) ? <DockAvoid /> : null}
    </div>
  );
}
