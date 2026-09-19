/** MD3 action and selection enhancements. Native elements retain form semantics. */
import {transitionView} from './motion.js';
const qmActionInstances = new WeakMap();
let qmActionCounterId = 0;
function qmActionAll(root, selector) {
  return [...(root.matches?.(selector) ? [root] : []), ...root.querySelectorAll(selector)];
}
function qmActionEnabled(node) {
  return !node.disabled && !node.matches(':disabled') && node.getAttribute('aria-disabled') !== 'true';
}
function qmActionButtons(group) {
  return [...group.querySelectorAll('button[data-value]')].filter(button => button.closest('[data-qm-segmented]') === group);
}

/** Initialize once per root; returns an idempotent cleanup function. */
export function initActionComponents(root = document) {
  if (qmActionInstances.has(root)) return qmActionInstances.get(root);
  const doc = root.nodeType === 9 ? root : root.ownerDocument;
  const win = doc.defaultView;
  const listeners = [];
  const defaultSelections = new Map();
  const fabMenus = new Map();
  const ranges = new Map();
  let disposed = false;
  let drag = null;
  const listen = (target, type, callback, options) => {
    target.addEventListener(type, callback, options);
    listeners.push(() => target.removeEventListener(type, callback, options));
  };
  const emit = (node, type, detail, cancelable = false) => node.dispatchEvent(new win.CustomEvent(type, {bubbles: true, cancelable, detail}));
  const closest = (event, selector) => {
    const target = event.composedPath().find(item => item?.nodeType === 1)?.closest(selector);
    return target && (target === root || root.contains(target)) ? target : null;
  };

  function syncSegment(group, selected, notify = false) {
    const buttons = qmActionButtons(group);
    const single = group.dataset.qmSegmented !== 'multiple';
    const enabledButtons = buttons.filter(qmActionEnabled);
    if (single) selected = [selected.find(button => enabledButtons.includes(button)) || enabledButtons[0]].filter(Boolean);
    group.setAttribute('role', single ? 'radiogroup' : 'group');
    for (const button of buttons) {
      if (!button.hasAttribute('type')) button.type = 'button';
      if (single) {
        button.setAttribute('role', 'radio');
        button.setAttribute('aria-checked', String(selected.includes(button)));
        button.removeAttribute('aria-pressed');
        button.tabIndex = selected.includes(button) && qmActionEnabled(button) ? 0 : -1;
      } else {
        button.removeAttribute('role');
        button.removeAttribute('aria-checked');
        button.setAttribute('aria-pressed', String(selected.includes(button)));
      }
    }
    for (const input of group.querySelectorAll('[data-qm-segment-value]')) input.remove();
    if (group.dataset.qmName) for (const button of selected.filter(qmActionEnabled)) {
      const input = doc.createElement('input');
      input.type = 'hidden'; input.name = group.dataset.qmName; input.value = button.dataset.value;
      input.setAttribute('data-qm-segment-value', ''); group.append(input);
    }
    const values = selected.map(button => button.dataset.value);
    if (notify) emit(group, 'qm:segmented-change', {value: single ? values[0] ?? null : null, values});
  }
  for (const group of qmActionAll(root, '[data-qm-segmented]')) {
    const selected = qmActionButtons(group).filter(button => button.getAttribute('aria-checked') === 'true' || button.getAttribute('aria-pressed') === 'true');
    syncSegment(group, selected);
    defaultSelections.set(group, qmActionButtons(group).filter(button => button.getAttribute(group.dataset.qmSegmented === 'multiple' ? 'aria-pressed' : 'aria-checked') === 'true'));
  }
  function selectSegment(group, button) {
    if (!qmActionEnabled(button)) return;
    if (group.dataset.qmSegmented === 'multiple') {
      const selected = qmActionButtons(group).filter(item => item.getAttribute('aria-pressed') === 'true');
      syncSegment(group, selected.includes(button) ? selected.filter(item => item !== button) : [...selected, button], true);
    } else syncSegment(group, [button], true);
  }

  function setFab(menu, open, focusFirst = false, restore = false, animate = true) {
    const state = fabMenus.get(menu);
    if (!state) return;
    state.motion?.cancel();
    state.motion = null;
    if (open) for (const other of fabMenus.keys()) if (other !== menu) setFab(other, false);
    state.toggle.setAttribute('aria-expanded', String(open));
    if (!open && !state.panel.hidden && animate) state.motion = transitionView({from: state.panel, to: null, pattern: 'fade', update: () => { state.panel.hidden = true; }});
    else state.panel.hidden = !open;
    menu.toggleAttribute('data-qm-expanded', open);
    if (open && focusFirst) state.panel.querySelector('button:not(:disabled):not([aria-disabled="true"]), a[href]:not([aria-disabled="true"])')?.focus();
    if (!open && restore && qmActionEnabled(state.toggle)
      && (state.panel.contains(doc.activeElement) || doc.activeElement === state.toggle || doc.activeElement === doc.body)) state.toggle.focus();
  }
  for (const menu of qmActionAll(root, '[data-qm-fab-menu]')) {
    const toggle = menu.querySelector('[data-qm-fab-toggle]');
    const panel = menu.querySelector('[data-qm-fab-actions]');
    if (!toggle || !panel || !panel.id) continue;
    toggle.setAttribute('aria-controls', panel.id);
    if (!toggle.hasAttribute('type')) toggle.type = 'button';
    fabMenus.set(menu, {toggle, panel});
    setFab(menu, toggle.getAttribute('aria-expanded') === 'true', false, false, false);
  }

  function syncField(field) {
    const input = field.querySelector('input:not([type="hidden"]), textarea');
    if (!input) return;
    field.toggleAttribute('data-qm-filled', input.value.length > 0);
    const counter = field.querySelector('[data-qm-field-counter]');
    if (counter) {
      if (!counter.id) {
        do { counter.id = `qm-field-counter-${++qmActionCounterId}`; } while (doc.querySelectorAll(`[id="${counter.id}"]`).length > 1);
      }
      const ids = new Set((input.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
      ids.add(counter.id); input.setAttribute('aria-describedby', [...ids].join(' '));
      counter.textContent = input.maxLength >= 0 ? `${input.value.length} / ${input.maxLength}` : String(input.value.length);
    }
  }
  for (const field of qmActionAll(root, '[data-qm-text-field]')) syncField(field);

  function snapRange(state, value) {
    const bounded = Math.min(state.max, Math.max(state.min, value));
    if (state.step === 'any') return bounded;
    return Number(Math.min(state.max, Math.max(state.min, state.min + Math.round((bounded - state.min) / state.step) * state.step)).toFixed(10));
  }
  function syncRange(wrapper, changed = null, eventType = null) {
    const state = ranges.get(wrapper);
    if (!state) return;
    const low = state.low, high = state.high;
    low.value = String(snapRange(state, Number(low.value)));
    high.value = String(snapRange(state, Number(high.value)));
    if (+low.value > +high.value) {
      if (changed === high) high.value = low.value;
      else low.value = high.value;
    }
    low.setAttribute('aria-valuemax', high.value);
    high.setAttribute('aria-valuemin', low.value);
    wrapper.style.setProperty('--qm-range-low', `${(+low.value - state.min) / (state.max - state.min || 1) * 100}%`);
    wrapper.style.setProperty('--qm-range-high', `${(+high.value - state.min) / (state.max - state.min || 1) * 100}%`);
    for (const output of wrapper.querySelectorAll('[data-qm-range-output]')) {
      output.textContent = output.dataset.qmRangeOutput === 'low' ? low.value : output.dataset.qmRangeOutput === 'high' ? high.value : `${low.value} - ${high.value}`;
    }
    if (eventType) emit(wrapper, eventType, {low: +low.value, high: +high.value});
  }
  for (const wrapper of qmActionAll(root, '[data-qm-range-slider]')) {
    const low = wrapper.querySelector('input[type="range"][data-qm-range-low]');
    const high = wrapper.querySelector('input[type="range"][data-qm-range-high]');
    if (!low || !high) continue;
    const min = Number.isFinite(Number(low.getAttribute('min'))) && low.hasAttribute('min') ? Number(low.min) : 0;
    const proposedMax = low.hasAttribute('max') ? Number(low.max) : 100;
    const max = Number.isFinite(proposedMax) && proposedMax >= min ? proposedMax : min;
    const step = low.step === 'any' ? 'any' : Number(low.step) > 0 ? Number(low.step) : 1;
    for (const input of [low, high]) { input.min = String(min); input.max = String(max); input.step = String(step); }
    ranges.set(wrapper, {low, high, min, max, step});
    syncRange(wrapper);
  }
  function syncSingleSlider(wrapper) {
    const input = wrapper.querySelector('input[type="range"]');
    if (!input) return;
    const output = wrapper.querySelector('[data-qm-slider-output]');
    if (output) output.textContent = input.value;
  }
  for (const wrapper of qmActionAll(root, '[data-qm-slider]')) syncSingleSlider(wrapper);

  listen(root, 'click', event => {
    const button = closest(event, '[data-qm-segmented] button[data-value]');
    if (button) { event.preventDefault(); selectSegment(button.closest('[data-qm-segmented]'), button); return; }
    const toggle = closest(event, '[data-qm-icon-toggle]');
    if (toggle && qmActionEnabled(toggle)) {
      event.preventDefault();
      const pressed = toggle.getAttribute('aria-pressed') !== 'true';
      toggle.setAttribute('aria-pressed', String(pressed)); emit(toggle, 'qm:icon-change', {pressed}); return;
    }
    const fabToggle = closest(event, '[data-qm-fab-toggle]');
    if (fabToggle && qmActionEnabled(fabToggle)) {
      event.preventDefault(); setFab(fabToggle.closest('[data-qm-fab-menu]'), fabToggle.getAttribute('aria-expanded') !== 'true', event.detail === 0); return;
    }
    const remove = closest(event, '[data-qm-chip-remove]');
    if (remove && qmActionEnabled(remove)) {
      const chip = remove.closest('[data-qm-input-chip]');
      if (!chip || chip.getAttribute('aria-disabled') === 'true') return;
      event.preventDefault();
      if (!emit(chip, 'qm:chip-remove', {value: chip.dataset.value ?? chip.textContent.trim()}, true)) return;
      const parent = chip.parentElement;
      const controls = [...parent.querySelectorAll('button, input, a[href], [tabindex="0"]')].filter(node => qmActionEnabled(node) && !node.closest('[hidden]'));
      const index = controls.indexOf(remove);
      const target = controls.slice(index + 1).find(node => !chip.contains(node)) || controls.slice(0, index).reverse().find(node => !chip.contains(node));
      const wasFocused = chip.contains(doc.activeElement); chip.remove();
      if (wasFocused) target?.focus();
      return;
    }
    const action = closest(event, '[data-qm-fab-actions] button, [data-qm-fab-actions] a[href]');
    if (action && qmActionEnabled(action)) setFab(action.closest('[data-qm-fab-menu]'), false, false, true);
  });
  listen(doc, 'pointerdown', event => {
    for (const [menu, state] of fabMenus) if (!menu.contains(event.target) && !state.panel.hidden) setFab(menu, false);
  });
  listen(root, 'focusout', event => {
    const menu = closest(event, '[data-qm-fab-menu]');
    if (menu && event.relatedTarget && !menu.contains(event.relatedTarget)) setFab(menu, false);
  });
  listen(root, 'keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const menu = closest(event, '[data-qm-fab-menu]');
    if (menu && event.key === 'Escape' && fabMenus.get(menu)?.toggle.getAttribute('aria-expanded') === 'true') {
      event.preventDefault(); setFab(menu, false, false, true); return;
    }
    const fabToggle = closest(event, '[data-qm-fab-toggle]');
    if (fabToggle && qmActionEnabled(fabToggle) && event.key === 'ArrowUp') { event.preventDefault(); setFab(menu, true, true); return; }
    const segment = closest(event, '[data-qm-segmented] button[data-value]');
    if (segment) {
      const group = segment.closest('[data-qm-segmented]');
      const buttons = qmActionButtons(group).filter(qmActionEnabled);
      const rtl = win.getComputedStyle(group).direction === 'rtl';
      const vertical = group.getAttribute('aria-orientation') === 'vertical';
      const forward = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
      const back = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
      let index = buttons.indexOf(segment);
      if (event.key === forward) index = (index + 1) % buttons.length;
      else if (event.key === back) index = (index - 1 + buttons.length) % buttons.length;
      else if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = buttons.length - 1;
      else return;
      event.preventDefault(); buttons[index]?.focus();
      if (group.dataset.qmSegmented !== 'multiple' && buttons[index]) selectSegment(group, buttons[index]);
      return;
    }
    const input = closest(event, '[data-qm-range-slider] input[type="range"]');
    if (input && qmActionEnabled(input)) {
      const wrapper = input.closest('[data-qm-range-slider]');
      const state = ranges.get(wrapper); if (!state) return;
      const unit = state.step === 'any' ? (state.max - state.min) / 100 : state.step;
      const rtl = win.getComputedStyle(wrapper).direction === 'rtl';
      let value = +input.value;
      if (event.key === 'Home') value = state.min;
      else if (event.key === 'End') value = state.max;
      else if (event.key === 'PageUp') value += unit * 10;
      else if (event.key === 'PageDown') value -= unit * 10;
      else if (event.key === 'ArrowUp' || event.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) value += unit;
      else if (event.key === 'ArrowDown' || event.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) value -= unit;
      else return;
      event.preventDefault(); input.value = String(snapRange(state, value)); syncRange(wrapper, input);
      input.dispatchEvent(new win.Event('input', {bubbles: true}));
      input.dispatchEvent(new win.Event('change', {bubbles: true}));
    }
  });
  for (const type of ['input', 'change']) listen(root, type, event => {
    const field = closest(event, '[data-qm-text-field]'); if (field) syncField(field);
    const range = closest(event, '[data-qm-range-slider]'); if (range) syncRange(range, event.target, type === 'input' ? 'qm:range-input' : 'qm:range-change');
    const slider = closest(event, '[data-qm-slider]'); if (slider) syncSingleSlider(slider);
  });

  function moveRange(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const {wrapper, input, state} = drag;
    const box = wrapper.querySelector('[data-qm-range-track]')?.getBoundingClientRect() || wrapper.getBoundingClientRect();
    if (!box.width) return;
    let ratio = Math.max(0, Math.min(1, (event.clientX - box.left) / box.width));
    if (win.getComputedStyle(wrapper).direction === 'rtl') ratio = 1 - ratio;
    input.value = String(snapRange(state, state.min + ratio * (state.max - state.min)));
    syncRange(wrapper, input); input.dispatchEvent(new win.Event('input', {bubbles: true}));
  }
  listen(root, 'pointerdown', event => {
    if (event.button !== 0) return;
    const track = closest(event, '[data-qm-range-track]');
    if (!track || event.target.matches?.('input')) return;
    const wrapper = track.closest('[data-qm-range-slider]');
    const state = ranges.get(wrapper); if (!state) return;
    const enabled = [state.low, state.high].filter(qmActionEnabled); if (!enabled.length) return;
    const box = track.getBoundingClientRect(); if (!box.width) return;
    let ratio = (event.clientX - box.left) / box.width;
    if (win.getComputedStyle(wrapper).direction === 'rtl') ratio = 1 - ratio;
    const value = state.min + ratio * (state.max - state.min);
    const input = enabled.sort((a, b) => Math.abs(+a.value - value) - Math.abs(+b.value - value))[0];
    event.preventDefault(); input.focus(); drag = {wrapper, input, state, pointerId: event.pointerId};
    track.setPointerCapture?.(event.pointerId); moveRange(event);
  });
  listen(doc, 'pointermove', moveRange);
  const endDrag = event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const input = drag.input; drag = null; input.dispatchEvent(new win.Event('change', {bubbles: true}));
  };
  listen(doc, 'pointerup', endDrag); listen(doc, 'pointercancel', endDrag);
  listen(root, 'reset', event => {
    win.queueMicrotask(() => {
      if (disposed || event.defaultPrevented) return;
      for (const [group, selected] of defaultSelections) if (event.target.contains(group)) syncSegment(group, selected);
      for (const wrapper of ranges.keys()) if (event.target.contains(wrapper)) syncRange(wrapper);
      for (const field of qmActionAll(root, '[data-qm-text-field]')) syncField(field);
      for (const slider of qmActionAll(root, '[data-qm-slider]')) syncSingleSlider(slider);
    });
  });
  const cleanup = () => {
    if (disposed) return;
    disposed = true; drag = null;
    for (const remove of listeners) remove();
    for (const menu of fabMenus.keys()) setFab(menu, false, false, false, false);
    qmActionInstances.delete(root);
  };
  qmActionInstances.set(root, cleanup);
  return cleanup;
}
