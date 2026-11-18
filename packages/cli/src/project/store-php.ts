/**
 * The PHP runtime of `site store`: checkout for a static export on shared hosting (Apache + PHP,
 * cPanel), where no Node server exists to keep the payment keys. The PHP mirrors
 * @vamos-ui/react/commerce (`priceCart`, `readBuyer`, `signOrder` / `verifyOrder`, `createCheckout`,
 * the iyzico client and `webhookNotifier`) rule for rule, so the same catalog, request and cookie
 * give the same result on either runtime. packages/cli/test/store-php.test.ts runs the generated
 * files with a real `php` against a fake iyzico and compares them with the TypeScript core.
 *
 * Catalog: ONE file, `public/api/_store/catalog.json`. The cart imports it at build time (through
 * store/catalog.ts, which only adds the type) and the PHP reads it on the server. It sits inside
 * public/ on purpose: a static export uploads only out/, so a catalog anywhere else would need a
 * copy step at every build, and a forgotten copy means the server charges old prices. The catalog
 * is not a secret (every price is already in the page's JavaScript); the folder is still denied to
 * the web by its .htaccess. Secrets never live under public/: they are read from a PHP config file
 * outside the web root (or from getenv).
 *
 * Generated PHP is written with String.raw (no `${` in it); the few baked values are substituted
 * from placeholders with PHP string escaping.
 */
import type { Lang } from "./questions";

const phpString = (v: string) => `'${v.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;

export const PHP_STORE_DIR = "public/api/_store";
export const PHP_CATALOG = `${PHP_STORE_DIR}/catalog.json`;
export const PHP_CONFIG_NAME = "vamos-store-config.php";

/** Setting names the PHP reads (config file first, then getenv). */
export const PHP_SETTINGS = [
  "IYZICO_API_KEY",
  "IYZICO_SECRET_KEY",
  "IYZICO_MODE",
  "IYZICO_BASE_URL",
  "ORDER_SECRET",
  "ORDER_FROM",
  "ORDER_TO",
  "ORDER_WEBHOOK_URL",
  "ORDER_WEBHOOK_SECRET",
  "SITE_URL",
  "ALLOWED_ORIGINS",
  "STATE_DIR",
] as const;

const entry = (what: "start" | "callback") => `<?php
// ${what === "start" ? "POST { lines, buyer, locale, note } from the checkout page -> { order, paymentPageUrl }." : "iyzico posts the payment token here (POST /api/checkout/callback); the buyer is redirected to the confirmation page."}
// Written by vamos-ui site store (PHP runtime). The logic is in _store/store.php.
if (PHP_VERSION_ID < 80100) {
  error_log('checkout: PHP 8.1 or newer is required (cPanel > MultiPHP Manager)');
  http_response_code(${what === "start" ? "502" : "303"});
  ${what === "start" ? `header('Content-Type: application/json; charset=utf-8');
  echo '{"error":"payment-unavailable"}';` : `header('Location: /checkout?payment=failed&reason=provider');`}
  exit;
}
define('VB_STORE', true);
require __DIR__ . '/_store/store.php';
${what === "start" ? "vb_checkout_start();" : "vb_checkout_callback();"}
`;

const API_HTACCESS = `# Written by vamos-ui site store (PHP checkout). Copied into out/ by next build (static export).
# A folder's own rewrite rules replace the site's root rules here, so HTTPS is enforced again.
Options -Indexes
<IfModule mod_rewrite.c>
  RewriteEngine On
  # 308 keeps the POST (a 301 would turn it into a GET).
  RewriteCond %{HTTPS} !=on
  RewriteCond %{HTTP:X-Forwarded-Proto} !https
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [R=308,L]
  RewriteRule ^_store(/|$) - [F,L]
  RewriteRule ^checkout/?$ checkout.php [L]
  RewriteRule ^checkout/callback/?$ checkout-callback.php [L]
</IfModule>
<IfModule mod_headers.c>
  Header always set Cache-Control "no-store"
  Header always set X-Content-Type-Options "nosniff"
</IfModule>
`;

const STORE_HTACCESS = `# The PHP checkout's code and the catalog it charges from: never served directly.
<IfModule mod_authz_core.c>
  Require all denied
</IfModule>
<IfModule !mod_authz_core.c>
  Order allow,deny
  Deny from all
</IfModule>
`;

function configExample(lang: Lang): string {
  const tr = lang === "tr";
  return `<?php
/**
 * ${tr ? "PHP ödeme sayfasının gizli ayarları. Bu dosyayı SİTE KLASÖRÜNÜN DIŞINA kopyalayın:" : "Secrets of the PHP checkout. Copy this file OUTSIDE the site folder:"}
 *   ~/${PHP_CONFIG_NAME}   ${tr ? "(public_html'in bir üstü; site public_html/alt-klasor içindeyse o klasörün bir üstü)" : "(next to public_html; for a site in public_html/sub-folder, next to that folder)"}
 * ${tr ? "Başka bir yer için VAMOS_STORE_CONFIG ortam değişkenine tam yolu yazın." : "For another place, put its full path in the VAMOS_STORE_CONFIG environment variable."}
 * ${tr ? "İzin: chmod 600. Bu dosyayı asla public/ ya da public_html içine koymayın, git'e eklemeyin." : "Permissions: chmod 600. Never put it in public/ or public_html, never commit it."}
 * ${tr ? "Boş bırakılan bir değer aynı adlı ortam değişkeninden okunur." : "An empty value falls back to the environment variable of the same name."}
 */
return [
  'IYZICO_API_KEY' => '',      // ${tr ? "iyzico panelinden (sandbox-… test anahtarı)" : "from the iyzico panel (sandbox-… test key)"}
  'IYZICO_SECRET_KEY' => '',
  'IYZICO_MODE' => 'sandbox',  // ${tr ? "canlıya geçerken: live" : "for launch: live"}
  'ORDER_SECRET' => '',        // ${tr ? "en az 32 rastgele karakter: openssl rand -hex 32" : "at least 32 random characters: openssl rand -hex 32"}
  'ORDER_FROM' => '',          // ${tr ? "Mağaza <siparis@alanadiniz.com.tr>: bu alan adında var olan bir e-posta hesabı" : "Shop <orders@yourdomain.com>: a real mailbox on this domain"}
  'ORDER_TO' => '',            // ${tr ? "siparişlerin gideceği adres(ler), virgülle" : "where orders go, comma-separated"}
  'ORDER_WEBHOOK_URL' => '',   // ${tr ? "isteğe bağlı: her ödenen sipariş JSON olarak buraya gider" : "optional: each paid order is posted here as JSON"}
  'ORDER_WEBHOOK_SECRET' => '',// ${tr ? "isteğe bağlı: X-Vamos-Signature imzası" : "optional: signs X-Vamos-Signature"}
  'SITE_URL' => '',            // ${tr ? "https://alanadiniz.com.tr (önerilir; boşsa isteğin adresi)" : "https://yourdomain.com (recommended; default: the request's host)"}
  'STATE_DIR' => '',           // ${tr ? "isteğe bağlı: ~/vamos-store-state (tek bildirim işaretleri; boşsa sistem geçici klasörü)" : "optional: ~/vamos-store-state (notify-once markers; default: the system temp folder)"}
];
`;
}

function devRouter(): string {
  return `<?php
