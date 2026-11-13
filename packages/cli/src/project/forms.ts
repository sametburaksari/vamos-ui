/**
 * Form senders for the kit's ContactForm, written into the user's project:
 *
 *   php-mail  public/contact.php — for static exports on shared hosting (cPanel). PHP's mail()
 *             through the host's own mail server; JSON answer for the hydrated form, redirect
 *             back with ?vb_sent=<form> without JS.
 *   resend    app/actions/contact.ts — a Next.js server action calling the Resend HTTP API.
 *   smtp      app/actions/contact.ts — a Next.js server action with nodemailer and the
 *             business's own mailbox.
 *
 * Every sender validates against the same field list the form renders (app/contact-fields.ts or
 * the list baked into contact.php), drops honeypot / too-fast submits with a fake success,
 * rate-limits per IP, refuses cross-site posts and never puts visitor input into mail headers
 * except a checked Reply-To. Pure: returns path → content; the caller writes the files.
 */

import type { Lang } from "./questions";

export type SenderKind = "php-mail" | "resend" | "smtp";

export interface FormField {
  name: "name" | "email" | "phone" | "company" | "subject" | "budget" | "message" | "date";
  required?: boolean;
  options?: string[];
  max?: number;
}

export interface FormSenderOptions {
  kind: SenderKind;
  /** Business name, used in the subject line. */
  siteName?: string;
  /** Where messages go. php-mail bakes it into contact.php; the others read CONTACT_TO. */
  to?: string;
  /** Sender mailbox on the site's own domain (SPF / DKIM). php-mail: default no-reply@<host>. */
  from?: string;
  fields?: FormField[];
  /** A required "I have read the notice" checkbox (KVKK). Default true. */
  privacyCheckbox?: boolean;
  /** Language of the email body and the server messages. */
  lang?: Lang;
  /** Next.js app directory (app or src/app). */
  appDir?: string;
  /** Static files directory for contact.php. */
  publicDir?: string;
  /** php-mail: also write the field list here (a Next.js static export imports it in the page). */
  fieldsFile?: string;
  /** A booking request form (name, phone, date) instead of a contact form, when `fields` is not given. */
  booking?: boolean;
}

export interface FormSenderResult {
  files: Record<string, string>;
  /** Environment variables the sender reads (with an example value). */
  env: Record<string, string>;
  /** npm packages to install. */
  dependencies: string[];
  /** The `action` to pass to ContactForm. */
  action: string;
  /** Short how-to lines (in `lang`). */
  notes: string[];
}

export const DEFAULT_CONTACT_FIELDS: FormField[] = [
  { name: "name", required: true },
  { name: "email", required: true },
  { name: "phone" },
  { name: "message", required: true },
];

