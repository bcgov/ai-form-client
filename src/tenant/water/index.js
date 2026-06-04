// Water-specific method overrides.
function getTenantDisplayName() {
  console.log('override water display name');
}

// new method only for water tenant bundle
function newWaterMethod() {
  console.log('new water method');
}


console.log('only shown for water tenant');
getTenantDisplayName();
newWaterMethod();

import { showStepMap } from './step-mapper.js';

showStepMap();