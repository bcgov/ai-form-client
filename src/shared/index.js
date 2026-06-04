
    
// shared methods

console.log('This is shared code that is included in all tenant bundles.');

function sharedMethod() {
  console.log('This method is shared across all tenants.');
}
sharedMethod();

function getTenantDisplayName() {
  console.log(`${tenant.charAt(0).toUpperCase()}${tenant.slice(1)} Tenant`);
  return `${tenant.charAt(0).toUpperCase()}${tenant.slice(1)} Tenant`;
}
