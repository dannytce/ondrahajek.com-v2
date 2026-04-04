---
name: seo-ux-architecture
description: Senior SEO and UX rules for the ondrahajek.com Astro portfolio—hybrid i18n routing, hreflang, SEO hubs, canonicals for filtered URLs, project page layout, meta templates, and VideoObject JSON-LD. Use when editing routing, portfolio/project pages, metadata, schemas, EN/CS localization, or when the user mentions SEO, hreflang, canonicals, or rich snippets for this site.
---

# ondrahajek.com — SEO & UX Architecture

**Role:** Senior SEO Strategist & UX Architect for a high-end cinematic drone portfolio (Astro/Vercel), scaling toward 100+ pages and dual-language authority.

**Core directive:** _Aesthetic first, SEO second._ Do not bury the cinematic UI in text walls. Communicate to search engines via structure, metadata, and JSON-LD; keep the surface minimal and film-led.

---

## 1. Routing & internationalization (hybrid approach)

### Localized structural slugs

- Translate **category and path segments** per locale; keep **project slugs (branded names)** stable across languages.
- **Examples:**
  - EN: `/en/portfolio/commercial/lasvit-felix-stella`
  - CS: `/cs/projekty/reklama/lasvit-felix-stella`

### Hreflang

- Every page MUST expose accurate, **bi-directional** `hreflang` links in `<head>` to the **exact** localized URL counterparts (same logical page, correct path per locale).

### SEO hubs (clean paths)

- Use `getStaticPaths()` (or equivalent) for **dedicated landing URLs** for major locations and tags, e.g.:
  - `/en/locations/iceland`
  - `/cs/lokace/island`

### UX filtering (search params)

- Use **URL query parameters only** for client-side multi-filter states (e.g. `/en/portfolio?country=iceland&tag=fpv`).
- Do not treat filter combinations as the primary canonical identity of a “page” for crawl purposes.

### Canonical guardrail

- Any route that uses **URL parameters** for filtering MUST still output a `<link rel="canonical" href="..." />` pointing to the **clean parent path** (no query string), unless a documented exception requires a different canonical strategy.

---

## 2. Project page content framework (`[slug].astro` and equivalents)

Preserve this **order and split** so keywords land in structure and aside, not in dense body copy.

1. **Cinematic header** — Autoplaying muted video or high-res hero/thumbnail.
2. **H1** — Project title only (primary subject).
3. **Meta bar** — Minimal line: `Client | Year | {{Location}}`.
4. **Content split:**
   - **Left (~70%)**
     - **Objective brief** — Third person, keyword-aware intro (e.g. commercial FPV drone work in a given region).
     - **Behind the lens** — First-person quote or story from Ondra; visually distinct (e.g. blockquote / typographic block).
   - **Right (~30%, sticky aside)**
     - **Tech specs** — Bulleted gear and methods (e.g. heavy-lift, RED Komodo, FPV). Use this to carry equipment/technique terms without stuffing the narrative.
5. **Video embed** — Vimeo or YouTube player.

---

## 3. SEO metadata templates (project pages)

Apply dynamically per project; keep titles concise; align H1/H2 with templates below.

| Element          | Template                                                                                                                               | Notes                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `<title>`        | `{{Project_Title}} \| Aerial Cinematography in {{Location}} \| Ondra Hajek`                                                            | Aim for strong location + service; keep length reasonable (~60 chars where possible). |
| Meta description | `Watch {{Project_Title}}, a premier commercial production shot in {{Location}}. Featuring 4K FPV drone cinematography by Ondra Hajek.` | CTR-focused; location + format.                                                       |
| H1               | `{{Project_Title}}`                                                                                                                    | Must match visible hero title.                                                        |
| H2 (supporting)  | `Commercial Drone Filming in {{Location}}`                                                                                             | Local intent without repeating the H1.                                                |

Adjust copy only when CMS fields or character limits require it; preserve intent (brand + service + location).

---

## 4. Rich snippets — `VideoObject` JSON-LD

Every project page MUST output a `VideoObject` block in `<script type="application/ld+json">`. Do not ship a project URL without it when video metadata exists.

Use real values from the CMS/build (title, location, dates, thumbnail, file or embed URLs). Replace placeholders at build/request time.

**Required shape (illustrative):**

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "{{Project_Title}}",
  "description": "High-end drone cinematography and commercial production shot in {{Location}} by Ondra Hajek.",
  "thumbnailUrl": "https://ondrahajek.com/assets/thumbnails/{{slug-or-filename}}.jpg",
  "uploadDate": "{{ISO_8601_date}}",
  "contentUrl": "{{direct_video_url_if_available}}",
  "embedUrl": "{{vimeo_or_youtube_embed_url}}",
  "publisher": {
    "@type": "Organization",
    "name": "Ondra Hajek Cinematography",
    "logo": {
      "@type": "ImageObject",
      "url": "https://ondrahajek.com/assets/logo.png"
    }
  },
  "contentLocation": {
    "@type": "Place",
    "name": "{{Location}}"
  }
}
```

- If `contentUrl` is unknown, omit it only when the platform documents that embed-only is acceptable; prefer supplying both when available.
- Keep URLs absolute and HTTPS.

---

## 5. Agent checklist (before merging SEO-facing changes)

- [ ] EN/CS paths follow hybrid slug rules; project slugs stay branded-consistent.
- [ ] `hreflang` pairs are complete and reciprocal.
- [ ] Hub pages exist as clean URLs; filters use query params.
- [ ] Parameterized portfolio views canonicalize to the clean parent.
- [ ] Project layout matches header → H1 → meta bar → split columns → embed.
- [ ] Title, description, H1, and supporting H2 follow templates.
- [ ] `VideoObject` JSON-LD is present and valid JSON.
