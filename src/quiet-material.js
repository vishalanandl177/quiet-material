/** Quiet Material: optional, dependency-free progressive enhancement. */
import {transitionView, cancelMotion} from './motion.js';
import {initActionComponents} from './components-actions.js';
import {initNavigationComponents} from './components-navigation.js';
import {initInputComponents} from './components-input.js';
import {initCommunicationComponents} from './components-communication.js';
export {mountDatePicker, mountTimePicker, mountSearch} from './components-input.js';
export {mountProgress, setProgress, mountLoadingIndicator} from './components-communication.js';
const instances = new WeakMap();
const notifications = new WeakMap();

/** Close semantics immediately; only a noninteractive visual snapshot fades out. */
export function closeQuietDialog(dialog, result = '') {
  if (!dialog?.open) return;
  const side = dialog.matches('.qm-dialog--side-sheet, .qm-dialog--drawer');
  const vertical = dialog.matches('.qm-dialog--sheet, .qm-dialog--fullscreen');
  return transitionView({from: dialog, to: null, pattern: side || vertical ? 'shared-axis' : 'fade', axis: side ? 'x' : 'y', reverse: true, update: () => dialog.close(result)});
}

function elements(root, selector) {
  const result = Array.from(root.querySelectorAll(selector));
  if (root.matches?.(selector)) result.unshift(root);
  return result;
}

function eventElement(event) {
  return event.composedPath().find((node) => node?.nodeType === 1);
}

function enabled(element) {
  return !element.disabled && element.getAttribute('aria-disabled') !== 'true';
}

