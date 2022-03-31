require('esbuild').build({
  bundle: true,
  entryPoints: ["src/main.ts"],
  outdir: "./dist",
  platform: 'node',
  sourcemap: true,
}).catch(() => process.exit(1))