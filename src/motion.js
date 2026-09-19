/**
 * Material motion, expressed as optional visual enhancement.
 * State, focus and navigation are committed before animation starts.
 * Token values are generated from the canonical design-token source.
 */
import { quietMotion } from '../exports/quiet-material.motion.js';

const running = new Set();
const PATTERNS = new Set(['container-transform', 'shared-axis', 'fade-through', 'fade']);
const completed = () => ({ finished: Promise.resolve(), cancel() {} });

export function motionReduced(element) {
  const doc = element?.nodeType === 9 ? element : element?.ownerDocument;
  if (!doc) return true;
  return doc.documentElement.dataset.qmMotion === 'reduced'
    || Boolean(doc.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}

/** Cancel visual work without changing the application's already-committed state. */
export function cancelMotion(root = document) {
  for (const run of [...running]) {
    if (run.targets.some((target) => root === target || root.contains?.(target)
      || (root.nodeType === 9 && target.ownerDocument === root))) run.cancel();
  }
}

function createRun(targets, decorations = []) {
  const doc = targets[0].ownerDocument;
  const win = doc.defaultView;
  const animations = [];
  const removeListeners = [];
  let resolve;
  let done = false;
  const finished = new Promise((finish) => { resolve = finish; });
  const run = { targets, cancel, finished };
  const listen = (target, name, callback, options) => {
    target?.addEventListener?.(name, callback, options);
    removeListeners.push(() => target?.removeEventListener?.(name, callback, options));
  };
  function cancel() {
    if (done) return;
    done = true;
    running.delete(run);
    for (const remove of removeListeners) remove();
    observer?.disconnect();
    for (const animation of animations) animation.cancel();
    for (const decoration of decorations) decoration.remove();
    resolve();
  }
  const preference = win.matchMedia?.('(prefers-reduced-motion: reduce)');
  const changed = () => { if (motionReduced(doc)) cancel(); };
  listen(preference, 'change', changed);
  // Older MediaQueryList implementations expose addListener instead.
  if (preference?.addListener && !preference.addEventListener) {
    preference.addListener(changed);
    removeListeners.push(() => preference.removeListener?.(changed));
  }
  const observer = win.MutationObserver ? new win.MutationObserver(changed) : null;
  observer?.observe(doc.documentElement, { attributes: true, attributeFilter: ['data-qm-motion'] });
  listen(win, 'pagehide', cancel);
  listen(win, 'resize', cancel);
  const initialScroll = { x: win.scrollX, y: win.scrollY };
  listen(doc, 'scroll', (event) => {
    // A synchronous route update may reset scroll before this run is created.
    // Its queued scroll event must not cancel the transition we just started.
    if (event.target === doc && win.scrollX === initialScroll.x && win.scrollY === initialScroll.y) return;
    cancel();
  }, true);
  listen(doc, 'visibilitychange', () => { if (doc.hidden) cancel(); });
  // Interacting again must reveal the final view immediately, including its focus ring.
  listen(doc, 'pointerdown', cancel, true);
  listen(doc, 'keydown', cancel, true);
  listen(doc, 'focusin', (event) => {
    if (targets.some((target) => target.contains(event.target))) cancel();
  }, true);
  running.add(run);
  return {
    ...run,
    animate(element, keyframes, options) {
      if (done) return;
      const animation = element.animate(keyframes, { fill: 'both', ...options });
      // Register rejection handlers before a user interrupt can cancel the animation.
      animation.finished?.catch?.(() => {});
      animations.push(animation);
      return animation;
    },
    finishWhenReady() {
      Promise.allSettled(animations.map((animation) => animation.finished)).then(cancel);
    },
  };
}

function bezierAt(points, time) {
  const [x1, y1, x2, y2] = points;
  const at = (a, b, t) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;
  let low = 0;
  let high = 1;
  for (let i = 0; i < 22; i += 1) {
    const mid = (low + high) / 2;
    if (at(x1, x2, mid) < time) low = mid;
    else high = mid;
  }
  return at(y1, y2, (low + high) / 2);
}

function easeAt(easing, time) {
  if (time <= 0) return 0;
  if (time >= 1) return 1;
  if (easing === 'emphasized') {
    const { first, second, joinX, joinY } = quietMotion.emphasized;
    return time <= joinX
      ? bezierAt(first, time / joinX) * joinY
      : joinY + bezierAt(second, (time - joinX) / (1 - joinX)) * (1 - joinY);
  }
  return Array.isArray(easing) ? bezierAt(easing, time) : time;
}

function sampled(makeFrame, easing, count = 60) {
  return Array.from({ length: count + 1 }, (_, index) => {
    const offset = index / count;
    return { ...makeFrame(easeAt(easing, offset), offset), offset };
  });
}

function frameOptions(recipe) {
  return { duration: recipe.duration, easing: 'linear' };
}

function snapshot(element) {
  const win = element.ownerDocument.defaultView;
  const clone = element.cloneNode(true);
  const originals = [element, ...element.querySelectorAll('*')];
  const copies = [clone, ...clone.querySelectorAll('*')];
  for (let index = 0; index < originals.length; index += 1) {
    const source = originals[index];
    const copy = copies[index];
    const computed = win.getComputedStyle(source);
    for (let propertyIndex = 0; propertyIndex < computed.length; propertyIndex += 1) {
      const property = computed.item(propertyIndex);
      copy.style?.setProperty(property, computed.getPropertyValue(property));
    }
    for (const attribute of [...copy.attributes]) {
      if (attribute.name === 'id' || attribute.name === 'autofocus' || attribute.name === 'for'
        || attribute.name === 'name' || attribute.name === 'role' || attribute.name === 'popover'
        || attribute.name.startsWith('aria-') || attribute.name.startsWith('data-')
        || attribute.name.startsWith('on')) copy.removeAttribute(attribute.name);
    }
    if ('value' in source && 'value' in copy) copy.value = source.value;
    if ('checked' in source && 'checked' in copy) copy.checked = source.checked;
    // A decorative dialog must not masquerade as an active application modal.
    // Its copied computed display keeps the snapshot visible without `open`.
    if (copy.localName === 'dialog') copy.removeAttribute('open');
    copy.style?.setProperty('animation', 'none', 'important');
    copy.style?.setProperty('transition', 'none', 'important');
  }
  // Live media and custom drawing surfaces are not portable DOM snapshots.
  for (const child of clone.querySelectorAll('script, iframe, object, embed, audio, video')) child.remove();
  clone.removeAttribute('hidden');
  clone.setAttribute('aria-hidden', 'true');
  clone.setAttribute('inert', '');
  clone.setAttribute('data-qm-motion-snapshot', '');
  Object.assign(clone.style, { margin: '0', pointerEvents: 'none', transform: 'none', transformOrigin: 'center' });
  return clone;
}

function boxOf(element) {
  const box = element?.getBoundingClientRect();
  return box && box.width > 0 && box.height > 0 ? box : null;
}

function placeSnapshot(clone, box, doc) {
  Object.assign(clone.style, {
    position: 'fixed', left: `${box.left}px`, top: `${box.top}px`, right: 'auto', bottom: 'auto',
    width: `${box.width}px`, height: `${box.height}px`, boxSizing: 'border-box',
    zIndex: '2147483646', overflow: 'clip',
  });
  (doc.body || doc.documentElement).append(clone);
}

function numberMix(a, b, progress) { return a + (b - a) * progress; }
function intervalProgress(progress, start, end) { return Math.max(0, Math.min(1, (progress - start) / (end - start))); }
function fadeOut(progress, threshold = 0.35) { return Math.max(0, 1 - progress / threshold); }
function fadeIn(progress, threshold = 0.35) { return Math.max(0, (progress - threshold) / (1 - threshold)); }

/**
 * Update view state synchronously, then play a cancellable MD3 transition.
 * `update` must show `to` and hide/remove `from` as appropriate. Use null for
 * fade entry/exit. Snapshot clones never take part in focus or accessibility.
 */
export function transitionView({ from = null, to = null, pattern = 'fade-through', axis = 'x', reverse = false, update }) {
  if (!PATTERNS.has(pattern)) throw new TypeError(`Unknown Material transition: ${pattern}`);
  if (!['x', 'y', 'z'].includes(axis)) throw new TypeError(`Unknown shared axis: ${axis}`);
  if (typeof update !== 'function') throw new TypeError('transitionView requires a synchronous update function');
  const target = to || from;
  if (!target?.ownerDocument) { update(); return completed(); }
  const doc = target.ownerDocument;
  const win = doc.defaultView;
  for (const existing of [...running]) {
    if (existing.targets.some((element) => [from, to].some((next) => next
      && (element === next || element.contains(next) || next.contains(element))))) existing.cancel();
  }
  const supported = typeof target.animate === 'function' && !motionReduced(target);
  let fromBox = null;
  let outgoing = null;
  let sourceRadius = '0px';
  try {
    fromBox = supported ? boxOf(from) : null;
    outgoing = fromBox ? snapshot(from) : null;
    sourceRadius = fromBox ? win.getComputedStyle(from).borderRadius : '0px';
  } catch {
    // Exotic DOM/snapshot failures are visual-only; perform the requested update.
    update();
    return completed();
  }
  update();
  if (!supported || motionReduced(target)) return completed();
  const toBox = boxOf(to);
  if (!outgoing && !toBox) return completed();
  const decorations = outgoing ? [outgoing] : [];
  const run = createRun([...new Set([from, to].filter(Boolean))], decorations);
  try {
    if (outgoing) placeSnapshot(outgoing, fromBox, doc);
    if (pattern === 'container-transform' && outgoing && toBox) {
      const recipe = reverse ? quietMotion.recipes.containerReturn : quietMotion.recipes.container;
      const incoming = snapshot(to);
      const shell = doc.createElement('div');
      const toStyle = win.getComputedStyle(to);
      shell.setAttribute('aria-hidden', 'true');
      shell.setAttribute('inert', '');
      shell.setAttribute('data-qm-motion-snapshot', '');
      Object.assign(shell.style, {
        position: 'fixed', pointerEvents: 'none', overflow: 'hidden', zIndex: '2147483646',
        background: toStyle.backgroundColor, transformOrigin: 'top left',
      });
      Object.assign(outgoing.style, { position: 'absolute', left: '0', top: '0', zIndex: 'auto' });
      Object.assign(incoming.style, {
        position: 'absolute', left: '0', top: '0', width: `${toBox.width}px`, height: `${toBox.height}px`,
        boxSizing: 'border-box', zIndex: 'auto',
      });
      shell.append(outgoing, incoming);
      (doc.body || doc.documentElement).append(shell);
      decorations.push(shell);
      // The shared container changes bounds/shape; content remains uniformly scaled.
      const radiusInterpolator = interpolateValue(sourceRadius, toStyle.borderRadius || '0px');
      run.animate(shell, sampled((progress) => ({
        left: `${numberMix(fromBox.left, toBox.left, progress)}px`,
        top: `${numberMix(fromBox.top, toBox.top, progress)}px`,
        width: `${numberMix(fromBox.width, toBox.width, progress)}px`,
        height: `${numberMix(fromBox.height, toBox.height, progress)}px`,
        borderRadius: radiusInterpolator?.(intervalProgress(progress, reverse ? 0.3 : 0, reverse ? 0.9 : 0.75)) || toStyle.borderRadius,
      }), recipe.easing), frameOptions(recipe));
      Object.assign(outgoing.style, { transformOrigin: 'top left', zIndex: reverse ? '2' : '1' });
      Object.assign(incoming.style, { transformOrigin: 'top left', zIndex: reverse ? '1' : '2' });
      run.animate(outgoing, sampled((progress) => ({
        opacity: reverse ? 1 - intervalProgress(progress, 0.6, 0.9) : 1,
        transform: `scale(${numberMix(fromBox.width, toBox.width, progress) / fromBox.width})`,
      }), recipe.easing), frameOptions(recipe));
      run.animate(incoming, sampled((progress) => ({
        opacity: reverse ? 1 : intervalProgress(progress, 0, 0.25),
        transform: `scale(${numberMix(fromBox.width, toBox.width, progress) / toBox.width})`,
      }), recipe.easing), frameOptions(recipe));
      run.animate(to, [{ opacity: 0, offset: 0 }, { opacity: 0, offset: 0.999 }, { opacity: 1, offset: 1 }], frameOptions(recipe));
    } else if (pattern === 'shared-axis') {
      const recipe = quietMotion.recipes.sharedAxis;
      const rtl = win.getComputedStyle(to || from).direction === 'rtl';
      const sign = (reverse ? -1 : 1) * (axis === 'x' && rtl ? -1 : 1);
      const transform = (progress, entering) => {
        if (axis === 'z') {
          const scale = entering
            ? numberMix(reverse ? 1.1 : 0.8, 1, progress)
            : numberMix(1, reverse ? 0.8 : 1.1, progress);
          return `scale(${scale})`;
        }
        const distance = (entering ? 1 - progress : -progress) * sign * 30;
        return `translate${axis.toUpperCase()}(${distance}px)`;
      };
      if (outgoing) run.animate(outgoing, sampled((progress) => ({
        opacity: fadeOut(progress), transform: transform(progress, false),
      }), recipe.easing), frameOptions(recipe));
      if (toBox) run.animate(to, sampled((progress) => ({
        opacity: fadeIn(progress), transform: transform(progress, true),
      }), recipe.easing), frameOptions(recipe));
    } else if (pattern === 'fade' || pattern === 'container-transform') {
      // A missing shared container degrades to Material fade.
      if (outgoing) {
        const recipe = quietMotion.recipes.fadeExit;
        run.animate(outgoing, sampled((progress) => ({ opacity: 1 - progress }), recipe.easing), frameOptions(recipe));
      }
      if (toBox) {
        const recipe = quietMotion.recipes.fadeEnter;
        run.animate(to, sampled((progress) => ({
          opacity: Math.min(1, progress / 0.3), transform: `scale(${numberMix(0.8, 1, progress)})`,
        }), recipe.easing), frameOptions(recipe));
      }
    } else {
      const recipe = quietMotion.recipes.fadeThrough;
      if (outgoing) run.animate(outgoing, sampled((progress) => ({ opacity: fadeOut(progress) }), recipe.easing), frameOptions(recipe));
      if (toBox) run.animate(to, sampled((progress) => ({
        opacity: fadeIn(progress), transform: `scale(${numberMix(0.92, 1, progress)})`,
      }), recipe.easing), frameOptions(recipe));
    }
    run.finishWhenReady();
  } catch {
    // Animation support must never prevent the committed interaction from working.
    run.cancel();
  }
  return { finished: run.finished, cancel: run.cancel };
}

function interpolateValue(start, end) {
  if (typeof start === 'number' && typeof end === 'number') {
    return (progress) => numberMix(start, end, progress);
  }
  if (typeof start !== 'string' || typeof end !== 'string') return null;
  // Hexadecimal colors are not decimal CSS values. Use rgb()/rgba() endpoints.
  if (start.includes('#') || end.includes('#')) return null;
  const numbers = /-?(?:\d*\.)?\d+(?:e[+-]?\d+)?/gi;
  const left = start.match(numbers)?.map(Number) || [];
  const right = end.match(numbers)?.map(Number) || [];
  if (left.length !== right.length || start.replace(numbers, '#') !== end.replace(numbers, '#')) return null;
  if (!left.length) return start === end ? () => start : null;
  return (progress) => {
    let index = 0;
    return end.replace(numbers, () => String(numberMix(left[index], right[index++], progress)));
  };
}

/**
 * Spring-animate two compatible numeric/unit keyframes. Commit the final value
 * in your application before calling; this function owns no persistent styles.
 * Spatial roles may overshoot. Effects roles clamp progress to avoid overshoot.
 */
export function animateMaterial(element, keyframes, { role = 'spatial', speed = 'default', scheme = 'standard' } = {}) {
  const spring = quietMotion.springs[scheme]?.[speed]?.[role];
  if (!spring) throw new TypeError('Unknown Material motion scheme, speed or role');
  if (!Array.isArray(keyframes) || keyframes.length !== 2) throw new TypeError('animateMaterial requires two endpoint keyframes');
  cancelMotion(element);
  if (motionReduced(element) || typeof element.animate !== 'function') return completed();
  const [start, end] = keyframes;
  const interpolators = Object.fromEntries(Object.keys(end).filter((key) => !['offset', 'easing', 'composite'].includes(key))
    .map((key) => [key, interpolateValue(start[key], end[key])]));
  if (!Object.keys(interpolators).length || Object.values(interpolators).some((value) => !value)) return completed();
  const frames = spring.samples.map((sample, index) => {
    const progress = role === 'effects' ? Math.max(0, Math.min(1, sample)) : sample;
    return { ...Object.fromEntries(Object.entries(interpolators).map(([key, interpolate]) => [key, interpolate(progress)])), offset: index / (spring.samples.length - 1) };
  });
  const run = createRun([element]);
  try {
    run.animate(element, frames, { duration: spring.duration, easing: 'linear' });
    run.finishWhenReady();
  } catch { run.cancel(); }
  return { finished: run.finished, cancel: run.cancel };
}