/** Initialize once per root. The returned cleanup function is safe to repeat. */
export function initQuietMaterial(root = document) {
  if (instances.has(root)) return instances.get(root);
  const doc = root.nodeType === 9 ? root : root.ownerDocument;
  const win = doc.defaultView;
  const componentCleanups = [initActionComponents(root), initNavigationComponents(root), initInputComponents(root), initCommunicationComponents(root)];
  const listeners = [];
  const ripples = new Map();
  const pendingTouches = new Map();
  const dialogInvokers = new Map();
  const observedDialogs = new WeakSet();
  const ownedDialogMotion = new Set();
  const ownedTooltipDismissals = new Set();
  let disposed = false;

  const listen = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    listeners.push(() => target.removeEventListener(type, handler, options));
  };
  const scoped = (element) => element && (element === root || root.contains(element));
  const closest = (event, selector) => {
    const found = eventElement(event)?.closest(selector);
    return scoped(found) ? found : null;
  };

  function tabSet(wrapper) {
    return elements(wrapper, '[role="tab"]')
      .filter((tab) => tab.closest('[data-qm-tabs]') === wrapper);
  }

  function activateTab(wrapper, current, focus = false, animate = false) {
    if (!enabled(current)) return;
    const tabs = tabSet(wrapper);
    const panels = elements(wrapper, '[role="tabpanel"]')
      .filter((panel) => panel.closest('[data-qm-tabs]') === wrapper);
    const activeId = current.getAttribute('aria-controls');
    for (const tab of tabs) {
      const selected = tab === current;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    }
    const previous = panels.find(panel => !panel.hidden);
    const next = panels.find(panel => panel.id === activeId);
    const update = () => { for (const panel of panels) panel.hidden = panel.id !== activeId; if (focus) current.focus(); };
    if (animate && previous && next && previous !== next) {
      transitionView({from: previous, to: next, pattern: 'shared-axis',
        axis: current.closest('[role="tablist"]')?.getAttribute('aria-orientation') === 'vertical' ? 'y' : 'x',
        reverse: panels.indexOf(next) < panels.indexOf(previous), update});
    } else update();
  }

  for (const wrapper of elements(root, '[data-qm-tabs]')) {
    const tabs = tabSet(wrapper).filter(enabled);
    const selected = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0];
    if (selected) activateTab(wrapper, selected);
  }

  function reducedMotion() {
    return doc.documentElement.dataset.qmMotion === 'reduced'
      || Boolean(win.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  }

  function clearRipple(button) {
    const active = ripples.get(button);
    if (!active) return;
    win.clearTimeout(active.timeout);
    win.clearTimeout(active.releaseTimer);
    active.node.removeEventListener('transitionend', active.finish);
    active.node.remove();
    ripples.delete(button);
  }

  function milliseconds(element, name, fallback) {
    const raw = win.getComputedStyle(element).getPropertyValue(name).trim();
    const value = Number.parseFloat(raw);
    return Number.isFinite(value) ? value * (raw.endsWith('ms') ? 1 : 1000) : fallback;
  }

  function releaseRipple(button) {
    const active = ripples.get(button);
    if (!active || active.released || active.releaseTimer !== null) return;
    const minimum = milliseconds(button, '--qm-motion-ripple-minimum-press-duration', 225);
    const wait = Math.max(0, minimum - (win.performance.now() - active.started));
    const release = () => {
      active.releaseTimer = null;
      if (ripples.get(button) !== active) return;
      active.released = true;
      active.node.classList.add('qm-ripple--released');
      active.timeout = win.setTimeout(() => clearRipple(button), milliseconds(button, '--qm-motion-ripple-fade-duration', 375) + 50);
    };
    if (wait) active.releaseTimer = win.setTimeout(release, wait); else release();
  }

  function ripple(button, event) {
    if (!enabled(button) || reducedMotion()) return;
    clearRipple(button);
    const box = button.getBoundingClientRect();
    const pointer = event.type === 'pointerdown';
    const x = pointer ? event.clientX - box.left : box.width / 2;
    const y = pointer ? event.clientY - box.top : box.height / 2;
    const size = Math.hypot(box.width, box.height) * 2;
    const node = doc.createElement('span');
    node.className = 'qm-ripple';
    node.setAttribute('aria-hidden', 'true');
    node.style.setProperty('--qm-ripple-x', `${x}px`);
    node.style.setProperty('--qm-ripple-y', `${y}px`);
    node.style.setProperty('--qm-ripple-size', `${size}px`);
    Object.assign(node.style, { left: `${x}px`, top: `${y}px`, width: `${size}px`, height: `${size}px` });
    const finish = event => { if (event.propertyName === 'opacity' && ripples.get(button)?.released) clearRipple(button); };
    node.addEventListener('transitionend', finish);
    ripples.set(button, {node, finish, started: win.performance.now(), pointerId: event.pointerId,
      keyboard: !pointer, released: false, releaseTimer: null, timeout: null});
    button.append(node);
  }

  listen(root, 'pointerdown', (event) => {
    if (event.button !== 0) return;
    const button = closest(event, 'button.qm-button, button.qm-chip, button.qm-fab, [data-qm-segmented] button');
    if (!button) return;
    if (event.pointerType === 'touch') {
      const previous = pendingTouches.get(button);
      if (previous) win.clearTimeout(previous.timer);
      const timer = win.setTimeout(() => {pendingTouches.delete(button); ripple(button, event);},
        milliseconds(button, '--qm-motion-ripple-touch-delay', 150));
      pendingTouches.set(button, {event, timer});
    } else ripple(button, event);
  });

  listen(win, 'pointerup', event => {
    for (const [button, pending] of pendingTouches) if (pending.event.pointerId === event.pointerId) {
      win.clearTimeout(pending.timer); pendingTouches.delete(button); ripple(button, pending.event);
    }
    for (const [button, active] of ripples) if (!active.keyboard && active.pointerId === event.pointerId) releaseRipple(button);
  }, true);
  listen(win, 'pointercancel', event => {
    for (const [button, pending] of pendingTouches) if (pending.event.pointerId === event.pointerId) {
      win.clearTimeout(pending.timer); pendingTouches.delete(button);
    }
    for (const [button, active] of ripples) if (active.pointerId === event.pointerId) clearRipple(button);
  }, true);
  const clearFeedback = () => {
    for (const pending of pendingTouches.values()) win.clearTimeout(pending.timer);
    pendingTouches.clear();
    for (const button of ripples.keys()) clearRipple(button);
  };
  listen(win, 'blur', clearFeedback);
  const preference = win.matchMedia?.('(prefers-reduced-motion: reduce)');
  if (preference?.addEventListener) listen(preference, 'change', () => {if (reducedMotion()) clearFeedback();});
  const motionObserver = new win.MutationObserver(() => {if (reducedMotion()) clearFeedback();});
  motionObserver.observe(doc.documentElement, {attributes: true, attributeFilter: ['data-qm-motion']});

  listen(root, 'click', (event) => {
    const tab = closest(event, '[data-qm-tabs] [role="tab"]');
    if (tab) {
      event.preventDefault();
      activateTab(tab.closest('[data-qm-tabs]'), tab, false, true);
      return;
    }

    const opener = closest(event, '[data-qm-dialog-open]');
    if (opener && enabled(opener)) {
      const scope = opener.getRootNode();
      const dialog = scope.getElementById?.(opener.dataset.qmDialogOpen)
        || doc.getElementById(opener.dataset.qmDialogOpen);
      if (dialog?.localName !== 'dialog' || typeof dialog.showModal !== 'function') return;
      event.preventDefault();
      // Keep one modal interaction active; opening a second dialog strands focus.
      if (dialog.open || elements(scope, 'dialog[open]').length) return;
      if (!observedDialogs.has(dialog)) {
        observedDialogs.add(dialog);
        listen(dialog, 'close', () => {
          const invoker = dialogInvokers.get(dialog);
          dialogInvokers.delete(dialog);
          const active = doc.activeElement;
          if (invoker?.isConnected && enabled(invoker) && (active === doc.body || active === invoker || dialog.contains(active))) invoker.focus({ preventScroll: true });
        });
        listen(dialog, 'cancel', event => {event.preventDefault(); closeQuietDialog(dialog);});
      }
      dialogInvokers.set(dialog, opener);
      if (dialog.classList.contains('qm-dialog--sheet')) dialog.showModal();
      else {
        if (!dialog.hasAttribute('data-qm-motion-enhanced')) {dialog.setAttribute('data-qm-motion-enhanced', ''); ownedDialogMotion.add(dialog);}
        const side = dialog.matches('.qm-dialog--side-sheet, .qm-dialog--drawer');
        const full = dialog.classList.contains('qm-dialog--fullscreen');
        transitionView({from: null, to: dialog, pattern: side || full ? 'shared-axis' : 'fade', axis: side ? 'x' : 'y', update: () => dialog.showModal()});
      }
      return;
    }

    const closer = closest(event, '[data-qm-dialog-close]');
    if (closer && enabled(closer)) {
      const dialog = closer.closest('dialog');
      if (dialog?.open) {
        event.preventDefault();
        closeQuietDialog(dialog, closer.dataset.qmDialogResult || '');
      }
      return;
    }

    const chip = closest(event, 'button.qm-chip[aria-pressed]');
    if (chip && enabled(chip)) {
      const pressed = chip.getAttribute('aria-pressed') !== 'true';
      chip.setAttribute('aria-pressed', String(pressed));
      chip.dispatchEvent(new win.CustomEvent('qm:chip-change', {
        bubbles: true, detail: { pressed },
      }));
    }
  });

  listen(root, 'keydown', (event) => {
    if (event.key === 'Escape') {
      for (const wrapper of elements(root, '.qm-tooltip-wrap')) {
        if (wrapper.contains(doc.activeElement) || wrapper.matches(':hover')) {
          if (!wrapper.hasAttribute('data-qm-tooltip-dismissed')) {
            ownedTooltipDismissals.add(wrapper);
            wrapper.setAttribute('data-qm-tooltip-dismissed', '');
          }
        }
      }
    }

    const tab = closest(event, '[data-qm-tabs] [role="tab"]');
    if (tab) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const wrapper = tab.closest('[data-qm-tabs]');
      const tablist = tab.closest('[role="tablist"]');
      const tabs = tabSet(wrapper).filter(enabled);
      const vertical = tablist?.getAttribute('aria-orientation') === 'vertical';
      const rtl = win.getComputedStyle(tablist || wrapper).direction === 'rtl';
      let delta = 0;
      if (event.key === (vertical ? 'ArrowDown' : 'ArrowRight')) delta = !vertical && rtl ? -1 : 1;
      if (event.key === (vertical ? 'ArrowUp' : 'ArrowLeft')) delta = !vertical && rtl ? 1 : -1;
      let index = tabs.indexOf(tab);
      if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = tabs.length - 1;
      else if (delta) index = (index + delta + tabs.length) % tabs.length;
      else return;
      event.preventDefault();
      if (tabs[index]) activateTab(wrapper, tabs[index], true, true);
      return;
    }

    if (!event.repeat && (event.key === 'Enter' || event.key === ' ')) {
      const button = closest(event, 'button.qm-button, button.qm-chip, button.qm-fab, [data-qm-segmented] button');
      if (button) ripple(button, event);
    }
  });

  listen(win, 'keyup', event => {
    if (event.key === 'Enter' || event.key === ' ') for (const [button, active] of ripples) if (active.keyboard) releaseRipple(button);
  }, true);

  // beforetoggle exposes the outgoing pixels before the UA hides a popover.
  // The native operation proceeds immediately; only this inert copy fades out.
  for (const menu of elements(root, '.qm-menu[popover]')) {
    listen(menu, 'beforetoggle', event => {
      if (menu.hasAttribute('data-qm-input-motion')) return;
      if (event.newState === 'closed') transitionView({from: menu, to: null, pattern: 'fade', update() {}});
    });
  }

  function resetTooltip(event) {
    const wrapper = closest(event, '.qm-tooltip-wrap[data-qm-tooltip-dismissed]');
    if (!wrapper || !ownedTooltipDismissals.has(wrapper) || wrapper.contains(event.relatedTarget)) return;
    const focused = event.type === 'focusout'
      ? wrapper.contains(event.relatedTarget)
      : wrapper.contains(doc.activeElement);
    const hovered = event.type === 'pointerout' ? false : wrapper.matches(':hover');
    if (!focused && !hovered) {
      wrapper.removeAttribute('data-qm-tooltip-dismissed');
      ownedTooltipDismissals.delete(wrapper);
    }
  }
  listen(root, 'pointerout', resetTooltip);
  listen(root, 'focusout', resetTooltip);

  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    for (const cleanupComponent of componentCleanups) cleanupComponent();
    for (const remove of listeners) remove();
    clearFeedback();
    motionObserver.disconnect();
    cancelMotion(root);
    for (const dialog of ownedDialogMotion) dialog.removeAttribute('data-qm-motion-enhanced');
    ownedDialogMotion.clear();
    for (const wrapper of ownedTooltipDismissals) {
      if (wrapper.getAttribute('data-qm-tooltip-dismissed') === '') {
        wrapper.removeAttribute('data-qm-tooltip-dismissed');
      }
    }
    ownedTooltipDismissals.clear();
    dialogInvokers.clear();
    instances.delete(root);
  };
  instances.set(root, cleanup);
  return cleanup;
}

