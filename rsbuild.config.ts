import { defineConfig } from '@rsbuild/core';
import { pluginSvelte } from '@rsbuild/plugin-svelte';

const publicApiBase = process.env.PUBLIC_API_BASE ?? '';

export default defineConfig({
  plugins: [pluginSvelte()],
  source: {
    define: {
      'import.meta.env.PUBLIC_API_BASE': JSON.stringify(publicApiBase),
    },
  },
});
