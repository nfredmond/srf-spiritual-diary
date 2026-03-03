/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SRF_ALLOW_OM_SYMBOL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