/**
 * Local test server for the PHP checkout. On the host, public/api/.htaccess does this routing.
 *   npx next build
 *   VAMOS_STORE_CONFIG=$HOME/${PHP_CONFIG_NAME} php -S localhost:8080 -t out store/php-dev-router.php
 * (iyzico needs a public callback URL: test the full payment on the host with sandbox keys.)
 */
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');
$root = rtrim($_SERVER['DOCUMENT_ROOT'], '/');
if (str_contains($path, '..')) { http_response_code(400); return true; }
if (preg_match('#^/api/_store(/|$)#', $path)) { http_response_code(403); return true; }
$routes = ['/api/checkout' => '/api/checkout.php', '/api/checkout/callback' => '/api/checkout-callback.php'];
$key = rtrim($path, '/');
if (isset($routes[$key])) {
  $_SERVER['SCRIPT_NAME'] = $routes[$key];
  require $root . $routes[$key];
  return true;
}
if ($path !== '/' && is_file($root . $path)) return false;
foreach ([$root . $key . '.html', $root . $key . '/index.html'] as $page) {
  if (is_file($page)) { header('Content-Type: text/html; charset=utf-8'); readfile($page); return true; }
}
return false;
`;
}

/** public/api/_store/store.php: the whole checkout. */
function storeLib(o: { siteName: string }): string {
  return String.raw`<?php
/**
 * Store checkout for a static site on shared hosting (Apache + PHP 8.1+, cPanel). Written by
 * vamos-ui site store (PHP runtime); mirrors @vamos-ui/react/commerce createCheckout:
 *
 *   /api/checkout           POST JSON { lines, buyer, locale?, note? }. Prices the cart from
 *                           catalog.json (a price from the browser is never read), starts an iyzico
 *                           Checkout Form, keeps the signed order in an HttpOnly cookie and answers
 *                           { order, paymentPageUrl }. Errors: bad-request, forbidden-origin,
 *                           invalid-cart (+ issues), invalid-buyer (+ fields), too-large,
 *                           payment-unavailable.
 *   /api/checkout/callback  iyzico posts the token here. The result is fetched from iyzico
 *                           (signature checked), matched with the signed order (id and amount), the
 *                           business and the buyer are emailed once (PHP mail() through this host)
 *                           plus an optional signed webhook, and the buyer is sent (303) to
 *                           /order/confirmation?order=… or /checkout?payment=failed&reason=….
 *
 * catalog.json next to this file is the only price list: the cart page imports the same file at
 * build time. Secrets come from ~/vamos-store-config.php (outside the web root; another path in
 * VAMOS_STORE_CONFIG) or from getenv. They are never echoed, logged or put in error messages.
 * Discount codes are not supported here: a request with a coupon is refused (invalid-cart,
 * coupon-unsupported) rather than charged at the wrong price.
 */
declare(strict_types=1);

if (!defined('VB_STORE')) {
  http_response_code(404);
  exit;
}

const VB_SITE_NAME = __SITE_NAME__;
const VB_ORDER_PREFIX = 'VB';
const VB_ORDER_COOKIE = 'vb_order';
const VB_DONE_COOKIE = 'vb_order_done';
const VB_CALLBACK_PATH = '/api/checkout/callback';
const VB_SUCCESS_PATH = '/order/confirmation';
const VB_FAILURE_PATH = '/checkout';
const VB_MAX_CART_LINES = 30;
const VB_MAX_BODY = 65536;
const VB_MAX_SIGNED = 3800;
const VB_IYZICO = ['sandbox' => 'https://sandbox-api.iyzipay.com', 'live' => 'https://api.iyzipay.com'];
// JavaScript's \s: ASCII and Unicode spaces (PCRE's \s is ASCII only).
const VB_WS = '\s\x{00a0}\x{1680}\x{2000}-\x{200a}\x{2028}\x{2029}\x{202f}\x{205f}\x{3000}\x{feff}';
const VB_SETTINGS = ['IYZICO_API_KEY', 'IYZICO_SECRET_KEY', 'IYZICO_MODE', 'IYZICO_BASE_URL', 'ORDER_SECRET', 'ORDER_FROM', 'ORDER_TO', 'ORDER_WEBHOOK_URL', 'ORDER_WEBHOOK_SECRET', 'SITE_URL', 'ALLOWED_ORIGINS', 'STATE_DIR'];

// ---------------------------------------------------------------- settings and catalog

/** Settings: the config file outside the web root, then getenv. */
function vb_config(): array {
  static $config = null;
  if ($config !== null) return $config;
  $file = (string) (getenv('VAMOS_STORE_CONFIG') ?: '');
  if ($file === '') {
    $root = rtrim((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''), '/');
    if ($root !== '') $file = dirname($root) . '/vamos-store-config.php';
  }
  $loaded = [];
  if ($file !== '' && is_file($file)) {
    $value = (static fn (string $f) => require $f)($file);
    if (is_array($value)) $loaded = $value;
  }
  $config = [];
  foreach (VB_SETTINGS as $k) {
    $v = $loaded[$k] ?? '';
    if (!is_string($v) || trim($v) === '') $v = (string) (getenv($k) ?: '');
    $config[$k] = trim($v);
  }
  return $config;
}

/** The missing or invalid settings (names only). */
function vb_config_problems(array $c): array {
  $bad = [];
  if ($c['IYZICO_API_KEY'] === '') $bad[] = 'IYZICO_API_KEY';
  if ($c['IYZICO_SECRET_KEY'] === '') $bad[] = 'IYZICO_SECRET_KEY';
  if (strlen($c['ORDER_SECRET']) < 32) $bad[] = 'ORDER_SECRET (at least 32 characters)';
  if ($c['IYZICO_BASE_URL'] !== '' && !preg_match('#^https?://#', $c['IYZICO_BASE_URL'])) $bad[] = 'IYZICO_BASE_URL';
  return $bad;
}

function vb_catalog(): ?array {
  $raw = @file_get_contents(__DIR__ . '/catalog.json');
  $c = is_string($raw) ? json_decode($raw, true) : null;
  if (!is_array($c) || !is_string($c['currency'] ?? null) || !is_array($c['products'] ?? null)) return null;
  return $c;
}

function vb_log(string $message, array $detail = []): void {
  error_log('[checkout] ' . $message . ($detail ? ' ' . json_encode($detail, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE) : ''));
}

// ---------------------------------------------------------------- JavaScript semantics

function vb_json($value): string {
  return json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE | JSON_THROW_ON_ERROR);
}

/** Number(v) */
function vb_js_number($v) {
  if (is_int($v) || is_float($v)) return $v;
  if (is_bool($v)) return $v ? 1 : 0;
  if ($v === null) return 0;
  if (is_string($v)) {
    $t = trim($v);
    if ($t === '') return 0;
    return is_numeric($t) ? $t + 0 : NAN;
  }
  return NAN;
}

