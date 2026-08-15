# descubr-web

Secondary pages for DescubR — About Us, Privacy Policy, and FAQ — meant to be
published on GitHub Pages ahead of the real descubr.com homepage. Plain
static HTML/CSS/JS, no build step, both pages fully bilingual (English +
Spanish).

## Structure

```
descubr-web/
  index.html        placeholder homepage (temporary — replace once the real site is ready)
  about/index.html
  faq/index.html
  privacy/index.html
  assets/style.css   shared brand styles
  assets/lang.js     language detection + switcher (?lang=en|es, localStorage, browser fallback)
  CNAME              tells GitHub Pages to serve this site at descubr.com
```

Every page contains **both languages inline**, wrapped in
`<div data-i18n="en">…</div>` / `<div data-i18n="es">…</div>` blocks.
`assets/lang.js` shows/hides them based on (in priority order): the `?lang=`
query param, a previously-saved choice in `localStorage`, then the browser's
language, falling back to English. This is exactly how the mobile app's
`?lang=` links already expect these pages to behave.

All internal links use **relative paths** (`about/`, `../assets/style.css`,
etc.), not absolute ones — this matters, see the deploy note below.

## Editing content

Open the relevant `index.html` and edit inside the matching
`data-i18n="en"` / `data-i18n="es"` block — no templating, just edit the
HTML directly. Keep both language blocks in sync when you add or change a
section.

The Privacy Policy has a version/date line near the top
(`<p class="updated">Version 1.0 — …`). If you make a **material** change to
what data is collected or how it's used, bump that version — and bump
`PRIVACY_POLICY_VERSION` in `backend/app/config.py` to match, so the app
prompts existing users to re-accept it.

## Deploying to GitHub Pages

This folder is meant to become its **own GitHub repository**, separate from
the `descubr` monorepo (same reason the mobile app already links to
`https://jorgerodpen.github.io/descubr-web/...`).

### 1. Push it as a new repo

```bash
cd descubr-web
git init
git add .
git commit -m "Initial DescubR docs site"
gh repo create jorgerodpen/descubr-web --public --source=. --remote=origin --push
```

(No `gh` CLI? Create the empty repo `descubr-web` on github.com under your
account first, then `git remote add origin git@github.com:jorgerodpen/descubr-web.git`
and `git push -u origin main`.)

### 2. Enable Pages

In the new repo: **Settings → Pages → Build and deployment → Source:
"Deploy from a branch" → Branch: `main`, folder `/ (root)` → Save.**

No GitHub Actions workflow needed — it's static files, GitHub serves them
directly. Give it a minute or two after the first push.

### 3. Verify

Your site will be live at:

```
https://jorgerodpen.github.io/descubr-web/
https://jorgerodpen.github.io/descubr-web/about/
https://jorgerodpen.github.io/descubr-web/faq/
https://jorgerodpen.github.io/descubr-web/privacy/
```

Both `/about` and `/about/` should work (GitHub Pages serves the folder's
`index.html` either way).

### 4. Pointing descubr.com at it

The repo already has a `CNAME` file containing `descubr.com`, so GitHub
knows what custom domain this site belongs to as soon as you push. You still
need to point DNS at GitHub yourself, at whichever registrar/DNS provider
holds `descubr.com`:

**Apex domain (`descubr.com`)** — add four `A` records, all for the root
(`@`), pointing at GitHub Pages' IPs:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Optional but recommended, `AAAA` records for IPv6, again all four for `@`:

```
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

**`www` subdomain (optional, catches people who type `www.descubr.com`)** —
add one `CNAME` record:

```
www  →  jorgerodpen.github.io
```

(GitHub's IPs occasionally change — worth a quick cross-check against
[GitHub's current docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain)
before you add them.)

If your DNS provider proxies traffic (e.g. Cloudflare's orange-cloud
proxy), set the `descubr.com`/`www` records to **DNS only** for now — a
proxy in front can interfere with GitHub's domain verification and TLS
issuance until Pages has confirmed the certificate.

**Then, in the repo on GitHub:** Settings → Pages → Custom domain should
already show `descubr.com` (picked up from the `CNAME` file) — if not,
type it in and save. GitHub will show a DNS check; once it goes green
(can take anywhere from a few minutes to ~24h for DNS to propagate), tick
**Enforce HTTPS**.

**Until DNS is verified**, keep using the `github.io` URL — GitHub
redirects the `github.io` URL to the custom domain once it's configured,
so don't flip anything over (or update the app's links, see below) until
that DNS check is actually green.

Because every link in this site is relative (not `/about/` but `about/`),
nothing needs to change in the HTML when the site moves from
`github.io/descubr-web/` to `descubr.com/` — it keeps working at the new
root automatically.

**Once `descubr.com` is confirmed live**, update the 3 hardcoded links in
the mobile app (`profile.tsx`, `register.tsx`, `accept-terms.tsx`,
currently pointed at `https://jorgerodpen.github.io/descubr-web/...`) to
use `https://descubr.com/...` instead, and ship an app update.
