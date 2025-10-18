import { defineConfig } from '@rsbuild/core';
import { pluginSvelte } from '@rsbuild/plugin-svelte';

function normalizeBase(value?: string | null): string | null {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }
  return trimmed.replace(/\/+$/, '');
}

const isDev = process.env.NODE_ENV !== 'production';
const configuredBase = normalizeBase(process.env.PUBLIC_API_BASE ?? null);
const devFallbackBase = normalizeBase(process.env.PUBLIC_API_BASE_DEV ?? 'http://127.0.0.1:8787');
const publicApiBase = configuredBase ?? (isDev ? devFallbackBase ?? '' : '');
const envDefine = {
  DEV: isDev,
  PROD: !isDev,
  MODE: isDev ? 'development' : 'production',
  PUBLIC_API_BASE: publicApiBase,
  PUBLIC_API_BASE_DEV: devFallbackBase ?? '',
};

export default defineConfig({
  plugins: [pluginSvelte()],
  source: {
    define: {
      'import.meta.env': `(${JSON.stringify(envDefine)})`,
      'navigator.userAgent === "Cloudflare-Workers"': 'false',
    },
  },
});
