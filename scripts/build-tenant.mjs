/**
 * This file is responsible for building a tenant-specific bundle using esbuild. 
 * It looks for an entry point in the tenant's directory, bundles it along with shared code, 
 * and outputs the result to the dist/tenants/{tenant} directory. 
 * It also generates a manifest.json file with metadata about the built bundle.
 */

import { build } from 'esbuild';
import { access, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const KNOWN_TENANTS = new Set(['water', 'fish']);
const ENTRY_FILE_CANDIDATES = ['index.cjs', 'index.js'];

async function resolveTenantEntryPoint(tenantName) {
  for (const filename of ENTRY_FILE_CANDIDATES) {
    const candidatePath = path.resolve('src', 'tenant', tenantName, filename);
    try {
      await access(candidatePath);
      return candidatePath;
    } catch {
      // Try the next candidate entry filename.
    }
  }

  return null;
}

function getArgValue(flagName) {
  const index = process.argv.indexOf(flagName);
  if (index === -1) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

function getPositionalTenantArg() {
  const args = process.argv.slice(2);
  for (const arg of args) {
    if (!arg.startsWith('-')) {
      return arg;
    }
  }

  return null;
}

const tenant = getArgValue('--tenant') ?? getPositionalTenantArg();

if (!tenant) {
  console.error('Missing --tenant argument. Example: npm run build:tenant -- --tenant water');
  process.exit(1);
}

if (!KNOWN_TENANTS.has(tenant)) {
  console.error(`Unsupported tenant "${tenant}". Supported tenants: ${[...KNOWN_TENANTS].join(', ')}`);
  process.exit(1);
}

const entryPoint = await resolveTenantEntryPoint(tenant);

if (!entryPoint) {
  console.error(
    `No entrypoint found for tenant "${tenant}". Expected one of: ${ENTRY_FILE_CANDIDATES.join(', ')}`
  );
  process.exit(1);
}

const outDir = path.resolve('dist', 'tenants', tenant);

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const result = await build({
  entryPoints: [entryPoint],
  bundle: true,
  // minify: true,
  minify: false,
  format: 'iife',
  target: 'es2020',
  // sourcemap: false,
  sourcemap: true,
  outdir: outDir,
  entryNames: 'app.[hash]',
  metafile: true,
  define: {
    __TENANT__: JSON.stringify(tenant)
  }
});

const metafileOutputs = Object.entries(result.metafile.outputs);
const outputEntry = metafileOutputs.find(([, value]) => value.entryPoint)?.[0] ?? null;

if (!outputEntry) {
  console.error(`Failed to resolve output bundle for tenant "${tenant}".`);
  process.exit(1);
}

const outputFilename = path.basename(outputEntry);
const cdnRelativePath = `tenants/${tenant}/${outputFilename}`;

const manifest = {
  tenant,
  sourceEntry: path.basename(entryPoint),
  file: outputFilename,
  cdnPath: cdnRelativePath,
  scriptTagExample: `<script src="https://cdn.example.com/${cdnRelativePath}"></script>`
};

await writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

console.log(`Built tenant bundle: dist/${cdnRelativePath}`);
console.log(`Manifest written: dist/tenants/${tenant}/manifest.json`);