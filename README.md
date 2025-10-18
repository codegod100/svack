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

Then start the Svelte dev server. By default the frontend will talk to `http://127.0.0.1:8787`, matching Wrangler's default.

```bash
pnpm dev
```

Override the target by exporting `PUBLIC_API_BASE` (or `PUBLIC_API_BASE_DEV` while developing) if your Worker runs elsewhere.

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
- `PUBLIC_API_BASE_DEV`: optional, development-only base URL. Defaults to `http://127.0.0.1:8787` when `PUBLIC_API_BASE` is omitted so the UI can reach a locally running Worker on the Wrangler dev port.

## Useful references

- [Cap'n Web README](https://github.com/cloudflare/capnweb)
- [Cloudflare Workers docs](https://developers.cloudflare.com/workers/)
- [Rsbuild documentation](https://rsbuild.rs)