/** Show plain text feedback. Persistent unless an optional duration is supplied. */
export function showSnackbar(message, options = {}) {
  const doc = options.document || document;
  const win = doc.defaultView;
  let state = notifications.get(doc);
  if (!state || !state.region.isConnected || !state.live.isConnected) {
    const region = doc.createElement('div');
    region.className = 'qm-snackbar-region';
    region.setAttribute('aria-label', 'Notifications');
    const live = doc.createElement('div');
    live.className = 'qm-live-region';
    live.setAttribute('role', 'status');
    live.setAttribute('aria-live', 'polite');
    live.setAttribute('aria-atomic', 'true');
    // The announcer stays mounted even when a visible notification is dismissed.
    Object.assign(live.style, {
      position: 'absolute', width: '1px', height: '1px', padding: '0',
      margin: '-1px', overflow: 'hidden', clipPath: 'inset(50%)',
      whiteSpace: 'nowrap', border: '0',
    });
    (doc.body || doc.documentElement).append(region, live);
    state = { region, live, announceTimer: null };
    notifications.set(doc, state);
  }

  state.dismiss?.();
  const previousFocus = doc.activeElement;
  const snackbar = doc.createElement('div');
  snackbar.className = 'qm-snackbar';
  const content = doc.createElement('span');
  content.className = 'qm-snackbar-message';
  content.textContent = String(message);
  const button = doc.createElement('button');
  button.className = 'qm-snackbar-dismiss';
  button.type = 'button';
  button.textContent = options.dismissLabel || (options.onAction ? 'Dismiss' : options.actionLabel) || 'Dismiss';
  snackbar.append(content, button);
  let actionButton = null;
  if (typeof options.onAction === 'function') {
    actionButton = doc.createElement('button');
    actionButton.className = 'qm-snackbar-action'; actionButton.type = 'button';
    actionButton.textContent = options.actionLabel || 'Undo';
    snackbar.insertBefore(actionButton, button);
  }
  transitionView({from: null, to: snackbar, pattern: 'fade', update: () => state.region.append(snackbar)});
  win.clearTimeout(state.announceTimer);
  state.live.textContent = '';
  state.announceTimer = win.setTimeout(() => { state.live.textContent = String(message); }, 50);

  let dismissed = false;
  let timer = null;
  let remaining = Number.isFinite(options.duration) && options.duration > 0
    ? Math.max(5000, options.duration) : 0;
  let started = 0;
  let hovered = false;
  let focused = false;
  let pending = false;

  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    if (state.dismiss === dismiss) {state.dismiss = null; win.clearTimeout(state.announceTimer);}
    win.clearTimeout(timer);
    const restoreFocus = snackbar.contains(doc.activeElement);
    transitionView({from: snackbar, to: null, pattern: 'fade', update: () => snackbar.remove()});
    if (restoreFocus && previousFocus?.isConnected && typeof previousFocus.focus === 'function') {
      previousFocus.focus({ preventScroll: true });
    }
  };
  const pause = () => {
    if (timer === null) return;
    win.clearTimeout(timer);
    timer = null;
    remaining = Math.max(1, remaining - (win.performance.now() - started));
  };
  const resume = () => {
    if (dismissed || hovered || focused || pending || !remaining || timer !== null) return;
    started = win.performance.now();
    timer = win.setTimeout(dismiss, remaining);
  };
  button.addEventListener('click', dismiss);
  actionButton?.addEventListener('click', async () => {
    if (pending || dismissed) return;
    pending = true; pause(); actionButton.disabled = true;
    try { await options.onAction(); dismiss(); }
    catch (error) {
      if (!dismissed) {
        win.clearTimeout(state.announceTimer);
        state.live.textContent = options.actionErrorMessage || 'The action could not be completed. Try again.';
        snackbar.dispatchEvent(new win.CustomEvent('qm:snackbar-action-error', {bubbles:true, detail:{error}}));
      }
    } finally {pending = false; actionButton.disabled = false; resume();}
  });
  snackbar.addEventListener('pointerenter', () => { hovered = true; pause(); });
  snackbar.addEventListener('pointerleave', () => { hovered = false; resume(); });
  snackbar.addEventListener('focusin', () => { focused = true; pause(); });
  snackbar.addEventListener('focusout', (event) => {
    focused = snackbar.contains(event.relatedTarget);
    if (!focused) resume();
  });
  resume();
  state.dismiss = dismiss;
  return dismiss;
}