export const DEFAULT_BOOKING_FIELDS: FormField[] = [
  { name: "name", required: true },
  { name: "phone", required: true },
  { name: "date", required: true },
  { name: "message" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const LABELS: Record<Lang, Record<FormField["name"], string> & Record<"subject" | "privacy" | "marketing" | "yes" | "no" | "page" | "intro" | "required" | "invalidEmail" | "invalidPhone" | "tooLong" | "privacyRequired" | "tooMany" | "failed" | "sent" | "back", string>> = {
  en: {
    name: "Name",
    email: "Email",
    phone: "Phone",
    company: "Company",
    subject: "New message from the website",
    budget: "Budget",
    message: "Message",
    date: "Preferred date",
    privacy: "Read the privacy notice",
    marketing: "Marketing consent",
    yes: "yes",
    no: "no",
    page: "Page",
    intro: "A visitor sent this through the contact form.",
    required: "This field is required.",
    invalidEmail: "Enter an email address like name@company.com.",
    invalidPhone: "Enter a phone number.",
    tooLong: "This is too long.",
    privacyRequired: "Please confirm you have read the privacy notice.",
    tooMany: "Too many messages from this connection. Please try again later or call us.",
    failed: "The message could not be sent. Please call or email us instead.",
    sent: "Thank you, your message was sent.",
    back: "Back to the site",
  },
  tr: {
    name: "Ad soyad",
    email: "E-posta",
    phone: "Telefon",
    company: "Şirket",
    subject: "Web sitesinden yeni mesaj",
    budget: "Bütçe",
    message: "Mesaj",
    date: "Tercih edilen tarih",
    privacy: "Aydınlatma metnini okudu",
    marketing: "Pazarlama izni",
    yes: "evet",
    no: "hayır",
    page: "Sayfa",
    intro: "Bir ziyaretçi iletişim formundan bu mesajı gönderdi.",
    required: "Bu alan zorunlu.",
    invalidEmail: "ad@sirket.com gibi bir e-posta adresi yazın.",
    invalidPhone: "Bir telefon numarası yazın.",
    tooLong: "Bu alan çok uzun.",
    privacyRequired: "Lütfen aydınlatma metnini okuduğunuzu onaylayın.",
    tooMany: "Bu bağlantıdan çok fazla mesaj geldi. Lütfen biraz sonra tekrar deneyin ya da bizi arayın.",
    failed: "Mesaj gönderilemedi. Lütfen bizi arayın ya da e-posta gönderin.",
    sent: "Teşekkürler, mesajınız gönderildi.",
    back: "Siteye dön",
  },
};

const phpString = (v: string) => `'${v.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
const tsString = (v: string) => JSON.stringify(v);

function cleanFields(fields: FormField[] | undefined, booking: boolean): FormField[] {
  const list = (fields?.length ? fields : booking ? DEFAULT_BOOKING_FIELDS : DEFAULT_CONTACT_FIELDS).slice(0, 8);
  const seen = new Set<string>();
  return list.filter((f) => (seen.has(f.name) ? false : (seen.add(f.name), true)));
}

/** The files, env and notes for one sender. Throws on a malformed recipient / sender address. */
export function formSender(opts: FormSenderOptions): FormSenderResult {
  const lang: Lang = opts.lang ?? "tr";
  const L = LABELS[lang];
  const fields = cleanFields(opts.fields, !!opts.booking);
  const privacy = opts.privacyCheckbox ?? true;
  for (const [key, value] of [["to", opts.to], ["from", opts.from]] as const) {
    if (value && !EMAIL_RE.test(value)) throw new Error(`${key} "${value}" is not an email address.`);
  }
  const tr = lang === "tr";
  const subject = opts.siteName ? `${opts.siteName}: ${L.subject}` : L.subject;

  if (opts.kind === "php-mail") {
    const dir = opts.publicDir ?? "public";
    return {
      files: {
        [`${dir}/contact.php`]: phpSender({ fields, privacy, to: opts.to ?? "", from: opts.from ?? "", subject, fromName: opts.siteName ?? subject, L }),
        ...(opts.fieldsFile ? { [opts.fieldsFile]: fieldsModule(fields, privacy, "contact.php") } : {}),
      },
      env: {},
      dependencies: [],
      action: "/contact.php",
      notes: [
        tr
          ? `${dir}/contact.php statik çıktıyla birlikte sunucuya yüklenir. İçindeki CONTACT_TO ${opts.to ? "dolu" : "BOŞ — mesajların gideceği adresi yazın"}; CONTACT_FROM sitenin kendi alan adında var olan bir e-posta hesabı olmalı (SPF/DKIM).`
          : `${dir}/contact.php ships with the static export. CONTACT_TO inside it is ${opts.to ? "set" : "EMPTY — put the inbox that receives messages"}; CONTACT_FROM must be a real mailbox on the site's own domain (SPF/DKIM).`,
        opts.fieldsFile
          ? tr
            ? `Sayfada: import { contactFields, privacyCheckbox } from "@/${opts.fieldsFile.replace(/^src\//, "").replace(/\.ts$/, "")}"; <ContactForm action="/contact.php" fields={contactFields} privacyLink={{ href: "/kvkk" }} privacyCheckbox={privacyCheckbox} />`
            : `In the page: import { contactFields, privacyCheckbox } from "@/${opts.fieldsFile.replace(/^src\//, "").replace(/\.ts$/, "")}"; <ContactForm action="/contact.php" fields={contactFields} privacyLink={{ href: "/privacy" }} privacyCheckbox={privacyCheckbox} />`
          : tr
            ? `Formda: <ContactForm action="/contact.php" fields={${JSON.stringify(fields)}} privacyLink={{ href: "/kvkk" }} privacyCheckbox={${privacy}} /> (alanlar contact.php içindeki FIELDS ile aynı olmalı)`
            : `In the page: <ContactForm action="/contact.php" fields={${JSON.stringify(fields)}} privacyLink={{ href: "/privacy" }} privacyCheckbox={${privacy}} /> (the fields must match FIELDS in contact.php)`,
        tr ? "Yayından sonra formu bir kez gerçekten gönderip gelen kutusunu ve spam klasörünü kontrol edin." : "After launch, send one real message and check the inbox and the spam folder.",
      ],
    };
  }

  const appDir = opts.appDir ?? "app";
  const files: Record<string, string> = {
    [`${appDir}/contact-fields.ts`]: fieldsModule(fields, privacy),
    [`${appDir}/actions/contact.ts`]: opts.kind === "resend" ? resendAction(subject, L) : smtpAction(subject, L),
  };
  const env: Record<string, string> =
    opts.kind === "resend"
      ? { RESEND_API_KEY: "re_…", CONTACT_TO: opts.to ?? "", CONTACT_FROM: opts.from ?? "" }
      : { SMTP_HOST: "", SMTP_PORT: "465", SMTP_USER: opts.from ?? "", SMTP_PASS: "", CONTACT_TO: opts.to ?? "", CONTACT_FROM: opts.from ?? "" };
  return {
    files,
    env,
    dependencies: opts.kind === "smtp" ? ["nodemailer", "@types/nodemailer"] : [],
    action: "sendContact",
    notes: [
      tr
        ? `Ortam değişkenleri (.env.local ve hosting paneli): ${Object.keys(env).join(", ")}. Gizli değerleri koda yazmayın.`
        : `Environment variables (.env.local and the hosting panel): ${Object.keys(env).join(", ")}. Never commit the secret values.`,
      opts.kind === "resend"
        ? tr
          ? "Resend'de alan adınızı doğrulayın; CONTACT_FROM o alan adında olmalı (ör. form@alanadiniz.com)."
          : "Verify your domain in Resend; CONTACT_FROM must be on that domain (e.g. form@yourdomain.com)."
        : tr
          ? "SMTP bilgileri e-posta sağlayıcınızdan (cPanel → E-posta Hesapları → Bağlan, Google Workspace, Microsoft 365). Port 465 = SSL, 587 = STARTTLS."
          : "SMTP details come from your mail provider (cPanel → Email Accounts → Connect Devices, Google Workspace, Microsoft 365). Port 465 = SSL, 587 = STARTTLS.",
      tr
        ? 'Sayfada: import { sendContact } from "@/app/actions/contact"; import { contactFields, privacyCheckbox } from "@/app/contact-fields"; <ContactForm action={sendContact} fields={contactFields} privacyLink={{ href: "/kvkk" }} privacyCheckbox={privacyCheckbox} />'
        : 'In the page: import { sendContact } from "@/app/actions/contact"; import { contactFields, privacyCheckbox } from "@/app/contact-fields"; <ContactForm action={sendContact} fields={contactFields} privacyLink={{ href: "/privacy" }} privacyCheckbox={privacyCheckbox} />',
    ],
  };
}

