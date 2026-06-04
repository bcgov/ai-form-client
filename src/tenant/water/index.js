import { createSharedTenantBundle } from '../../shared/index.js';
import { registerTenantBundle } from '../../shared/tenant-bundle-registry.js';
// import { FormSteps } from './step-mapper.js';

registerTenantBundle(
  'water',
  createSharedTenantBundle({
    tenant: 'water',
    overrides: waterOverrides
  })
);

const waterOverrides = {

  
  // Water-specific method overrides.
  getTenantDisplayName() {
    console.log('Newwwww Water Tenant stuff');
    return 'New-Water Tenant';
  },

  testWater() {
    console.log('water method');
  }
};


