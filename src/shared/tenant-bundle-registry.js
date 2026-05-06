const REGISTRY_KEY = 'AIFormTenantBundles';

export function registerTenantBundle(tenantName, bundleApi) {
  const globalObject = globalThis;
  const registry = globalObject[REGISTRY_KEY] ?? {};

  registry[tenantName] = {
    tenant: tenantName,
    ...bundleApi
  };

  globalObject[REGISTRY_KEY] = registry;

  if (typeof globalObject.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
    globalObject.dispatchEvent(
      new CustomEvent('ai-form-tenant-ready', {
        detail: {
          tenant: tenantName,
          registryKey: REGISTRY_KEY
        }
      })
    );
  }
}

export function getTenantBundle(tenantName) {
  const globalObject = globalThis;
  const registry = globalObject[REGISTRY_KEY] ?? {};
  return registry[tenantName] ?? null;
}