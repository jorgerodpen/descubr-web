# descubr-web

Secondary pages for DescubR — About Us, Privacy Policy, and FAQ — meant to be
published on GitHub Pages ahead of the real descubr.com homepage. Plain
static HTML/CSS/JS, no build step, both pages fully bilingual (English +
Spanish).

## Structure

```
descubr-web/
  index.html          placeholder homepage (temporary — replace once the real site is ready)
  about/index.html
  faq/index.html
  privacy/index.html      general Privacy Policy — every user accepts this
  terms/index.html        general Terms of Service — every user accepts this (see below)
  guide-terms/index.html  guide-only terms — only shown/accepted at "Become a guide", and
                          re-accepted by existing guides if it's updated (see below)
  legal-notice/index.html Aviso Legal (LSSICE legal notice) — currently placeholders, see below
  assets/style.css   shared brand styles + self-hosted @font-face rules
  assets/fonts/      self-hosted Inter/Sora WOFF2 files (see "Fonts" below)
  assets/lang.js     language detection + switcher (?lang=en|es, localStorage, browser fallback)
  assets/theme.js    dark-mode toggle, sticky-header glass state, reading-progress bar,
                      back-to-top button, and the docs table-of-contents scroll-spy — every
                      feature no-ops when its markup isn't on the page, so it's included on
                      every page
  CNAME              tells GitHub Pages to serve this site at descubr.com
```

Privacy, Terms, Guide Terms and the Legal Notice additionally get a sticky
table-of-contents sidebar and a card layout (`.docs-shell` / `.toc` /
`.doc-card` in `assets/style.css`), generated from each page's `<h2>`
headings — every heading has an `id="en-N"`/`id="es-N"` and a hover-to-copy
`#` anchor. When you add, remove, or reorder an `<h2>` in one of those
pages, keep the matching `<a href="#en-N">`/`<a href="#es-N">` link in the
`.toc-list` block in sync (same order, same count) — nothing recomputes it
for you.

Dark mode uses the mobile app's dark palette (see `constants/theme.ts` in
`descubr-mobile`), applied automatically via `prefers-color-scheme` and
override-able with the header's toggle button (persisted in
`localStorage` under `descubr-theme`). Add new colors as CSS custom
properties in `assets/style.css`'s `:root` block (light) and mirror them in
both the `@media (prefers-color-scheme: dark)` block and the
`:root[data-theme="dark"]` block — see the comments there.

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

Guide Terms works the same way but is entirely separate — its own version
line, its own `GUIDE_TERMS_VERSION` in `backend/app/config.py`, and it only
prompts *guides* to re-accept (regular users never see it). Bump it when
you materially change anything guide-specific: tour review rules, profile
picture review, Pro verification, the inactivity/revocation policy, or
payout requirements.

Terms of Service has its own version line and its own
`TERMS_OF_SERVICE_VERSION` in `backend/app/config.py`, but shares the same
mobile re-accept screen as the Privacy Policy (`accept-terms.tsx`) — bumping
either version forces every user through that screen once. Bump it when you
materially change the access license, the withdrawal-right waiver, user
content licensing, liability terms, or anything else user-facing.

The Legal Notice currently ships with placeholder fields (`[LEGAL NAME]`,
`[NIF]`, `[REGISTERED ADDRESS]`) — fill these in with real values before
accepting real payments. See the HTML comment at the top of
`legal-notice/index.html` for the two practical ways to do this without
publishing a home address.

## Fonts

Inter and Sora are self-hosted (`assets/fonts/*.woff2`), not loaded from
Google Fonts — the site's own Privacy Policy claims no third-party trackers,
and a live request to `fonts.googleapis.com`/`fonts.gstatic.com` would leak
every visitor's IP to Google. Both files are variable fonts covering the
Latin subset (all EN/ES copy on this site fits in that range), declared in
`assets/style.css` with a `font-weight: 400 700` range so 400/500/600/700 all
resolve correctly from the same file. To refresh or add a weight/script,
fetch `https://fonts.googleapis.com/css2?family=<name>:wght@<weights>` with
a modern-browser `User-Agent` header, download the resulting `.woff2` URLs,
and update the `@font-face` blocks accordingly — no need to re-add the
Google-hosted `<link>` tags.

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
so don't flip anything over until that DNS check is actually green.

Because every link in this site is relative (not `/about/` but `about/`),
nothing needs to change in the HTML when the site moves from
`github.io/descubr-web/` to `descubr.com/` — it keeps working at the new
root automatically.

**Status: `descubr.com` DNS is live** and the mobile app's links
(`profile.tsx`, `register.tsx`, `accept-terms.tsx`, `accept-guide-terms.tsx`,
`become-guide.tsx`, `tour-detail/[id].tsx`) already point at
`https://descubr.com/...`, not the `github.io` URL. Steps 1–4 above are kept
as reference for re-creating this deploy from scratch, not as an in-progress
checklist.