/** Boolean(v) */
function vb_js_truthy($v): bool {
  if ($v === null || $v === false || $v === '' || $v === 0) return false;
  if (is_float($v)) return $v != 0.0 && !is_nan($v);
  return true;
}

/** String(v) for JSON scalars. Floats in their shortest round-trip form, as JavaScript prints them. */
function vb_js_string($v): string {
  if (is_string($v)) return $v;
  if (is_bool($v)) return $v ? 'true' : 'false';
  if (is_int($v)) return (string) $v;
  if (is_float($v)) {
    if (!is_finite($v)) return is_nan($v) ? 'NaN' : ($v > 0 ? 'Infinity' : '-Infinity');
    if (floor($v) === $v && abs($v) < 1e21) return sprintf('%.0f', $v);
    for ($p = 1; $p <= 17; $p++) {
      $s = sprintf('%.' . $p . 'G', $v);
      if ((float) $s === $v) return $s;
    }
    return (string) $v;
  }
  return $v === null ? 'null' : '[object Object]';
}

/** Number.isInteger(v) */
function vb_is_integer($v): bool {
  return is_int($v) || (is_float($v) && is_finite($v) && floor($v) === $v);
}

/** Math.round for the positive values used here (ties toward +infinity). */
function vb_round(float $x): int {
  $f = floor($x);
  return (int) ($x - $f >= 0.5 ? $f + 1 : $f);
}

// ---------------------------------------------------------------- pricing (priceCart)

function vb_vat_of(int $gross, $rate): int {
  return $rate > 0 ? vb_round(($gross * $rate) / (100 + $rate)) : 0;
}

/** Same rules and result as priceCart(catalog, lines) in @vamos-ui/react/commerce. */
function vb_price_cart(array $catalog, array $lines): array {
  if (count($lines) === 0) return ['ok' => false, 'issues' => [['index' => -1, 'code' => 'empty']]];
  if (count($lines) > VB_MAX_CART_LINES) return ['ok' => false, 'issues' => [['index' => -1, 'code' => 'too-many']]];
  $byId = [];
  foreach ($catalog['products'] as $p) if (is_array($p) && is_string($p['id'] ?? null)) $byId[$p['id']] = $p;
  $issues = [];
  $seen = [];
  $out = [];
  foreach (array_values($lines) as $index => $line) {
    $pid = $line['productId'];
    $product = array_key_exists($pid, $byId) ? $byId[$pid] : null;
    if ($product === null) {
      $issues[] = ['index' => $index, 'code' => 'unknown-product', 'productId' => $pid];
      continue;
    }
    $variants = is_array($product['variants'] ?? null) ? array_values($product['variants']) : [];
    $variantId = $line['variantId'];
    $variant = null;
    if ($variantId !== null && $variantId !== '') {
      foreach ($variants as $v) if (is_array($v) && ($v['id'] ?? null) === $variantId) { $variant = $v; break; }
    }
    if ($variantId !== null && $variantId !== '' && $variant === null) { $issues[] = ['index' => $index, 'code' => 'unknown-variant', 'productId' => $product['id']]; continue; }
    if ($variant === null && count($variants) > 0) { $issues[] = ['index' => $index, 'code' => 'unknown-variant', 'productId' => $product['id']]; continue; }
    if (($product['available'] ?? null) === false || ($variant !== null && ($variant['available'] ?? null) === false)) { $issues[] = ['index' => $index, 'code' => 'unavailable', 'productId' => $product['id']]; continue; }
    $qty = $line['qty'];
    $max = $product['maxQty'] ?? 20;
    if (!vb_is_integer($qty) || $qty < 1 || $qty > $max) { $issues[] = ['index' => $index, 'code' => 'bad-quantity', 'productId' => $product['id']]; continue; }
    $qty = (int) $qty;
    $key = $product['id'] . "\0" . ($variant['id'] ?? '');
    if (isset($seen[$key])) { $issues[] = ['index' => $index, 'code' => 'duplicate', 'productId' => $product['id']]; continue; }
    $seen[$key] = true;
    $unit = ($variant !== null && ($variant['price'] ?? null) !== null) ? $variant['price'] : ($product['price'] ?? null);
    if (!vb_is_integer($unit) || $unit <= 0) { $issues[] = ['index' => $index, 'code' => 'unavailable', 'productId' => $product['id']]; continue; }
    $unit = (int) $unit;
    $vatRate = $product['vatRate'] ?? $catalog['vatRate'] ?? 20;
    $total = $unit * $qty;
    $q = ['productId' => $product['id']];
    if ($variant !== null) $q['variantId'] = $variant['id'];
    $q['name'] = $variant !== null ? $product['name'] . ' · ' . $variant['name'] : $product['name'];
    $q['category'] = $product['category'] ?? 'General';
    $q['itemType'] = $product['itemType'] ?? 'PHYSICAL';
    $q['unit'] = $unit;
    $q['qty'] = $qty;
    $q['total'] = $total;
    $q['vatRate'] = $vatRate;
    $q['vat'] = vb_vat_of($total, $vatRate);
    // Discount codes are not supported in PHP yet (refused as coupon-unsupported): always 0.
    $q['discount'] = 0;
    $out[] = $q;
  }
  if ($issues) return ['ok' => false, 'issues' => $issues];

  $subtotal = 0;
  $physical = false;
  foreach ($out as $l) {
    $subtotal += $l['total'];
    if ($l['itemType'] === 'PHYSICAL') $physical = true;
  }
  $s = is_array($catalog['shipping'] ?? null) ? $catalog['shipping'] : null;
  $free = $s !== null && array_key_exists('freeOver', $s) && $subtotal >= $s['freeOver'];
  $shipping = $s !== null && $physical && !$free ? (int) $s['flat'] : 0;
  $vatByRate = [];
  foreach ($out as $l) {
    $k = (string) $l['vatRate'];
    $vatByRate[$k] = ($vatByRate[$k] ?? 0) + $l['vat'];
  }
  if ($shipping > 0) {
    $r = $s['vatRate'] ?? 20;
    $k = (string) $r;
    $vatByRate[$k] = ($vatByRate[$k] ?? 0) + vb_vat_of($shipping, $r);
  }
  $vat = array_sum($vatByRate);
  return ['ok' => true, 'quote' => [
    'currency' => $catalog['currency'],
    'lines' => $out,
    'subtotal' => $subtotal,
    'shipping' => $shipping,
    'shippingLabel' => $s['label'] ?? 'Shipping',
    'discount' => 0,
    'vatByRate' => (object) $vatByRate,
    'vat' => $vat,
    'total' => $subtotal + $shipping,
    'physical' => $physical,
  ]];
}

/** 14990 → "149.90" */
function vb_to_decimal(int $minor): string {
  $sign = $minor < 0 ? '-' : '';
  $a = abs($minor);
  return $sign . intdiv($a, 100) . '.' . str_pad((string) ($a % 100), 2, '0', STR_PAD_LEFT);
}

