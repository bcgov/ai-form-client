import { registerTenantBundle } from '../../shared/tenant-bundle-registry.js';

registerTenantBundle('water', {
	version: '1.0.0',
	init(options = {}) {
		return {
			tenant: 'water',
			initializedAt: new Date().toISOString(),
			options
		};
	}
});

const waterBundleRegistry = globalThis.AIFormTenantBundles;

if (waterBundleRegistry?.water) {
	Object.defineProperty(waterBundleRegistry.water, 'dummyWaterOnlyMethod', {
		value: function dummyWaterOnlyMethod() {
			return 'water-only-dummy-method';
		},
		enumerable: true
	});
}
