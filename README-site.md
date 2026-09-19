# OmniThings public website

The `site/` directory is a standalone static website for `https://omnithings.ai/`.
It uses native HTML, CSS and a small optional JavaScript file. There is no build
step, application server, analytics, external font or third-party script.
Serving the files needs no package installation; the deployment CLI is pinned separately.

## Content boundary

Copy is based only on this repository's public `profile/README.md`: local-first
AI, connected tools and knowledge, user-selected integrations, private development,
and public updates on the organization profile. The site does not publish names
of private repositories, internal services, private contact addresses, metrics,
testimonials or release availability that has not been established.

The existing GitHub organization avatar is stored locally in
`site/assets/omnithings-avatar.png`. Source:
`https://github.com/OmniThings.png?size=512`, which returned the organization's
420 by 420 pixel PNG on 2026-09-19. It is an existing brand asset, not a generated
product preview. Keep its original colors and proportions.

## Preview

From the repository root:

```bash
python3 -m http.server 4173 --bind 127.0.0.1 --directory site
```

Open `http://127.0.0.1:4173/`. The deployment document root must be `site/`, because
asset references are absolute to the website root. Serve `404.html` for unmatched
paths with HTTP status 404. The local Python server does not automatically use
that custom error page; open `/404.html` to inspect its appearance.

## Design and accessibility

- Design variance 6, motion intensity 3, visual density 3: asymmetric hero,
  existing logo, unboxed principles and a factual public-release section.
- One violet accent derived from the brand avatar; semantic CSS variables for
  every page surface. No section switches theme independently.
- System sans-serif typography and explicit mobile collapse below 768 pixels.
- Radius scale: controls 12 pixels, the brand image 24 pixels; the small navigation
  avatar uses a 6.4 pixel radius to preserve its proportions.
- Native select labeled `Motyw`, values `system`, `light`, `dark`. The optional
  preference lives under `omnithings.theme` in localStorage. Storage failures do
  not disable the control; native CSS follows the OS when JavaScript is absent.
- Saved preference is applied before the stylesheet to avoid a theme flash.
  Browser theme color also follows both manual and OS changes.
- Keyboard skip link, visible focus outlines, semantic headings, native links,
  explicit image dimensions, and no automatically running animations. Interaction
  motion is limited to a small press response and respects reduced motion.

## Verification handoff

Check desktop and mobile in light, dark and system modes; verify OS changes,
persistence, blocked storage, no-JavaScript fallback, keyboard navigation,
320-pixel overflow, 404 appearance and every external link. Run a browser
accessibility/performance audit before publication. Infrastructure-specific
headers and deployment configuration are maintained by the deployment task.

## Cloudflare deployment

Install the pinned CLI with `npm ci`. Provide `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` through your local environment; never commit credentials.

```sh
npm run dev
npm run deploy:preview
npm run deploy
```

`deploy:preview` uses a separate Worker whose name ends in `-preview`, with no production domains. `deploy` publishes the production Worker and its apex/www Custom Domains. Review domain configuration before running production deployment: Wrangler can replace conflicting DNS in a non-interactive session.

Only `site/` is uploaded. The configuration has no request-handling Worker code, database or paid storage binding. `_headers` supplies CSP and other response headers; `404.html` is returned with a real 404 status for missing paths. The apex URL is canonical; www serves the same content.

Production: https://omnithings.ai/

GitHub is the source repository. Deployments are currently performed with the CLI; pushing a commit alone does not publish the site. Cloudflare Git integration is not configured. This deployment does not use GitHub Actions minutes.