/** iyzico's price form ("10.50" → "10.5", "10.0" → "10"); '' when it is not a price. */
function vb_iyzico_trim($value): string {
  if ($value === null || is_bool($value) || is_array($value)) return '';
  $s = trim(vb_js_string($value));
  if (!preg_match('/^\d+(\.\d+)?$/', $s)) return '';
  if (!str_contains($s, '.')) return preg_replace('/^0+(?=\d)/', '', $s);
  [$i, $f] = explode('.', $s, 2);
  $f = rtrim($f, '0');
  $i = preg_replace('/^0+(?=\d)/', '', $i);
  return $f !== '' ? $i . '.' . $f : $i;
}

/** As iyzico's SDKs send prices: trimmed, at least one decimal ("10" → "10.0"). */
function vb_request_price(string $value): string {
  $t = vb_iyzico_trim($value);
  return str_contains($t, '.') ? $t : $t . '.0';
}

// ---------------------------------------------------------------- buyer (readBuyer)

function vb_text($v, int $max): string {
  if (!is_string($v)) return '';
  $v = mb_scrub($v, 'UTF-8');
  $v = preg_replace('/[\x{0000}-\x{001f}\x{007f}]/u', ' ', $v) ?? '';
  $v = preg_replace('/^[' . VB_WS . ']+|[' . VB_WS . ']+$/u', '', $v) ?? '';
  return mb_substr($v, 0, $max, 'UTF-8');
}

/** ['buyer' => array] or ['invalid' => field names], like readBuyer(input, physical). */
function vb_read_buyer($input, bool $physical): array {
  $b = is_array($input) ? $input : [];
  $buyer = [
    'name' => vb_text($b['name'] ?? null, 60),
    'surname' => vb_text($b['surname'] ?? null, 60),
    'email' => mb_strtolower(vb_text($b['email'] ?? null, 120), 'UTF-8'),
    'phone' => vb_text($b['phone'] ?? null, 20),
    'address' => vb_text($b['address'] ?? null, 300),
    'city' => vb_text($b['city'] ?? null, 60),
  ];
  foreach (['district' => 60, 'zipCode' => 12] as $k => $max) {
    $v = vb_text($b[$k] ?? null, $max);
    if ($v !== '') $buyer[$k] = $v;
  }
  $buyer['country'] = vb_text($b['country'] ?? null, 60) ?: 'Turkey';
  $tckn = vb_text($b['identityNumber'] ?? null, 11);
  if ($tckn !== '') $buyer['identityNumber'] = $tckn;
  $c = $b['company'] ?? null;
  if (is_array($c) && vb_text($c['name'] ?? null, 120) !== '') {
    $company = ['name' => vb_text($c['name'], 120)];
    $office = vb_text($c['taxOffice'] ?? null, 60);
    $number = vb_text($c['taxNumber'] ?? null, 11);
    if ($office !== '') $company['taxOffice'] = $office;
    if ($number !== '') $company['taxNumber'] = $number;
    $buyer['company'] = $company;
  }
  $invalid = [];
  if ($buyer['name'] === '') $invalid[] = 'name';
  if ($buyer['surname'] === '') $invalid[] = 'surname';
  if (!preg_match('/^[^' . VB_WS . '@]+@[^' . VB_WS . '@]+\.[^' . VB_WS . '@]{2,}$/u', $buyer['email'])) $invalid[] = 'email';
  $digits = preg_replace('/\D/', '', $buyer['phone']);
  if (strlen($digits) < 10 || strlen($digits) > 15) $invalid[] = 'phone';
  if (mb_strlen($buyer['address'], 'UTF-8') < ($physical ? 8 : 3)) $invalid[] = 'address';
  if ($buyer['city'] === '') $invalid[] = 'city';
  if (isset($buyer['identityNumber']) && !preg_match('/^[1-9]\d{10}$/', $buyer['identityNumber'])) $invalid[] = 'identityNumber';
  return $invalid ? ['invalid' => $invalid] : ['buyer' => $buyer];
}

/** iyzico wants +90… for Turkish numbers. */
function vb_gsm(string $phone): string {
  $d = preg_replace('/\D/', '', $phone);
  if (str_starts_with(trim($phone), '+')) return '+' . $d;
  if (strlen($d) === 10) return '+90' . $d;
  if (strlen($d) === 11 && $d[0] === '0') return '+90' . substr($d, 1);
  return '+' . $d;
}

function vb_client_ip(): string {
  foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'REMOTE_ADDR'] as $k) {
    $v = trim(explode(',', (string) ($_SERVER[$k] ?? ''))[0]);
    if ($v !== '' && filter_var($v, FILTER_VALIDATE_IP)) return $v;
  }
  return '127.0.0.1';
}

// ---------------------------------------------------------------- signed order (signOrder / verifyOrder)

function vb_b64url(string $s): string {
  return rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
}

function vb_from_b64url(string $s) {
  $s = strtr($s, '-_', '+/');
  return base64_decode(str_pad($s, (int) (ceil(strlen($s) / 4) * 4), '='), true);
}

function vb_order_id(): string {
  $alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  $tail = '';
  foreach (str_split(random_bytes(8)) as $byte) $tail .= $alphabet[ord($byte) % 32];
  $prefix = substr(preg_replace('/[^A-Za-z0-9]/', '', VB_ORDER_PREFIX), 0, 6) ?: 'VB';
  return $prefix . '-' . gmdate('ymd') . '-' . $tail;
}

function vb_now_iso(): string {
  $t = microtime(true);
  return gmdate('Y-m-d\TH:i:s', (int) $t) . sprintf('.%03dZ', (int) (($t - floor($t)) * 1000));
}

/** The order as JSON values (vatByRate stays an object after a decode). */
function vb_order_value(array $order): array {
  if (isset($order['quote']['vatByRate'])) $order['quote']['vatByRate'] = (object) $order['quote']['vatByRate'];
  return $order;
}

/** "<base64url JSON>.<hex HMAC-SHA256>" — the same token signOrder makes. */
function vb_sign_order(array $order, string $secret): string {
  if (strlen($secret) < 32) throw new RuntimeException('ORDER_SECRET must be at least 32 characters');
  $body = vb_b64url(vb_json(vb_order_value($order)));
  return $body . '.' . hash_hmac('sha256', $body, $secret);
}

function vb_verify_order($token, string $secret, int $maxAge): ?array {
  if (!is_string($token) || $token === '' || $secret === '') return null;
  $dot = strrpos($token, '.');
  if ($dot === false || $dot < 1) return null;
  $body = substr($token, 0, $dot);
  $sig = substr($token, $dot + 1);
  if (!hash_equals(hash_hmac('sha256', $body, $secret), $sig)) return null;
  $raw = vb_from_b64url($body);
  $order = is_string($raw) ? json_decode($raw, true) : null;
  if (!is_array($order) || ($order['v'] ?? null) !== 1 || !is_string($order['id'] ?? null) || !is_array($order['quote'] ?? null)) return null;
  try {
    $created = (new DateTimeImmutable((string) ($order['createdAt'] ?? '')))->format('U.u');
  } catch (Throwable $e) {
    return null;
  }
  $age = microtime(true) - (float) $created;
  if (!($age >= -60 && $age <= $maxAge)) return null;
  return $order;
}

