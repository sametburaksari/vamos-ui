/**
 * `vamos-ui site check`: the checks that prove a deploy took effect, on the live URL. One
 * permanent redirect from http:// to https://, one host name (www or not, the other 301s to it),
 * the security headers `site deploy` writes, a real 404 for an unknown path, and robots.txt and
 * sitemap.xml that answer. Pure (global fetch only, injectable), like the audit; the CLI pairs it
 * with `runAudit` and gates on both.
 */

import type { AuditReport } from "./index";
import { request, type FetchLike, type Fetched, type HttpOptions } from "./fetch";
import { isAllowed, parseRobots, parseSitemap } from "./files";

/** English and Turkish text, like the project module. */
export interface CheckText {
  en: string;
  tr: string;
}

export type DeployCheckId = "https-redirect" | "one-host" | "security-headers" | "not-found" | "contact-endpoint" | "robots" | "sitemap";
export type DeployCheckStatus = "pass" | "warn" | "fail" | "skip";

export interface DeployCheck {
  id: DeployCheckId;
  status: DeployCheckStatus;
  title: CheckText;
  message: CheckText;
  /** The URL that was requested for this check. */
  url?: string;
  fix?: CheckText;
}

export interface DeployCheckOptions {
  fetch?: FetchLike;
  timeoutMs?: number;
  userAgent?: string;
  /** Called before every request and redirect hop; throw AuditRefusedError to refuse a URL. */
  guard?: (url: URL) => void | Promise<void>;
  /** Path used for the 404 check (default: a random /vamos-ui-check-… path). */
  notFoundPath?: string;
  /**
   * The contact form endpoint (e.g. "/api/contact" or "/contact.php"). When given, an empty POST
   * must reach it: a 4xx refusal (400, 405, 415, 422 …) proves it exists; 404 means it did not
   * deploy. The empty POST never passes validation, so no mail is sent.
   */
  formEndpoint?: string | null;
  /** Header names the project's own config sets (e.g. from public/_headers), checked on top of the defaults. */
  expectedHeaders?: string[];
}

export interface SiteCheckVerdict {
  passed: boolean;
  score: number;
  minScore: number;
  auditErrors: number;
  failedChecks: DeployCheckId[];
  /** Why it did not pass (empty when it passed). */
  reasons: CheckText[];
}

const t = (en: string, tr: string): CheckText => ({ en, tr });

export const DEPLOY_CHECK_TITLES: Record<DeployCheckId, CheckText> = {
  "https-redirect": t("http → https (301)", "http → https (301)"),
  "one-host": t("One host name (www or not)", "Tek alan adı (www'li ya da www'siz)"),
  "security-headers": t("Security headers", "Güvenlik başlıkları"),
  "not-found": t("Unknown path returns 404", "Olmayan sayfa 404 döndürüyor"),
  "contact-endpoint": t("Contact form endpoint", "İletişim formu adresi"),
  robots: t("robots.txt", "robots.txt"),
  sitemap: t("sitemap.xml", "sitemap.xml"),
};

/** Headers `site deploy` writes for every host; a missing one means the config did not go live. */
export const REQUIRED_HEADERS = ["strict-transport-security", "x-content-type-options", "referrer-policy"] as const;
/** Also written by `site deploy`, but a site can have its own reasons to differ. */
export const RECOMMENDED_HEADERS = ["x-frame-options", "permissions-policy"] as const;

/** Second-level registry suffixes, so www.ornek.com.tr is treated as the www host of ornek.com.tr. */
const SECOND_LEVEL = /\.(?:(?:com|net|org|gen|web|biz|info|av|dr|bel|pol|k12|edu|gov|tv|name|tel)\.tr|(?:co|org|ac|gov|me|net|ltd|plc)\.uk|com\.(?:au|br|mx|cy|ar|tr)|co\.(?:jp|nz|za|kr|in|id|il)|(?:com|org|net)\.(?:au|br|mx|cy))$/i;

/**
 * The other host name of a site's address (www.<domain> ↔ <domain>), or null when there is none
 * to check: an IP address, localhost, or a subdomain such as shop.ornek.com.tr.
 */
