import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const srcRoot = path.join(repoRoot, 'src');
const tenantRoot = path.join(srcRoot, 'tenant');
const outputRoot = path.join(repoRoot, 'dist', 'tenants');

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { tenant: undefined };

  for (const arg of args) {
    if (arg.startsWith('--tenant=')) {
      result.tenant = arg.split('=')[1];
    } else if (arg === '--tenant') {
      const next = args[args.indexOf(arg) + 1];
      if (next && !next.startsWith('--')) {
        result.tenant = next;
      }
    }
  }

  return result;
}

async function listTenants() {
  const entries = await fs.readdir(tenantRoot, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

async function buildTenant(tenant) {
  const tenantEntry = path.join(tenantRoot, tenant, 'index.js');
  const sharedEntry = path.join(srcRoot, 'shared', 'index.js');

  await fs.access(tenantEntry);
  await fs.access(sharedEntry);

  const destDir = path.join(outputRoot, tenant);
  await fs.mkdir(destDir, { recursive: true });

  const entrySource = `globalThis.tenant = ${JSON.stringify(tenant)};
import './shared/index.js';
import './tenant/${tenant}/index.js';
`;

  await esbuild.build({
    stdin: {
      contents: entrySource,
      resolveDir: srcRoot,
      sourcefile: `build-${tenant}.js`,
    },
    bundle: true,
    platform: 'browser',
    format: 'iife',
    outfile: path.join(destDir, 'client.js'),
    sourcemap: false,
    minify: false,
  });

  const manifest = {
    tenant,
    entry: `src/tenant/${tenant}/index.js`,
    shared: 'src/shared/index.js',
    output: 'client.js',
    builtAt: new Date().toISOString(),
  };

  await fs.writeFile(path.join(destDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`Built tenant bundle: ${tenant} -> ${path.relative(repoRoot, destDir)}/client.js`);
}

async function main() {
  const args = parseArgs();
  const tenants = args.tenant ? [args.tenant] : await listTenants();

  if (tenants.length === 0) {
    throw new Error('No tenant directories were found under src/tenant.');
  }

  for (const tenant of tenants) {
    try {
      await buildTenant(tenant);
    } catch (error) {
      console.error(`Failed to build tenant '${tenant}':`, error.message);
      process.exitCode = 1;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