// ---------------------------------------------------------------- HTTP

function vb_cookie(string $name, string $value, int $maxAge): string {
  // SameSite=None: iyzico's callback is a cross-site POST from the buyer's browser; Lax would drop it.
  return $name . '=' . rawurlencode($value) . '; Path=/; Max-Age=' . $maxAge . '; HttpOnly; Secure; SameSite=None';
}

function vb_json_out(int $status, array $data, array $headers = [], array $cookies = []): never {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  header('Cache-Control: no-store');
  foreach ($headers as $h) header($h);
  foreach ($cookies as $c) header('Set-Cookie: ' . $c, false);
  echo vb_json($data);
  exit;
}

function vb_redirect(string $location, array $cookies = []): never {
  http_response_code(303);
  header('Location: ' . $location);
  header('Cache-Control: no-store');
  foreach ($cookies as $c) header('Set-Cookie: ' . $c, false);
  exit;
}

/** "scheme://host[:port]" of a URL, lower case; null when it is not one. */
function vb_origin_of(string $url): ?string {
  $p = parse_url(trim($url));
  if (!is_array($p) || !isset($p['scheme'], $p['host']) || !in_array(strtolower($p['scheme']), ['http', 'https'], true)) return null;
  return strtolower($p['scheme'] . '://' . $p['host'] . (isset($p['port']) ? ':' . $p['port'] : ''));
}

function vb_request_host(): string {
  $host = (string) ($_SERVER['HTTP_HOST'] ?? '');
  return preg_match('/^[A-Za-z0-9.-]{1,253}(:\d{1,5})?$/', $host) ? strtolower($host) : '';
}

function vb_https(): bool {
  return (!empty($_SERVER['HTTPS']) && strtolower((string) $_SERVER['HTTPS']) !== 'off')
    || (string) ($_SERVER['SERVER_PORT'] ?? '') === '443'
    || strtolower((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')) === 'https';
}

/** Public base URL: SITE_URL, else this request's scheme and host. */
function vb_base_url(array $c): string {
  if ($c['SITE_URL'] !== '') return rtrim($c['SITE_URL'], '/');
  $host = vb_request_host();
  return ($host === '' ? '' : (vb_https() ? 'https://' : 'http://') . $host);
}

function vb_with_query(string $base, string $path, array $query): string {
  return $base . $path . '?' . http_build_query($query, '', '&', PHP_QUERY_RFC3986);
}

/** The page's own host, SITE_URL and ALLOWED_ORIGINS may call /api/checkout. */
function vb_origin_allowed(string $origin, array $c): bool {
  $o = vb_origin_of($origin);
  if ($o === null) return false;
  $host = vb_request_host();
  if ($host !== '' && preg_replace('#^https?://#', '', $o) === $host) return true;
  $allowed = [];
  if ($c['SITE_URL'] !== '') $allowed[] = vb_origin_of($c['SITE_URL']);
  foreach (explode(',', $c['ALLOWED_ORIGINS']) as $x) if (trim($x) !== '') $allowed[] = vb_origin_of($x);
  return in_array($o, $allowed, true);
}

/** [status, body]. curl when the host has it, else PHP streams. */
function vb_http_post(string $url, array $headers, string $body, int $timeout = 20): array {
  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
      CURLOPT_POST => true,
      CURLOPT_POSTFIELDS => $body,
      CURLOPT_HTTPHEADER => $headers,
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_FOLLOWLOCATION => false,
      CURLOPT_CONNECTTIMEOUT => 10,
      CURLOPT_TIMEOUT => $timeout,
    ]);
    $res = curl_exec($ch);
    if ($res === false) throw new RuntimeException('HTTP request failed: ' . curl_error($ch));
    return [(int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE), (string) $res];
  }
  $ctx = stream_context_create(['http' => ['method' => 'POST', 'header' => implode("\r\n", $headers), 'content' => $body, 'timeout' => $timeout, 'ignore_errors' => true, 'follow_location' => 0]]);
  $res = @file_get_contents($url, false, $ctx);
  if ($res === false) throw new RuntimeException('HTTP request failed');
  $lines = function_exists('http_get_last_response_headers') ? (http_get_last_response_headers() ?? []) : ($http_response_header ?? []);
  $status = 0;
  foreach ($lines as $h) if (preg_match('#^HTTP/\S+\s+(\d{3})#', $h, $m)) $status = (int) $m[1];
  return [$status, $res];
}

// ---------------------------------------------------------------- iyzico (IYZWSv2)

function vb_iyzico_post(array $c, string $path, array $payload): array {
  $base = rtrim($c['IYZICO_BASE_URL'] !== '' ? $c['IYZICO_BASE_URL'] : VB_IYZICO[$c['IYZICO_MODE'] === 'live' ? 'live' : 'sandbox'], '/');
  $body = vb_json($payload);
  $rnd = (string) (int) (microtime(true) * 1000) . (string) random_int(0, 999999999);
  $signature = hash_hmac('sha256', $rnd . $path . $body, $c['IYZICO_SECRET_KEY']);
  $auth = 'IYZWSv2 ' . base64_encode('apiKey:' . $c['IYZICO_API_KEY'] . '&randomKey:' . $rnd . '&signature:' . $signature);
  [$status, $raw] = vb_http_post($base . $path, ['Content-Type: application/json', 'Accept: application/json', 'x-iyzi-rnd: ' . $rnd, 'Authorization: ' . $auth], $body);
  $json = json_decode($raw, true);
  if (!is_array($json)) throw new RuntimeException('iyzico: HTTP ' . $status . ' without a JSON body');
  return $json;
}

/** Hex HMAC-SHA256 of the values joined with ":" (iyzico's response signature). */
function vb_iyzico_signature(string $secret, array $values): string {
  return hash_hmac('sha256', implode(':', array_map(fn ($v) => $v === null ? '' : vb_js_string($v), $values)), $secret);
}

function vb_iyzico_signed(string $secret, array $values, $given): bool {
  return is_string($given) && hash_equals(vb_iyzico_signature($secret, $values), strtolower($given));
}

// ---------------------------------------------------------------- notify (mail() + webhook)

function vb_t(string $lang): array {
  return $lang === 'en'
    ? ['newOrder' => 'New order', 'thanks' => 'We have your order', 'hello' => 'Hello %s,', 'received' => 'Your payment went through and we are preparing your order. Summary:', 'order' => 'Order', 'items' => 'Items', 'shipping' => 'Shipping', 'total' => 'Total', 'vat' => 'incl. VAT', 'buyer' => 'Buyer', 'address' => 'Address', 'company' => 'Invoice to', 'note' => 'Note', 'payment' => 'Payment', 'many' => '%d instalments', 'single' => 'single payment', 'reply' => 'Reply to this email if you have a question.']
    : ['newOrder' => 'Yeni sipariş', 'thanks' => 'Siparişiniz alındı', 'hello' => 'Merhaba %s,', 'received' => 'Ödemeniz alındı, siparişiniz hazırlanıyor. Özeti aşağıda:', 'order' => 'Sipariş', 'items' => 'Ürünler', 'shipping' => 'Kargo', 'total' => 'Toplam', 'vat' => 'KDV dahil', 'buyer' => 'Alıcı', 'address' => 'Adres', 'company' => 'Fatura', 'note' => 'Not', 'payment' => 'Ödeme', 'many' => '%d taksit', 'single' => 'tek çekim', 'reply' => 'Sorunuz olursa bu e-postayı yanıtlayabilirsiniz.'];
}

