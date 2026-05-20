const { createSharedTenantBundle } = require('../../shared/index.js');
const { registerTenantBundle } = require('../../shared/tenant-bundle-registry.js');
const { FormSteps } = require('./step-mapper.cjs');

registerTenantBundle(
  'water',
  createSharedTenantBundle({
    tenant: 'water',
    overrides: {
      // Water-specific method override.
      init(options = {}) {
        return {
          tenant: 'water',
          initializedAt: new Date().toISOString(),
          options,
          isWaterOverride: true,
          formSteps: FormSteps
        };
      },
      getTenantDisplayName() {
        console.log('Newwwww Water Tenant stuff');
        return 'New-Water Tenant';
      },
      getFormSteps() {
        return FormSteps;
      }
    }
  })
);
