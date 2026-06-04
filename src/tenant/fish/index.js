// Water-specific method overrides.
function getTenantDisplayName() {
  console.log('override water display name');
}

// new method only for water tenant bundle
function newFishMethod() {
  console.log('new fish method');
}


console.log('only shown for fish tenant');
getTenantDisplayName();
newFishMethod();