import {readFile,writeFile,mkdir} from 'node:fs/promises';
const read = path=>readFile(new URL('../'+path,import.meta.url),'utf8');
let html = await read('index.html');
const tokens = await read('styles/tokens.css');
const styles = (await read('styles/quiet-material.css')).replace(/@import[^;]+;/g,'');
html=html.replace('<link rel="stylesheet" href="styles/quiet-material.css">','<style>'+tokens+'\n'+styles+'</style>');
html=html.replace('<link rel="stylesheet" href="demo.css">','<style>'+await read('demo.css')+'</style>');
let module = await read('src/quiet-material.js');
let demo = (await read('demo.js')).replace(/^import .*?;\s*/gm,'');
const motion = await read('demo-motion.js');
html=html.replace('<script type="module" src="demo.js"></script>','<script type="module">\n'+module+'\n'+motion+'\n'+demo+'\n</script>');
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
