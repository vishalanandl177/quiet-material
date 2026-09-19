/** Navigation and containment enhancements. Native links, scrolling and dialogs remain usable without JS. */
import { transitionView, motionReduced, animateMaterial } from './motion.js';
import { quietMotion } from '../exports/quiet-material.motion.js';

const qmNavInstances = new WeakMap();
const qmNavElements = (root, selector) => [ ...(root.matches?.(selector) ? [root] : []), ...root.querySelectorAll(selector) ];
const qmNavEnabled = (node) => !node.disabled && node.getAttribute('aria-disabled') !== 'true' && !node.closest('[hidden], [inert]');

/** Initialize one root once. Call cleanup before replacing the owning subtree. */
export function initNavigationComponents(root = document) {
  if (qmNavInstances.has(root)) return qmNavInstances.get(root);
  const doc = root.nodeType === 9 ? root : root.ownerDocument;
  const win = doc.defaultView;
  const removals = [];
  const carousels = new Map();
  const invokers = new WeakMap();
  let disposed = false;
  let drag = null;
  let suppressClick = null;
  const listen = (target, type, callback, options) => {
    target.addEventListener(type, callback, options);
    removals.push(() => target.removeEventListener(type, callback, options));
  };
  const owned = (node) => node && (node === root || root.contains(node));
  const closest = (event, selector) => {
    const node = event.composedPath().find((part) => part?.nodeType === 1)?.closest(selector);
    return owned(node) ? node : null;
  };
  const byId = (id) => root.getElementById?.(id) || [...root.querySelectorAll('[id]')].find((node) => node.id === id);
  const emit = (node, name, detail, cancelable = false) => node.dispatchEvent(new win.CustomEvent(name, { bubbles: true, cancelable, detail }));

  // One navigation tree changes layout. It never creates duplicate active destinations.
  const adaptive = qmNavElements(root, '[data-qm-navigation="adaptive"]');
  const resizeNavigation = () => {
    const layout = win.innerWidth < 600 ? 'bar' : win.innerWidth < 1200 ? 'rail' : 'drawer';
    for (const nav of adaptive) {
      if (nav.dataset.qmLayout !== layout) {
        nav.dataset.qmLayout = layout;
        emit(nav, 'qm:navigation-layout', { layout });
      }
    }
  };
  resizeNavigation();
  listen(win, 'resize', resizeNavigation);
  for (const nav of qmNavElements(root, '[data-qm-navigation]')) {
    const current = [...nav.querySelectorAll('.qm-navigation__item[aria-current]')];
    current.slice(1).forEach((item) => item.removeAttribute('aria-current'));
  }

  // Product routing remains caller owned. data-qm-nav-target is an explicit local view switch.
  listen(root, 'click', (event) => {
    const item = closest(event, '[data-qm-navigation] .qm-navigation__item');
    if (!item || event.defaultPrevented) return;
    if (!qmNavEnabled(item)) { event.preventDefault(); return; }
    if (event.button > 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const nav = item.closest('[data-qm-navigation]');
    const destination = item.dataset.qmNavTarget || item.getAttribute('href') || item.dataset.qmDestination || '';
    if (!emit(nav, 'qm:navigate', { destination, item }, true)) { event.preventDefault(); return; }
    if (!item.dataset.qmNavTarget) return;
    const next = byId(item.dataset.qmNavTarget);
    if (!next?.hasAttribute('data-qm-nav-panel')) return;
    event.preventDefault();
    const targets = [...nav.querySelectorAll('[data-qm-nav-target]')].map((link) => byId(link.dataset.qmNavTarget)).filter(Boolean);
    const previous = targets.find((panel) => !panel.hidden);
    transitionView({ from: previous === next ? null : previous, to: previous === next ? null : next, pattern: 'fade-through', update: () => {
      for (const link of nav.querySelectorAll('.qm-navigation__item')) {
        if (link === item) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
      }
      for (const panel of targets) panel.hidden = panel !== next;
    } });
  });

  for (const bar of qmNavElements(root, '[data-qm-app-bar]')) {
    const scrollTarget = byId(bar.dataset.qmScrollTarget) || win;
    let previous = scrollTarget === win ? win.scrollY : scrollTarget.scrollTop;
    const update = () => {
      const top = Math.max(0, scrollTarget === win ? win.scrollY : scrollTarget.scrollTop);
      bar.toggleAttribute('data-qm-scrolled', top > 0);
      const behavior = bar.dataset.qmScrollBehavior || 'pinned';
      if (behavior === 'exit-until-collapsed') bar.toggleAttribute('data-qm-collapsed', top > 64);
      if (behavior === 'enter-always') {
        if (top === 0 || top < previous) bar.removeAttribute('data-qm-collapsed');
        else if (top > 64) bar.setAttribute('data-qm-collapsed', '');
      }
      previous = top;
    };
    update();
    listen(scrollTarget, 'scroll', update, { passive: true });
  }

  const toolbarItems = (toolbar) => [...toolbar.querySelectorAll('button, a[href], [data-qm-toolbar-item]')]
    .filter((item) => item.closest('[data-qm-toolbar]') === toolbar && qmNavEnabled(item));
  for (const toolbar of qmNavElements(root, '[data-qm-toolbar]')) {
    const items = toolbarItems(toolbar);
    const first = items.find((item) => item.tabIndex === 0) || items[0];
    for (const item of items) item.tabIndex = item === first ? 0 : -1;
  }
  listen(root, 'focusin', (event) => {
    const toolbar = closest(event, '[data-qm-toolbar]');
    if (toolbar) {
      const items = toolbarItems(toolbar);
      if (items.includes(event.target)) for (const item of items) item.tabIndex = item === event.target ? 0 : -1;
    }
  });
  listen(root, 'keydown', (event) => {
    const toolbar = closest(event, '[data-qm-toolbar]');
    if (!toolbar || event.altKey || event.metaKey || event.ctrlKey || event.target.matches('input, textarea, select, [contenteditable="true"]')) return;
    const items = toolbarItems(toolbar);
    const index = items.indexOf(event.target);
    if (index < 0) return;
    const vertical = toolbar.getAttribute('aria-orientation') === 'vertical';
    const rtl = win.getComputedStyle(toolbar).direction === 'rtl';
    let next = index;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    else if (event.key === (vertical ? 'ArrowDown' : 'ArrowRight')) next += rtl && !vertical ? -1 : 1;
    else if (event.key === (vertical ? 'ArrowUp' : 'ArrowLeft')) next += rtl && !vertical ? 1 : -1;
    else return;
    event.preventDefault();
    items[(next + items.length) % items.length]?.focus();
  });

  function setSheetState(sheet, expanded, announce = true) {
    sheet.dataset.qmSheetState = expanded ? 'expanded' : 'collapsed';
    for (const toggle of sheet.querySelectorAll('[data-qm-sheet-toggle], [data-qm-sheet-drag]')) toggle.setAttribute('aria-expanded', String(expanded));
    for (const details of sheet.querySelectorAll('[data-qm-sheet-details]')) {
      if (!expanded && details.contains(doc.activeElement)) sheet.querySelector('[data-qm-sheet-toggle], [data-qm-sheet-drag]')?.focus({ preventScroll: true });
      details.hidden = !expanded;
    }
    if (announce) emit(sheet, 'qm:sheet-change', { expanded, state: sheet.dataset.qmSheetState });
  }
  for (const sheet of qmNavElements(root, '[data-qm-sheet]')) setSheetState(sheet, sheet.dataset.qmSheetState === 'expanded', false);
  function closeStandardSheet(sheet) {
    const invoker = invokers.get(sheet);
    transitionView({ from: sheet, to: null, pattern: 'fade', update: () => {
      sheet.hidden = true;
      if (invoker) invoker.setAttribute('aria-expanded', 'false');
      if (sheet.contains(doc.activeElement) && qmNavEnabled(invoker || sheet)) invoker?.focus({ preventScroll: true });
    } });
    emit(sheet, 'qm:sheet-close', {});
  }
  listen(root, 'click', (event) => {
    const opener = closest(event, '[data-qm-sheet-open]');
    if (opener && qmNavEnabled(opener)) {
      const sheet = byId(opener.dataset.qmSheetOpen);
      if (!sheet?.hasAttribute('data-qm-sheet') || sheet.localName === 'dialog') return;
      event.preventDefault();
      invokers.set(sheet, opener);
      opener.setAttribute('aria-expanded', 'true');
      const axis = sheet.classList.contains('qm-sheet--side') ? 'x' : 'y';
      transitionView({ from: null, to: sheet, pattern: 'shared-axis', axis, update: () => { sheet.hidden = false; } });
      emit(sheet, 'qm:sheet-open', {});
      return;
    }
    const closer = closest(event, '[data-qm-sheet-close]');
    if (closer && qmNavEnabled(closer)) {
      const sheet = closer.closest('[data-qm-sheet]');
      if (sheet && sheet.localName !== 'dialog') { event.preventDefault(); closeStandardSheet(sheet); }
      return;
    }
    const handle = closest(event, '[data-qm-sheet-toggle], [data-qm-sheet-drag]');
    if (handle && qmNavEnabled(handle)) {
      event.preventDefault();
      if (suppressClick === handle && event.detail > 0) { suppressClick = null; return; }
      suppressClick = null;
      const sheet = handle.closest('[data-qm-sheet]');
      if (sheet) setSheetState(sheet, sheet.dataset.qmSheetState !== 'expanded');
    }
  });
  listen(root, 'keydown', (event) => {
    const sheet = closest(event, '[data-qm-sheet]');
    if (event.key === 'Escape' && sheet && !sheet.hidden && sheet.localName !== 'dialog') {
      event.preventDefault();
      closeStandardSheet(sheet);
    }
  });
  listen(root, 'pointerdown', (event) => {
    const handle = closest(event, '[data-qm-sheet-drag]');
    if (!handle || !qmNavEnabled(handle) || event.button !== 0) return;
    const sheet = handle.closest('[data-qm-sheet]');
    if (!sheet) return;
    suppressClick = null;
    drag = { handle, sheet, x: event.clientX, y: event.clientY, pointerId: event.pointerId };
    handle.setPointerCapture?.(event.pointerId);
  });
  listen(win, 'pointerup', (event) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const { handle, sheet, x, y } = drag;
    drag = null;
    const side = sheet.classList.contains('qm-sheet--side');
    const rtl = win.getComputedStyle(sheet).direction === 'rtl';
    const distance = side ? (event.clientX - x) * (rtl ? -1 : 1) : event.clientY - y;
    if (Math.abs(distance) < 24) return;
    suppressClick = handle;
    setSheetState(sheet, distance < 0);
    // State commits immediately; spring feedback only enhances the handle affordance.
    animateMaterial(handle, [{ transform: 'scale(1.15)' }, { transform: 'scale(1)' }], { speed: 'fast' });
  });
  listen(win, 'pointercancel', () => { drag = null; suppressClick = null; });

  for (const carousel of qmNavElements(root, '[data-qm-carousel]')) {
    const track = carousel.querySelector('[data-qm-carousel-track]');
    if (!track) continue;
    const slides = [...track.querySelectorAll('[data-qm-carousel-item]')].filter((slide) => slide.closest('[data-qm-carousel]') === carousel);
    const previousButton = carousel.querySelector('[data-qm-carousel-prev]');
    const nextButton = carousel.querySelector('[data-qm-carousel-next]');
    const status = carousel.querySelector('[data-qm-carousel-status]');
    const vertical = carousel.classList.contains('qm-carousel--fullscreen');
    let index = Math.max(0, slides.findIndex((slide) => slide.hasAttribute('data-qm-carousel-current')));
    let frame = null;
    let finishScroll = null;
    const trailing = slides.at(-1);
    const originalMargin = trailing?.style.marginInlineEnd || '';
    const originalSnap = track.style.scrollSnapType;
    const alignTrailing = () => {
      // Let the last item reach the leading edge even when it is narrower than the track.
      // Without trailing space, next/End would announce an item that cannot become current.
      if (!vertical && trailing) trailing.style.marginInlineEnd = `${Math.max(0, track.clientWidth - trailing.getBoundingClientRect().width)}px`;
    };
    alignTrailing();
    if (!track.hasAttribute('tabindex')) track.tabIndex = 0;
    if (!carousel.hasAttribute('role')) carousel.setAttribute('role', 'region');
    carousel.setAttribute('aria-roledescription', 'carousel');
    slides.forEach((slide, i) => {
      if (!slide.hasAttribute('role')) slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      if (!slide.hasAttribute('aria-label')) slide.setAttribute('aria-label', `${i + 1} of ${slides.length}`);
    });
    if (status) { status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); status.setAttribute('aria-atomic', 'true'); }
    const update = (announce = false) => {
      if (previousButton) previousButton.disabled = !slides.length || index === 0;
      if (nextButton) nextButton.disabled = !slides.length || index === slides.length - 1;
      slides.forEach((slide, i) => {
        slide.toggleAttribute('data-qm-carousel-current', i === index);
        slide.dataset.qmCarouselPosition = i === index ? 'focus' : Math.abs(i - index) === 1 ? 'near' : 'far';
      });
      if (status) status.textContent = slides.length ? `${index + 1} / ${slides.length}` : '0 / 0';
      if (announce) emit(carousel, 'qm:carousel-change', { index, item: slides[index], count: slides.length });
    };
    const stop = (commit = false) => {
      if (frame !== null) win.cancelAnimationFrame?.(frame);
      frame = null;
      const finish = finishScroll;
      finishScroll = null;
      track.style.scrollSnapType = originalSnap;
      if (commit) finish?.();
    };
    const scrollToItem = (animate) => {
      stop();
      const slide = slides[index];
      if (!slide) return;
      const viewport = track.getBoundingClientRect();
      const item = slide.getBoundingClientRect();
      const rtl = win.getComputedStyle(track).direction === 'rtl';
      const key = vertical ? 'scrollTop' : 'scrollLeft';
      const start = track[key];
      const delta = vertical ? item.top - viewport.top : rtl ? item.right - viewport.right : item.left - viewport.left;
      const destination = start + delta;
      const commit = () => { track[key] = destination; };
      if (!animate || motionReduced(track) || typeof win.requestAnimationFrame !== 'function' || !delta) { commit(); return; }
      const spring = quietMotion.springs.standard.default.spatial;
      const started = win.performance.now();
      finishScroll = commit;
      track.style.scrollSnapType = 'none';
      const tick = (now) => {
        const progress = Math.min(1, (now - started) / spring.duration);
        const point = progress * (spring.samples.length - 1);
        const low = Math.floor(point);
        const sample = spring.samples[low] + ((spring.samples[low + 1] ?? 1) - spring.samples[low]) * (point - low);
        track[key] = start + delta * sample;
        if (progress < 1) frame = win.requestAnimationFrame(tick); else stop(true);
      };
      frame = win.requestAnimationFrame(tick);
    };
    const select = (value) => {
      const next = Math.max(0, Math.min(slides.length - 1, value));
      if (next === index || !slides.length) return;
      index = next;
      update(true);
      scrollToItem(true);
    };
    update();
    if (index > 0) scrollToItem(false);
    if (previousButton) listen(previousButton, 'click', () => select(index - 1));
    if (nextButton) listen(nextButton, 'click', () => select(index + 1));
    listen(track, 'keydown', (event) => {
      if (event.target !== track || event.ctrlKey || event.altKey || event.metaKey) return;
      const rtl = win.getComputedStyle(track).direction === 'rtl';
      let next = index;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = slides.length - 1;
      else if (event.key === (vertical ? 'ArrowDown' : 'ArrowRight')) next += rtl && !vertical ? -1 : 1;
      else if (event.key === (vertical ? 'ArrowUp' : 'ArrowLeft')) next += rtl && !vertical ? 1 : -1;
      else return;
      event.preventDefault(); select(next);
    });
    const reconcile = () => {
      if (frame !== null || !slides.length) return;
      const viewport = track.getBoundingClientRect();
      const rtl = win.getComputedStyle(track).direction === 'rtl';
      let closestIndex = 0;
      let distance = Infinity;
      slides.forEach((slide, i) => {
        const rect = slide.getBoundingClientRect();
        const difference = Math.abs(vertical ? rect.top - viewport.top : rtl ? rect.right - viewport.right : rect.left - viewport.left);
        if (difference < distance) { distance = difference; closestIndex = i; }
      });
      if (closestIndex !== index) { index = closestIndex; update(true); }
    };
    listen(track, 'scrollend', reconcile);
    // Scroll fallback is rAF-throttled and never announces transient animation frames.
    let scrollFrame = null;
    listen(track, 'scroll', () => {
      if (frame !== null || scrollFrame !== null) return;
      if (typeof win.requestAnimationFrame !== 'function') { reconcile(); return; }
      scrollFrame = win.requestAnimationFrame(() => { scrollFrame = null; reconcile(); });
    }, { passive: true });
    listen(track, 'pointerdown', () => stop(), { passive: true });
    listen(track, 'wheel', () => stop(), { passive: true });
    listen(track, 'focusin', () => stop());
    listen(doc, 'visibilitychange', () => { if (doc.hidden) stop(true); });
    listen(win, 'pagehide', () => stop(true));
    listen(win, 'resize', () => { stop(true); alignTrailing(); scrollToItem(false); });
    carousels.set(carousel, {
      stop: () => { stop(true); if (scrollFrame !== null) { win.cancelAnimationFrame?.(scrollFrame); scrollFrame = null; } },
      restore: () => { if (trailing) trailing.style.marginInlineEnd = originalMargin; },
    });
  }

  const reducedChanged = () => {
    if (motionReduced(doc)) for (const state of carousels.values()) state.stop();
  };
  const preference = win.matchMedia?.('(prefers-reduced-motion: reduce)');
  if (preference?.addEventListener) listen(preference, 'change', reducedChanged);
  else if (preference?.addListener) {
    preference.addListener(reducedChanged);
    removals.push(() => preference.removeListener?.(reducedChanged));
  }
  const observer = win.MutationObserver ? new win.MutationObserver(reducedChanged) : null;
  observer?.observe(doc.documentElement, { attributes: true, attributeFilter: ['data-qm-motion'] });
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    drag = null;
    observer?.disconnect();
    for (const remove of removals) remove();
    for (const state of carousels.values()) { state.stop(); state.restore(); }
    qmNavInstances.delete(root);
  };
  qmNavInstances.set(root, cleanup);
  return cleanup;
}
