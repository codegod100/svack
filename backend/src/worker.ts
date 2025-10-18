import { newWorkersRpcResponse, RpcTarget } from 'capnweb';
import type { BackendApi, GreetingRecord, ServerInfo } from '../../src/lib/rpc';

const startedAt = Date.now();

class GreetingService extends RpcTarget implements BackendApi {
  private history: GreetingRecord[] = [];

  greet(name: string): GreetingRecord {
    const sanitized = name?.trim() ?? '';
    const effectiveName = sanitized.length > 0 ? sanitized : 'there';

    const record: GreetingRecord = {
      name: effectiveName,
      message: `Hello, ${effectiveName}!`,
      createdAt: new Date().toISOString(),
    };

    this.history.unshift(record);
    this.history = this.history.slice(0, 10);

    return record;
  }

  getRecentGreetings(limit = 5): GreetingRecord[] {
    if (!Number.isFinite(limit) || limit <= 0) {
      return [];
    }

    const normalizedLimit = Math.min(Math.trunc(limit), this.history.length);
    return this.history.slice(0, normalizedLimit);
  }

  getServerInfo(): ServerInfo {
    const uptimeSeconds = Math.floor((Date.now() - startedAt) / 1000);
    return {
      version: '1.0.0',
      uptimeSeconds,
      recentGreetingCount: this.history.length,
    };
  }
}

const service = new GreetingService();

type CorsOptions = {
  origin: string | null;
  requestHeaders?: string | null;
};

function applyCors(response: Response, { origin, requestHeaders }: CorsOptions): Response {
  const allowOrigin = origin ?? '*';
  const allowHeaders = requestHeaders?.length ? requestHeaders : 'Content-Type';

  response.headers.set('Access-Control-Allow-Origin', allowOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', allowHeaders);
  response.headers.append('Vary', 'Origin');
  if (requestHeaders) {
    response.headers.append('Vary', 'Access-Control-Request-Headers');
  }
  return response;
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const requestedHeaders = request.headers.get('Access-Control-Request-Headers');

    if (url.pathname === '/api') {
      if (request.method === 'OPTIONS') {
        return applyCors(new Response(null, { status: 204 }), {
          origin,
          requestHeaders: requestedHeaders,
        });
      }

      const response = await newWorkersRpcResponse(request, service);
      return applyCors(response, { origin, requestHeaders: requestedHeaders });
    }

    if (url.pathname === '/health') {
      return new Response('ok');
    }

    return new Response('Not found', { status: 404 });
  },
};
