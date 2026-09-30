/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional GitHub token for higher rate limits (see .env.example). */
  readonly VITE_GITHUB_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
