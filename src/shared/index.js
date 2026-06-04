export function createSharedTenantBundle({ tenant, overrides = {} } = {}) {
  console.log('This code runs for all tenants.');

  const sharedBundle = {
    version: '1.0.0',
    
    // shared methods
    getTenantDisplayName() {
      console.log(`${tenant.charAt(0).toUpperCase()}${tenant.slice(1)} Tenant`);
      return `${tenant.charAt(0).toUpperCase()}${tenant.slice(1)} Tenant`;
    },


  };

  return {
    ...sharedBundle,
    ...overrides
  };
}