/** Dependency-free MD3 input patterns. All user strings are assigned as text. */
import { transitionView, cancelMotion } from './motion.js';

const qmInputRoots = new WeakMap();
const qmInputMounts = new WeakMap();
let qmInputSerial = 0;
function qmInputId(doc, prefix) { let id; do { id = `qm-${prefix}-${++qmInputSerial}`; } while (doc.getElementById(id)); return id; }
const qmInputEnabled = (el) => !el.disabled && !el.matches(':disabled') && el.getAttribute('aria-disabled') !== 'true';
function qmInputFind(root, selector) { return [...(root.matches?.(selector) ? [root] : []), ...root.querySelectorAll(selector)]; }
function qmInputNode(doc, tag, cls, text) { const node = doc.createElement(tag); if (cls) node.className = cls; if (text !== undefined) node.textContent = text; return node; }
function qmInputButton(doc, text, cls = 'qm-button qm-button--ghost') { const button = qmInputNode(doc, 'button', cls, text); button.type = 'button'; return button; }
function qmInputEmit(host, type, detail) { host.dispatchEvent(new host.ownerDocument.defaultView.CustomEvent(type, { bubbles: true, detail })); }
function qmInputListeners() { const removers = []; return { on(target, event, callback, options) { target.addEventListener(event, callback, options); removers.push(() => target.removeEventListener(event, callback, options)); }, clear() { removers.splice(0).forEach(fn => fn()); } }; }
function qmInputPosition(anchor, popup) {
  const win = anchor.ownerDocument.defaultView;
  const rect = anchor.getBoundingClientRect(); const box = popup.getBoundingClientRect();
  const width = Math.min(box.width || 280, win.innerWidth - 16);
  const rtl = win.getComputedStyle(anchor).direction === 'rtl';
  const left = Math.max(8, Math.min(rtl ? rect.right - width : rect.left, win.innerWidth - width - 8));
  const below = win.innerHeight - rect.bottom - 8;
  const above = rect.top - 8;
  const flip = box.height > below && above > below;
  popup.style.position = 'fixed'; popup.style.margin = '0'; popup.style.inset = 'auto';
  popup.style.left = `${left}px`; popup.style.top = `${Math.max(8, flip ? rect.top - Math.min(box.height, above) : rect.bottom + 4)}px`;
  popup.style.maxHeight = `${Math.max(48, flip ? above - 4 : below - 4)}px`;
  popup.style.maxWidth = 'calc(100vw - 16px)'; popup.style.overflowY = 'auto';
  // Anchored popups share the documented popover tier instead of a local magic number.
  popup.style.setProperty('z-index', 'var(--qm-layer-popover)');
}
function qmInputPopup(popup, show, anchor) {
  popup.dataset.qmInputMotion = '';
  transitionView({ from: show ? null : popup, to: show ? popup : null, pattern: 'fade', update: () => {
    if (show) {
      popup.hidden = false;
      if (popup.hasAttribute('popover') && popup.showPopover) { try { popup.showPopover(); } catch { /* already open */ } }
      if (anchor) qmInputPosition(anchor, popup);
    } else {
      if (popup.hasAttribute('popover') && popup.hidePopover) { try { popup.hidePopover(); } catch { /* already closed */ } }
      popup.hidden = true;
    }
  } });
}

/** Enhance an exposed dropdown. Editing retains focus; options use active descendant. */
function qmInputCombobox(wrapper) {
  const input = wrapper.querySelector('[role="combobox"]'); const list = wrapper.querySelector('[role="listbox"]');
  if (!input || !list) return () => {};
  const doc = wrapper.ownerDocument; const listeners = qmInputListeners(); let active = -1; let typed = ''; let typeTimer; let open = false;
  list.id ||= qmInputId(doc, 'options'); input.setAttribute('aria-controls', list.id); input.setAttribute('aria-expanded', 'false'); input.setAttribute('aria-haspopup', 'listbox');
  input.setAttribute('aria-autocomplete', input.readOnly ? 'none' : 'list');
  const options = () => [...list.querySelectorAll('[role="option"]')];
  const available = () => options().filter(option => !option.hidden && qmInputEnabled(option));
  function normalize() { options().forEach(option => { option.id ||= qmInputId(doc, 'option'); option.tabIndex = -1; if (!option.hasAttribute('aria-selected')) option.setAttribute('aria-selected', 'false'); }); }
  normalize(); list.hidden = true;
  function setActive(index) {
    const items = available(); active = items.length ? Math.max(0, Math.min(index, items.length - 1)) : -1;
    options().forEach(option => option.classList.remove('qm-option--active'));
    if (items[active]) { items[active].classList.add('qm-option--active'); input.setAttribute('aria-activedescendant', items[active].id); items[active].scrollIntoView?.({ block: 'nearest' }); }
    else input.removeAttribute('aria-activedescendant');
  }
  function close() { open = false; qmInputPopup(list, false); input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; }
  function show(filter = false) {
    normalize(); if (!qmInputEnabled(input)) return;
    options().forEach(option => { option.hidden = filter && !option.textContent.toLocaleLowerCase().includes(input.value.toLocaleLowerCase()); });
    open = true; qmInputPopup(list, true, input); input.setAttribute('aria-expanded', 'true'); qmInputPosition(input, list); setActive(-1);
  }
  function choose(option) {
    if (!option || !qmInputEnabled(input) || !qmInputEnabled(option)) return;
    input.value = option.dataset.label || option.textContent.trim(); input.dataset.value = option.dataset.value ?? input.value;
    options().forEach(item => item.setAttribute('aria-selected', String(item === option)));
    close(); input.dispatchEvent(new doc.defaultView.Event('change', { bubbles: true }));
    qmInputEmit(wrapper, 'qm:combobox-change', { value: input.dataset.value, label: input.value }); input.focus();
  }
  listeners.on(input, 'click', () => open && input.readOnly ? close() : show(false));
  listeners.on(input, 'input', () => { delete input.dataset.value; show(true); });
  listeners.on(input, 'keydown', event => {
    if (event.altKey && event.key === 'ArrowUp') { event.preventDefault(); close(); return; }
    if (event.ctrlKey || event.metaKey || !qmInputEnabled(input)) return;
    if (['ArrowDown', 'ArrowUp'].includes(event.key)) { event.preventDefault(); if (!open) { show(); setActive(event.key === 'ArrowUp' ? available().length - 1 : 0); } else setActive(active + (event.key === 'ArrowDown' ? 1 : -1)); }
    else if (event.key === 'Enter' && open) { const option = available()[active]; if (option) { event.preventDefault(); choose(option); } else close(); }
    else if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); close(); }
    else if (event.key === 'Tab') close();
    else if (open && input.readOnly && ['Home', 'End'].includes(event.key)) { event.preventDefault(); setActive(event.key === 'Home' ? 0 : available().length - 1); }
    else if (input.readOnly && event.key.length === 1 && !event.altKey) {
      event.preventDefault(); doc.defaultView.clearTimeout(typeTimer); typed += event.key.toLocaleLowerCase();
      typeTimer = doc.defaultView.setTimeout(() => { typed = ''; }, 600); if (!open) show();
      const index = available().findIndex(option => option.textContent.trim().toLocaleLowerCase().startsWith(typed)); if (index >= 0) setActive(index);
    }
  });
  listeners.on(list, 'pointerdown', event => { if (event.target.closest('[role="option"]')) event.preventDefault(); });
  listeners.on(list, 'click', event => choose(event.target.closest('[role="option"]')));
  listeners.on(doc, 'pointerdown', event => { if (!wrapper.contains(event.target)) close(); });
  listeners.on(doc, 'focusin', event => { if (!wrapper.contains(event.target)) close(); });
  listeners.on(doc.defaultView, 'resize', () => { if (open) qmInputPosition(input, list); });
  listeners.on(doc, 'scroll', event => { if (open && !list.contains(event.target)) qmInputPosition(input, list); }, true);
  return () => { close(); cancelMotion(list); listeners.clear(); doc.defaultView.clearTimeout(typeTimer); };
}

