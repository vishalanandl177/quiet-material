import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { animateMaterial, cancelMotion, motionReduced, transitionView } from '../src/motion.js';
import { quietMotion } from '../exports/quiet-material.motion.js';

// Contract tests use a deliberately small WAAPI recorder. They verify generated
// frames, immediate state, cancellation and DOM ownership, not rendered motion.
function fixture(t, { reduced = false, waapi = true } = {}) {
  const dom = new JSDOM(`<!doctype html><html><body>
    <section id="from" style="border-radius:24px"><label for="field">Name</label><input id="field" name="name" value="Initial"><span role="status" aria-live="polite">Ready</span></section>
    <section id="to" style="border-radius:32px" hidden><button id="next">Continue</button></section>
  </body></html>`, { pretendToBeVisual: true });
  const { window } = dom;
  const { document } = window;
  const media = new window.EventTarget();
  media.matches = reduced;
  window.matchMedia = () => media;
  const from = document.getElementById('from');
  const to = document.getElementById('to');
  from.getBoundingClientRect = () => ({ left: 20, top: 30, width: 120, height: 80 });
  to.getBoundingClientRect = () => ({ left: 40, top: 60, width: 320, height: 200 });
  const animations = [];
  if (waapi) {
    window.Element.prototype.animate = function animate(keyframes, options) {
      let finish;
      let reject;
      const animation = {
        element: this, keyframes, options, cancelled: false,
        finished: new Promise((resolve, failed) => { finish = resolve; reject = failed; }),
        cancel() { this.cancelled = true; reject(new Error('Cancelled')); },
        finish() { finish(); },
      };
      animations.push(animation);
      return animation;
    };
  }
  t.after(() => { cancelMotion(document); window.close(); });
  const update = () => { from.hidden = true; to.hidden = false; };
  const motion = (options = {}) => transitionView({ from, to, update, ...options });
  return { window, document, from, to, media, animations, motion, update };
}

test('transition state is synchronous and temporary snapshots are inert, anonymous and current', async (t) => {
  const { document, from, to, animations, motion } = fixture(t);
  document.getElementById('field').value = 'Edited value';
  const handle = motion();
  assert.equal(from.hidden, true);
  assert.equal(to.hidden, false);
  const snapshot = document.querySelector('[data-qm-motion-snapshot]');
  assert.equal(snapshot.getAttribute('aria-hidden'), 'true');
  assert.equal(snapshot.hasAttribute('inert'), true);
  assert.equal(snapshot.style.pointerEvents, 'none');
  assert.equal(snapshot.querySelector('[id], [name], [aria-live], [role], [for]'), null);
  assert.equal(snapshot.querySelector('input').value, 'Edited value');
  assert.equal(document.querySelectorAll('#from').length, 1);
  for (const animation of animations) animation.finish();
  await handle.finished;
  assert.equal(document.querySelector('[data-qm-motion-snapshot]'), null);
  assert.equal(to.hidden, false);
  assert.equal(animations.every((animation) => animation.cancelled), true, 'Finished fill effects are removed');
});

test('fade through is sequential with incoming scale and current MD3 duration', (t) => {
  const { animations, motion } = fixture(t);
  motion({ pattern: 'fade-through' });
  const [outgoing, incoming] = animations;
  assert.equal(incoming.options.duration, 450);
  assert.equal(incoming.keyframes[0].transform, 'scale(0.92)');
  assert.equal(incoming.keyframes.at(-1).transform, 'scale(1)');
  assert.equal(outgoing.keyframes.some((frame) => 'transform' in frame), false);
  for (let index = 0; index < incoming.keyframes.length; index += 1) {
    assert.ok(outgoing.keyframes[index].opacity === 0 || incoming.keyframes[index].opacity === 0,
      'Incoming and outgoing fades must never overlap');
  }
});

test('shared axes support x/y/z, reverse and RTL with official 30px travel', (t) => {
  const { to, animations, motion } = fixture(t);
  motion({ pattern: 'shared-axis', axis: 'x' }).cancel();
  assert.equal(animations[1].keyframes[0].transform, 'translateX(30px)');
  assert.equal(animations[0].keyframes.at(-1).transform, 'translateX(-30px)');
  to.style.direction = 'rtl';
  motion({ pattern: 'shared-axis', axis: 'x' }).cancel();
  assert.equal(animations[3].keyframes[0].transform, 'translateX(-30px)');
  motion({ pattern: 'shared-axis', axis: 'x', reverse: true }).cancel();
  assert.equal(animations[5].keyframes[0].transform, 'translateX(30px)');
  motion({ pattern: 'shared-axis', axis: 'y', reverse: true }).cancel();
  assert.equal(animations[7].keyframes[0].transform, 'translateY(-30px)');
  motion({ pattern: 'shared-axis', axis: 'z' }).cancel();
  assert.equal(animations[9].keyframes[0].transform, 'scale(0.8)');
  assert.equal(animations[8].keyframes.at(-1).transform, 'scale(1.1)');
  motion({ pattern: 'shared-axis', axis: 'z', reverse: true }).cancel();
  assert.equal(animations[11].keyframes[0].transform, 'scale(1.1)');
  assert.equal(animations[10].keyframes.at(-1).transform, 'scale(0.8)');
});

