/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_PUBLIC_DEMO_ENABLED?: '0' | '1';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
