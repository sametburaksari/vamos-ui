/**
 * Deploy guides: for each host, the steps to publish a kit site and the config files that make
 * the launch checks pass on day one (one HTTPS address, security headers, long cache for hashed
 * assets, the 404 page). Pure: returns text and file contents; the CLI writes them.
 */

import type { Hosting } from "./plan";
import type { Text } from "./questions";

export interface DeployOptions {
  host: Hosting;
  /** Bare or www domain the site is served on, e.g. "ornek.com.tr". */
  domain?: string | null;
  /** Serve on www.<domain> instead of the bare domain. Default false (bare). */
  www?: boolean;
  /** The app uses a contact form sender (contact.php or a server action). */
  forms?: "php-mail" | "resend" | "smtp" | "whatsapp" | "none";
  /** Environment variables the app needs at runtime. */
  env?: string[];
}

export interface DeployGuide {
  host: Hosting;
  output: "static" | "server";
  /** Config files to add (path relative to the project root → content). */
  files: Record<string, string>;
  steps: Text[];
  /** Checks to run after the first deploy. */
  checks: Text[];
}

const t = (en: string, tr: string): Text => ({ en, tr });

/** Headers every kit site sends. CSP is left out on purpose: tag managers need a per-site policy. */
export const SECURITY_HEADERS: [string, string][] = [
  ["Strict-Transport-Security", "max-age=31536000"],
  ["X-Content-Type-Options", "nosniff"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["X-Frame-Options", "SAMEORIGIN"],
  ["Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()"],
];

function hosts(o: DeployOptions): { canonical: string | null; other: string | null } {
  const bare = o.domain?.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "").toLowerCase() || null;
  if (!bare) return { canonical: null, other: null };
  return o.www ? { canonical: `www.${bare}`, other: bare } : { canonical: bare, other: `www.${bare}` };
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Apache (cPanel / shared hosting) rules for a static export in public_html. */
export function htaccess(o: DeployOptions): string {
  const { canonical, other } = hosts(o);
  const bare = canonical?.replace(/^www\./, "");
  // On cPanel, subdomain and addon-domain folders often live inside public_html and inherit this
  // file, so the redirects and headers only apply to this site's own host names.
  const hostRe = bare ? `^(www\\.)?${escapeRe(bare)}$` : null;
  const lines = [
    "# Written by vamos-ui site deploy. Copied into out/ by next build (static export).",
    ...(hostRe ? ["# Rules are limited to this domain: subdomain folders inside public_html inherit this file."] : []),
    "Options -Indexes",
    "DirectoryIndex index.html index.php",
    "ErrorDocument 404 /404.html",
    "",
    "<IfModule mod_rewrite.c>",
    "  RewriteEngine On",
    "  # One address: HTTPS" + (canonical ? ` on ${canonical}` : ""),
    ...(hostRe ? [`  RewriteCond %{HTTP_HOST} ${hostRe} [NC]`] : []),
    "  RewriteCond %{HTTPS} !=on",
    "  RewriteCond %{HTTP:X-Forwarded-Proto} !https",
    canonical ? `  RewriteRule ^ https://${canonical}%{REQUEST_URI} [R=301,L]` : "  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]",
    ...(other ? [`  RewriteCond %{HTTP_HOST} ^${escapeRe(other)}$ [NC]`, `  RewriteRule ^ https://${canonical}%{REQUEST_URI} [R=301,L]`] : []),
    "  # /page → /page.html (Next export without trailingSlash)",
    "  RewriteCond %{REQUEST_FILENAME} !-f",
    "  RewriteCond %{REQUEST_FILENAME} !-d",
    "  RewriteCond %{REQUEST_FILENAME}.html -f",
    "  RewriteRule ^(.+?)/?$ $1.html [L]",
    "</IfModule>",
    "",
    "<IfModule mod_headers.c>",
    ...(hostRe
      ? [`  <If "%{HTTP_HOST} =~ /${hostRe}/i">`, ...SECURITY_HEADERS.map(([k, v]) => `    Header always set ${k} "${v}"`), "  </If>"]
      : SECURITY_HEADERS.map(([k, v]) => `  Header always set ${k} "${v}"`)),
    '  <FilesMatch "\\.(html|php)$">',
    '    Header set Cache-Control "no-cache"',
    "  </FilesMatch>",
    "</IfModule>",
    "",
    "<IfModule mod_expires.c>",
    "  ExpiresActive On",
    '  ExpiresByType image/webp "access plus 30 days"',
    '  ExpiresByType image/avif "access plus 30 days"',
    '  ExpiresByType image/jpeg "access plus 30 days"',
    '  ExpiresByType image/png "access plus 30 days"',
    '  ExpiresByType image/svg+xml "access plus 30 days"',
    '  ExpiresByType font/woff2 "access plus 1 year"',
    "</IfModule>",
    '<IfModule mod_headers.c>',
    '  <If "%{REQUEST_URI} =~ m#^/_next/static/#">',
    '    Header set Cache-Control "public, max-age=31536000, immutable"',
    "  </If>",
    "</IfModule>",
    "",
    "<IfModule mod_deflate.c>",
    "  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml text/plain application/xml",
    "</IfModule>",
    "",
    "# Keep project files out of reach if they are ever uploaded by mistake.",
    '<FilesMatch "^(vamos\\..*\\.json|\\.env.*|package(-lock)?\\.json)$">',
    "  Require all denied",
    "</FilesMatch>",
    "",
  ];
  return lines.join("\n");
}

/** Netlify / Cloudflare Pages `_headers`. */
export function headersFile(): string {
  return ["# Written by vamos-ui site deploy.", "/*", ...SECURITY_HEADERS.map(([k, v]) => `  ${k}: ${v}`), "", "/_next/static/*", "  Cache-Control: public, max-age=31536000, immutable", ""].join("\n");
}

/** Netlify / Cloudflare Pages `_redirects` (other host → canonical). */
export function redirectsFile(o: DeployOptions): string | null {
  const { canonical, other } = hosts(o);
  if (!canonical || !other) return null;
  return [`# Written by vamos-ui site deploy.`, `https://${other}/* https://${canonical}/:splat 301!`, `http://${other}/* https://${canonical}/:splat 301!`, ""].join("\n");
}

export function vercelJson(o: DeployOptions): string {
  const { canonical, other } = hosts(o);
  const config: Record<string, unknown> = {
    $schema: "https://openapi.vercel.sh/vercel.json",
    headers: [
      { source: "/(.*)", headers: SECURITY_HEADERS.map(([key, value]) => ({ key, value })) },
      { source: "/_next/static/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ],
  };
  if (canonical && other) config.redirects = [{ source: "/:path*", has: [{ type: "host", value: other }], destination: `https://${canonical}/:path*`, permanent: true }];
  return JSON.stringify(config, null, 2) + "\n";
}

export function nginxConf(o: DeployOptions): string {
  const { canonical, other } = hosts(o);
  const name = canonical ?? "example.invalid";
  const names = [canonical, other].filter(Boolean).join(" ") || name;
  return `# Written by vamos-ui site deploy. Put it in /etc/nginx/sites-available/, link it into
# sites-enabled, get the certificate with: certbot --nginx -d ${names.split(" ").join(" -d ")}
server {
  listen 80;
  listen [::]:80;
  server_name ${names};
  return 301 https://${name}$request_uri;
}
${
  other
    ? `
server {
  listen 443 ssl;
  listen [::]:443 ssl;
  http2 on;
  server_name ${other};
  ssl_certificate /etc/letsencrypt/live/${name}/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/${name}/privkey.pem;
  return 301 https://${name}$request_uri;
}
`
    : ""
}
server {
  listen 443 ssl;
  listen [::]:443 ssl;
  http2 on;
  server_name ${name};
  ssl_certificate /etc/letsencrypt/live/${name}/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/${name}/privkey.pem;

${SECURITY_HEADERS.map(([k, v]) => `  add_header ${k} "${v}" always;`).join("\n")}

  gzip on;
  gzip_types text/css application/javascript application/json image/svg+xml text/plain application/xml;

  location /_next/static/ {
    proxy_pass http://127.0.0.1:3000;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
`;
}

export function pm2Config(): string {
  return `// Written by vamos-ui site deploy. Start with: pm2 start deploy/ecosystem.config.cjs && pm2 save
// Needs output: "standalone" in next.config; copy public/ and .next/static into .next/standalone first.
module.exports = {
  apps: [
    {
      name: "site",
      cwd: __dirname + "/..",
      script: ".next/standalone/server.js",
      env: { NODE_ENV: "production", PORT: "3000", HOSTNAME: "127.0.0.1" },
      max_memory_restart: "300M",
    },
  ],
};
`;
}

/** The guide and config files for one host. */
export function deployGuide(o: DeployOptions): DeployGuide {
  const { canonical } = hosts(o);
  const domain = canonical ?? "<domain>";
  const env = o.env?.filter((e) => !e.includes("contact.php")) ?? [];
  const envStep = env.length ? [t(`Set the environment variables: ${env.join(", ")} (never commit them).`, `Ortam değişkenlerini girin: ${env.join(", ")} (depoya asla eklemeyin).`)] : [];
  const checks: Text[] = [
    t(`npx vamos-ui audit https://${domain} — no errors, HTTPS and headers pass.`, `npx vamos-ui audit https://${domain} — hata yok, HTTPS ve başlıklar geçiyor.`),
    t(`curl -sI http://${domain} answers 301 to https://${domain}/.`, `curl -sI http://${domain} 301 ile https://${domain}/ adresine yönlendiriyor.`),
    ...(o.forms && o.forms !== "none" && o.forms !== "whatsapp" ? [t("Send a test message from the live contact form and check the inbox and the spam folder.", "Canlı iletişim formundan deneme mesajı gönderin; gelen kutusunu ve spam klasörünü kontrol edin.")] : []),
    t("Google Search Console: verify the domain (DNS TXT) and submit /sitemap.xml.", "Google Search Console: alan adını doğrulayın (DNS TXT) ve /sitemap.xml gönderin."),
  ];
  switch (o.host) {
    case "cpanel":
      return {
        host: "cpanel",
        output: "static",
        files: { "public/.htaccess": htaccess(o) },
        steps: [
          t('next.config: output: "export" and images: { unoptimized: true } (or a loader); then npm run build — the site is in out/.', 'next.config: output: "export" ve images: { unoptimized: true } (ya da bir loader); sonra npm run build — site out/ klasöründe.'),
          t("cPanel → SSL/TLS Status: run AutoSSL so the domain (and www) has a certificate before the HTTPS redirect goes live.", "cPanel → SSL/TLS Status: HTTPS yönlendirmesi devreye girmeden alan adı (ve www) için AutoSSL ile sertifika alın."),
          ...(o.forms === "php-mail" ? [t("Open out/contact.php and check CONTACT_TO / CONTACT_FROM; the From mailbox must exist on this hosting (cPanel → Email Accounts) so SPF/DKIM pass.", "out/contact.php içinde CONTACT_TO / CONTACT_FROM'u kontrol edin; gönderen kutusu bu hostingde olmalı (cPanel → Email Accounts), SPF/DKIM geçsin.")] : []),
          t("Upload the contents of out/ (not the folder itself) to public_html: rsync over SSH, FTP or File Manager → Upload + Extract. Keep a copy of the previous public_html to roll back.", "out/ klasörünün İÇERİĞİNİ (klasörün kendisini değil) public_html'e yükleyin: SSH ile rsync, FTP ya da File Manager → Upload + Extract. Geri dönüş için önceki public_html'in kopyasını saklayın."),
          t("rsync example: rsync -avz --delete out/ user@host:public_html/ — --delete removes files you did not build, so exclude anything else that lives there (e.g. --exclude blog-cron/).", "rsync örneği: rsync -avz --delete out/ kullanici@sunucu:public_html/ — --delete derlenmemiş dosyaları siler; orada yaşayan başka şeyleri hariç tutun (ör. --exclude blog-cron/)."),
        ],
        checks,
      };
    case "vercel":
      return {
        host: "vercel",
        output: "server",
        files: { "vercel.json": vercelJson(o) },
        steps: [
          t("Push the project to a Git repository, then vercel.com → Add New → Project → import it (framework: Next.js).", "Projeyi bir Git deposuna gönderin, sonra vercel.com → Add New → Project → içe aktarın (framework: Next.js)."),
          ...envStep,
          t(`Project → Settings → Domains: add ${domain}${o.www ? "" : ` and www.${domain}`}; at the DNS provider set the records Vercel shows (A 76.76.21.21 for the bare domain, CNAME for www).`, `Project → Settings → Domains: ${domain}${o.www ? "" : ` ve www.${domain}`} ekleyin; DNS sağlayıcısında Vercel'in gösterdiği kayıtları girin (çıplak alan için A 76.76.21.21, www için CNAME).`),
          t("Set NEXT_PUBLIC_SITE_URL to the final https address so canonical URLs and the sitemap use it.", "Canonical adresler ve sitemap doğru olsun diye NEXT_PUBLIC_SITE_URL'yi son https adresine ayarlayın."),
        ],
        checks,
      };
    case "netlify": {
      const redirects = redirectsFile(o);
      return {
        host: "netlify",
        output: "server",
        files: { "public/_headers": headersFile(), ...(redirects ? { "public/_redirects": redirects } : {}) },
        steps: [
          t("netlify.com → Add new site → Import from Git; the Next.js runtime is detected (build: npm run build).", "netlify.com → Add new site → Import from Git; Next.js çalışma ortamı otomatik algılanır (build: npm run build)."),
          ...envStep,
          t(`Domain management → add ${domain}; use Netlify DNS or the records it shows; HTTPS is issued automatically.`, `Domain management → ${domain} ekleyin; Netlify DNS'i ya da gösterdiği kayıtları kullanın; HTTPS otomatik verilir.`),
        ],
        checks,
      };
    }
    case "cloudflare": {
      const redirects = redirectsFile(o);
      return {
        host: "cloudflare",
        output: "server",
        files: { "public/_headers": headersFile(), ...(redirects ? { "public/_redirects": redirects } : {}) },
        steps: [
          t("A static export deploys to Cloudflare Pages as is (build output: out). A Next.js server needs the OpenNext adapter: npm i -D @opennextjs/cloudflare, then deploy as a Worker.", "Statik çıktı Cloudflare Pages'e olduğu gibi yüklenir (build output: out). Sunuculu Next.js için OpenNext adaptörü gerekir: npm i -D @opennextjs/cloudflare, sonra Worker olarak yayınlayın."),
          ...envStep,
          t(`Custom domains → add ${domain}; with the zone on Cloudflare the records are created for you. SSL/TLS mode: Full (strict). Turn on "Always Use HTTPS".`, `Custom domains → ${domain} ekleyin; alan Cloudflare'deyse kayıtlar otomatik açılır. SSL/TLS modu: Full (strict). "Always Use HTTPS"i açın.`),
        ],
        checks,
      };
    }
    case "vps":
      return {
        host: "vps",
        output: "server",
        files: { [`deploy/nginx-${canonical ?? "site"}.conf`]: nginxConf(o), "deploy/ecosystem.config.cjs": pm2Config() },
        steps: [
          t('next.config: output: "standalone"; npm run build; copy public/ and .next/static/ into .next/standalone/.', 'next.config: output: "standalone"; npm run build; public/ ve .next/static/ klasörlerini .next/standalone/ içine kopyalayın.'),
          ...envStep,
          t("Copy the build to the server, start it with pm2 (deploy/ecosystem.config.cjs) and run pm2 save + pm2 startup so it survives a reboot.", "Derlemeyi sunucuya kopyalayın, pm2 ile başlatın (deploy/ecosystem.config.cjs), yeniden başlatmada ayağa kalksın diye pm2 save + pm2 startup çalıştırın."),
          t("Install the nginx config, get the certificate with certbot and reload nginx. Keep port 3000 closed in the firewall.", "nginx yapılandırmasını kurun, certbot ile sertifika alın ve nginx'i yeniden yükleyin. 3000 portunu güvenlik duvarında kapalı tutun."),
        ],
        checks,
      };
  }
}

export const HOSTS: Hosting[] = ["vercel", "netlify", "cloudflare", "cpanel", "vps"];
