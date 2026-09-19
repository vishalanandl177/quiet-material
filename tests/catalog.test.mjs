import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {JSDOM} from 'jsdom';

test('the shipped explorer initializes every catalog family and its composed interactions work together', async t => {
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const catalog=JSON.parse(await readFile(new URL('../exports/quiet-material.components.json',import.meta.url),'utf8'));
  const dom=new JSDOM(html,{url:'https://quiet.test/#components',pretendToBeVisual:true});
  const win=dom.window,doc=win.document;
  win.matchMedia=query=>({matches:true,media:query,addEventListener(){},removeEventListener(){}});
  win.scrollTo=()=>{};win.HTMLElement.prototype.scrollIntoView=()=>{};
  // Native dialog presentation needs real browser review. These stubs exercise
  // composition/state ownership only, not top-layer focus containment.
  win.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  win.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new win.Event('close'));};
  const globals={window:win,document:doc,location:win.location,getComputedStyle:win.getComputedStyle.bind(win),requestAnimationFrame:win.requestAnimationFrame.bind(win),cancelAnimationFrame:win.cancelAnimationFrame.bind(win)};
  const old=Object.fromEntries(Object.keys(globals).map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
  Object.assign(globalThis,globals);
  t.after(()=>{win.close();for(const key of Object.keys(globals)){if(old[key])Object.defineProperty(globalThis,key,old[key]);else delete globalThis[key];}});
  await import('../demo.js');
  assert.equal(catalog.families.length,36);
  const names=[...doc.querySelectorAll('[data-family]')].map(node=>node.dataset.family);
  assert.deepEqual(names.sort(),catalog.families.map(item=>item.id).sort());
  for(const family of catalog.families){
    assert.ok(doc.getElementById(family.example.split('#')[1]),family.id+' has a navigable example');
    await access(new URL('../'+family.guide,import.meta.url));
  }
  const ids=[...doc.querySelectorAll('[id]')].map(node=>node.id);
  assert.equal(new Set(ids).size,ids.length,'Mounting pickers must not introduce duplicate IDs');
  for(const element of doc.querySelectorAll('[aria-controls],[aria-labelledby],[aria-describedby],[aria-activedescendant]')){
    for(const attr of ['aria-controls','aria-labelledby','aria-describedby','aria-activedescendant']){
      for(const id of (element.getAttribute(attr)||'').split(/\s+/).filter(Boolean))assert.ok(doc.getElementById(id),attr+' resolves '+id);
    }
  }
  const search=doc.querySelector('#component-search');search.value='date picker';search.dispatchEvent(new win.Event('input',{bubbles:true}));
  assert.equal([...doc.querySelectorAll('.specimen')].filter(node=>!node.hidden).length,1);
  assert.equal(doc.querySelector('[data-family="date-pickers"]').hidden,false);
  doc.querySelector('[data-component-category="communication"]').click();
  doc.querySelector('#demo-archive').click();
  assert.match(doc.querySelector('#snackbar-demo-state').textContent,/archived/);
  doc.querySelector('.qm-snackbar-action').click();await Promise.resolve();
  assert.match(doc.querySelector('#snackbar-demo-state').textContent,/back/);
  const progress=doc.querySelector('#demo-progress-value');progress.value='90';progress.dispatchEvent(new win.Event('input',{bubbles:true}));
  assert.ok([...doc.querySelectorAll('[data-demo-progress]')].every(node=>node.getAttribute('aria-valuenow')==='90'));
  const all=doc.querySelector('#export-all');assert.equal(all.indeterminate,true);all.click();
  assert.ok([...doc.querySelectorAll('[data-export-part]')].every(node=>node.checked));
});
