/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DATOCMS_API_TOKEN: string
  /** Portfolio single-line string field API identifier for tag keys (`;`-separated). Default tags */
  readonly DATOCMS_PORTFOLIO_TAGS_FIELD?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
