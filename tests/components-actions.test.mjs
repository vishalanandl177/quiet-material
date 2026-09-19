import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {initActionComponents} from '../src/components-actions.js';

function actionFixture(t, markup) {
  const dom = new JSDOM(`<!doctype html><html><body>${markup}</body></html>`, {url: 'https://quiet-material.test/'});
  const {window} = dom, {document} = window;
  window.matchMedia = () => ({matches: true});
  const cleanup = initActionComponents(document);
  t.after(() => { cleanup(); window.close(); });
  return {window, document, cleanup};
}
function actionKey(window, node, key, modifiers = {}) {
  const event = new window.KeyboardEvent('keydown', {key, bubbles: true, cancelable: true, ...modifiers});
  node.dispatchEvent(event); return event;
}
const actionSegments = `<form><div data-qm-segmented="single" data-qm-name="period" aria-label="Period">
  <button data-value="day" aria-checked="true">Day</button>
  <button data-value="week" disabled>Week</button>
  <button data-value="month">Month</button></div></form>`;

test('segmented single choice exposes radio semantics, skips disabled, writes form values and resets', async t => {
  const {window, document} = actionFixture(t, actionSegments);
  const group = document.querySelector('[data-qm-segmented]');
  const buttons = [...group.querySelectorAll('button')];
  assert.equal(group.getAttribute('role'), 'radiogroup');
  assert.equal(buttons[0].getAttribute('role'), 'radio');
  buttons[0].focus();
  let detail;
  group.addEventListener('qm:segmented-change', event => { detail = event.detail; });
  actionKey(window, buttons[0], 'ArrowRight');
  assert.equal(document.activeElement, buttons[2]);
  assert.equal(buttons[2].getAttribute('aria-checked'), 'true');
  assert.equal(buttons[0].tabIndex, -1);
  assert.deepEqual(detail, {value: 'month', values: ['month']});
  assert.equal(new window.FormData(document.querySelector('form')).get('period'), 'month');
  document.querySelector('form').reset(); await Promise.resolve();
  assert.equal(buttons[0].getAttribute('aria-checked'), 'true');
  assert.equal(new window.FormData(document.querySelector('form')).get('period'), 'day');
});

test('segmented arrows respect RTL/vertical orientation and browser shortcuts', t => {
  const {window, document} = actionFixture(t, actionSegments);
  const group = document.querySelector('[data-qm-segmented]');
  group.style.direction = 'rtl';
  const buttons = group.querySelectorAll('button');
  actionKey(window, buttons[0], 'ArrowLeft');
  assert.equal(document.activeElement, buttons[2]);
  group.setAttribute('aria-orientation', 'vertical');
  actionKey(window, buttons[2], 'ArrowDown');
  assert.equal(document.activeElement, buttons[0]);
  assert.equal(actionKey(window, buttons[0], 'ArrowDown', {altKey: true}).defaultPrevented, false);
  actionKey(window, buttons[0], 'End'); assert.equal(document.activeElement, buttons[2]);
  actionKey(window, buttons[2], 'Home'); assert.equal(document.activeElement, buttons[0]);
});

test('multiple segments toggle independently; arrow focus does not select; cleanup prevents duplicate behavior', t => {
  const {window, document, cleanup} = actionFixture(t, `<form><div data-qm-segmented="multiple" data-qm-name="format"><button data-value="bold">Bold</button><button data-value="italic" aria-pressed="true">Italic</button></div></form>`);
  assert.equal(initActionComponents(document), cleanup);
  const [bold, italic] = document.querySelectorAll('button');
  actionKey(window, bold, 'ArrowRight');
  assert.equal(document.activeElement, italic); assert.equal(bold.getAttribute('aria-pressed'), 'false');
  bold.click(); assert.equal(bold.getAttribute('aria-pressed'), 'true');
  assert.deepEqual(new window.FormData(document.querySelector('form')).getAll('format'), ['italic', 'bold']);
  italic.click(); assert.equal(italic.getAttribute('aria-pressed'), 'false');
  cleanup(); cleanup(); bold.click(); assert.equal(bold.getAttribute('aria-pressed'), 'true');
});

test('disabled fieldset segments and disabled icon toggles cannot change state', t => {
  const {document} = actionFixture(t, `<fieldset disabled><div data-qm-segmented="single"><button data-value="x">X</button></div></fieldset><button data-qm-icon-toggle aria-pressed="false" aria-disabled="true">Save</button>`);
  const button = document.querySelector('[data-qm-icon-toggle]');
  button.click(); assert.equal(button.getAttribute('aria-pressed'), 'false');
  assert.equal(document.querySelector('[data-value]').tabIndex, -1);
  button.removeAttribute('aria-disabled');
  let detail;
  button.addEventListener('qm:icon-change', event => {detail = event.detail;});
  button.click(); assert.deepEqual(detail, {pressed: true});
});

test('FAB disclosure moves keyboard focus, closes with Escape/outside press, and restores focus on action', t => {
  const {window, document} = actionFixture(t, `<div data-qm-fab-menu><button data-qm-fab-toggle aria-expanded="false">Create</button><div id="fab-options" data-qm-fab-actions hidden><button id="note">Note</button><a href="#upload">Upload</a></div></div><button id="outside">Outside</button>`);
  const toggle = document.querySelector('[data-qm-fab-toggle]');
  const panel = document.getElementById('fab-options');
  toggle.click(); assert.equal(panel.hidden, false); assert.equal(document.activeElement.id, 'note');
  actionKey(window, document.activeElement, 'Escape'); assert.equal(panel.hidden, true); assert.equal(document.activeElement, toggle);
  actionKey(window, toggle, 'ArrowUp'); assert.equal(panel.hidden, false);
  document.getElementById('note').click(); assert.equal(panel.hidden, true); assert.equal(document.activeElement, toggle);
  toggle.click(); document.getElementById('outside').dispatchEvent(new window.MouseEvent('pointerdown', {bubbles: true}));
  assert.equal(panel.hidden, true);
});

