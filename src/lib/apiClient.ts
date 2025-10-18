import { newHttpBatchRpcSession, type RpcStub } from 'capnweb';
import type { BackendApi } from './rpc';

function normalizeBase(value?: string): string | null {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }
  return trimmed.replace(/\/+$/, '');
}

const apiBase = ((): string => {
  const configured = normalizeBase(import.meta.env.PUBLIC_API_BASE);
  if (configured) {
    return configured;
  }
  if (import.meta.env.DEV) {
    const devFallback = normalizeBase(import.meta.env.PUBLIC_API_BASE_DEV);
    if (devFallback) {
      return devFallback;
    }
  }
  return '';
})();

export const API_ENDPOINT = apiBase ? `${apiBase}/api` : '/api';
const DISPOSE_SYMBOL = Symbol.for('dispose');

type DisposableStub = {
  [DISPOSE_SYMBOL]?: () => void;
};

function disposeStub(stub: RpcStub<BackendApi>): void {
  (stub as unknown as DisposableStub)[DISPOSE_SYMBOL]?.();
}

export function newBackendSession(): RpcStub<BackendApi> {
  return newHttpBatchRpcSession<BackendApi>(API_ENDPOINT);
}

export async function withBackendSession<T>(callback: (stub: RpcStub<BackendApi>) => Promise<T>): Promise<T> {
  const stub = newBackendSession();
  try {
    return await callback(stub);
  } finally {
    disposeStub(stub);
  }
}
