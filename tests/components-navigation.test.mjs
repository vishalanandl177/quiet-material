import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { initNavigationComponents } from '../src/components-navigation.js';
import { initQuietMaterial } from '../src/quiet-material.js';

function navigationFixture(t, markup, { reduced = true, width = 390 } = {}) {
  const dom = new JSDOM(`<!doctype html><html><body>${markup}</body></html>`, { url: 'https://quiet.test/' });
  const { window } = dom;
  window.matchMedia = () => ({ matches: reduced });
  window.innerWidth = width;
  const cleanup = initNavigationComponents(window.document);
  t.after(() => { cleanup(); window.close(); });
  return { window, document: window.document, cleanup };
}
function navigationKey(window, target, key, options = {}) {
  const event = new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options });
  target.dispatchEvent(event);
  return event;
}
const navigationMarkup = `<nav data-qm-navigation="adaptive" aria-label="Workspace">
  <button class="qm-navigation__item" id="home-link" data-qm-nav-target="home" aria-current="page">Home</button>
  <button class="qm-navigation__item" id="files-link" data-qm-nav-target="files">Files</button>
  <button class="qm-navigation__item" id="disabled-link" data-qm-nav-target="disabled-panel" disabled>Disabled</button>
</nav><section id="home" data-qm-nav-panel>Home content</section><section id="files" data-qm-nav-panel hidden>Files content</section><section id="disabled-panel" data-qm-nav-panel hidden>Disabled</section>`;

test('adaptive navigation resizes one DOM tree and preserves active destination and focus', (t) => {
  const { window, document } = navigationFixture(t, navigationMarkup);
  const nav = document.querySelector('nav');
  const changes = [];
  nav.addEventListener('qm:navigation-layout', (event) => changes.push(event.detail.layout));
  assert.equal(nav.dataset.qmLayout, 'bar');
  document.getElementById('files-link').click();
  document.getElementById('files-link').focus();
  for (const width of [800, 1400, 360]) { window.innerWidth = width; window.dispatchEvent(new window.Event('resize')); }
  assert.deepEqual(changes, ['rail', 'drawer', 'bar']);
  assert.equal(document.activeElement.id, 'files-link');
  assert.equal(document.querySelectorAll('nav').length, 1);
  assert.equal(document.querySelectorAll('[aria-current="page"]').length, 1);
  assert.equal(document.getElementById('files').hidden, false);
  assert.equal(document.getElementById('home').hidden, true);
});

test('navigation cancellation and disabled destinations preserve the displayed panel', (t) => {
  const { document } = navigationFixture(t, navigationMarkup);
  const nav = document.querySelector('nav');
  nav.addEventListener('qm:navigate', (event) => event.preventDefault());
  document.getElementById('files-link').click();
  document.getElementById('disabled-link').click();
  assert.equal(document.getElementById('home').hidden, false);
  assert.equal(document.getElementById('files').hidden, true);
  assert.equal(document.getElementById('home-link').getAttribute('aria-current'), 'page');
});

test('navigation leaves router-owned links and modified clicks native', (t) => {
  const { window, document } = navigationFixture(t, `<nav data-qm-navigation="bar"><a class="qm-navigation__item" id="route" href="#next">Next</a><a class="qm-navigation__item" id="disabled" href="#no" aria-disabled="true">Disabled</a></nav>`);
  const route = document.getElementById('route');
  const event = new window.MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true });
  route.dispatchEvent(event);
  assert.equal(event.defaultPrevented, false);
  assert.equal(route.hasAttribute('aria-current'), false);
  const blocked = new window.MouseEvent('click', { bubbles: true, cancelable: true });
  document.getElementById('disabled').dispatchEvent(blocked);
  assert.equal(blocked.defaultPrevented, true);
});

test('app bar enter-always and exit-until-collapsed react to scroll direction', (t) => {
  const { window, document } = navigationFixture(t, `<div id="scroller"></div><header id="enter" data-qm-app-bar data-qm-scroll-target="scroller" data-qm-scroll-behavior="enter-always"></header><header id="exit" data-qm-app-bar data-qm-scroll-target="scroller" data-qm-scroll-behavior="exit-until-collapsed"></header>`);
  const scroller = document.getElementById('scroller');
  const scroll = (top) => { scroller.scrollTop = top; scroller.dispatchEvent(new window.Event('scroll')); };
  scroll(100);
  assert.equal(document.getElementById('enter').hasAttribute('data-qm-collapsed'), true);
  assert.equal(document.getElementById('exit').hasAttribute('data-qm-collapsed'), true);
  scroll(80);
  assert.equal(document.getElementById('enter').hasAttribute('data-qm-collapsed'), false);
  assert.equal(document.getElementById('exit').hasAttribute('data-qm-collapsed'), true);
  scroll(0);
  assert.equal(document.getElementById('exit').hasAttribute('data-qm-scrolled'), false);
});