test('removable input chip supports cancellation and moves focus to the next chip', t => {
  const {document} = actionFixture(t, `<div><span data-qm-input-chip data-value="a"><span>A</span><button data-qm-chip-remove>Remove A</button></span><span data-qm-input-chip data-value="b"><span>B</span><button data-qm-chip-remove>Remove B</button></span><input aria-label="Add tag"></div>`);
  const chip = document.querySelector('[data-qm-input-chip]');
  const button = chip.querySelector('button');
  const prevent = event => event.preventDefault();
  chip.addEventListener('qm:chip-remove', prevent); button.click(); assert.equal(chip.isConnected, true);
  chip.removeEventListener('qm:chip-remove', prevent); button.focus(); button.click();
  assert.equal(chip.isConnected, false); assert.equal(document.activeElement.textContent, 'Remove B');
});

test('fields preserve helper descriptions, synchronize counters and reset filled state', async t => {
  const {window, document} = actionFixture(t, `<form><div data-qm-text-field><label for="title">Title</label><input id="title" maxlength="20" aria-describedby="hint"><span id="hint">Help</span><span data-qm-field-counter></span></div></form>`);
  const input = document.querySelector('input'), field = document.querySelector('[data-qm-text-field]');
  const counter = document.querySelector('[data-qm-field-counter]');
  assert.equal(counter.textContent, '0 / 20');
  assert.ok(input.getAttribute('aria-describedby').startsWith('hint '));
  input.value = 'Example'; input.dispatchEvent(new window.Event('input', {bubbles: true}));
  assert.equal(counter.textContent, '7 / 20'); assert.equal(field.hasAttribute('data-qm-filled'), true);
  document.querySelector('form').reset(); await Promise.resolve();
  assert.equal(counter.textContent, '0 / 20'); assert.equal(field.hasAttribute('data-qm-filled'), false);
});

const actionRange = `<form><div data-qm-range-slider><div data-qm-range-track><input type="range" data-qm-range-low min="0" max="100" step="5" value="20" name="min" aria-label="Minimum"><input type="range" data-qm-range-high min="10" max="200" step="1" value="80" name="max" aria-label="Maximum"></div><output data-qm-range-output></output></div></form>`;
test('range slider normalizes shared limits, clamps crossing, updates ARIA and submits both values', t => {
  const {window, document} = actionFixture(t, actionRange);
  const low = document.querySelector('[data-qm-range-low]'), high = document.querySelector('[data-qm-range-high]');
  assert.equal(high.min, '0'); assert.equal(high.max, '100'); assert.equal(high.step, '5');
  let detail;
  document.addEventListener('qm:range-change', event => {detail = event.detail;});
  low.value = '95'; low.dispatchEvent(new window.Event('input', {bubbles: true}));
  assert.equal(low.value, '80'); assert.equal(high.getAttribute('aria-valuemin'), '80');
  high.value = '40'; high.dispatchEvent(new window.Event('change', {bubbles: true}));
  assert.equal(high.value, '80'); assert.deepEqual(detail, {low: 80, high: 80});
  assert.equal(document.querySelector('output').textContent, '80 - 80');
  assert.deepEqual([...new window.FormData(document.querySelector('form'))], [['min', '80'], ['max', '80']]);
});

test('range slider keyboard honors step, limits, RTL and resets without crossing', async t => {
  const {window, document} = actionFixture(t, actionRange);
  const low = document.querySelector('[data-qm-range-low]'), high = document.querySelector('[data-qm-range-high]');
  actionKey(window, low, 'ArrowRight'); assert.equal(low.value, '25');
  actionKey(window, low, 'PageUp'); assert.equal(low.value, '75');
  actionKey(window, low, 'End'); assert.equal(low.value, '80');
  actionKey(window, high, 'Home'); assert.equal(high.value, '80');
  document.querySelector('[data-qm-range-slider]').style.direction = 'rtl';
  actionKey(window, low, 'ArrowRight'); assert.equal(low.value, '75');
  document.querySelector('form').reset(); await Promise.resolve();
  assert.equal(low.value, '20'); assert.equal(high.value, '80');
});

test('track pointer interaction selects the nearest enabled thumb and clamps the range', t => {
  const {window, document} = actionFixture(t, actionRange);
  const track = document.querySelector('[data-qm-range-track]');
  track.getBoundingClientRect = () => ({left: 0, width: 100});
  const high = document.querySelector('[data-qm-range-high]');
  track.dispatchEvent(new window.MouseEvent('pointerdown', {button: 0, clientX: 90, bubbles: true, cancelable: true}));
  assert.equal(high.value, '90');
  document.dispatchEvent(new window.MouseEvent('pointermove', {clientX: 5, bubbles: true}));
  assert.equal(high.value, '20');
  document.dispatchEvent(new window.MouseEvent('pointerup', {bubbles: true}));
  assert.equal(document.activeElement, high);
});

test('discrete single slider keeps its visible value in sync', t => {
  const {window, document} = actionFixture(t, `<div data-qm-slider><input type="range" min="0" max="10" step="2" value="4"><output data-qm-slider-output></output></div>`);
  const input = document.querySelector('input');
  assert.equal(document.querySelector('output').textContent, '4');
  input.value = '8'; input.dispatchEvent(new window.Event('input', {bubbles: true}));
  assert.equal(document.querySelector('output').textContent, '8');
});
