import {readFile,writeFile,mkdir} from 'node:fs/promises';
const read = path=>readFile(new URL('../'+path,import.meta.url),'utf8');
let html = await read('index.html');
async function inlineStyles(path, seen = new Set()) {
  if (seen.has(path)) return ''; seen.add(path);
  let css = await read(path);
  for (const match of [...css.matchAll(/@import\s+['"]\.\/([^'"]+)['"];?/g)]) {
    css = css.replace(match[0], await inlineStyles(path.slice(0,path.lastIndexOf('/')+1)+match[1], seen));
  }
  return css;
}
const styles = await inlineStyles('styles/quiet-material.css');
html=html.replace('<link rel="stylesheet" href="styles/quiet-material.css">','<style>'+styles+'</style>');
html=html.replace('<link rel="stylesheet" href="demo.css">','<style>'+await read('demo.css')+'</style>');
const withoutImports = source => source.replace(/^import[\s\S]*?;\s*/gm,'').replace(/^export\s*\{[^}]*\}\s*from\s*['"][^'"]+['"];?\s*/gm,'');
const contract = await read('exports/quiet-material.motion.js');
const engine = withoutImports(await read('src/motion.js'));
let module = withoutImports(await read('src/quiet-material.js'));
const componentModules = await Promise.all(['actions','navigation','input','communication'].map(async name => withoutImports(await read(`src/components-${name}.js`))));
let demo = (await read('demo.js')).replace(/^import .*?;\s*/gm,'');
const motion = await read('demo-motion.js');
html=html.replace('<script type="module" src="demo.js"></script>','<script type="module">\n'+[contract,engine,...componentModules,module,motion,demo].join('\n')+'\n</script>');
// Include posters, opt-in GIF sources and concepts, so the visual explorer travels together.
const assets = [...new Set([...html.matchAll(/(?:src|data-poster|data-animation)="(assets\/[^\"]+)"/g)].map(match=>match[1]))];
for (const path of assets) {
  const bytes = await readFile(new URL('../'+path,import.meta.url));
  const mime = path.endsWith('.gif') ? 'image/gif' : 'image/png';
  html = html.replaceAll('"'+path+'"', '"data:'+mime+';base64,'+bytes.toString('base64')+'"');
}
await mkdir(new URL('../dist/',import.meta.url),{recursive:true});
await writeFile(new URL('../dist/quiet-material-preview.html',import.meta.url),html);
console.log('Created dist/quiet-material-preview.html (self-contained component explorer; repository documentation links require the full checkout).');
