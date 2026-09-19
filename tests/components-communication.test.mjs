import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {initCommunicationComponents, mountProgress, setProgress, mountLoadingIndicator, circularProgressFrame, linearProgressFrame} from '../src/components-communication.js';

function communicationFixture(t, markup) {
  const dom=new JSDOM(`<!doctype html><body>${markup}`,{url:'https://quiet.test/'});
  dom.window.matchMedia=()=>({matches:true});
  t.after(()=>dom.window.close()); return dom.window;
}

test('circular progress clamps values, keeps ARIA in sync, and supports indeterminate switching',t=>{
  const {document}=communicationFixture(t,'<div id="progress" data-qm-progress="circular" aria-label="Upload"></div>');
  const host=document.getElementById('progress'), handle=mountProgress(host,{value:25,max:50});
  assert.equal(host.getAttribute('aria-valuenow'),'25');assert.equal(host.getAttribute('aria-valuemax'),'50');
  assert.equal(host.querySelector('.qm-progress-circular__indicator').getAttribute('stroke-dasharray'),'50 100');
  handle.setValue(80);assert.equal(host.getAttribute('aria-valuenow'),'50');
  handle.setValue(null);assert.equal(host.hasAttribute('aria-valuenow'),false);
  setProgress(host,NaN,0);assert.equal(host.hasAttribute('aria-valuenow'),false);assert.equal(host.dataset.max,'100');
  handle.destroy();handle.destroy();assert.equal(host.children.length,0);
});

test('linear progress clears animation frame styles when changing to determinate',t=>{
  const {document}=communicationFixture(t,'<div data-qm-progress="linear" aria-label="Sync"></div>');
  const host=document.querySelector('div'), handle=mountProgress(host);
  const segment=host.firstElementChild;segment.style.width='12%';segment.style.insetInlineStart='34%';
  handle.setValue(60);assert.equal(segment.style.width,'');assert.equal(segment.style.insetInlineStart,'');
  assert.equal(host.style.getPropertyValue('--qm-progress-fraction'),'0.6');handle.destroy();
});

test('MD3 progress frames stay finite and periodic without jumping the circular arc',()=>{
  for(let time=0;time<10800;time+=17){
    const {sweep,start}=circularProgressFrame(time);assert.ok(Number.isFinite(start));assert.ok(sweep>=19.9&&sweep<=270.1);
    for(const {start,end} of linearProgressFrame(time)){assert.ok(start>=0&&start<=1);assert.ok(end>=0&&end<=1);}
  }
  assert.deepEqual(circularProgressFrame(5400),circularProgressFrame(0));
  assert.deepEqual(linearProgressFrame(1800),linearProgressFrame(0));
});

test('loading indicator has a static accessible reduced-motion presentation',t=>{
  const {document}=communicationFixture(t,'<div aria-label="Loading"></div>');
  const host=document.querySelector('div'), handle=mountLoadingIndicator(host);
  assert.equal(host.getAttribute('role'),'progressbar');assert.equal(host.hasAttribute('aria-valuenow'),false);
  assert.equal(host.querySelector('svg').getAttribute('aria-hidden'),'true');assert.match(host.querySelector('path').getAttribute('d'),/^M.+Z$/);
  handle.destroy();assert.equal(host.children.length,0);
});

test('rich tooltip opens on touch-equivalent click and closes on Escape with focus restored',t=>{
  const win=communicationFixture(t,'<button id="help" data-qm-rich-tooltip="tip" aria-controls="tip" aria-expanded="false">Help</button><div id="tip" class="qm-rich-tooltip" role="dialog" aria-label="Help details" hidden><p>Details</p><button data-qm-rich-tooltip-close>Close</button></div>');
  const doc=win.document,cleanup=initCommunicationComponents(doc),trigger=doc.getElementById('help'),panel=doc.getElementById('tip');
  assert.equal(initCommunicationComponents(doc),cleanup);trigger.click();
  assert.equal(panel.hidden,false);assert.equal(doc.activeElement,panel);assert.equal(trigger.getAttribute('aria-expanded'),'true');
  panel.dispatchEvent(new win.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
  assert.equal(panel.hidden,true);assert.equal(doc.activeElement,trigger);cleanup();cleanup();
});