test('fade handles independent entry and exit without delaying visibility', async (t) => {
  const { from, to, animations } = fixture(t);
  const enter = transitionView({ to, pattern: 'fade', update: () => { to.hidden = false; } });
  assert.equal(to.hidden, false);
  assert.equal(animations[0].options.duration, 400);
  assert.equal(animations[0].keyframes[0].transform, 'scale(0.8)');
  enter.cancel();
  const exit = transitionView({ from, pattern: 'fade', update: () => { from.remove(); } });
  assert.equal(from.isConnected, false);
  assert.equal(animations[1].options.duration, 150);
  assert.equal(animations[1].keyframes.some((frame) => 'transform' in frame), false);
  exit.cancel();
  await exit.finished;
});

test('a closing dialog snapshot never counts as an open application dialog', (t) => {
  const { document } = fixture(t);
  const dialog = document.createElement('dialog');
  dialog.open = true;
  document.body.append(dialog);
  dialog.getBoundingClientRect = () => ({ left: 20, top: 30, width: 320, height: 200 });
  const handle = transitionView({ from: dialog, pattern: 'fade', update: () => { dialog.open = false; } });
  assert.ok(document.querySelector('[data-qm-motion-snapshot]'));
  assert.equal(document.querySelector('dialog[open]'), null);
  handle.cancel();
});

test('container transform animates shared bounds/shape with forward and return recipes', (t) => {
  const { animations, motion, document } = fixture(t);
  motion({ pattern: 'container-transform' }).cancel();
  const geometry = animations[0];
  assert.equal(geometry.options.duration, 500);
  assert.deepEqual(
    [geometry.keyframes[0].left, geometry.keyframes[0].width, geometry.keyframes[0].borderRadius],
    ['20px', '120px', '24px'],
  );
  assert.deepEqual(
    [geometry.keyframes.at(-1).left, geometry.keyframes.at(-1).width, geometry.keyframes.at(-1).borderRadius],
    ['40px', '320px', '32px'],
  );
  assert.equal(animations[1].keyframes.every((frame) => frame.opacity === 1), true, 'Forward uses fade IN');
  assert.equal(animations[2].keyframes[0].opacity, 0);
  assert.equal(animations[2].keyframes.at(-1).opacity, 1);
  assert.equal(document.querySelector('[data-qm-motion-snapshot]'), null);
  motion({ pattern: 'container-transform', reverse: true }).cancel();
  assert.equal(animations[4].options.duration, 400);
  assert.equal(animations[5].keyframes[0].opacity, 1);
  assert.equal(animations[5].keyframes.at(-1).opacity, 0);
  assert.equal(animations[6].keyframes.every((frame) => frame.opacity === 1), true, 'Return uses fade OUT');
});

test('missing WAAPI and reduced motion commit state with no visual side effects', async (t) => {
  for (const settings of [{ waapi: false }, { reduced: true }]) {
    const { document, from, to, animations, motion } = fixture(t, settings);
    const handle = motion();
    await handle.finished;
    assert.equal(from.hidden, true);
    assert.equal(to.hidden, false);
    assert.equal(animations.length, 0);
    assert.equal(document.querySelector('[data-qm-motion-snapshot]'), null);
  }
});

test('system and application preference changes cancel in-flight visual work', async (t) => {
  const { media, window, document, animations, motion } = fixture(t);
  const systemRun = motion();
  media.matches = true;
  media.dispatchEvent(new window.Event('change'));
  await systemRun.finished;
  assert.equal(animations.every((animation) => animation.cancelled), true);
  assert.equal(motionReduced(document), true);
  media.matches = false;
  const localRun = motion();
  document.documentElement.dataset.qmMotion = 'reduced';
  await localRun.finished;
  assert.equal(document.querySelector('[data-qm-motion-snapshot]'), null);
  assert.equal(animations.every((animation) => animation.cancelled), true);
});