function fieldsModule(fields: FormField[], privacy: boolean, server = "the server action"): string {
  return `// The fields of the contact form. The page renders them and ${server} validates
// against the same list${server === "contact.php" ? " (FIELDS in public/contact.php): change both together" : ", so change them here only"}.
import type { ContactFieldConfig } from "@vamos-ui/react/blocks";

export const contactFields: ContactFieldConfig[] = ${JSON.stringify(fields, null, 2)};

/** A required, never pre-checked "I have read the privacy notice" checkbox (KVKK / GDPR). */
export const privacyCheckbox = ${privacy};
`;
}

/** Shared head of both server actions: validation, spam, rate limit, origin check, body. */
function actionHead(L: (typeof LABELS)[Lang]): string {
  return `"use server";

import { headers } from "next/headers";
import { validateContactForm, type SiteFormState } from "@vamos-ui/react/blocks";
import { contactFields, privacyCheckbox } from "../contact-fields";

const LABELS: Record<string, string> = ${JSON.stringify(Object.fromEntries(["name", "email", "phone", "company", "subject", "budget", "message", "date"].map((k) => [k, L[k as FormField["name"]]])))};

// Best-effort limit per server instance: 5 messages per IP in 10 minutes.
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;
const hits = new Map<string, number[]>();
function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > LIMIT;
}

const oneLine = (v: string) => v.replace(/[\\r\\n]+/g, " ").trim();

async function prepare(data: FormData): Promise<{ state?: SiteFormState; text?: string; replyTo?: string }> {
  const v = validateContactForm(contactFields, data, { privacyCheckbox });
  if (v.spam) return { state: { status: "success", ts: Date.now() } };
  if (!v.ok) return { state: v.state };
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (origin && host && new URL(origin).host !== host) return { state: { status: "error", ts: Date.now() } };
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0]!.trim() || "unknown";
  if (limited(ip)) return { state: { status: "error", message: ${tsString(L.tooMany)}, values: v.values, ts: Date.now() } };
  const lines = contactFields.filter((f) => v.values[f.name]).map((f) => \`\${f.label ?? LABELS[f.name] ?? f.name}: \${v.values[f.name]}\`);
  lines.push(\`${L.privacy}: \${v.privacy ? ${tsString(L.yes)} : ${tsString(L.no)}}\`, \`${L.marketing}: \${v.marketing ? ${tsString(L.yes)} : ${tsString(L.no)}}\`);
  const referer = h.get("referer");
  if (referer) lines.push(\`${L.page}: \${oneLine(referer)}\`);
  const email = v.values.email ?? "";
  return { text: [${tsString(L.intro)}, "", ...lines].join("\\n"), replyTo: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(email) ? oneLine(email) : undefined };
}

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(\`\${name} is not set.\`);
  return value;
}
`;
}