/** formatMoney: Intl (ICU) when the host has the intl extension, else a close fallback. */
function vb_money(int $minor, string $currency, string $lang): string {
  $whole = $minor % 100 === 0;
  if (class_exists('NumberFormatter')) {
    $f = new NumberFormatter($lang === 'tr' ? 'tr_TR' : 'en_GB', NumberFormatter::CURRENCY);
    $f->setAttribute(NumberFormatter::MIN_FRACTION_DIGITS, $whole ? 0 : 2);
    $f->setAttribute(NumberFormatter::MAX_FRACTION_DIGITS, 2);
    $s = $f->formatCurrency($minor / 100, $currency);
    if (is_string($s) && $s !== '') return $s;
  }
  $n = $lang === 'tr' ? number_format($minor / 100, $whole ? 0 : 2, ',', '.') : number_format($minor / 100, $whole ? 0 : 2, '.', ',');
  $symbol = ['TRY' => '₺', 'EUR' => '€', 'GBP' => '£', 'USD' => $lang === 'tr' ? '$' : 'US$'][$currency] ?? $currency . ' ';
  return $symbol . $n;
}

/** orderText: the plain-text summary in both emails. */
function vb_order_text(array $order, bool $forBusiness): string {
  $lang = $order['locale'] === 'en' ? 'en' : 'tr';
  $t = vb_t($lang);
  $q = $order['quote'];
  $fmt = fn ($m) => vb_money((int) $m, (string) $q['currency'], $lang);
  $b = $order['buyer'];
  $out = [];
  if (!$forBusiness) array_push($out, sprintf($t['hello'], $b['name']), '', $t['received'], '');
  array_push($out, $t['order'] . ': ' . $order['id'], '', $t['items'] . ':');
  foreach ($q['lines'] as $l) $out[] = '  ' . $l['qty'] . ' × ' . $l['name'] . ' — ' . $fmt($l['total']);
  if ($q['shipping'] > 0) $out[] = '  ' . $t['shipping'] . ' — ' . $fmt($q['shipping']);
  $out[] = $t['total'] . ': ' . $fmt($q['total']) . ' (' . $t['vat'] . ': ' . $fmt($q['vat']) . ')';
  if (!empty($order['installment'])) $out[] = $t['payment'] . ': ' . ($order['installment'] > 1 ? sprintf($t['many'], $order['installment']) : $t['single']);
  array_push($out, '', $t['buyer'] . ': ' . $b['name'] . ' ' . $b['surname'] . ' · ' . $b['email'] . ' · ' . $b['phone']);
  $out[] = $t['address'] . ': ' . implode(', ', array_filter([$b['address'] ?? '', $b['district'] ?? '', $b['city'] ?? '', $b['zipCode'] ?? '', $b['country'] ?? ''], fn ($x) => $x !== ''));
  if (!empty($b['company'])) $out[] = $t['company'] . ': ' . implode(' · ', array_filter([$b['company']['name'] ?? '', $b['company']['taxOffice'] ?? '', $b['company']['taxNumber'] ?? ''], fn ($x) => $x !== ''));
  if ($forBusiness && !empty($b['identityNumber'])) $out[] = 'TCKN: ' . $b['identityNumber'];
  if (!empty($order['note'])) $out[] = $t['note'] . ': ' . $order['note'];
  if ($forBusiness && !empty($order['paymentId'])) $out[] = 'iyzico paymentId: ' . $order['paymentId'];
  if (!$forBusiness) array_push($out, '', $t['reply']);
  return implode("\r\n", $out);
}

function vb_one_line(string $v): string {
  return trim(preg_replace('/[\r\n\t]+/', ' ', $v) ?? '');
}

function vb_encode_header(string $v): string {
  return '=?UTF-8?B?' . base64_encode(vb_one_line($v)) . '?=';
}

/** [display name, address] of ORDER_FROM ("Shop <orders@shop.example>" or a bare address). */
function vb_sender(array $c): array {
  $from = $c['ORDER_FROM'];
  $name = '';
  if (preg_match('/^(.*?)\s*<([^<>\s]+)>$/', $from, $m)) [$name, $from] = [trim($m[1], " \t\"'"), $m[2]];
  if ($from === '') {
    // The Host header comes from the visitor: only a plain host name may become part of the sender.
    $host = preg_replace('/^www\./', '', preg_replace('/:\d+$/', '', vb_request_host()));
    if ($host !== '') $from = 'no-reply@' . $host;
  }
  return [$name !== '' ? $name : VB_SITE_NAME, filter_var($from, FILTER_VALIDATE_EMAIL) ? $from : ''];
}

function vb_mail(array $to, string $subject, string $body, array $sender, string $replyTo): bool {
  [$name, $from] = $sender;
  $headers = [
    'From: ' . ($name !== '' ? vb_encode_header($name) . ' <' . $from . '>' : $from),
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
  ];
  if ($replyTo !== '' && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) $headers[] = 'Reply-To: ' . vb_one_line($replyTo);
  return mail(implode(', ', $to), vb_encode_header($subject), $body, implode("\r\n", $headers), '-f' . $from);
}

/** The business email, the buyer's receipt and the webhook. Throws after all ran if any failed. */
function vb_notify(array $order, array $c): void {
  $errors = [];
  $t = vb_t($order['locale'] === 'en' ? 'en' : 'tr');
  $site = VB_SITE_NAME !== '' ? VB_SITE_NAME . ' · ' : '';
  $to = array_values(array_filter(array_map('trim', explode(',', $c['ORDER_TO'])), fn ($x) => filter_var($x, FILTER_VALIDATE_EMAIL)));
  if ($to) {
    $sender = vb_sender($c);
    if ($sender[1] === '') {
      $errors[] = 'ORDER_FROM is not a valid address';
    } else {
      $buyer = (string) ($order['buyer']['email'] ?? '');
      if (!vb_mail($to, $site . $t['newOrder'] . ' ' . $order['id'], vb_order_text($order, true), $sender, $buyer)) $errors[] = 'order email failed';
      if (filter_var($buyer, FILTER_VALIDATE_EMAIL) && !vb_mail([$buyer], $site . $t['thanks'] . ' · ' . $order['id'], vb_order_text($order, false), $sender, $to[0])) $errors[] = 'receipt email failed';
    }
  }
  if ($c['ORDER_WEBHOOK_URL'] !== '') {
    try {
      $body = vb_json(['event' => 'order.paid', 'order' => vb_order_value($order)]);
      $headers = ['Content-Type: application/json'];
      if ($c['ORDER_WEBHOOK_SECRET'] !== '') $headers[] = 'X-Vamos-Signature: sha256=' . hash_hmac('sha256', $body, $c['ORDER_WEBHOOK_SECRET']);
      [$status] = vb_http_post($c['ORDER_WEBHOOK_URL'], $headers, $body, 15);
      if ($status < 200 || $status > 299) $errors[] = 'order webhook answered ' . $status;
    } catch (Throwable $e) {
      $errors[] = 'order webhook failed: ' . $e->getMessage();
    }
  }
  if (!$to && $c['ORDER_WEBHOOK_URL'] === '') $errors[] = 'ORDER_TO and ORDER_WEBHOOK_URL are both empty: nobody was told about this order';
  if ($errors) throw new RuntimeException(implode('; ', $errors));
}