export function alternateHost(hostname: string): string | null {
  const host = hostname.toLowerCase();
  if (/^\d+\.\d+\.\d+\.\d+$|^\[/.test(host) || host === "localhost" || !host.includes(".")) return null;
  const bare = host.startsWith("www.") ? host.slice(4) : host;
  const labels = bare.split(".").length;
  if (labels > (SECOND_LEVEL.test(`.${bare}`) ? 3 : 2)) return null;
  return host.startsWith("www.") ? bare : `www.${bare}`;
}

const permanent = (status: number) => status === 301 || status === 308;
const looksHtml = (body: string | null) => !!body && /^\s*(?:<!doctype html|<html)/i.test(body);

/** The first redirect of a request made with maxRedirects 0: its status and target, or null. */
function firstHop(r: Fetched): { status: number; target: string } | null {
  return r.chain.length ? { status: r.chain[0]!.status, target: r.finalUrl } : null;
}

const failed = (r: Fetched, lang: "en" | "tr") => (r.status ? `HTTP ${r.status}` : r.error ?? (lang === "tr" ? "yanıt yok" : "no answer"));

/** Runs the deploy checks against a live address. Never throws for network errors. */
export async function runDeployChecks(input: string, options: DeployCheckOptions = {}): Promise<{ url: string; finalUrl: string; checks: DeployCheck[] }> {
  const http: HttpOptions = {
    fetch: options.fetch ?? ((url, init) => fetch(url, init)),
    userAgent: options.userAgent ?? "vamos-ui-site-check (+https://ui.vamos.ist/docs/cli)",
    timeoutMs: options.timeoutMs ?? 10_000,
    maxBytes: 2 * 1024 * 1024,
    maxRedirects: 10,
    guard: options.guard,
    remaining: () => Infinity,
  };
  const url = new URL(input).href;
  const checks: DeployCheck[] = [];
  const add = (id: DeployCheckId, status: DeployCheckStatus, message: CheckText, at?: string, fix?: CheckText) => checks.push({ id, status, title: DEPLOY_CHECK_TITLES[id], message, url: at, fix });

  const start = await request(url, "GET", http);
  if (!start.status) {
    const why = start.error ?? "no answer";
    for (const id of (Object.keys(DEPLOY_CHECK_TITLES) as DeployCheckId[]).filter((x) => x !== "contact-endpoint" || options.formEndpoint)) add(id, "fail", t(`${url} could not be loaded: ${why}.`, `${url} açılamadı: ${why}.`), url);
    return { url, finalUrl: url, checks };
  }
  const finalUrl = start.finalUrl;
  const final = new URL(finalUrl);
  const origin = final.origin;
  const headers = start.headers!;

  // http → https --------------------------------------------------------------------
  const https = async () => {
    if (final.protocol !== "https:") {
      add("https-redirect", "fail", t(`The site ends up on ${finalUrl}, without HTTPS.`, `Site HTTPS olmadan ${finalUrl} adresinde açılıyor.`), finalUrl, t("Get a certificate for the domain, then redirect http:// to https:// with a 301.", "Alan adı için sertifika alın, sonra http:// adresini 301 ile https:// adresine yönlendirin."));
      return;
    }
    const plain = `http://${final.host}/`;
    const r = await request(plain, "GET", { ...http, maxRedirects: 0 }, false);
    const hop = firstHop(r);
    if (!hop) {
      if (r.refused) add("https-redirect", "skip", t(`${plain} was not requested: ${r.error}.`, `${plain} istenmedi: ${r.error}.`), plain);
      else if (r.status) add("https-redirect", "fail", t(`${plain} answers ${r.status} without redirecting to https.`, `${plain} https'e yönlendirmeden ${r.status} döndürüyor.`), plain, t("Add a permanent (301) redirect from http:// to https:// (site deploy writes it for each host).", "http:// adresinden https:// adresine kalıcı (301) yönlendirme ekleyin (site deploy her sunucu için yazar)."));
      else add("https-redirect", "warn", t(`${plain} does not answer (${r.error}); visitors who type http:// get an error.`, `${plain} yanıt vermiyor (${r.error}); http:// yazan ziyaretçi hata görür.`), plain, t("Open port 80 and redirect it to https:// with a 301.", "80 portunu açın ve 301 ile https:// adresine yönlendirin."));
      return;
    }
    if (!/^https:/i.test(hop.target)) add("https-redirect", "fail", t(`${plain} redirects to ${hop.target}, not to https.`, `${plain} https yerine ${hop.target} adresine yönlendiriyor.`), plain);
    else if (!permanent(hop.status)) add("https-redirect", "warn", t(`${plain} redirects with ${hop.status} (temporary); search engines keep the http address.`, `${plain} ${hop.status} (geçici) ile yönlendiriyor; arama motorları http adresini tutar.`), plain, t("Make it a 301 (or 308).", "301 (ya da 308) yapın."));
    else add("https-redirect", "pass", t(`${plain} → ${hop.target} (${hop.status}).`, `${plain} → ${hop.target} (${hop.status}).`), plain);
  };

  // one host name ------------------------------------------------------------------------
  const oneHost = async () => {
    const alt = alternateHost(final.hostname);
    if (!alt) {
      add("one-host", "skip", t(`${final.hostname} has no www / non-www twin to check.`, `${final.hostname} için kontrol edilecek www / www'siz eşi yok.`));
      return;
    }
    const altUrl = `${final.protocol}//${alt}${final.port ? `:${final.port}` : ""}/`;
    const r = await request(altUrl, "GET", { ...http, maxRedirects: 0 }, false);
    const hop = firstHop(r);
    if (hop) {
      let target: URL | null = null;
      try {
        target = new URL(hop.target);
      } catch {
        /* ignore */
      }
      if (!target || target.hostname.toLowerCase() !== final.hostname.toLowerCase())
        add("one-host", "warn", t(`${altUrl} redirects to ${hop.target}, not to ${origin}/.`, `${altUrl} ${origin}/ yerine ${hop.target} adresine yönlendiriyor.`), altUrl, t(`Redirect ${alt} straight to ${origin}/ in one hop.`, `${alt} adresini tek adımda ${origin}/ adresine yönlendirin.`));
      else if (!permanent(hop.status)) add("one-host", "warn", t(`${altUrl} redirects with ${hop.status} (temporary).`, `${altUrl} ${hop.status} (geçici) ile yönlendiriyor.`), altUrl, t("Make it a 301 (or 308).", "301 (ya da 308) yapın."));
      else add("one-host", "pass", t(`${altUrl} → ${hop.target} (${hop.status}).`, `${altUrl} → ${hop.target} (${hop.status}).`), altUrl);
      return;
    }
    if (r.refused) add("one-host", "skip", t(`${altUrl} was not requested: ${r.error}.`, `${altUrl} istenmedi: ${r.error}.`), altUrl);
    else if (r.status >= 200 && r.status < 300)
      add("one-host", "fail", t(`${altUrl} serves the site too, without redirecting to ${origin}/: two copies of every page.`, `${altUrl} de siteyi ${origin}/ adresine yönlendirmeden açıyor: her sayfanın iki kopyası var.`), altUrl, t(`301-redirect ${alt} to ${origin}/ (site deploy --domain writes it).`, `${alt} adresini 301 ile ${origin}/ adresine yönlendirin (site deploy --domain yazar).`));
    else add("one-host", "warn", t(`${altUrl} ${r.status ? `answers ${r.status}` : `does not answer (${r.error})`}; visitors who type it do not reach the site.`, `${altUrl} ${r.status ? `${r.status} döndürüyor` : `yanıt vermiyor (${r.error})`}; bu adresi yazan siteye ulaşamaz.`), altUrl, t(`Point ${alt} at the host (DNS) and 301-redirect it to ${origin}/.`, `${alt} için DNS kaydı açın ve 301 ile ${origin}/ adresine yönlendirin.`));
  };

  // security headers (from the start page response) -------------------------------------
  const missingReq = REQUIRED_HEADERS.filter((h) => !headers.has(h));
  const frameOk = headers.has("x-frame-options") || /frame-ancestors/i.test(headers.get("content-security-policy") ?? "");
  const known = new Set<string>([...REQUIRED_HEADERS, ...RECOMMENDED_HEADERS]);
  const ownHeaders = [...new Set((options.expectedHeaders ?? []).map((h) => h.toLowerCase().trim()))].filter((h) => /^[a-z0-9-]+$/.test(h) && !known.has(h) && h !== "cache-control");
  const missingRec = [...RECOMMENDED_HEADERS.filter((h) => (h === "x-frame-options" ? !frameOk : !headers.has(h))), ...ownHeaders.filter((h) => !headers.has(h))];
  const headerFix = t("Deploy the headers site deploy wrote (.htaccess, vercel.json, _headers or the nginx config) and purge the CDN cache.", "site deploy'un yazdığı başlıkları yayına alın (.htaccess, vercel.json, _headers ya da nginx yapılandırması) ve CDN önbelleğini temizleyin.");
  if (missingReq.length) add("security-headers", "fail", t(`Not set: ${[...missingReq, ...missingRec].join(", ")}.`, `Eksik: ${[...missingReq, ...missingRec].join(", ")}.`), finalUrl, headerFix);
  else if (missingRec.length) add("security-headers", "warn", t(`Set: ${REQUIRED_HEADERS.join(", ")}. Not set: ${missingRec.join(", ")}.`, `Var: ${REQUIRED_HEADERS.join(", ")}. Eksik: ${missingRec.join(", ")}.`), finalUrl, headerFix);
  else add("security-headers", "pass", t(`${[...REQUIRED_HEADERS, ...RECOMMENDED_HEADERS, ...ownHeaders].join(", ")} are set.`, `${[...REQUIRED_HEADERS, ...RECOMMENDED_HEADERS, ...ownHeaders].join(", ")} tanımlı.`), finalUrl);

  // unknown path → 404 ------------------------------------------------------------------------
  const notFound = async () => {
    const path = options.notFoundPath ?? `/vamos-ui-check-${Math.random().toString(36).slice(2, 10)}`;
    const probeUrl = new URL(path, origin).href;
    const r = await request(probeUrl, "GET", http);
    const fix = t("Serve the 404 page with status 404 (ErrorDocument 404 on cPanel, not-found.tsx in Next.js); never redirect unknown paths to the home page.", "404 sayfasını 404 durum koduyla sunun (cPanel'de ErrorDocument 404, Next.js'te not-found.tsx); olmayan adresleri ana sayfaya yönlendirmeyin.");
    if (r.status === 404 || r.status === 410) add("not-found", "pass", t(`${path} → ${r.status}${r.chain.length ? ` (after ${r.chain.length} redirect${r.chain.length === 1 ? "" : "s"})` : ""}.`, `${path} → ${r.status}${r.chain.length ? ` (${r.chain.length} yönlendirmeden sonra)` : ""}.`), probeUrl);
    else if (r.status >= 200 && r.status < 300)
      add("not-found", "fail", t(`${path} answers ${r.status}${r.chain.length ? ` after redirecting to ${r.finalUrl}` : ""} (a "soft 404"): search engines index error pages and broken links look fine.`, `${path} ${r.chain.length ? `${r.finalUrl} adresine yönlendirip ` : ""}${r.status} döndürüyor ("soft 404"): arama motorları hata sayfalarını dizine alır, kırık bağlantılar fark edilmez.`), probeUrl, fix);
    else add("not-found", "fail", t(`${path} answers ${failed(r, "en")}, not 404.`, `${path} 404 yerine ${failed(r, "tr")} döndürüyor.`), probeUrl, fix);
  };

  // contact form endpoint ---------------------------------------------------------------------
  const contact = async () => {
    if (!options.formEndpoint) return;
    let at: string;
    try {
      at = new URL(options.formEndpoint, origin).href;
      await options.guard?.(new URL(at));
    } catch (error) {
      add("contact-endpoint", "skip", t(`${options.formEndpoint} was not requested: ${(error as Error).message}.`, `${options.formEndpoint} istenmedi: ${(error as Error).message}.`));
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), http.timeoutMs);
    let status = 0;
    let error = "";
    try {
      const res = await http.fetch(at, { method: "POST", redirect: "manual", signal: ctrl.signal, headers: { "user-agent": http.userAgent, accept: "application/json" } });
      status = res.status;
      await res.body?.cancel().catch(() => {});
    } catch (e) {
      error = ctrl.signal.aborted ? "timed out" : (e as Error).message;
    } finally {
      clearTimeout(timer);
    }
    const fix = t(
      "Deploy the form sender with the site: functions/ next to out/ on Cloudflare Pages and Spacefast (site deploy --publish does it), public/contact.php on cPanel. Then send one real message.",
      "Form göndericisini siteyle birlikte yayınlayın: Cloudflare Pages ve Spacefast'te out/ yanında functions/ (site deploy --publish bunu yapar), cPanel'de public/contact.php. Sonra gerçek bir mesaj gönderin.",
    );
    if (!status) add("contact-endpoint", "fail", t(`POST ${at} got no answer (${error}).`, `POST ${at} yanıt vermedi (${error}).`), at, fix);
    else if (status === 404 || status === 410) add("contact-endpoint", "fail", t(`POST ${at} answers ${status}: the form has nowhere to send.`, `POST ${at} ${status} döndürüyor: formun gönderecek yeri yok.`), at, fix);
    else if ([400, 403, 405, 411, 413, 415, 422, 429].includes(status)) add("contact-endpoint", "pass", t(`POST ${at} answers ${status} to an empty request: the endpoint is live.`, `POST ${at} boş isteğe ${status} döndürüyor: adres çalışıyor.`), at);
    else if (status >= 200 && status < 300) add("contact-endpoint", "warn", t(`POST ${at} answers ${status} to an empty request; make sure it validates the fields and the consent.`, `POST ${at} boş isteğe ${status} döndürüyor; alanları ve onayı doğruladığından emin olun.`), at);
    else if (status >= 300 && status < 400) add("contact-endpoint", "warn", t(`POST ${at} redirects (${status}); the form posts to the address it is given.`, `POST ${at} yönlendiriyor (${status}); form verilen adrese gönderir.`), at, t("Use the final address (https, one host name) as the form action.", "Form action olarak son adresi kullanın (https, tek alan adı)."));
    else add("contact-endpoint", "warn", t(`POST ${at} answers ${status}; check the function logs and its environment variables.`, `POST ${at} ${status} döndürüyor; fonksiyon günlüklerini ve ortam değişkenlerini kontrol edin.`), at, fix);
  };

  // robots.txt ------------------------------------------------------------------------------
  let robotsSitemaps: string[] = [];
  const robots = async () => {
    const at = `${origin}/robots.txt`;
    const r = await request(at, "GET", http);
    if (r.status !== 200 || r.body === null || looksHtml(r.body)) {
      add("robots", "fail", t(`${at} ${r.status === 200 ? "returns an HTML page" : `answers ${failed(r, "en")}`}.`, `${at} ${r.status === 200 ? "HTML sayfa döndürüyor" : `${failed(r, "tr")} döndürüyor`}.`), at, t("Publish robots.txt (site essentials writes app/robots.ts) with a Sitemap: line.", "robots.txt yayınlayın (site essentials app/robots.ts yazar), içinde Sitemap: satırı olsun."));
      return;
    }
    const parsed = parseRobots(r.body);
    robotsSitemaps = parsed.sitemaps;
    if (!isAllowed(parsed, "Googlebot", "/")) add("robots", "fail", t(`${at} disallows / for Googlebot: the site cannot be indexed.`, `${at} Googlebot için / yolunu engelliyor: site dizine alınamaz.`), at, t('Remove "Disallow: /" for User-agent: * (a leftover from staging?).', 'User-agent: * için "Disallow: /" satırını kaldırın (test ortamından mı kaldı?).'));
    else if (!parsed.sitemaps.length) add("robots", "warn", t(`${at} answers, but has no Sitemap: line.`, `${at} açılıyor ama Sitemap: satırı yok.`), at, t(`Add "Sitemap: ${origin}/sitemap.xml".`, `"Sitemap: ${origin}/sitemap.xml" ekleyin.`));
    else add("robots", "pass", t(`${at} answers; Sitemap: ${parsed.sitemaps[0]}.`, `${at} açılıyor; Sitemap: ${parsed.sitemaps[0]}.`), at);
  };

  await Promise.all([https(), oneHost(), notFound(), contact(), robots()]);

  // sitemap.xml (after robots, which may name another location) ------------------------------
  const own = `${origin}/sitemap.xml`;
  let at = own;
  let sm = await request(own, "GET", http);
  if (sm.status !== 200 && robotsSitemaps[0]) {
    at = robotsSitemaps[0];
    sm = await request(at, "GET", http);
  }
  if (sm.status !== 200 || sm.body === null) add("sitemap", "fail", t(`${at} answers ${failed(sm, "en")}.`, `${at} ${failed(sm, "tr")} döndürüyor.`), at, t("Publish sitemap.xml (site essentials writes app/sitemap.ts).", "sitemap.xml yayınlayın (site essentials app/sitemap.ts yazar)."));
  else {
    const info = parseSitemap(sm.body);
    if (!info.valid) add("sitemap", "fail", t(`${at} is not a sitemap${looksHtml(sm.body) ? " (it returns an HTML page)" : `: ${info.error}`}.`, `${at} geçerli bir sitemap değil${looksHtml(sm.body) ? " (HTML sayfa döndürüyor)" : `: ${info.error}`}.`), at);
    else if (!info.urls.length) add("sitemap", "warn", t(`${at} lists no URLs.`, `${at} hiç adres listelemiyor.`), at);
    else add("sitemap", "pass", t(`${at}: ${info.urls.length} ${info.kind === "sitemapindex" ? "sitemaps" : "URLs"}.`, `${at}: ${info.urls.length} ${info.kind === "sitemapindex" ? "sitemap" : "adres"}.`), at);
  }

  const order: DeployCheckId[] = ["https-redirect", "one-host", "security-headers", "not-found", "contact-endpoint", "robots", "sitemap"];
  checks.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  return { url, finalUrl, checks };
}

