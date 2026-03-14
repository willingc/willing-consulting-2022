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

- Deployed to **Netlify** via GitHub Actions (`.github/workflows/publish.yml`) on push to `main`
- Uses `@quarto/netlify-plugin-quarto` to install Quarto and build during Netlify deploys
- Lighthouse plugin runs post-build; report at `reports/lighthouse.html`
- Quarto pre-release version is used in CI

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