test('toolbars use roving focus, skip disabled items, and reverse horizontal arrows in RTL', (t) => {
  const { window, document } = navigationFixture(t, `<div data-qm-toolbar role="toolbar" aria-label="Editing"><button id="a">A</button><button disabled>D</button><button id="b">B</button><button id="c">C</button></div>`);
  const toolbar = document.querySelector('[role="toolbar"]');
  document.getElementById('a').focus();
  navigationKey(window, document.activeElement, 'ArrowRight');
  assert.equal(document.activeElement.id, 'b');
  navigationKey(window, document.activeElement, 'End');
  assert.equal(document.activeElement.id, 'c');
  toolbar.style.direction = 'rtl';
  navigationKey(window, document.activeElement, 'ArrowRight');
  assert.equal(document.activeElement.id, 'b');
  toolbar.setAttribute('aria-orientation', 'vertical');
  navigationKey(window, document.activeElement, 'ArrowDown');
  assert.equal(document.activeElement.id, 'c');
  assert.equal(toolbar.querySelectorAll('[tabindex="0"]').length, 1);
  assert.equal(navigationKey(window, document.activeElement, 'ArrowDown', { altKey: true }).defaultPrevented, false);
});

const sheetMarkup = `<button id="opener" data-qm-sheet-open="sheet" aria-expanded="false">Open details</button>
<aside id="sheet" class="qm-sheet qm-sheet--bottom" data-qm-sheet data-qm-sheet-state="collapsed" hidden>
  <button id="handle" data-qm-sheet-toggle data-qm-sheet-drag aria-label="Expand or collapse details"></button>
  <section data-qm-sheet-details hidden>Additional details</section><button id="closer" data-qm-sheet-close>Close</button>
</aside>`;
test('standard sheet expansion and close restore focus and expose correct state', (t) => {
  const { document } = navigationFixture(t, sheetMarkup);
  const opener = document.getElementById('opener');
  const handle = document.getElementById('handle');
  const sheet = document.getElementById('sheet');
  const changes = [];
  sheet.addEventListener('qm:sheet-change', (event) => changes.push(event.detail.expanded));
  opener.click();
  assert.equal(sheet.hidden, false);
  assert.equal(opener.getAttribute('aria-expanded'), 'true');
  handle.click();
  assert.equal(handle.getAttribute('aria-expanded'), 'true');
  assert.equal(sheet.querySelector('[data-qm-sheet-details]').hidden, false);
  handle.click();
  assert.equal(sheet.dataset.qmSheetState, 'collapsed');
  document.getElementById('closer').focus();
  document.getElementById('closer').click();
  assert.equal(sheet.hidden, true);
  assert.equal(document.activeElement, opener);
  assert.equal(opener.getAttribute('aria-expanded'), 'false');
  assert.deepEqual(changes, [true, false]);
});

test('Escape closes standard sheets but leaves modal dialog ownership to core', (t) => {
  const { window, document } = navigationFixture(t, `${sheetMarkup}<dialog open data-qm-sheet><button id="modal-control">Modal control</button></dialog>`);
  document.getElementById('opener').click();
  navigationKey(window, document.getElementById('handle'), 'Escape');
  assert.equal(document.getElementById('sheet').hidden, true);
  assert.equal(navigationKey(window, document.getElementById('modal-control'), 'Escape').defaultPrevented, false);
  assert.equal(document.querySelector('dialog').open, true);
});

test('sheet handle drag selects a snap state and canceled gestures make no change', (t) => {
  const { window, document } = navigationFixture(t, sheetMarkup);
  document.getElementById('opener').click();
  const handle = document.getElementById('handle');
  const send = (target, name, y) => {
    const event = new window.MouseEvent(name, { bubbles: true, button: 0, clientX: 0, clientY: y });
    Object.defineProperty(event, 'pointerId', { value: 7 });
    target.dispatchEvent(event);
  };
  send(handle, 'pointerdown', 100);
  send(window, 'pointerup', 50);
  assert.equal(document.getElementById('sheet').dataset.qmSheetState, 'expanded');
  send(handle, 'pointerdown', 50);
  send(window, 'pointercancel', 100);
  send(window, 'pointerup', 100);
  assert.equal(document.getElementById('sheet').dataset.qmSheetState, 'expanded');
});