function qmInputMenus(root) {
  const doc = root.nodeType === 9 ? root : root.ownerDocument; const listeners = qmInputListeners(); const opened = new Map(); const ownedMenus = new Set(); let typed = ''; let typeTimer;
  const itemSelector = '[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]';
  const items = menu => [...menu.querySelectorAll(itemSelector)].filter(item => item.closest('[role="menu"]') === menu && qmInputEnabled(item) && !item.hidden);
  function close(menu, restore = false) {
    for (const nested of [...opened.keys()].reverse()) if (nested !== menu && menu.contains(opened.get(nested))) close(nested);
    const trigger = opened.get(menu); if (!trigger) return;
    qmInputPopup(menu, false); trigger.setAttribute('aria-expanded', 'false'); opened.delete(menu); if (restore && trigger.isConnected) trigger.focus();
  }
  function closeAll() { for (const menu of [...opened.keys()].reverse()) close(menu); }
  function open(trigger, last = false) {
    if (!qmInputEnabled(trigger)) return;
    const menu = doc.getElementById(trigger.dataset.qmMenuTrigger || trigger.dataset.qmMenuOpen || trigger.getAttribute('aria-controls'));
    if (!menu || menu.getAttribute('role') !== 'menu' || !(root === doc || root.contains(menu))) return;
    for (const old of [...opened.keys()]) if (!old.contains(trigger)) close(old);
    trigger.setAttribute('aria-haspopup', 'menu'); trigger.setAttribute('aria-expanded', 'true'); trigger.setAttribute('aria-controls', menu.id);
    opened.set(menu, trigger); ownedMenus.add(menu); qmInputPopup(menu, true, trigger); qmInputPosition(trigger, menu);
    const all = items(menu); all.forEach(item => { item.tabIndex = -1; }); const first = last ? all.at(-1) : all[0]; if (first) { first.tabIndex = 0; first.focus(); }
  }
  function triggerOf(event) { const trigger = event.target.closest?.('[data-qm-menu-trigger],[data-qm-menu-open]'); return trigger && (root === doc || root.contains(trigger)) ? trigger : null; }
  listeners.on(root, 'click', event => {
    const trigger = triggerOf(event); if (trigger) { event.preventDefault(); const menu = doc.getElementById(trigger.dataset.qmMenuTrigger || trigger.dataset.qmMenuOpen); if (opened.has(menu)) close(menu, true); else open(trigger); return; }
    const item = event.target.closest?.(itemSelector); if (!item) return; const menu = item.closest('[role="menu"]'); if (!opened.has(menu)) return;
    if (!qmInputEnabled(item)) { event.preventDefault(); return; }
    const role = item.getAttribute('role');
    if (role === 'menuitemcheckbox') item.setAttribute('aria-checked', String(item.getAttribute('aria-checked') !== 'true'));
    if (role === 'menuitemradio') { const group = item.closest('[role="group"]') || menu; for (const radio of group.querySelectorAll('[role="menuitemradio"]')) radio.setAttribute('aria-checked', String(radio === item)); }
    qmInputEmit(menu, 'qm:menu-select', { value: item.dataset.value ?? item.textContent.trim(), checked: item.getAttribute('aria-checked') === 'true', item });
    const topTrigger = [...opened.values()][0]; closeAll(); if (topTrigger?.isConnected) topTrigger.focus();
  });
  listeners.on(root, 'keydown', event => {
    const trigger = triggerOf(event); const menu = event.target.closest?.('[role="menu"]');
    if (!menu && trigger && event.key === 'Escape') { const controlled = doc.getElementById(trigger.getAttribute('aria-controls')); if (opened.has(controlled)) { event.preventDefault(); close(controlled, true); } return; }
    if (!menu && trigger && ['ArrowDown', 'ArrowUp'].includes(event.key)) { event.preventDefault(); open(trigger, event.key === 'ArrowUp'); return; }
    if (!opened.has(menu) || event.ctrlKey || event.metaKey || event.altKey) return;
    const all = items(menu); const index = all.indexOf(event.target.closest(itemSelector)); let next;
    const rtl = doc.defaultView.getComputedStyle(menu).direction === 'rtl';
    if (trigger && event.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) { event.preventDefault(); open(trigger); return; }
    if (event.key === (rtl ? 'ArrowRight' : 'ArrowLeft') && opened.get(menu)?.closest('[role="menu"]')) { event.preventDefault(); close(menu, true); return; }
    if (event.key === 'ArrowDown') next = (index + 1) % all.length;
    else if (event.key === 'ArrowUp') next = (index - 1 + all.length) % all.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = all.length - 1;
    else if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(menu, true); }
    else if (event.key === 'Tab') { const firstTrigger = [...opened.values()][0]; closeAll(); firstTrigger?.focus(); }
    else if (['Enter', ' '].includes(event.key)) { event.preventDefault(); all[index]?.click(); }
    else if (event.key.length === 1) {
      event.preventDefault(); doc.defaultView.clearTimeout(typeTimer); typed += event.key.toLocaleLowerCase(); typeTimer = doc.defaultView.setTimeout(() => { typed = ''; }, 600);
      const query = [...typed].every(char => char === typed[0]) ? typed[0] : typed;
      for (let offset = 1; offset <= all.length; offset++) { const candidate = (index + offset) % all.length; if (all[candidate].textContent.trim().toLocaleLowerCase().startsWith(query)) { next = candidate; break; } }
    }
    if (next !== undefined && all[next]) { event.preventDefault(); all.forEach(item => { item.tabIndex = -1; }); all[next].tabIndex = 0; all[next].focus(); }
  });
  listeners.on(doc, 'pointerdown', event => { if (![...opened].some(([menu, trigger]) => menu.contains(event.target) || trigger.contains(event.target))) closeAll(); });
  listeners.on(doc, 'focusin', event => { if (![...opened].some(([menu, trigger]) => menu.contains(event.target) || trigger.contains(event.target))) closeAll(); });
  listeners.on(doc.defaultView, 'resize', () => opened.forEach((trigger, menu) => qmInputPosition(trigger, menu)));
  listeners.on(doc, 'scroll', event => opened.forEach((trigger, menu) => { if (!menu.contains(event.target)) qmInputPosition(trigger, menu); }), true);
  return () => { closeAll(); for (const menu of ownedMenus) cancelMotion(menu); listeners.clear(); doc.defaultView.clearTimeout(typeTimer); };
}

