export type TNext<R> = () => R;
export type TMiddleWare<R> = (next: TNext<R>) => R;
export type TKeyType = number | symbol | string;

export interface IPortal<D> {
  provide(data: D): void;
  inject(): D | undefined;
  key: TKeyType;
}

export function _exec<T extends Record<string, unknown>, R>(
  fn: () => R,
  state: T,
  contextStack: unknown[],
  index: number = 0
): R {
  try {
    const context = Object.create(state) as T;
    contextStack.push(context);

    return fn();
  } finally {
    contextStack.pop();
  }
}

export type TProvide<T> = (key: TKeyType, value: T) => void;
export type TInject<T> = (key: TKeyType) => T | undefined;

export function _createPortal<D, K extends TKeyType = symbol>(
  provide: TProvide<D>,
  inject: TInject<D>,
  key?: K
): IPortal<D> {
  const _key = key || Symbol();
  return {
    provide(data: D) {
      provide(_key, data);
    },
    inject() {
      return inject(_key);
    },
    get key() {
      return _key;
    },
  };
}

export function portalCompose() {
  const contextStack: Record<TKeyType, unknown>[] = [];

  function getCurrentContext() {
    return contextStack[contextStack.length - 1];
  }

  function provide<T>(key: TKeyType, value: T) {
    const ctx = getCurrentContext();
    ctx[key] = value;
  }

  function inject<T>(key: TKeyType): T | undefined {
    const ctx = getCurrentContext();
    return ctx[key] as T;
  }

  function exec<R>(fn: () => R): R {
    return _exec(fn, getCurrentContext(), contextStack);
  }

  function createPortal<D, K extends TKeyType = symbol>(key?: K): IPortal<D> {
    return _createPortal<D, K>(provide, inject, key);
  }

  return {
    createPortal,
    exec,
  };
}

export const onionRing = portalCompose();
