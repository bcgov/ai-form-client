import { getTenantBundle } from './shared/tenant-bundle-registry.js';

const tenant = document.documentElement.dataset.tenant || window.__TENANT__ || 'water';

const loaders = {
	water: () => import('./tenant/water/index.cjs'),
	fish: () => import('./tenant/fish/index.cjs')
};

const loadTenant = loaders[tenant];

if (!loadTenant) {
	throw new Error(`Unsupported tenant "${tenant}". Expected one of: ${Object.keys(loaders).join(', ')}`);
}

await loadTenant();

const tenantBundle = getTenantBundle(tenant);

if (!tenantBundle) {
	throw new Error(`Tenant bundle "${tenant}" did not register correctly.`);
}

const displayName = tenantBundle.getTenantDisplayName();

console.log('Loaded tenant bundle:', tenantBundle.tenant);
console.log('Display name:', displayName);