/**
 * True the first time an order id is seen. A marker file (created with mode "x", which fails when
 * it exists) makes notify run once even when the same signed cookie and token are posted again.
 */
function vb_claim_once(string $orderId, array $c): bool {
  $dir = $c['STATE_DIR'] !== '' ? rtrim($c['STATE_DIR'], '/') : sys_get_temp_dir();
  if (!is_dir($dir)) @mkdir($dir, 0700, true);
  foreach (glob($dir . '/vb-order-*.done') ?: [] as $old) if (@filemtime($old) < time() - 3 * 3600) @unlink($old);
  $file = $dir . '/vb-order-' . substr(hash_hmac('sha256', $orderId, $c['ORDER_SECRET']), 0, 40) . '.done';
  $h = @fopen($file, 'x');
  if ($h !== false) {
    fclose($h);
    return true;
  }
  if (file_exists($file)) return false;
  vb_log('STATE_DIR is not writable; notify-once falls back to the order cookie');
  return true;
}

// ---------------------------------------------------------------- endpoints

function vb_checkout_start(): never {
  header('X-Content-Type-Options: nosniff');
  if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') vb_json_out(405, ['error' => 'bad-request'], ['Allow: POST']);
  $c = vb_config();
  $from = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
  if ($from !== '' && !vb_origin_allowed($from, $c)) vb_json_out(403, ['error' => 'forbidden-origin']);
  $raw = (string) file_get_contents('php://input', false, null, 0, VB_MAX_BODY + 1);
  if (strlen($raw) > VB_MAX_BODY) vb_json_out(413, ['error' => 'too-large']);
  $body = json_decode($raw, true);
  if (json_last_error() !== JSON_ERROR_NONE) vb_json_out(400, ['error' => 'bad-request']);
  if (!is_array($body)) $body = [];

  foreach (['coupon', 'couponCode', 'discountCode'] as $k) {
    if (vb_js_truthy($body[$k] ?? null)) vb_json_out(422, ['error' => 'invalid-cart', 'issues' => [['index' => -1, 'code' => 'coupon-unsupported']]]);
  }
  $catalog = vb_catalog();
  if ($catalog === null) {
    vb_log('catalog.json is missing or not valid JSON');
    vb_json_out(502, ['error' => 'payment-unavailable']);
  }
  $lines = [];
  if (is_array($body['lines'] ?? null) && array_is_list($body['lines'])) {
    foreach ($body['lines'] as $l) {
      $l = is_array($l) ? $l : [];
      $lines[] = [
        'productId' => vb_js_string($l['productId'] ?? ''),
        'variantId' => vb_js_truthy($l['variantId'] ?? null) ? vb_js_string($l['variantId']) : null,
        'qty' => array_key_exists('qty', $l) ? vb_js_number($l['qty']) : NAN,
      ];
    }
  }
  $priced = vb_price_cart($catalog, $lines);
  if (!$priced['ok']) vb_json_out(422, ['error' => 'invalid-cart', 'issues' => $priced['issues']]);
  $quote = $priced['quote'];
  $read = vb_read_buyer($body['buyer'] ?? null, $quote['physical']);
  if (isset($read['invalid'])) vb_json_out(422, ['error' => 'invalid-buyer', 'fields' => $read['invalid']]);
  $buyer = $read['buyer'];

  $problems = vb_config_problems($c);
  if ($problems) {
    vb_log('settings missing in the store config: ' . implode(', ', $problems));
    vb_json_out(502, ['error' => 'payment-unavailable']);
  }
  $locale = ($body['locale'] ?? null) === 'en' ? 'en' : 'tr';
  $order = ['v' => 1, 'id' => vb_order_id(), 'createdAt' => vb_now_iso(), 'locale' => $locale, 'quote' => $quote, 'buyer' => $buyer];
  $note = vb_text($body['note'] ?? null, 500);
  if ($note !== '') $order['note'] = $note;
  $signed = vb_sign_order($order, $c['ORDER_SECRET']);
  if (strlen($signed) > VB_MAX_SIGNED) vb_json_out(413, ['error' => 'too-large']);

  $base = vb_base_url($c);
  $address = array_filter([
    'contactName' => $buyer['name'] . ' ' . $buyer['surname'],
    'city' => $buyer['city'],
    'country' => $buyer['country'],
    'address' => implode(', ', array_filter([$buyer['address'], $buyer['district'] ?? ''], fn ($x) => $x !== '')),
    'zipCode' => $buyer['zipCode'] ?? null,
  ], fn ($v) => $v !== null);
  $items = [];
  foreach ($quote['lines'] as $i => $l) {
    $id = substr($l['productId'] . (isset($l['variantId']) ? '-' . $l['variantId'] : ''), 0, 60);
    $items[] = ['id' => $id !== '' ? $id : 'item-' . $i, 'name' => mb_substr((string) $l['name'], 0, 120, 'UTF-8'), 'category1' => $l['category'], 'itemType' => $l['itemType'], 'price' => vb_request_price(vb_to_decimal($l['total']))];
  }
  if ($quote['shipping'] > 0) $items[] = ['id' => 'shipping', 'name' => $quote['shippingLabel'], 'category1' => 'Shipping', 'itemType' => 'VIRTUAL', 'price' => vb_request_price(vb_to_decimal($quote['shipping']))];
  $price = vb_request_price(vb_to_decimal($quote['total']));
  $request = [
    'locale' => $locale,
    'conversationId' => $order['id'],
    'price' => $price,
    'paidPrice' => $price,
    'currency' => $quote['currency'],
    'basketId' => $order['id'],
    'paymentGroup' => 'PRODUCT',
    'callbackUrl' => $base . VB_CALLBACK_PATH,
    'buyer' => array_filter([
      'id' => $order['id'],
      'name' => $buyer['name'],
      'surname' => $buyer['surname'],
      // iyzico requires a value; 11111111111 is its documented placeholder when TCKN is not collected.
      'identityNumber' => $buyer['identityNumber'] ?? '11111111111',
      'email' => $buyer['email'],
      'gsmNumber' => vb_gsm($buyer['phone']),
      'registrationAddress' => $address['address'],
      'city' => $buyer['city'],
      'country' => $address['country'],
      'zipCode' => $buyer['zipCode'] ?? null,
      'ip' => vb_client_ip(),
    ], fn ($v) => $v !== null),
  ];
  if ($quote['physical']) $request['shippingAddress'] = $address;
  $request['billingAddress'] = isset($buyer['company']) ? array_merge($address, ['contactName' => $buyer['company']['name']]) : $address;
  $request['basketItems'] = $items;
  try {
    if (!preg_match('#^https?://#', $request['callbackUrl'])) throw new RuntimeException('no site URL: set SITE_URL');
    $res = vb_iyzico_post($c, '/payment/iyzipos/checkoutform/initialize/auth/ecom', $request);
    if (($res['status'] ?? null) !== 'success' || !is_string($res['token'] ?? null)) throw new RuntimeException('iyzico: ' . vb_js_string($res['errorMessage'] ?? 'initialize failed'));
    if (!vb_iyzico_signed($c['IYZICO_SECRET_KEY'], [$res['conversationId'] ?? null, $res['token']], $res['signature'] ?? null)) throw new RuntimeException('iyzico: initialize response signature does not match');
    if (!is_string($res['paymentPageUrl'] ?? null) || $res['paymentPageUrl'] === '') throw new RuntimeException('no paymentPageUrl');
  } catch (Throwable $e) {
    vb_log('payment provider refused the checkout', ['message' => $e->getMessage()]);
    vb_json_out(502, ['error' => 'payment-unavailable']);
  }
  vb_json_out(200, ['order' => $order['id'], 'paymentPageUrl' => $res['paymentPageUrl']], [], [vb_cookie(VB_ORDER_COOKIE, $signed, 3600)]);
}

