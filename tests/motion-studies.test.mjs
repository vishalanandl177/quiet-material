import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {initMotionStudies} from '../demo-motion.js';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
function setup(t, reduced=()=>false) {
  t.mock.timers.enable({apis:['setTimeout']});
  const {document}=new JSDOM(html,{url:'https://quiet.example/'}).window;
  const messages=[];
  const controls=initMotionStudies(document,{isReduced:reduced,announce:message=>messages.push(message)});
  t.after(()=>controls.destroy());
  return {document,controls,messages,studies:[...document.querySelectorAll('[data-motion-study]')]};
}

test('GIFs remain static until requested, finish once, and can be replayed',t=>{
  const {studies,messages}=setup(t);
  const study=studies[0],image=study.querySelector('img'),button=study.querySelector('button');
  assert.ok(image.src.endsWith('.png'));
  button.click();
  const first=image.src;
  assert.match(first,/\.gif\?play=/);
  assert.equal(button.getAttribute('aria-pressed'),'true');
  t.mock.timers.tick(Number(study.dataset.duration));
  assert.ok(image.src.endsWith('.png'));
  assert.equal(button.getAttribute('aria-pressed'),'false');
  assert.equal(messages.at(-1),'Animation complete.');
  button.click();
  assert.notEqual(image.src,first,'Replay must restart the image resource');
  button.click();
  assert.ok(image.src.endsWith('.png'),'Stop returns the static poster');
});

test('only one study moves and stopping all cancels delayed completion',t=>{
  const {studies,controls,messages}=setup(t);
  studies[0].querySelector('button').click();
  studies[1].querySelector('button').click();
  assert.ok(studies[0].querySelector('img').src.endsWith('.png'));
  controls.stopAll();
  const count=messages.length;
  t.mock.timers.tick(5000);
  assert.equal(messages.length,count);
  assert.ok(studies.every(study=>study.querySelector('img').src.endsWith('.png')));
});

test('reduced motion prevents playback and stops an already running study',t=>{
  let reduced=true;
  const {studies,controls,messages}=setup(t,()=>reduced);
  const image=studies[0].querySelector('img'),button=studies[0].querySelector('button');
  button.click();
  assert.ok(image.src.endsWith('.png'));
  assert.match(messages.at(-1),/Reduced motion/);
  reduced=false;button.click();
  assert.match(image.src,/\.gif\?play=/);
  reduced=true;controls.stopAll();
  assert.ok(image.src.endsWith('.png'));
});

test('motion source files and declared replay durations agree with the generated manifest',async t=>{
  const {studies}=setup(t);
  const manifest=JSON.parse(await readFile(new URL('../assets/motion/manifest.json',import.meta.url),'utf8'));
  for(const study of studies) {
    const recorded=manifest.studies[study.dataset.motionName];
    const image=study.querySelector('img');
    const gif=await readFile(new URL('../'+image.dataset.animation,import.meta.url));
    const poster=await readFile(new URL('../'+image.dataset.poster,import.meta.url));
    assert.match(gif.subarray(0,6).toString(),/^GIF8[79]a$/);
    assert.equal(gif.readUInt16LE(6),640);
    assert.equal(gif.readUInt16LE(8),400);
    assert.ok(gif.length<300000);
    assert.equal(gif.includes(Buffer.from('NETSCAPE2.0')),false,'No looping extension');
    assert.equal(poster.subarray(1,4).toString(),'PNG');
    assert.equal(Number(study.dataset.duration),recorded.totalMs);
    assert.equal(gif.length,recorded.gifBytes);
    assert.equal(image.dataset.animation,recorded.gif);
    assert.equal(image.dataset.poster,recorded.poster);
  }
});
