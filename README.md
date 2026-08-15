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

### 4. Later: pointing descubr.com at it

When you're ready to configure DNS (we'll do this together):

1. Buy/own `descubr.com` and add a `CNAME` file to this repo's root
   containing just `descubr.com`, **or** set the custom domain in
   **Settings → Pages → Custom domain**.
2. At your DNS provider, add either:
   - An `ALIAS`/`ANAME` record (or 4 `A` records to GitHub's IPs, see
     [GitHub's docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site))
     for the apex `descubr.com`, or
   - A `CNAME` record for `www.descubr.com` → `jorgerodpen.github.io`.
3. **Do this only once DNS is actually ready** — GitHub Pages redirects the
   `github.io` URL to the custom domain as soon as it's configured, which
   would break the site if DNS isn't resolving yet.
4. Because every link in this site is relative (not `/about/` but `about/`),
   nothing needs to change in the HTML when you move from
   `github.io/descubr-web/` to `descubr.com/` — it keeps working at the new
   root automatically.
5. Once live on `descubr.com`, update the 3 hardcoded links in the mobile
   app (`profile.tsx`, `register.tsx`, `accept-terms.tsx`, currently pointed
   at `https://jorgerodpen.github.io/descubr-web/...`) to use
   `https://descubr.com/...` instead, and ship an app update.