const carouselMarkup = `<section data-qm-carousel aria-label="Gallery"><div data-qm-carousel-track>
  <article data-qm-carousel-item><button id="slide-action">Read first</button></article>
  <article data-qm-carousel-item>Second</article><article data-qm-carousel-item>Third</article>
</div><button data-qm-carousel-prev>Previous</button><span data-qm-carousel-status></span><button data-qm-carousel-next>Next</button></section>`;
function mockCarouselGeometry(document, vertical = false) {
  const track = document.querySelector('[data-qm-carousel-track]');
  track.getBoundingClientRect = () => ({ left: 0, right: 200, top: 0, bottom: 200, width: 200, height: 200 });
  [...track.children].forEach((item, index) => {
    item.getBoundingClientRect = () => ({ left: vertical ? 0 : index * 200 - track.scrollLeft, right: vertical ? 200 : (index + 1) * 200 - track.scrollLeft, top: vertical ? index * 200 - track.scrollTop : 0, bottom: vertical ? (index + 1) * 200 - track.scrollTop : 200, width: 200, height: 200 });
  });
  return track;
}
test('carousel buttons and keys expose index, boundaries and status without autoplay', (t) => {
  const { window, document } = navigationFixture(t, carouselMarkup);
  const track = mockCarouselGeometry(document);
  const previous = document.querySelector('[data-qm-carousel-prev]');
  const next = document.querySelector('[data-qm-carousel-next]');
  const changes = [];
  document.addEventListener('qm:carousel-change', (event) => changes.push(event.detail.index));
  assert.equal(previous.disabled, true);
  next.click();
  assert.equal(track.scrollLeft, 200);
  assert.equal(previous.disabled, false);
  track.focus();
  navigationKey(window, track, 'End');
  assert.equal(next.disabled, true);
  assert.equal(document.querySelector('[data-qm-carousel-status]').textContent, '3 / 3');
  assert.equal(document.querySelectorAll('[data-qm-carousel-current]').length, 1);
  navigationKey(window, track, 'Home');
  assert.equal(track.scrollLeft, 0);
  assert.deepEqual(changes, [1, 2, 0]);
  assert.equal(navigationKey(window, document.getElementById('slide-action'), 'ArrowRight').defaultPrevented, false, 'Nested interactive controls keep their keys');
});

test('vertical fullscreen carousel uses up/down and synchronizes after manual scrolling', (t) => {
  const { window, document } = navigationFixture(t, carouselMarkup.replace('data-qm-carousel aria-label', 'class="qm-carousel--fullscreen" data-qm-carousel aria-label'));
  const track = mockCarouselGeometry(document, true);
  navigationKey(window, track, 'ArrowDown');
  assert.equal(track.scrollTop, 200);
  track.scrollTop = 400;
  track.dispatchEvent(new window.Event('scrollend'));
  assert.equal(document.querySelector('[data-qm-carousel-status]').textContent, '3 / 3');
  navigationKey(window, track, 'ArrowUp');
  assert.equal(track.scrollTop, 200);
});

test('carousel reduced-motion preference commits scroll immediately and cleanup is repeatable', (t) => {
  const { document, cleanup } = navigationFixture(t, carouselMarkup);
  const track = mockCarouselGeometry(document);
  assert.equal(initNavigationComponents(document), cleanup);
  const next = document.querySelector('[data-qm-carousel-next]');
  next.click();
  assert.equal(track.style.scrollSnapType, '');
  assert.equal(track.scrollLeft, 200);
  cleanup(); cleanup();
  next.click();
  assert.equal(track.scrollLeft, 200);
});

test('active carousel spring is canceled and committed when local reduced motion changes', async (t) => {
  const { window, document } = navigationFixture(t, carouselMarkup, { reduced: false });
  const callbacks = new Map();
  let frameId = 0;
  window.requestAnimationFrame = (callback) => { callbacks.set(++frameId, callback); return frameId; };
  window.cancelAnimationFrame = (id) => callbacks.delete(id);
  const track = mockCarouselGeometry(document);
  document.querySelector('[data-qm-carousel-next]').click();
  assert.equal(track.style.scrollSnapType, 'none');
  assert.equal(callbacks.size, 1);
  document.documentElement.dataset.qmMotion = 'reduced';
  await new Promise((resolve) => window.queueMicrotask(resolve));
  assert.equal(callbacks.size, 0);
  assert.equal(track.scrollLeft, 200);
  assert.equal(track.style.scrollSnapType, '');
});

test('primary and secondary tabs retain existing keyboard activation and panel semantics', (t) => {
  const { window, document } = navigationFixture(t, `<section data-qm-tabs><div class="qm-tabs qm-tabs--primary qm-tabs--scrollable" role="tablist" aria-label="Library"><button role="tab" id="t1" aria-controls="p1" aria-selected="true">One</button><button role="tab" id="t2" aria-controls="p2">Two</button></div><div role="tabpanel" id="p1" aria-labelledby="t1">One</div><div role="tabpanel" id="p2" aria-labelledby="t2" hidden>Two</div></section>`);
  const coreCleanup = initQuietMaterial(document);
  t.after(coreCleanup);
  document.getElementById('t1').focus();
  navigationKey(window, document.activeElement, 'ArrowRight');
  assert.equal(document.activeElement.id, 't2');
  assert.equal(document.getElementById('p2').hidden, false);
  assert.equal(document.getElementById('p1').hidden, true);
});
