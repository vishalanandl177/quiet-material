import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.md':'text/plain; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.gif':'image/gif','.webp':'image/webp'};
createServer(async (req,res) => {
  try {
    if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405); res.end(); return;}
    const path = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if (path.split('/').some(part=>part.startsWith('.'))) {res.writeHead(404); res.end(); return;}
    let file = resolve(root, '.' + path);
    if (file !== root && !file.startsWith(root+sep)) {res.writeHead(403); res.end(); return;}
    if ((await stat(file)).isDirectory()) file=resolve(file,'index.html');
    const content = await readFile(file);
    res.writeHead(200, {'Content-Type':types[extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});
    res.end(req.method==='HEAD'?undefined:content);
  } catch {res.writeHead(404);res.end('Not found');}
}).listen(Number(process.env.PORT||4173),process.env.HOST||'127.0.0.1',()=>console.log('Quiet Material: http://127.0.0.1:'+(process.env.PORT||4173)));
