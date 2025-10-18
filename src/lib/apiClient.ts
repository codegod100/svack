import { newHttpBatchRpcSession, type RpcStub } from 'capnweb';
import type { BackendApi } from './rpc';

const apiBase = ((): string => {
  const configured = import.meta.env.PUBLIC_API_BASE?.trim();
  if (configured && configured.length > 0) {
    return configured.replace(/\/+$/, '');
  }
  return '';
})();

const API_ENDPOINT = `${apiBase}/api`;
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