/** Passes when the audit score reaches `minScore`, the audit has no errors and no deploy check failed. */
export function siteCheckVerdict(audit: Pick<AuditReport, "score" | "summary">, checks: DeployCheck[], minScore = 90): SiteCheckVerdict {
  const failedChecks = checks.filter((c) => c.status === "fail").map((c) => c.id);
  const reasons: CheckText[] = [];
  if (audit.score < minScore) reasons.push(t(`Audit score ${audit.score} is below ${minScore}.`, `Denetim puanı ${audit.score}; geçmek için en az ${minScore} gerekli.`));
  if (audit.summary.errors > 0) reasons.push(t(`The audit found ${audit.summary.errors} error${audit.summary.errors === 1 ? "" : "s"}.`, `Denetim ${audit.summary.errors} hata buldu.`));
  if (failedChecks.length) reasons.push(t(`Deploy checks failed: ${failedChecks.join(", ")}.`, `Başarısız yayın kontrolleri: ${failedChecks.join(", ")}.`));
  return { passed: reasons.length === 0, score: audit.score, minScore, auditErrors: audit.summary.errors, failedChecks, reasons };
}

/** A GitHub Actions workflow that runs the check after each production deploy, by hand and weekly. */
export function siteCheckWorkflow(url: string, minScore = 90): string {
  return `# .github/workflows/site-check.yml — written by \`npx vamos-ui site check --ci\`.
# Checks the live site after each production deploy (Vercel and Netlify send deployment_status),
# by hand and every Monday. It only reads the public site: no secrets, nothing is published.
# On cPanel or a VPS add the last step to the job that uploads the site instead.
name: Site check
on:
  deployment_status:
  workflow_dispatch:
  schedule:
    - cron: "0 6 * * 1"
jobs:
  site-check:
    if: github.event_name != 'deployment_status' || (github.event.deployment_status.state == 'success' && github.event.deployment_status.environment == 'Production')
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Audit + deploy checks
        run: npx -y vamos-ui@latest site check ${url} --min-score ${minScore} --lang en
`;
}
