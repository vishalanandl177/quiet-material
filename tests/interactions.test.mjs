import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { initQuietMaterial, showSnackbar } from '../src/quiet-material.js';

// DOM behavior only: these tests do not claim browser layout, rendering,
// assistive-technology announcements, or native dialog verification.
function fixture(t, markup, { reduced = false } = {}) {
  const dom = new JSDOM(`<!doctype html><html><body>${markup}</body></html>`, {
    url: 'https://quiet-material.test/',
  });
  const { window } = dom;
  window.matchMedia = (query) => ({ matches: reduced, media: query });
  const { document } = window;
  const cleanup = initQuietMaterial(document);
  t.after(() => { cleanup(); window.close(); });
  return { window, document, cleanup };
}

const tabsMarkup = `
  <section data-qm-tabs>
    <div role="tablist" aria-label="Example sections">
      <button class="qm-tab" role="tab" id="first" aria-controls="first-panel" aria-selected="true">First</button>
      <button class="qm-tab" role="tab" id="disabled" aria-controls="disabled-panel" disabled>Unavailable</button>
      <button class="qm-tab" role="tab" id="second" aria-controls="second-panel">Second</button>
      <button class="qm-tab" role="tab" id="third" aria-controls="third-panel">Third</button>
    </div>
    <div role="tabpanel" id="first-panel" aria-labelledby="first">First content</div>
    <div role="tabpanel" id="disabled-panel" aria-labelledby="disabled">Unavailable content</div>
    <div role="tabpanel" id="second-panel" aria-labelledby="second">Second content</div>
    <div role="tabpanel" id="third-panel" aria-labelledby="third">Third content</div>
  </section>`;

function key(window, element, name, modifiers = {}) {
  const event = new window.KeyboardEvent('keydown', {
    key: name, bubbles: true, cancelable: true, ...modifiers,
  });
  element.dispatchEvent(event);
  return event;
}

function pointer(window, element) {
  const EventType = window.PointerEvent || window.MouseEvent;
  element.dispatchEvent(new EventType('pointerdown', { bubbles: true, button: 0, clientX: 8, clientY: 8 }));
}

function assertSelected(document, id) {
  const selected = document.getElementById(id);
  assert.equal(selected.getAttribute('aria-selected'), 'true');
  assert.equal(selected.tabIndex, 0);
  assert.deepEqual(
    [...document.querySelectorAll('[role="tab"]')].filter((tab) => tab.tabIndex === 0).map((tab) => tab.id),
    [id],
  );
  assert.deepEqual(
    [...document.querySelectorAll('[role="tabpanel"]')].filter((panel) => !panel.hidden).map((panel) => panel.id),
    [`${id}-panel`],
  );
}

test('tabs use roving focus, skip disabled tabs, wrap, and support Home/End', (t) => {
  const { window, document } = fixture(t, tabsMarkup);
  const first = document.getElementById('first');
  first.focus();
  assertSelected(document, 'first');
  assert.equal(key(window, first, 'ArrowRight').defaultPrevented, true);
  assertSelected(document, 'second');
  assert.equal(document.activeElement.id, 'second');
  key(window, document.activeElement, 'End');
  assertSelected(document, 'third');
  key(window, document.activeElement, 'ArrowRight');
  assertSelected(document, 'first');
  key(window, document.activeElement, 'ArrowLeft');
  assertSelected(document, 'third');
  key(window, document.activeElement, 'Home');
  assertSelected(document, 'first');
  const browserShortcut = key(window, first, 'ArrowLeft', { altKey: true });
  assert.equal(browserShortcut.defaultPrevented, false);
  assertSelected(document, 'first');
});

test('RTL reverses horizontal tab arrows and vertical tabs use up/down', (t) => {
  const { window, document } = fixture(t, tabsMarkup);
  const tablist = document.querySelector('[role="tablist"]');
  tablist.style.direction = 'rtl';
  document.getElementById('first').focus();
  key(window, document.activeElement, 'ArrowRight');
  assertSelected(document, 'third');
  key(window, document.activeElement, 'ArrowLeft');
  assertSelected(document, 'first');
  tablist.setAttribute('aria-orientation', 'vertical');
  key(window, document.activeElement, 'ArrowDown');
  assertSelected(document, 'second');
  key(window, document.activeElement, 'ArrowUp');
  assertSelected(document, 'first');
});