test('repeated transitions cancel prior snapshots and cancellation preserves caller styles', async (t) => {
  const { to, animations, motion, document } = fixture(t);
  to.style.transform = 'translateX(7px)';
  to.style.opacity = '0.7';
  const previous = motion();
  const current = motion();
  await previous.finished;
  assert.equal(animations[0].cancelled, true);
  assert.equal(animations[1].cancelled, true);
  assert.equal(animations[2].cancelled, false);
  assert.equal(document.querySelectorAll('[data-qm-motion-snapshot]').length, 1);
  current.cancel();
  current.cancel();
  await current.finished;
  assert.equal(to.style.transform, 'translateX(7px)');
  assert.equal(to.style.opacity, '0.7');
});

test('new interaction and focus cancel animation without hiding the selected view', async (t) => {
  const { window, document, to, motion } = fixture(t);
  const keyboardRun = motion();
  to.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
  await keyboardRun.finished;
  assert.equal(to.hidden, false);
  const focusRun = motion();
  document.getElementById('next').focus();
  await focusRun.finished;
  assert.equal(document.activeElement.id, 'next');
  assert.equal(document.querySelector('[data-qm-motion-snapshot]'), null);
});

test('a queued scroll reset from the update does not cancel motion; later scrolling does', async (t) => {
  const { window, document, animations, motion } = fixture(t);
  window.scrollY = 300;
  const run = motion({ update: () => { window.scrollY = 0; } });
  document.dispatchEvent(new window.Event('scroll'));
  assert.equal(animations.every((animation) => !animation.cancelled), true);
  window.scrollY = 40;
  document.dispatchEvent(new window.Event('scroll'));
  await run.finished;
  assert.equal(animations.every((animation) => animation.cancelled), true);
});

test('spring roles retain spatial overshoot and bounded effects, with reusable final styles', async (t) => {
  const { to, animations } = fixture(t);
  to.style.transform = 'translateX(100px)';
  const spatial = animateMaterial(to, [{ transform: 'translateX(0px)' }, { transform: 'translateX(100px)' }], {
    scheme: 'expressive', speed: 'fast', role: 'spatial',
  });
  const values = animations[0].keyframes.map((frame) => Number(frame.transform.match(/-?[\d.]+/)[0]));
  assert.ok(Math.max(...values) > 100, 'Expressive spatial springs overshoot');
  assert.equal(values.at(-1), 100);
  assert.equal(animations[0].options.duration, quietMotion.springs.expressive.fast.spatial.duration);
  spatial.cancel();
  await spatial.finished;
  assert.equal(to.style.transform, 'translateX(100px)');
  const effects = animateMaterial(to, [{ opacity: 0 }, { opacity: 1 }], { role: 'effects' });
  assert.ok(animations[1].keyframes.every((frame) => frame.opacity >= 0 && frame.opacity <= 1));
  assert.equal(animations[1].keyframes.at(-1).opacity, 1);
  effects.cancel();
});

test('unsupported spring interpolation and animation failures preserve immediate application state', async (t) => {
  const { to, motion, animations } = fixture(t);
  const unsupported = animateMaterial(to, [{ color: 'red' }, { color: 'blue' }]);
  await unsupported.finished;
  assert.equal(animations.length, 0);
  to.animate = () => { throw new Error('Unsupported browser animation'); };
  const run = motion();
  await run.finished;
  assert.equal(to.hidden, false);
  assert.equal(animations.every((animation) => animation.cancelled), true);
});

test('snapshot failures do not prevent the synchronous update', async (t) => {
  const { from, to, motion, animations } = fixture(t);
  from.cloneNode = () => { throw new Error('This view cannot be snapshotted'); };
  const run = motion();
  assert.equal(from.hidden, true);
  assert.equal(to.hidden, false);
  assert.equal(animations.length, 0);
  await run.finished;
});

test('emphasized transition samples preserve the official two-segment join', (t) => {
  const { animations, motion } = fixture(t);
  motion({ pattern: 'shared-axis', axis: 'x' });
  const joinFrame = animations[1].keyframes[10];
  assert.equal(joinFrame.offset, 1 / 6);
  const distance = Number(joinFrame.transform.match(/-?[\d.]+/)[0]);
  assert.ok(Math.abs(distance - 18) < 0.001, 'At time 1/6 the exact emphasized path has advanced by 0.4');
});

test('invalid pattern options fail before changing application state', (t) => {
  const { motion, from } = fixture(t);
  assert.throws(() => motion({ pattern: 'crossfade' }), /Unknown Material transition/);
  assert.throws(() => motion({ axis: 'q' }), /Unknown shared axis/);
  assert.equal(from.hidden, false);
});
