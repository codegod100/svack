/// <reference types="@rsbuild/core/types" />
/// <reference types="svelte" />

interface ImportMetaEnv {
  readonly PUBLIC_API_BASE?: string;
  readonly PUBLIC_API_BASE_DEV?: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