function resendAction(subject: string, L: (typeof LABELS)[Lang]): string {
  return `${actionHead(L)}
/** ContactForm action: validates, then sends the message with the Resend API. */
export async function sendContact(_prev: SiteFormState, data: FormData): Promise<SiteFormState> {
  const { state, text, replyTo } = await prepare(data);
  if (state) return state;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: \`Bearer \${env("RESEND_API_KEY")}\`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env("CONTACT_FROM"), to: env("CONTACT_TO").split(",").map((x) => x.trim()), subject: ${tsString(subject)}, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    if (!res.ok) throw new Error(\`Resend answered \${res.status}: \${await res.text()}\`);
    return { status: "success", ts: Date.now() };
  } catch (error) {
    console.error("[contact]", error);
    return { status: "error", message: ${tsString(L.failed)}, ts: Date.now() };
  }
}
`;
}

function smtpAction(subject: string, L: (typeof LABELS)[Lang]): string {
  return `${actionHead(L)}
import nodemailer from "nodemailer";

let transport: ReturnType<typeof nodemailer.createTransport> | undefined;
function mailer() {
  const port = Number(process.env.SMTP_PORT ?? 465);
  transport ??= nodemailer.createTransport({ host: env("SMTP_HOST"), port, secure: port === 465, auth: { user: env("SMTP_USER"), pass: env("SMTP_PASS") } });
  return transport;
}

/** ContactForm action: validates, then sends the message through the business's own mailbox. */
export async function sendContact(_prev: SiteFormState, data: FormData): Promise<SiteFormState> {
  const { state, text, replyTo } = await prepare(data);
  if (state) return state;
  try {
    await mailer().sendMail({ from: process.env.CONTACT_FROM || env("SMTP_USER"), to: env("CONTACT_TO"), subject: ${tsString(subject)}, text, ...(replyTo ? { replyTo } : {}) });
    return { status: "success", ts: Date.now() };
  } catch (error) {
    console.error("[contact]", error);
    return { status: "error", message: ${tsString(L.failed)}, ts: Date.now() };
  }
}
`;
}

