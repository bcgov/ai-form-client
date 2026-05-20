# Tenant-Specific Build And Azure Deployment

This project builds and deploys tenant-specific JavaScript bundles to separate Azure Storage/CDN targets.
Each build emits a static client.js file that can be loaded by a remote app through a CDN script tag.

## Module Import Pattern

Tenant entrypoints:

- `src/tenant/water/index.js`
- `src/tenant/fish/index.js`

Shared code:

- `src/shared/tenant-bundle-registry.js`

Example pattern used:

```js
import { registerTenantBundle } from '../../shared/tenant-bundle-registry.js';

registerTenantBundle('water', {
  version: '1.0.0',
  init(options = {}) {
    return { tenant: 'water', options };
  }
});
```

Each tenant bundle registers itself in `window.AIFormTenantBundles` so remote apps can read and initialize it after loading the script.

## CDN Script Usage

After deployment, a remote app can use:

```html
<script src="https://cdn.example.com/tenants/water/client.js"></script>
<script>
  const waterBundle = window.AIFormTenantBundles.water;
  const initialized = waterBundle.init({ locale: 'en-CA' });
  console.log(initialized);
</script>
```

Each tenant output also includes a manifest file:

```js
// dist/tenants/water/manifest.json
{
  "tenant": "water",
  "file": "client.js",
  "cdnPath": "tenants/water/client.js",
  "scriptTagExample": "<script src=\"https://cdn.example.com/tenants/water/client.js\"></script>"
}
```

## Build Commands

Install dependencies:

```bash
npm install
```

Build one tenant at a time:

```bash
npm run build:water
npm run build:fish
```

Output bundles:

- `dist/tenants/water/client.js`
- `dist/tenants/fish/client.js`
- `dist/tenants/<tenant>/manifest.json`

## GitHub Actions

Workflows:

- `.github/workflows/deploy-water.yml` (trigger wrapper)
- `.github/workflows/deploy-fish.yml` (trigger wrapper)
- `.github/workflows/deploy-tenant-reusable.yml` (shared build/deploy implementation)

Trigger behavior:

- Water workflow runs only when `src/tenant/water/**` or shared build files change on `dev`, `test`, or `main`.
- Fish workflow runs only when `src/tenant/fish/**` or shared build files change on `dev`, `test`, or `main`.
- Both wrappers call the same reusable workflow via `workflow_call` and pass tenant plus deployment environment values.
- Branch-to-environment mapping in wrappers:
  - `dev` branch deploys to `dev`
  - `test` branch deploys to `test`
  - `main` branch deploys to `prod`

## Required GitHub Environment Secrets

Create shared GitHub environments:

- `dev`
- `test`
- `prod`

For each shared environment, set these secrets:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `STORAGE_ACCOUNT_NAME`
- `CDN_RESOURCE_GROUP`
- `CDN_PROFILE_NAME`
- `CDN_ENDPOINT_NAME`

The workflows use Azure OIDC login (`azure/login@v2`) and then:

1. Upload tenant build output to the target storage account static website container (`$web`).
2. Purge the tenant CDN endpoint.

## Notes

- Do not create separate GitHub environments per tenant. Both tenants deploy through the shared `dev`, `test`, and `prod` environments.
- Keep each tenant in its own storage account/CDN endpoint by setting tenant-specific secret values (for example by environment and deployment context).
- If shared files (`src/index.js`, `src/shared/tenant-bundle-registry.js`, build script) change, both tenant workflows may run when those files are in each workflow path filter.