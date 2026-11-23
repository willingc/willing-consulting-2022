# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal/consulting website for Carol Willing (willingconsulting.com), built with [Quarto](https://quarto.org/) and deployed to Netlify.

## Commands

- **Preview locally:** `quarto preview`
- **Render site:** `quarto render` (outputs to `_site/`)
- **Compile SCSS manually:** `sass wilcon.scss wilcon.css`

There are no tests or linters configured for this project.

## Deployment

- Deployed by **Netlify's Git integration**: pushes to `main` build production; pull requests get Deploy Previews. There is no GitHub Actions deploy workflow.
- `@quarto/netlify-plugin-quarto` (configured in `netlify.toml`) installs Quarto and runs `quarto render` during Netlify builds. The Quarto version is pinned there via `version = "v1.11.9"` (a quarto-cli release tag, leading `v` required); a `QUARTO_VERSION` env var in Netlify overrides it.
- Response headers (CSP, security, caching) live in `_headers`, which Quarto copies into `_site/` via `project: resources` in `_quarto.yml`. Do not put headers in `netlify.toml`.
- When adding a new third-party embed, script, font, or API, update the Content-Security-Policy in `_headers` or it will be blocked.
- Lighthouse plugin runs during the build (`onPostBuild`, via `fail_deploy_on_score_thresholds = "true"` with no thresholds, so it never fails the build) and publishes HTML reports: `/reports/lighthouse.html` (home), `/reports/blog.html`, `/reports/blog-post.html`, `/reports/contact.html`. Audits run against `_site/` served locally, so `_headers` and CDN caching are not reflected in the scores.

## Architecture

### Content Structure

- `index.qmd` — Homepage with custom `page-layout: custom` and hero banner
- `blog/posts/` — Blog posts (each in its own directory or as `.qmd` files)
- `til/` — "Today I Learned" section
- `about/` — About pages (bios, awards, podcasts, press)
- `speaking.qmd` — Speaking engagements
- `talks/` — Talk materials

### Styling

- **Theme:** Simplex base theme with custom overrides in `wilcon.scss`
- **Brand colors:** Deep Cove (`#040A2B`), Bay of Many (`#244A7B`), Calypso (`#326494`), Malibu (`#5BB2F9`), Lightest Blue (`#bde0fe`)
- **Fonts:** Roboto family (Flex, Slab, Mono, Serif) loaded via Google Fonts in `_head.html`
- `index.css` — Homepage-specific layout (hero banner, features grid, blog section)
- `styles.css` — Global overrides (accessibility fixes for listing card headings, navbar)

### Key Customizations

- `listing-grid-a11y.ejs` — Custom EJS listing template that uses `<h2>` for card titles (accessibility fix for heading hierarchy)
- `_head.html` — Preconnect hints and Google Fonts loading
- `execute: freeze: auto` in `_quarto.yml` — Computational outputs are frozen (stored in `_freeze/`)

### Quarto Extensions

- `quarto-ext/fontawesome` — Font Awesome icons
- `mcanouil/iconify` — Iconify icons (used for Bluesky icon in footer)
- `sellorm/social-embeds` — Social media embeds
