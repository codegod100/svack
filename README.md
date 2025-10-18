# Cap'n Web demo

This project pairs a Svelte 5 UI with a Cloudflare Worker backend using [Cap'n Web](https://github.com/cloudflare/capnweb) for RPC. The frontend lives at the repository root (`src/`) and the Worker code is under `backend/`.

## Prerequisites

- Node.js 20+
- `pnpm` 8+

Install dependencies once:

```bash
pnpm install
```

## Running locally

Start the Cloudflare Worker in one terminal:

```bash
pnpm backend:dev
```

Then start the Svelte dev server, pointing it at the Worker URL that Wrangler exposes (defaults to `http://127.0.0.1:8787`):

```bash
PUBLIC_API_BASE=http://127.0.0.1:8787 pnpm dev
```

The UI will be available at [http://localhost:3000](http://localhost:3000) and all RPC calls are routed to the Worker via Cap'n Web.

## Building and previewing the frontend

```bash
# Production build (outputs to dist/)
pnpm build

# Serve the production bundle
pnpm preview
```

## Worker deployment

Deploy the Worker with Wrangler (requires Cloudflare credentials configured locally):

```bash
pnpm backend:deploy
```

The deployed Worker exposes the RPC endpoint at `/api`, which the frontend targets via the `PUBLIC_API_BASE` environment variable.

## Configuration

- `PUBLIC_API_BASE`: optional, base URL for the Cap'n Web endpoint. Leave unset to use same-origin `/api` paths (e.g., when the Worker is fronted by the same host); set it when developing locally or when the Worker runs on a different domain.

## Useful references

- [Cap'n Web README](https://github.com/cloudflare/capnweb)
- [Cloudflare Workers docs](https://developers.cloudflare.com/workers/)
- [Rsbuild documentation](https://rsbuild.rs)
