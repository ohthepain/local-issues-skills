import { build } from 'esbuild';
import { copyFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
await build({entryPoints:['src/list-issues.ts'], outfile:'skills/issues/scripts/list-issues.mjs', bundle:true, platform:'node', format:'esm', target:'node22', banner:{js:"import { createRequire as bundleRequire } from 'node:module'; const require = bundleRequire(import.meta.url);"}, minify:true, legalComments:'eof'});
copyFileSync(require.resolve('yaml/package.json').replace('package.json','LICENSE'), 'skills/issues/scripts/YAML-LICENSE');