/** Civil dates are local calendar values, never parsed as UTC instants. */
function qmInputCivil(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number); if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1) return null;
  const date = new Date(0); date.setFullYear(year, month - 1, day); date.setHours(12, 0, 0, 0);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}
function qmInputISO(date) { return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function qmInputAddDate(value, days) { const date = qmInputCivil(value); date.setDate(date.getDate() + days); return qmInputISO(date); }
function qmInputMonth(value, amount) {
  const date = qmInputCivil(value); const day = date.getDate(); date.setDate(1); date.setMonth(date.getMonth() + amount);
  const last = new Date(date.getTime()); last.setMonth(last.getMonth() + 1, 0); date.setDate(Math.min(day, last.getDate())); return qmInputISO(date);
}
function qmInputShell(host, { modal, label, kind }) {
  const doc = host.ownerDocument; const listeners = qmInputListeners(); const content = qmInputNode(doc, 'section', `qm-picker qm-${kind}-picker`);
  const title = qmInputNode(doc, 'h3', 'qm-picker__title', label); title.id = qmInputId(doc, 'picker-title'); content.setAttribute('aria-labelledby', title.id); content.append(title);
  let dialog; let trigger; let cancel = () => {}; let invoker;
  if (modal) {
    trigger = qmInputButton(doc, label, 'qm-button qm-button--tonal'); dialog = qmInputNode(doc, 'dialog', 'qm-dialog qm-picker-dialog'); dialog.setAttribute('aria-labelledby', title.id); dialog.dataset.qmMotionEnhanced = ''; dialog.append(content); host.append(trigger, dialog);
    listeners.on(trigger, 'click', () => api.open());
    listeners.on(dialog, 'cancel', event => { event.preventDefault(); cancel(); });
    listeners.on(dialog, 'close', () => { if (invoker?.isConnected) invoker.focus(); });
  } else host.append(content);
  const api = { content, trigger, dialog, onCancel(fn) { cancel = fn; },
    open() {
      if (!dialog || dialog.open) return;
      if (doc.querySelector('dialog[open]')) return;
      if (typeof dialog.showModal !== 'function') throw new Error('Modal pickers require HTMLDialogElement.showModal support.');
      invoker = doc.activeElement;
      transitionView({ from: null, to: dialog, pattern: 'fade', update: () => dialog.showModal() });
      (content.querySelector('[tabindex="0"]') || content.querySelector('input,button'))?.focus();
    },
    close(result = '') { if (dialog?.open) transitionView({ from: dialog, to: null, pattern: 'fade', update: () => dialog.close(result) }); },
    destroy() { cancelMotion(content); if (dialog) cancelMotion(dialog); if (dialog?.open) dialog.close(); listeners.clear(); if (dialog) dialog.remove(); else content.remove(); trigger?.remove(); }
  }; return api;
}

/** Mount a calendar/date input. Value is a civil ISO date, or {start,end} for ranges. */
export function mountDatePicker(host, options = {}) {
  if (qmInputMounts.has(host)) return qmInputMounts.get(host);
  const { range = false, min = '0001-01-01', max = '9999-12-31', locale, weekStartsOn = 0, modal = false, onChange } = options;
  if (!qmInputCivil(min) || !qmInputCivil(max) || min > max) throw new RangeError('Date bounds must be valid ordered civil ISO dates.');
  if (![0, 1, 2, 3, 4, 5, 6].includes(weekStartsOn)) throw new RangeError('weekStartsOn must be 0 through 6.');
  const doc = host.ownerDocument; const listeners = qmInputListeners(); const valid = value => Boolean(qmInputCivil(value) && value >= min && value <= max);
  function normalize(value) {
    if (value == null || value === '') return range ? { start: '', end: '' } : '';
    if (!range) { if (!valid(value)) throw new RangeError('Date value is invalid or outside bounds.'); return value; }
    if (!valid(value.start) || !valid(value.end) || value.start > value.end) throw new RangeError('Date range must have ordered dates within bounds.'); return { start: value.start, end: value.end };
  }
  let committed = normalize(options.value); let draft = range ? { ...committed } : committed;
  const clamp = value => !qmInputCivil(value) ? (value.startsWith('0000') || value.startsWith('-') ? min : max) : value < min ? min : value > max ? max : value;
  let focused = clamp((range ? draft.start : draft) || qmInputISO(new Date())); let month = focused.slice(0, 7); let inputMode = false;
  const shell = qmInputShell(host, { modal, label: options.label || (range ? 'Select date range' : 'Select date'), kind: 'date' });
  const summary = qmInputNode(doc, 'p', 'qm-picker__summary'); summary.setAttribute('aria-live', 'polite');
  const mode = qmInputButton(doc, 'Use keyboard input'); mode.setAttribute('aria-pressed', 'false');
  const calendar = qmInputNode(doc, 'div', 'qm-calendar'); calendar.setAttribute('role', 'region'); calendar.setAttribute('aria-label', 'Date calendar'); const toolbar = qmInputNode(doc, 'div', 'qm-calendar__toolbar');
  const previous = qmInputButton(doc, '‹'); previous.setAttribute('aria-label', 'Previous month');
  const monthLabel = qmInputNode(doc, 'span', 'qm-calendar__month'); monthLabel.id = qmInputId(doc, 'month'); monthLabel.setAttribute('aria-live', 'polite');
  const next = qmInputButton(doc, '›'); next.setAttribute('aria-label', 'Next month'); toolbar.append(previous, monthLabel, next);
  const grid = qmInputNode(doc, 'div', 'qm-calendar__grid'); grid.setAttribute('role', 'grid'); grid.setAttribute('aria-labelledby', monthLabel.id); if (range) grid.setAttribute('aria-multiselectable', 'true');
  calendar.append(toolbar, grid);
  const fields = qmInputNode(doc, 'div', 'qm-picker__fields'); fields.hidden = true;
  const inputs = [];
  for (const text of range ? ['Start date', 'End date'] : ['Date']) {
    const label = qmInputNode(doc, 'label', 'qm-field', text); const input = qmInputNode(doc, 'input', 'qm-input'); input.type = 'text'; input.inputMode = 'numeric'; input.placeholder = 'YYYY-MM-DD'; input.maxLength = 10; input.autocomplete = 'off';
    label.append(input); fields.append(label); inputs.push(input);
  }
  const error = qmInputNode(doc, 'p', 'qm-picker__error'); error.id = qmInputId(doc, 'date-error'); error.setAttribute('role', 'status');
  inputs.forEach(input => input.setAttribute('aria-describedby', error.id));
  const actions = qmInputNode(doc, 'div', 'qm-picker__actions'); const cancel = qmInputButton(doc, 'Cancel'); const confirm = qmInputButton(doc, 'OK', 'qm-button qm-button--tonal'); actions.append(cancel, confirm);
  shell.content.append(summary, mode, calendar, fields, error, actions);
  const selected = value => range ? draft.start && value >= draft.start && value <= (draft.end || draft.start) : draft === value;
  function renderGrid(moveFocus = false) {
    const first = `${month}-01`; const date = qmInputCivil(first); const formatter = new Intl.DateTimeFormat(locale, { calendar: 'gregory', month: 'long', year: 'numeric' }); monthLabel.textContent = formatter.format(date);
    previous.disabled = month <= min.slice(0, 7); next.disabled = month >= max.slice(0, 7);
    grid.replaceChildren();
    const header = qmInputNode(doc, 'div', 'qm-calendar__week'); header.setAttribute('role', 'row');
    for (let i = 0; i < 7; i++) { const sample = qmInputCivil('2023-01-01'); sample.setDate(sample.getDate() + (i + weekStartsOn) % 7); const cell = qmInputNode(doc, 'span', '', new Intl.DateTimeFormat(locale, { calendar: 'gregory', weekday: 'narrow' }).format(sample)); cell.setAttribute('role', 'columnheader'); cell.setAttribute('aria-label', new Intl.DateTimeFormat(locale, { calendar: 'gregory', weekday: 'long' }).format(sample)); header.append(cell); }
    grid.append(header);
    const offset = (date.getDay() - weekStartsOn + 7) % 7; const beginning = new Date(date.getTime()); beginning.setDate(beginning.getDate() - offset);
    for (let row = 0; row < 6; row++) {
      const week = qmInputNode(doc, 'div', 'qm-calendar__week'); week.setAttribute('role', 'row');
      for (let col = 0; col < 7; col++) {
        const day = new Date(beginning.getTime()); day.setDate(day.getDate() + row * 7 + col); const value = qmInputISO(day);
        const button = qmInputButton(doc, String(day.getDate()), 'qm-calendar__day'); button.dataset.date = value; button.setAttribute('role', 'gridcell'); button.setAttribute('aria-label', new Intl.DateTimeFormat(locale, { calendar: 'gregory', dateStyle: 'full' }).format(day)); button.setAttribute('aria-selected', String(Boolean(selected(value)))); button.disabled = !valid(value); button.tabIndex = value === focused && !button.disabled ? 0 : -1;
        if (value.slice(0, 7) !== month) button.classList.add('qm-calendar__day--outside'); if (value === qmInputISO(new Date())) button.setAttribute('aria-current', 'date');
        if (range && (value === draft.start || value === draft.end)) button.dataset.endpoint = 'true'; week.append(button);
      } grid.append(week);
    }
    if (moveFocus) grid.querySelector('[tabindex="0"]')?.focus();
  }
  function update() {
    summary.textContent = range ? `${draft.start || 'Start date'} - ${draft.end || 'End date'}` : draft || 'No date selected';
    inputs[0].value = range ? draft.start : draft; if (range) inputs[1].value = draft.end;
    confirm.disabled = range ? !(valid(draft.start) && valid(draft.end) && draft.start <= draft.end) : !valid(draft);
    error.textContent = ''; inputs.forEach(input => input.removeAttribute('aria-invalid')); renderGrid();
  }
  function select(value) {
    if (!valid(value)) return; focused = value; month = value.slice(0, 7);
    if (range) draft = !draft.start || draft.end ? { start: value, end: '' } : value < draft.start ? { start: value, end: draft.start } : { start: draft.start, end: value };
    else draft = value; update(); grid.querySelector('[tabindex="0"]')?.focus();
    qmInputEmit(host, 'qm:date-input', { value: range ? { ...draft } : draft });
  }
  function cancelDraft() { draft = range ? { ...committed } : committed; focused = clamp((range ? draft.start : draft) || qmInputISO(new Date())); month = focused.slice(0, 7); update(); shell.close('cancel'); qmInputEmit(host, 'qm:date-cancel', {}); }
  function readInputs() {
    const values = inputs.map(input => input.value.trim()); const correct = values.every(valid) && (!range || values[0] <= values[1]);
    inputs.forEach((input, index) => input.setAttribute('aria-invalid', String(!valid(values[index]) || (range && values[0] > values[1]))));
    error.textContent = correct ? '' : `Enter ${range ? 'an ordered date range' : 'a date'} as YYYY-MM-DD between ${min} and ${max}.`; confirm.disabled = !correct;
    if (correct) { draft = range ? { start: values[0], end: values[1] } : values[0]; focused = values[0]; month = focused.slice(0, 7); summary.textContent = range ? `${values[0]} - ${values[1]}` : values[0]; renderGrid(); }
    return correct;
  }
  listeners.on(mode, 'click', () => { inputMode = !inputMode; fields.hidden = !inputMode; calendar.hidden = inputMode; mode.textContent = inputMode ? 'Use calendar' : 'Use keyboard input'; mode.setAttribute('aria-pressed', String(inputMode)); if (inputMode) inputs[0].focus(); else { update(); grid.querySelector('[tabindex="0"]')?.focus(); } });
  listeners.on(previous, 'click', () => { focused = clamp(qmInputMonth(focused, -1)); month = focused.slice(0, 7); renderGrid(); });
  listeners.on(next, 'click', () => { focused = clamp(qmInputMonth(focused, 1)); month = focused.slice(0, 7); renderGrid(); });
  listeners.on(grid, 'click', event => { const button = event.target.closest('[data-date]'); if (button && !button.disabled) select(button.dataset.date); });
  listeners.on(grid, 'keydown', event => {
    const button = event.target.closest('[data-date]'); if (!button || event.altKey || event.ctrlKey || event.metaKey) return; let target; const rtl = doc.defaultView.getComputedStyle(grid).direction === 'rtl';
    if (event.key === 'ArrowRight') target = qmInputAddDate(button.dataset.date, rtl ? -1 : 1);
    else if (event.key === 'ArrowLeft') target = qmInputAddDate(button.dataset.date, rtl ? 1 : -1);
    else if (event.key === 'ArrowDown') target = qmInputAddDate(button.dataset.date, 7);
    else if (event.key === 'ArrowUp') target = qmInputAddDate(button.dataset.date, -7);
    else if (event.key === 'Home') target = qmInputAddDate(button.dataset.date, -((qmInputCivil(button.dataset.date).getDay() - weekStartsOn + 7) % 7));
    else if (event.key === 'End') target = qmInputAddDate(button.dataset.date, 6 - ((qmInputCivil(button.dataset.date).getDay() - weekStartsOn + 7) % 7));
    else if (event.key === 'PageDown') target = qmInputMonth(button.dataset.date, event.shiftKey ? 12 : 1);
    else if (event.key === 'PageUp') target = qmInputMonth(button.dataset.date, event.shiftKey ? -12 : -1);
    if (target) { event.preventDefault(); focused = clamp(target); month = focused.slice(0, 7); renderGrid(true); }
  });
  inputs.forEach(input => { listeners.on(input, 'input', readInputs); listeners.on(input, 'keydown', event => { if (event.key === 'Enter') { event.preventDefault(); if (readInputs()) confirm.click(); } }); });
  listeners.on(cancel, 'click', cancelDraft); shell.onCancel(cancelDraft);
  listeners.on(confirm, 'click', () => { if (inputMode && !readInputs() || confirm.disabled) return; committed = range ? { ...draft } : draft; const value = range ? { ...committed } : committed; shell.close('confirm'); qmInputEmit(host, 'qm:date-change', { value }); onChange?.(value); });
  update();
  const api = { open: shell.open, close: cancelDraft, get value() { return range ? { ...committed } : committed; }, setValue(value) { committed = normalize(value); draft = range ? { ...committed } : committed; focused = clamp((range ? draft.start : draft) || qmInputISO(new Date())); month = focused.slice(0, 7); update(); }, destroy() { listeners.clear(); shell.destroy(); qmInputMounts.delete(host); } };
  qmInputMounts.set(host, api); return api;
}

/** Mount a 12/24-hour time dial with a complete numeric input alternative. */
export function mountTimePicker(host, options = {}) {
  if (qmInputMounts.has(host)) return qmInputMounts.get(host);
  const { hour24 = true, modal = false, onChange } = options; const doc = host.ownerDocument; const listeners = qmInputListeners();
  function parse(value) { if (typeof value !== 'string' || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new RangeError('Time value must be HH:mm in 24-hour form.'); return value.split(':').map(Number); }
  let committed = options.value || '09:30'; let [hour, minute] = parse(committed); let field = 'hour'; let inputMode = false; let dragging = false; let handAngle = 0;
  const shell = qmInputShell(host, { modal, label: options.label || 'Select time', kind: 'time' });
  const face = qmInputNode(doc, 'div', 'qm-time__display'); const hourButton = qmInputButton(doc, '', 'qm-time__value'); const minuteButton = qmInputButton(doc, '', 'qm-time__value'); hourButton.setAttribute('aria-label', 'Select hours'); minuteButton.setAttribute('aria-label', 'Select minutes'); face.append(hourButton, qmInputNode(doc, 'span', '', ':'), minuteButton);
  const periods = qmInputNode(doc, 'div', 'qm-time__period'); periods.setAttribute('role', 'group'); periods.setAttribute('aria-label', 'Time period'); periods.hidden = hour24; const am = qmInputButton(doc, 'AM'); const pm = qmInputButton(doc, 'PM'); periods.append(am, pm); face.append(periods);
  const dial = qmInputNode(doc, 'div', 'qm-time__dial'); dial.tabIndex = 0; dial.setAttribute('role', 'slider'); dial.setAttribute('aria-orientation', 'horizontal');
  const hand = qmInputNode(doc, 'span', 'qm-time__hand'); hand.setAttribute('aria-hidden', 'true');
  const fields = qmInputNode(doc, 'div', 'qm-picker__fields'); fields.hidden = true;
  const hourInput = qmInputNode(doc, 'input', 'qm-input'); const minuteInput = qmInputNode(doc, 'input', 'qm-input');
  for (const [input, labelText, minValue, maxValue] of [[hourInput, 'Hours', hour24 ? 0 : 1, hour24 ? 23 : 12], [minuteInput, 'Minutes', 0, 59]]) { const label = qmInputNode(doc, 'label', 'qm-field', labelText); input.type = 'number'; input.inputMode = 'numeric'; input.min = String(minValue); input.max = String(maxValue); input.step = '1'; label.append(input); fields.append(label); }
  const error = qmInputNode(doc, 'p', 'qm-picker__error'); error.id = qmInputId(doc, 'time-error'); error.setAttribute('role', 'status'); hourInput.setAttribute('aria-describedby', error.id); minuteInput.setAttribute('aria-describedby', error.id);
  const mode = qmInputButton(doc, 'Use keyboard input'); mode.setAttribute('aria-pressed', 'false'); const actions = qmInputNode(doc, 'div', 'qm-picker__actions'); const cancel = qmInputButton(doc, 'Cancel'); const confirm = qmInputButton(doc, 'OK', 'qm-button qm-button--tonal'); actions.append(cancel, confirm);
  shell.content.append(face, dial, fields, mode, error, actions);
  const displayHour = () => hour24 ? hour : hour % 12 || 12;
  function render() {
    hourButton.textContent = String(displayHour()).padStart(2, '0'); minuteButton.textContent = String(minute).padStart(2, '0'); hourButton.setAttribute('aria-pressed', String(field === 'hour')); minuteButton.setAttribute('aria-pressed', String(field === 'minute'));
    am.setAttribute('aria-pressed', String(hour < 12)); pm.setAttribute('aria-pressed', String(hour >= 12));
    hourInput.value = String(displayHour()); minuteInput.value = String(minute).padStart(2, '0'); error.textContent = ''; confirm.disabled = false; hourInput.removeAttribute('aria-invalid'); minuteInput.removeAttribute('aria-invalid');
    dial.setAttribute('aria-label', field === 'hour' ? 'Hours' : 'Minutes'); dial.setAttribute('aria-valuemin', field === 'hour' && !hour24 ? '1' : '0'); dial.setAttribute('aria-valuemax', field === 'minute' ? '59' : hour24 ? '23' : '12'); dial.setAttribute('aria-valuenow', String(field === 'hour' ? displayHour() : minute)); dial.setAttribute('aria-valuetext', `${hourButton.textContent}:${minuteButton.textContent}${hour24 ? '' : hour < 12 ? ' AM' : ' PM'}`);
    dial.replaceChildren(hand); let angle = (field === 'minute' ? minute / 60 : hour % 12 / 12) * 360; while (angle - handAngle > 180) angle -= 360; while (angle - handAngle < -180) angle += 360; handAngle = angle; hand.style.setProperty('--qm-clock-angle', `${angle}deg`); hand.style.setProperty('--qm-clock-length', field === 'hour' && hour24 && (hour === 0 || hour > 12) ? '26%' : '38%');
    const count = field === 'hour' && hour24 ? 24 : 12;
    for (let index = 0; index < count; index++) {
      const value = field === 'minute' ? index * 5 : index === 0 ? 12 : index === 12 ? 0 : index;
      const position = index % 12; const inner = index >= 12; const theta = position / 12 * Math.PI * 2; const radius = inner ? 26 : 39;
      const mark = qmInputButton(doc, String(value).padStart(field === 'minute' ? 2 : 1, '0'), 'qm-time__mark'); mark.tabIndex = -1; mark.setAttribute('aria-hidden', 'true'); mark.dataset.clockValue = String(value); mark.style.left = `${50 + Math.sin(theta) * radius}%`; mark.style.top = `${50 - Math.cos(theta) * radius}%`; mark.classList.toggle('qm-time__mark--selected', value === (field === 'minute' ? minute : hour24 ? hour : displayHour())); dial.append(mark);
    }
  }
  function set(value, advance = false) {
    if (field === 'minute') minute = value;
    else hour = hour24 ? value : value % 12 + (hour >= 12 ? 12 : 0);
    if (advance && field === 'hour') field = 'minute'; render(); qmInputEmit(host, 'qm:time-input', { value: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}` });
  }
  function point(event, advance = false) {
    const box = dial.getBoundingClientRect(); if (!box.width || !box.height) return;
    const x = event.clientX - box.left - box.width / 2; const y = event.clientY - box.top - box.height / 2;
    const fraction = (Math.atan2(x, -y) / (Math.PI * 2) + 1) % 1;
    if (field === 'minute') set(Math.round(fraction * 60) % 60, advance);
    else { let value = Math.round(fraction * 12) % 12; const inner = Math.hypot(x, y) < box.width * .32; if (hour24) value = inner ? value === 0 ? 0 : value + 12 : value || 12; else value ||= 12; set(value, advance); }
  }
  function readInputs() {
    const h = Number(hourInput.value), m = Number(minuteInput.value); const hourValid = hourInput.value !== '' && Number.isInteger(h) && h >= (hour24 ? 0 : 1) && h <= (hour24 ? 23 : 12); const minuteValid = minuteInput.value !== '' && Number.isInteger(m) && m >= 0 && m <= 59;
    hourInput.setAttribute('aria-invalid', String(!hourValid)); minuteInput.setAttribute('aria-invalid', String(!minuteValid)); confirm.disabled = !(hourValid && minuteValid); error.textContent = confirm.disabled ? `Enter hours ${hour24 ? '0-23' : '1-12'} and minutes 0-59.` : '';
    if (!confirm.disabled) { hour = hour24 ? h : h % 12 + (hour >= 12 ? 12 : 0); minute = m; hourButton.textContent = String(displayHour()).padStart(2, '0'); minuteButton.textContent = String(minute).padStart(2, '0'); }
    return !confirm.disabled;
  }
  function cancelDraft() { [hour, minute] = parse(committed); render(); shell.close('cancel'); qmInputEmit(host, 'qm:time-cancel', {}); }
  listeners.on(hourButton, 'click', () => { field = 'hour'; render(); if (inputMode) hourInput.focus(); else dial.focus(); }); listeners.on(minuteButton, 'click', () => { field = 'minute'; render(); if (inputMode) minuteInput.focus(); else dial.focus(); });
  listeners.on(am, 'click', () => { hour %= 12; render(); }); listeners.on(pm, 'click', () => { hour = hour % 12 + 12; render(); });
  listeners.on(mode, 'click', () => { if (inputMode && !readInputs()) return; inputMode = !inputMode; dial.hidden = inputMode; fields.hidden = !inputMode; mode.textContent = inputMode ? 'Use clock' : 'Use keyboard input'; mode.setAttribute('aria-pressed', String(inputMode)); render(); if (inputMode) hourInput.focus(); else dial.focus(); });
  listeners.on(dial, 'click', event => { const mark = event.target.closest('[data-clock-value]'); if (mark && event.detail === 0) { set(Number(mark.dataset.clockValue), true); dial.focus(); } });
  listeners.on(dial, 'pointerdown', event => { if (event.button !== 0) return; event.preventDefault(); dragging = true; dial.setPointerCapture?.(event.pointerId); dial.focus(); point(event); });
  listeners.on(dial, 'pointermove', event => { if (dragging) point(event); });
  listeners.on(dial, 'pointerup', event => { if (!dragging) return; dragging = false; point(event, true); dial.releasePointerCapture?.(event.pointerId); });
  listeners.on(dial, 'pointercancel', () => { dragging = false; });
  listeners.on(dial, 'keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return; const value = field === 'minute' ? minute : hour24 ? hour : displayHour(); const minimum = field === 'hour' && !hour24 ? 1 : 0; const maximum = field === 'minute' ? 59 : hour24 ? 23 : 12; let nextValue;
    if (['ArrowUp', 'ArrowRight'].includes(event.key)) nextValue = value === maximum ? minimum : value + 1;
    else if (['ArrowDown', 'ArrowLeft'].includes(event.key)) nextValue = value === minimum ? maximum : value - 1;
    else if (event.key === 'PageUp') nextValue = Math.min(maximum, value + 5);
    else if (event.key === 'PageDown') nextValue = Math.max(minimum, value - 5);
    else if (event.key === 'Home') nextValue = minimum; else if (event.key === 'End') nextValue = maximum;
    else if (['Enter', ' '].includes(event.key)) { event.preventDefault(); field = field === 'hour' ? 'minute' : 'hour'; render(); }
    if (nextValue !== undefined) { event.preventDefault(); set(nextValue); }
  });
  for (const input of [hourInput, minuteInput]) { listeners.on(input, 'input', readInputs); listeners.on(input, 'keydown', event => { if (event.key === 'Enter') { event.preventDefault(); if (readInputs()) confirm.click(); } }); }
  listeners.on(cancel, 'click', cancelDraft); shell.onCancel(cancelDraft);
  listeners.on(confirm, 'click', () => { if (inputMode && !readInputs()) return; committed = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`; shell.close('confirm'); qmInputEmit(host, 'qm:time-change', { value: committed }); onChange?.(committed); });
  render();
  const api = { open: shell.open, close: cancelDraft, get value() { return committed; }, setValue(value) { const parsed = parse(value); committed = value; [hour, minute] = parsed; render(); }, destroy() { listeners.clear(); shell.destroy(); qmInputMounts.delete(host); } };
  qmInputMounts.set(host, api); return api;
}

/** Search submits an event/callback; applications own fetching, navigation and results. */
export function mountSearch(host, options = {}) {
  if (qmInputMounts.has(host)) return qmInputMounts.get(host);
  const { suggestions = [], onSearch, modal = false, label = 'Search' } = options; const doc = host.ownerDocument; const listeners = qmInputListeners();
  const shell = qmInputShell(host, { modal, label, kind: 'search' }); shell.content.classList.add('qm-search-view'); if (shell.trigger) shell.trigger.classList.add('qm-search-bar');
  const form = qmInputNode(doc, 'form', 'qm-search-bar'); form.setAttribute('role', 'search'); form.setAttribute('aria-label', label);
  const wrapper = qmInputNode(doc, 'div', 'qm-search__input'); wrapper.dataset.qmCombobox = '';
  const input = qmInputNode(doc, 'input', 'qm-input'); input.type = 'search'; input.setAttribute('role', 'combobox'); input.setAttribute('aria-label', label); input.placeholder = options.placeholder || 'Search'; input.autocomplete = 'off';
  const list = qmInputNode(doc, 'div', 'qm-search__suggestions'); list.setAttribute('role', 'listbox'); list.setAttribute('aria-label', 'Search suggestions'); list.hidden = true;
  function updateSuggestions(values) {
    if (!Array.isArray(values)) throw new TypeError('Search suggestions must be an array.');
    list.replaceChildren(); for (const item of values) { if (typeof item !== 'string' && (!item || typeof item.label !== 'string')) continue; const entry = typeof item === 'string' ? { label: item, value: item } : item; const option = qmInputNode(doc, 'div', 'qm-option', String(entry.label)); option.setAttribute('role', 'option'); option.dataset.value = String(entry.value ?? entry.label); list.append(option); }
    if (input.getAttribute('aria-expanded') === 'true') input.dispatchEvent(new doc.defaultView.Event('input', { bubbles: true }));
  }
  updateSuggestions(suggestions); wrapper.append(input, list); const submit = qmInputButton(doc, 'Search', 'qm-button qm-button--tonal'); submit.type = 'submit'; const clear = qmInputButton(doc, 'Clear', 'qm-button qm-button--ghost'); clear.setAttribute('aria-label', 'Clear search'); form.append(wrapper, clear, submit);
  const status = qmInputNode(doc, 'p', 'qm-search__status'); status.setAttribute('role', 'status'); shell.content.append(form, status);
  const cleanupCombo = qmInputCombobox(wrapper); let sequence = 0; let destroyed = false;
  async function search() {
    const query = input.value.trim(); if (!query) { status.textContent = 'Enter a search term.'; input.focus(); return; }
    const current = ++sequence; qmInputEmit(host, 'qm:search', { query });
    if (!onSearch) { status.textContent = `Search submitted: ${query}`; return; }
    status.textContent = 'Searching…'; form.setAttribute('aria-busy', 'true');
    try { await onSearch(query); if (destroyed || current !== sequence) return; status.textContent = `Search complete: ${query}`; }
    catch { if (!destroyed && current === sequence) status.textContent = 'Search could not be completed. Try again.'; }
    finally { if (!destroyed && current === sequence) form.removeAttribute('aria-busy'); }
  }
  listeners.on(form, 'submit', event => { event.preventDefault(); search(); });
  listeners.on(wrapper, 'qm:combobox-change', () => search());
  listeners.on(clear, 'click', () => { sequence++; form.removeAttribute('aria-busy'); input.value = ''; input.dispatchEvent(new doc.defaultView.Event('input', { bubbles: true })); input.focus(); status.textContent = ''; });
  if (modal) { const back = qmInputButton(doc, 'Back'); back.setAttribute('aria-label', 'Close search'); shell.content.prepend(back); listeners.on(back, 'click', () => shell.close('cancel')); shell.onCancel(() => shell.close('cancel')); }
  const api = { open: shell.open, close: () => shell.close(), input, setSuggestions: updateSuggestions, destroy() { destroyed = true; sequence++; cleanupCombo(); listeners.clear(); shell.destroy(); qmInputMounts.delete(host); } };
  qmInputMounts.set(host, api); return api;
}

/** Initialize declarative menus, dropdowns, search and pickers. Safe to call once per root. */
export function initInputComponents(root = document) {
  if (qmInputRoots.has(root)) return qmInputRoots.get(root);
  const cleanups = [qmInputMenus(root)];
  for (const wrapper of qmInputFind(root, '[data-qm-combobox]')) cleanups.push(qmInputCombobox(wrapper));
  for (const host of qmInputFind(root, '[data-qm-date-picker]')) {
    if (qmInputMounts.has(host)) continue; const range = host.hasAttribute('data-range'); let value = host.dataset.value;
    if (range && value) { const [start, end] = value.split('/'); value = { start, end }; }
    const api = mountDatePicker(host, { range, value, min: host.dataset.min, max: host.dataset.max, modal: host.hasAttribute('data-modal'), locale: host.dataset.locale, label: host.dataset.label }); cleanups.push(() => api.destroy());
  }
  for (const host of qmInputFind(root, '[data-qm-time-picker]')) { if (qmInputMounts.has(host)) continue; const api = mountTimePicker(host, { value: host.dataset.value, hour24: host.dataset.hour24 !== 'false', modal: host.hasAttribute('data-modal'), label: host.dataset.label }); cleanups.push(() => api.destroy()); }
  for (const host of qmInputFind(root, '[data-qm-search]')) { if (qmInputMounts.has(host)) continue; let suggestions = []; try { const parsed = JSON.parse(host.dataset.suggestions || '[]'); if (Array.isArray(parsed)) suggestions = parsed; } catch { /* no suggestions */ } const api = mountSearch(host, { suggestions, modal: host.hasAttribute('data-modal'), label: host.dataset.label }); cleanups.push(() => api.destroy()); }
  let disposed = false; const cleanup = () => { if (disposed) return; disposed = true; cleanups.reverse().forEach(fn => fn()); qmInputRoots.delete(root); }; qmInputRoots.set(root, cleanup); return cleanup;
}
