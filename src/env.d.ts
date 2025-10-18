/// <reference types="@rsbuild/core/types" />
/// <reference types="svelte" />

interface ImportMetaEnv {
  readonly PUBLIC_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
