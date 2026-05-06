import { createSharedTenantBundle } from '../../shared/index.js';
import { registerTenantBundle } from '../../shared/tenant-bundle-registry.js';

registerTenantBundle(
	'fish',
	createSharedTenantBundle({
		tenant: 'fish'
	})
);
