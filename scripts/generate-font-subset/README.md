# Font subsetting (ondrahajek.com Astro)

This pipeline collects characters used on the site, subsets the self-hosted **Anton** WOFF2 files in `public/fonts/`, and writes:

- [`src/components/fonts/anton-critical.generated.css`](../../src/components/fonts/anton-critical.generated.css) — inlined `@font-face` rules consumed by [`AntonCriticalFaces.astro`](../../src/components/fonts/AntonCriticalFaces.astro)
- `public/fonts/subset-demo.html` — quick visual check of the Anton subset

Character buckets in `unique_chars.json` (`anton`, `inter`, `geist_mono`, `teko`) are gathered for documentation and future extension (Inter/Teko/Geist subsetting is not wired in Python yet).

## Requirements

- **Node** (project uses pnpm)
- **Python 3** on `PATH`. The first run of `pnpm generate:fonts:subset` creates `scripts/generate-font-subset/.venv` and installs [`requirements.txt`](requirements.txt) there (avoids macOS/Homebrew PEP 668 conflicts).

## Usage

1. **Production build** so `dist/**/*.html` exists (static routes + copy):

   ```bash
   pnpm build
   ```

   If the build is skipped, `get-characters.mjs` falls back to `src/i18n/index.ts` plus visible text heuristics from `src/**/*.astro` (smaller coverage).

2. **Collect characters** → `scripts/generate-font-subset/unique_chars.json`:

   ```bash
   pnpm generate:fonts:chars
   ```

3. **Subset Anton + emit CSS + demo page**:

   ```bash
   pnpm generate:fonts:subset
   ```

4. **All-in-one** (build + chars + subset):

   ```bash
   pnpm generate:fonts
   ```

5. Commit `anton-critical.generated.css` (and optionally `subset-demo.html`) when glyphs change.

## Extending

- Source fonts: `public/fonts/anton-*.woff2` (same files as [`src/styles/fonts.css`](../../src/styles/fonts.css) / Google-derived self-host).
- To subset **Inter**, **Geist Mono**, or **Teko**, add analogous entries and `@font-face` output in `generate.font-subset.py` using the same `unique_chars.json` keys.