test('repeated initialization toggles a chip once and cleanup preserves DOM state', (t) => {
  const { window, document, cleanup } = fixture(t, `${tabsMarkup}
    <button type="button" class="qm-chip" aria-pressed="false">Filter</button>
    <input type="checkbox" checked>`);
  assert.equal(initQuietMaterial(document), cleanup);
  const chip = document.querySelector('.qm-chip');
  const changes = [];
  document.addEventListener('qm:chip-change', (event) => changes.push(event.detail.pressed));
  chip.click();
  assert.equal(chip.getAttribute('aria-pressed'), 'true');
  assert.deepEqual(changes, [true]);
  document.getElementById('third').click();
  pointer(window, chip);
  assert.equal(chip.querySelectorAll('.qm-ripple').length, 1);
  cleanup();
  cleanup();
  assertSelected(document, 'third');
  assert.equal(chip.getAttribute('aria-pressed'), 'true');
  assert.equal(document.querySelector('input').checked, true);
  assert.equal(chip.querySelector('.qm-ripple'), null);
  pointer(window, chip);
  chip.click();
  assert.equal(chip.querySelector('.qm-ripple'), null);
  assert.equal(chip.getAttribute('aria-pressed'), 'true');
  assert.deepEqual(changes, [true]);
  const secondCleanup = initQuietMaterial(document);
  t.after(secondCleanup);
  assert.notEqual(secondCleanup, cleanup);
  chip.click();
  assert.equal(chip.getAttribute('aria-pressed'), 'false');
  assert.deepEqual(changes, [true, false]);
});

test('tooltip Escape dismissal is owned by the initializer without overwriting caller state', (t) => {
  const { window, document, cleanup } = fixture(t, `
    <span class="qm-tooltip-wrap" id="owned"><button aria-describedby="tip-owned">Help</button><span role="tooltip" id="tip-owned">Helpful text</span></span>
    <span class="qm-tooltip-wrap" id="caller" data-qm-tooltip-dismissed="application"><button aria-describedby="tip-caller">More help</button><span role="tooltip" id="tip-caller">Other text</span></span>`);
  const caller = document.getElementById('caller');
  caller.querySelector('button').focus();
  key(window, document.activeElement, 'Escape');
  assert.equal(caller.getAttribute('data-qm-tooltip-dismissed'), 'application');
  const owned = document.getElementById('owned');
  owned.querySelector('button').focus();
  key(window, document.activeElement, 'Escape');
  assert.equal(owned.hasAttribute('data-qm-tooltip-dismissed'), true);
  cleanup();
  assert.equal(owned.hasAttribute('data-qm-tooltip-dismissed'), false);
  assert.equal(caller.getAttribute('data-qm-tooltip-dismissed'), 'application');
});

test('snackbar treats HTML-like messages as plain text and dismiss restores focus', async (t) => {
  const { document } = fixture(t, '<button id="invoker">Show notification</button>');
  const invoker = document.getElementById('invoker');
  invoker.focus();
  const message = '<img src=x onerror="alert(1)"> & <strong>Plain text</strong>';
  const dismiss = showSnackbar(message, { document });
  const snackbar = document.querySelector('.qm-snackbar');
  assert.equal(snackbar.querySelector('.qm-snackbar-message').textContent, message);
  assert.equal(snackbar.querySelector('img, strong'), null);
  assert.equal(document.activeElement, invoker, 'Creating feedback must not move focus');
  const live = document.querySelector('[role="status"]');
  assert.equal(snackbar.contains(live), false, 'Announcement stays separate from interactive feedback');
  await new Promise((resolve) => setTimeout(resolve, 80));
  assert.equal(live.textContent, message);
  const dismissButton = snackbar.querySelector('button');
  dismissButton.focus();
  dismissButton.click();
  assert.equal(document.querySelector('.qm-snackbar'), null);
  assert.equal(document.activeElement, invoker);
  assert.doesNotThrow(dismiss);
});

test('ripples use one transient node and animation completion removes it', (t) => {
  const { window, document } = fixture(t, '<button class="qm-button">Press</button>');
  const button = document.querySelector('button');
  pointer(window, button);
  pointer(window, button);
  assert.equal(button.querySelectorAll('.qm-ripple').length, 1);
  const ripple = button.querySelector('.qm-ripple');
  assert.equal(ripple.getAttribute('aria-hidden'), 'true');
  ripple.dispatchEvent(new window.Event('animationend'));
  assert.equal(button.querySelector('.qm-ripple'), null);
});

test('system reduced motion suppresses ripple insertion', (t) => {
  const { window, document } = fixture(t, '<button class="qm-button">Press</button>', { reduced: true });
  pointer(window, document.querySelector('button'));
  assert.equal(document.querySelector('.qm-ripple'), null);
});

test('explicit reduced motion suppresses pointer and keyboard ripples', (t) => {
  const { window, document } = fixture(t, '<button class="qm-button">Press</button>');
  document.documentElement.dataset.qmMotion = 'reduced';
  const button = document.querySelector('button');
  pointer(window, button);
  key(window, button, 'Enter');
  assert.equal(document.querySelector('.qm-ripple'), null);
});
