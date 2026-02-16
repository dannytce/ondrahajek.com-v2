/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DATOCMS_API_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
