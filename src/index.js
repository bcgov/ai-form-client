const tenant = document.documentElement.dataset.tenant || window.__TENANT__ || 'water';

const loaders = {
	water: () => import('./tenant/water/index.js'),
	fish: () => import('./tenant/fish/index.js')
};

const loadTenant = loaders[tenant];

if (!loadTenant) {
	throw new Error(`Unsupported tenant "${tenant}". Expected one of: ${Object.keys(loaders).join(', ')}`);
}

await loadTenant();