function vb_checkout_callback(): never {
  header('X-Content-Type-Options: nosniff');
  $c = vb_config();
  $base = vb_base_url($c);
  $failed = function (string $reason) use ($base): never {
    vb_redirect(vb_with_query($base, VB_FAILURE_PATH, ['payment' => 'failed', 'reason' => $reason]), [vb_cookie(VB_ORDER_COOKIE, '', 0)]);
  };
  if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') vb_redirect(vb_with_query($base, VB_FAILURE_PATH, ['payment' => 'failed', 'reason' => 'method']));
  $token = '';
  if (stripos((string) ($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json') !== false) {
    $json = json_decode((string) file_get_contents('php://input', false, null, 0, VB_MAX_BODY), true);
    $token = is_array($json) && is_scalar($json['token'] ?? null) ? vb_js_string($json['token']) : '';
  } else {
    $token = is_string($_POST['token'] ?? null) ? $_POST['token'] : '';
  }
  if ($token === '') $failed('token');
  $problems = vb_config_problems($c);
  if ($problems) {
    vb_log('settings missing in the store config: ' . implode(', ', $problems));
    $failed('provider');
  }
  try {
    $res = vb_iyzico_post($c, '/payment/iyzipos/checkoutform/auth/ecom/detail', ['locale' => 'tr', 'token' => $token]);
  } catch (Throwable $e) {
    vb_log('could not read the payment result', ['message' => $e->getMessage()]);
    $failed('provider');
  }
  $price = fn ($v) => ($v === null || $v === '') ? '' : vb_iyzico_trim($v);
  $verified = ($res['status'] ?? null) === 'success' && vb_iyzico_signed($c['IYZICO_SECRET_KEY'], [
    $res['paymentStatus'] ?? null, $res['paymentId'] ?? null, $res['currency'] ?? null, $res['basketId'] ?? null,
    $res['conversationId'] ?? null, $price($res['paidPrice'] ?? null), $price($res['price'] ?? null), $res['token'] ?? null,
  ], $res['signature'] ?? null);
  if (!$verified || ($res['paymentStatus'] ?? null) !== 'SUCCESS') $failed('declined');

  $basketId = isset($res['basketId']) && is_scalar($res['basketId']) ? vb_js_string($res['basketId']) : null;
  $paymentId = isset($res['paymentId']) && is_scalar($res['paymentId']) ? vb_js_string($res['paymentId']) : null;
  $order = vb_verify_order($_COOKIE[VB_ORDER_COOKIE] ?? null, $c['ORDER_SECRET'], 2 * 3600);
  $doneId = is_string($_COOKIE[VB_DONE_COOKIE] ?? null) ? $_COOKIE[VB_DONE_COOKIE] : null;
  if ($order === null) {
    // Paid, but the signed order is gone: a second post of the same callback, or blocked cookies.
    if ($doneId !== null && $doneId !== '' && $doneId === $basketId) vb_redirect(vb_with_query($base, VB_SUCCESS_PATH, ['order' => $doneId]));
    vb_log('payment succeeded without a matching order cookie: find it in the iyzico panel', ['basketId' => $basketId, 'paymentId' => $paymentId]);
    vb_redirect(vb_with_query($base, VB_SUCCESS_PATH, ['order' => $basketId ?? '']));
  }
  $expected = vb_iyzico_trim(vb_to_decimal((int) $order['quote']['total']));
  if ($basketId !== $order['id'] || $price($res['price'] ?? null) !== $expected) {
    vb_log('payment does not match the order', ['order' => $order['id'], 'basketId' => $basketId, 'price' => $res['price'] ?? null, 'expected' => $expected]);
    $failed('mismatch');
  }
  $paid = $order + ['paidAt' => vb_now_iso(), 'provider' => 'iyzico'];
  if ($paymentId !== null) $paid['paymentId'] = $paymentId;
  if (isset($res['paidPrice']) && is_scalar($res['paidPrice'])) $paid['paidPrice'] = vb_js_string($res['paidPrice']);
  if (is_int($res['installment'] ?? null)) $paid['installment'] = $res['installment'];
  if (vb_claim_once($order['id'], $c)) {
    try {
      vb_notify($paid, $c);
    } catch (Throwable $e) {
      vb_log('notify failed', ['order' => $order['id'], 'message' => $e->getMessage()]);
    }
  }
  vb_redirect(vb_with_query($base, VB_SUCCESS_PATH, ['order' => $order['id']]), [vb_cookie(VB_ORDER_COOKIE, '', 0), vb_cookie(VB_DONE_COOKIE, $order['id'], 3600)]);
}
`.replace("__SITE_NAME__", phpString(o.siteName));
}

export interface PhpStoreFilesOptions {
  lang: Lang;
  siteName?: string;
  /** The catalog as JSON text (written once, the one price source). */
  catalogJson: string;
}

/** Files of the PHP runtime, keyed by project path (the catalog included). */
export function phpStoreFiles(o: PhpStoreFilesOptions): Record<string, string> {
  return {
    [PHP_CATALOG]: o.catalogJson,
    "public/api/checkout.php": entry("start"),
    "public/api/checkout-callback.php": entry("callback"),
    "public/api/.htaccess": API_HTACCESS,
    [`${PHP_STORE_DIR}/.htaccess`]: STORE_HTACCESS,
    [`${PHP_STORE_DIR}/store.php`]: storeLib({ siteName: o.siteName ?? "" }),
    "store/php-config.example.php": configExample(o.lang),
    "store/php-dev-router.php": devRouter(),
  };
}