function phpSender(o: { fields: FormField[]; privacy: boolean; to: string; from: string; subject: string; fromName: string; L: (typeof LABELS)[Lang] }): string {
  const { L } = o;
  const fields = o.fields
    .map((f) => `  [${[`'name' => ${phpString(f.name)}`, `'label' => ${phpString(L[f.name])}`, `'required' => ${f.required ? "true" : "false"}`, `'max' => ${f.max ?? (f.name === "message" ? 2000 : 160)}`, `'options' => [${(f.options ?? []).map(phpString).join(", ")}]`].join(", ")}],`)
    .join("\n");
  return `<?php
/**
 * Contact form sender for a static site (Vamos UI ContactForm with action="/contact.php").
 * Sends with PHP mail() through this host's mail server. Answers JSON to the hydrated form and
 * redirects back with ?vb_sent=<form> when JavaScript is off.
 *
 * Fill in CONTACT_TO (who receives the messages) and CONTACT_FROM (a real mailbox on this
 * site's own domain, so SPF/DKIM pass). Nothing is stored on the server except a short-lived
 * rate-limit counter per IP hash.
 */

const CONTACT_TO = ${phpString(o.to)};
const CONTACT_FROM = ${phpString(o.from)}; // empty: no-reply@<this host>
const SUBJECT = ${phpString(o.subject)};
const PRIVACY_REQUIRED = ${o.privacy ? "true" : "false"};
const MIN_FILL_MS = 2500;      // faster than this is a bot
const LIMIT = 5;               // messages per IP …
const WINDOW_SECONDS = 600;    // … in 10 minutes

const FIELDS = [
${fields}
];

const MSG = [
  'required' => ${phpString(L.required)},
  'email' => ${phpString(L.invalidEmail)},
  'phone' => ${phpString(L.invalidPhone)},
  'long' => ${phpString(L.tooLong)},
  'privacy' => ${phpString(L.privacyRequired)},
  'many' => ${phpString(L.tooMany)},
  'failed' => ${phpString(L.failed)},
  'sent' => ${phpString(L.sent)},
  'back' => ${phpString(L.back)},
];

header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$wantsJson = stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;

function answer(array $body, int $code = 200): void {
  global $wantsJson;
  http_response_code($code);
  if ($wantsJson) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
  }
  $back = back_url($body['status'] === 'success' ? ($_POST['_form'] ?? '') : '');
  if ($body['status'] === 'success') {
    header('Location: ' . $back, true, 303);
    exit;
  }
  header('Content-Type: text/html; charset=utf-8');
  $items = '';
  foreach (($body['errors'] ?? []) as $msg) $items .= '<li>' . htmlspecialchars($msg) . '</li>';
  $text = htmlspecialchars($body['message'] ?? MSG['failed']);
  echo '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' . htmlspecialchars(SUBJECT) . '</title>'
    . '<main style="font:16px/1.5 system-ui;max-width:36rem;margin:4rem auto;padding:0 1rem"><p>' . ($items ? '' : $text) . '</p>' . ($items ? '<ul>' . $items . '</ul>' : '')
    . '<p><a href="' . htmlspecialchars($back) . '">' . htmlspecialchars(MSG['back']) . '</a></p></main>';
  exit;
}

/** Same-host page the form was on (never an outside URL), with ?vb_sent=<form> after success. */
function back_url(string $form): string {
  $ref = $_SERVER['HTTP_REFERER'] ?? '';
  $path = '/';
  if ($ref && same_host($ref)) $path = parse_url($ref, PHP_URL_PATH) ?: '/';
  if ($form !== '' && preg_match('/^[A-Za-z0-9_:-]{1,80}$/', $form)) $path .= '?vb_sent=' . rawurlencode($form);
  return $path;
}

/** True when $url points at this host (host and port as the browser sent them). */
function same_host(string $url): bool {
  $h = parse_url($url, PHP_URL_HOST);
  if (!$h) return false;
  $p = parse_url($url, PHP_URL_PORT);
  return strcasecmp($p ? $h . ':' . $p : $h, $_SERVER['HTTP_HOST'] ?? '') === 0;
}

function one_line(string $v): string {
  return trim(preg_replace('/[\\r\\n\\t]+/', ' ', $v));
}

function encode_header(string $v): string {
  return '=?UTF-8?B?' . base64_encode(one_line($v)) . '?=';
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  header('Allow: POST');
  answer(['status' => 'error'], 405);
}

// Cross-site posts are refused (the form always posts from this host).
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !same_host($origin)) {
  answer(['status' => 'error'], 403);
}

// Honeypot and time trap: answer like a success, send nothing.
$ts = (float) ($_POST['_ts'] ?? 0);
if (trim((string) ($_POST['website'] ?? '')) !== '' || ($ts > 0 && microtime(true) * 1000 - $ts < MIN_FILL_MS)) {
  answer(['status' => 'success']);
}

$values = [];
$errors = [];
foreach (FIELDS as $f) {
  $v = trim((string) ($_POST[$f['name']] ?? ''));
  $values[$f['name']] = $v;
  if ($v === '') {
    if ($f['required']) $errors[$f['name']] = MSG['required'];
    continue;
  }
  if (mb_strlen($v, 'UTF-8') > $f['max']) $errors[$f['name']] = MSG['long'];
  elseif ($f['name'] === 'email' && !filter_var($v, FILTER_VALIDATE_EMAIL)) $errors[$f['name']] = MSG['email'];
  elseif ($f['name'] === 'phone' && !preg_match('/^\\+?[\\d\\s().-]{7,20}$/', $v)) $errors[$f['name']] = MSG['phone'];
  elseif ($f['options'] && !in_array($v, $f['options'], true)) $errors[$f['name']] = MSG['required'];
}
$privacy = in_array($_POST['privacy'] ?? '', ['on', 'true'], true);
$marketing = in_array($_POST['marketing'] ?? '', ['on', 'true'], true);
if (PRIVACY_REQUIRED && !$privacy) $errors['privacy'] = MSG['privacy'];
if ($errors) answer(['status' => 'invalid', 'errors' => $errors], 422);

// Rate limit per IP (hashed; the address itself is not written anywhere).
$bucket = sys_get_temp_dir() . '/vb-contact-' . hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . __FILE__);
$now = time();
$recent = array_filter(array_map('intval', @file($bucket, FILE_IGNORE_NEW_LINES) ?: []), fn ($t) => $now - $t < WINDOW_SECONDS);
if (count($recent) >= LIMIT) answer(['status' => 'error', 'message' => MSG['many']], 429);
$recent[] = $now;
@file_put_contents($bucket, implode("\\n", $recent), LOCK_EX);

if (CONTACT_TO === '' || !filter_var(CONTACT_TO, FILTER_VALIDATE_EMAIL)) {
  error_log('contact.php: CONTACT_TO is not set');
  answer(['status' => 'error', 'message' => MSG['failed']], 500);
}

// The Host header comes from the visitor: only a plain host name may become part of the sender.
$host = strtolower(preg_replace('/^www\\./', '', preg_replace('/:\\d+$/', '', $_SERVER['HTTP_HOST'] ?? '')));
$from = CONTACT_FROM !== '' ? CONTACT_FROM : (preg_match('/^[a-z0-9.-]{1,253}$/', $host) ? 'no-reply@' . $host : '');
if (!filter_var($from, FILTER_VALIDATE_EMAIL)) {
  error_log('contact.php: set CONTACT_FROM to a mailbox on this domain');
  answer(['status' => 'error', 'message' => MSG['failed']], 500);
}
$lines = [${phpString(L.intro)}, ''];
foreach (FIELDS as $f) if ($values[$f['name']] !== '') $lines[] = $f['label'] . ': ' . $values[$f['name']];
$lines[] = ${phpString(L.privacy)} . ': ' . ($privacy ? ${phpString(L.yes)} : ${phpString(L.no)});
$lines[] = ${phpString(L.marketing)} . ': ' . ($marketing ? ${phpString(L.yes)} : ${phpString(L.no)});
if (!empty($_SERVER['HTTP_REFERER'])) $lines[] = ${phpString(L.page)} . ': ' . one_line($_SERVER['HTTP_REFERER']);

$headers = [
  'From: ' . encode_header(${phpString(o.fromName)}) . ' <' . $from . '>',
  'MIME-Version: 1.0',
  'Content-Type: text/plain; charset=UTF-8',
  'Content-Transfer-Encoding: 8bit',
];
$reply = $values['email'] ?? '';
if ($reply !== '' && filter_var($reply, FILTER_VALIDATE_EMAIL)) $headers[] = 'Reply-To: ' . one_line($reply);

$ok = mail(CONTACT_TO, encode_header(SUBJECT), implode("\\r\\n", $lines), implode("\\r\\n", $headers), '-f' . $from);
if (!$ok) {
  error_log('contact.php: mail() failed');
  answer(['status' => 'error', 'message' => MSG['failed']], 502);
}
answer(['status' => 'success']);
`;
}
