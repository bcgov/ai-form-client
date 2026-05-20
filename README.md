# Tenant-Specific Build And Azure Deployment

This project deploys tenant-specific assets to separate Azure Storage targets.
Each build:
-  bundles and uploads a static JavaScript client.js file from shared and tenant-specific sources to the target storage account static website container (`$web`)
-  uploads tenant-specific 'assets' (required for AI Form Assistant)

## Javascript bundling

### Module Import Pattern

- Tenant entrypoints, eg:
  - `src/tenant/water/index.js`
  - `src/tenant/fish/index.js`
- Shared code:
  - `src/shared/index.js`

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

### CDN Script Usage

After deployment, a remote app can use:

```html
<script src="https://cdn.example.com/scripts/tenants/fish/client.js"></script>
<script>
  const waterBundle = window.AIFormTenantBundles.water;
  const initialized = waterBundle.init({ locale: 'en-CA' });
  console.log(initialized);
</script>
```

### Build Commands

Install dependencies:

```bash
npm install
```

Build one tenant at a time:

```bash
npm run build:<tenant>
```

Output bundles:

- `dist/tenants/<tenant>/client.js`
- `dist/tenants/<tenant>/manifest.json`


## Tennant-specific Assets are uploaded

Assets for each tenant in `src/tenant/<tenant>/assets` are uploaded to configured storage container (`Assets`) to location `tenants/<tenant>/<files>`. The This Assets container is only reachable by Azure services within our private subnet.  

## GitHub Actions

Workflows:

- `.github/workflows/deploy-<tenant>.yml` (trigger wrapper)
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

The workflows use Azure OIDC login (`azure/login@v2`) and then:

1. Uploads tenant build output to the target storage account static website container (`$web`).

