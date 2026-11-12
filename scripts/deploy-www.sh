#!/bin/bash
# Deploy the docs site (apps/www) to https://ui.vamos.ist as a static export.
# Builds from a clean checkout of a git ref (default: origin/main), so uncommitted
# or in-progress local work never reaches production.
#   scripts/deploy-www.sh            # deploy origin/main
#   REF=HEAD scripts/deploy-www.sh   # deploy the local HEAD commit
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REF="${REF:-origin/main}"
SERVER="${SERVER:-vamos-ts}"
TARGET="/home/vamosist/public_html/subdomains/ui"
WORK="$(mktemp -d /tmp/vamos-ui-deploy.XXXXXX)"
trap 'git -C "$ROOT" worktree remove --force "$WORK/src" >/dev/null 2>&1 || true; rm -rf "$WORK"' EXIT

git -C "$ROOT" fetch -q origin || true
git -C "$ROOT" worktree add -q --detach "$WORK/src" "$REF"
cd "$WORK/src"
echo "→ building $(git rev-parse --short HEAD) ($REF)"
pnpm install --frozen-lockfile --prefer-offline >/dev/null
node scripts/gen.mjs
# Registry for `npx vamos-ui` and the MCP server → apps/www/public/r → https://ui.vamos.ist/r/
if [ -f scripts/build-registry.mjs ]; then node scripts/build-registry.mjs; fi
if [ -f packages/cli/package.json ]; then
  ( cd packages/cli && pnpm build >/dev/null )
  node --input-type=module -e "import { BRAND_JSON_SCHEMA } from './packages/cli/dist/brand.js'; import fs from 'node:fs'; fs.writeFileSync('apps/www/public/r/brand-schema.json', JSON.stringify(BRAND_JSON_SCHEMA, null, 2));"
  node --input-type=module -e "import { SITE_JSON_SCHEMA } from './packages/cli/dist/verify.js'; import fs from 'node:fs'; fs.writeFileSync('apps/www/public/r/site-schema.json', JSON.stringify(SITE_JSON_SCHEMA, null, 2));"
  node --input-type=module -e "import { PROJECT_JSON_SCHEMA } from './packages/cli/dist/project.js'; import fs from 'node:fs'; fs.writeFileSync('apps/www/public/r/project-schema.json', JSON.stringify(PROJECT_JSON_SCHEMA, null, 2));"
fi
( cd apps/www && NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=8192}" STATIC_EXPORT=1 NEXT_PUBLIC_ADMIN_URL="https://ui.vamos.ist/blocks" pnpm exec next build )
OUT="apps/www/out"
test -f "$OUT/index.html" && test -d "$OUT/docs"
# AI-readable docs: /llms.txt, /llms-full.txt and a .md next to every docs page and block
node scripts/llms.mjs "$OUT"
# Apache: clean URLs, caching, security headers, custom 404
cat > "$OUT/.htaccess" <<'HT'
Options -Indexes
AddType "text/markdown; charset=utf-8" .md
AddType "text/plain; charset=utf-8" .txt
ErrorDocument 404 /404.html
<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set X-Frame-Options "SAMEORIGIN"
  <FilesMatch "\.(js|css|woff2|svg|png|jpg|webp)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\.json$">
    Header set Access-Control-Allow-Origin "*"
    Header set Cache-Control "public, max-age=300"
  </FilesMatch>
  <FilesMatch "\.(md|txt)$">
    Header set Cache-Control "public, max-age=300"
    Header set Access-Control-Allow-Origin "*"
  </FilesMatch>
  <FilesMatch "\.html$">
    Header set Cache-Control "public, max-age=300"
  </FilesMatch>
</IfModule>
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/markdown text/html text/css text/plain text/xml application/javascript text/javascript application/json application/manifest+json image/svg+xml application/xml
</IfModule>
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
HT
echo "→ uploading $(find "$OUT" -type f | wc -l | tr -d ' ') files to $SERVER:$TARGET"
rsync -az --delete "$OUT/" "$SERVER:$TARGET/"
ssh "$SERVER" "chown -R vamosist:vamosist $TARGET && find $TARGET -type d -exec chmod 755 {} + && find $TARGET -type f -exec chmod 644 {} + && chmod 750 $TARGET"
echo "→ done: https://ui.vamos.ist ($(git rev-parse --short HEAD))"
