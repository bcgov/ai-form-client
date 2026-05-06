import { build } from 'esbuild';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const KNOWN_TENANTS = new Set(['water', 'fish']);

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

const entryPoint = path.resolve('src', 'tenant', tenant, 'index.js');
const outDir = path.resolve('dist', 'tenants', tenant);

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const result = await build({
  entryPoints: [entryPoint],
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2020',
  sourcemap: false,
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
  file: outputFilename,
  cdnPath: cdnRelativePath,
  scriptTagExample: `<script src="https://cdn.example.com/${cdnRelativePath}"></script>`
};

await writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

console.log(`Built tenant bundle: dist/${cdnRelativePath}`);
console.log(`Manifest written: dist/tenants/${tenant}/manifest.json`);