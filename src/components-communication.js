import {transitionView, motionReduced} from './motion.js';

const qmCommunicationInstances = new WeakMap();
const qmProgressHandles = new WeakMap();
const qmLoadingHandles = new WeakMap();
const qmSvgNamespace = 'http://www.w3.org/2000/svg';
const qmClamp = (value, low = 0, high = 1) => Math.min(high, Math.max(low, value));

function qmCommunicationElements(root, selector) {
  return [...(root.matches?.(selector) ? [root] : []), ...root.querySelectorAll(selector)];
}

// FastOutSlowInInterpolator: cubic-bezier(.4, 0, .2, 1).
function qmProgressEase(x, x1 = .4, x2 = .2) {
  x = qmClamp(x);
  let low = 0, high = 1, t = x;
  for (let i = 0; i < 16; i++) {
    t = (low + high) / 2;
    const sample = 3 * (1-t) * (1-t) * t * x1 + 3 * (1-t) * t * t * x2 + t*t*t;
    if (sample < x) low = t; else high = t;
  }
  return 3 * (1-t) * t*t + t*t*t;
}

/** MD disjoint linear recipe; head/tail fractions for the two segments. */
export function linearProgressFrame(milliseconds) {
  const time = ((milliseconds % 1800) + 1800) % 1800;
  const bounds = [[533,1267,.2,.8],[567,1000,.4,1],[850,333,0,.65],[750,0,.1,.45]]
    .map(([duration,delay,x1,x2]) => qmProgressEase((time-delay)/duration,x1,x2));
  return [{start:bounds[0],end:bounds[1]}, {start:bounds[2],end:bounds[3]}];
}

/** MD circular advance recipe: four expand/collapse cycles over 5400ms. */
export function circularProgressFrame(milliseconds) {
  const time = ((milliseconds % 5400) + 5400) % 5400;
  let start = 1520 * time / 5400 - 20, end = 1520 * time / 5400;
  for (let cycle = 0; cycle < 4; cycle++) {
    end += 250 * qmProgressEase((time - cycle * 1350) / 667);
    start += 250 * qmProgressEase((time - cycle * 1350 - 667) / 667);
  }
  return {start, sweep: end - start};
}

function qmMakeCircle(doc, className) {
  const circle = doc.createElementNS(qmSvgNamespace, 'circle');
  for (const [key, value] of Object.entries({cx: 24, cy: 24, r: 20, fill: 'none', 'stroke-width': 4, pathLength: 100, class: className})) circle.setAttribute(key, value);
  return circle;
}

function qmVisible(element) {
  return element.isConnected && !element.closest('[hidden], [inert]') && element.getClientRects().length > 0;
}

/** Update the value and accessible state together. null means indeterminate. */
export function setProgress(element, value, max = 100) {
  const finiteMax = Number.isFinite(Number(max)) && Number(max) > 0 ? Number(max) : 100;
  const number = value === null || value === undefined || value === '' ? null : Number(value);
  const finiteValue = number !== null && Number.isFinite(number) ? qmClamp(number, 0, finiteMax) : null;
  element.setAttribute('role', 'progressbar');
  element.setAttribute('aria-valuemin', '0');
  element.setAttribute('aria-valuemax', String(finiteMax));
  element.dataset.max = String(finiteMax);
  if (finiteValue === null) {
    delete element.dataset.value;
    element.removeAttribute('aria-valuenow');
  } else {
    element.dataset.value = String(finiteValue);
    element.setAttribute('aria-valuenow', String(finiteValue));
  }
  element.style.setProperty('--qm-progress-fraction', finiteValue === null ? '.3' : String(finiteValue / finiteMax));
  for (const segment of element.querySelectorAll('.qm-progress-linear__indicator')) {
    segment.style.removeProperty('width'); segment.style.removeProperty('inset-inline-start');
  }
  const indicator = element.querySelector('.qm-progress-circular__indicator');
  if (indicator) {
    indicator.setAttribute('stroke-dasharray', `${finiteValue === null ? 25 : finiteValue / finiteMax * 100} 100`);
    indicator.setAttribute('transform', 'rotate(-90 24 24)');
  }
  qmProgressHandles.get(element)?.wake();
}

/** A labeled host owns semantics; its SVG is decorative. Call destroy before removal. */
export function mountProgress(element, {value = element.dataset.value, max = element.dataset.max || 100, circular = element.dataset.qmProgress !== 'linear'} = {}) {
  qmProgressHandles.get(element)?.destroy();
  const doc = element.ownerDocument, win = doc.defaultView;
  const original = [...element.childNodes];
  element.classList.add(circular ? 'qm-progress-circular' : 'qm-progress-linear');
  let indicator;
  if (circular) {
    const svg = doc.createElementNS(qmSvgNamespace, 'svg');
    svg.setAttribute('viewBox', '0 0 48 48'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
    indicator = qmMakeCircle(doc, 'qm-progress-circular__indicator');
    svg.append(qmMakeCircle(doc, 'qm-progress-circular__track'), indicator);
    element.replaceChildren(svg);
  } else {
    indicator = doc.createElement('span'); indicator.className = 'qm-progress-linear__indicator'; indicator.setAttribute('aria-hidden','true');
    const second = indicator.cloneNode(); second.classList.add('qm-progress-linear__secondary');
    element.replaceChildren(indicator, second);
  }
  let frame = null, epoch = null, disposed = false;
  function tick(now) {
    frame = null;
    if (disposed || element.hasAttribute('data-value') || doc.hidden || motionReduced(element) || !qmVisible(element)) return;
    epoch ??= now;
    if (circular) {
      const {start, sweep} = circularProgressFrame(now - epoch);
      indicator.setAttribute('stroke-dasharray', `${sweep / 360 * 100} 100`);
      indicator.setAttribute('transform', `rotate(${start - 90} 24 24)`);
    } else {
      const segments = linearProgressFrame(now - epoch);
      [...element.children].forEach((segment,index) => {
        const {start,end} = segments[index];
        segment.style.insetInlineStart = `${Math.min(start,end)*100}%`;
        segment.style.width = `${Math.abs(end-start)*100}%`;
      });
    }
    frame = win.requestAnimationFrame?.(tick);
  }
  function wake() {
    if (frame !== null) win.cancelAnimationFrame?.(frame);
    frame = null;
    if (!disposed && !element.hasAttribute('data-value') && !motionReduced(element) && !doc.hidden) frame = win.requestAnimationFrame?.(tick) ?? null;
  }
  const visibility = win.IntersectionObserver ? new win.IntersectionObserver(wake) : null;
  visibility?.observe(element);
  const observer = new win.MutationObserver(wake);
  observer.observe(doc.documentElement, {attributes: true, attributeFilter: ['data-qm-motion','hidden'], subtree: true});
  const media = win.matchMedia?.('(prefers-reduced-motion: reduce)');
  media?.addEventListener?.('change', wake);
  doc.addEventListener('visibilitychange', wake);
  const handle = {setValue: (next, maximum = Number(element.dataset.max)) => setProgress(element, next, maximum), wake, destroy() {
    if (disposed) return; disposed = true; win.cancelAnimationFrame?.(frame);
    visibility?.disconnect(); observer.disconnect(); media?.removeEventListener?.('change', wake); doc.removeEventListener('visibilitychange', wake);
    element.replaceChildren(...original); qmProgressHandles.delete(element);
  }};
  qmProgressHandles.set(element, handle);
  setProgress(element, value, max);
  return handle;
}

// Quiet's seven branded contour shapes. The MD3 loading timing/spring/rotation
// recipe is preserved; these sampled contours are not Android RoundedPolygon paths.
function qmLoadingContour(shape, angle) {
  const a = angle;
  if (shape === 0) return .82 + .12 * Math.cos(12*a);
  if (shape === 1) return .86 + .1 * Math.cos(9*a);
  if (shape === 2) return .87 + .08 * Math.cos(5*a);
  if (shape === 3) return .7 + .25 * Math.abs(Math.cos(a));
  if (shape === 4) return .82 + .12 * Math.cos(8*a);
  if (shape === 5) return .84 + .12 * Math.cos(4*a);
  return .76 + .2 * Math.abs(Math.sin(a));
}

export function mountLoadingIndicator(element) {
  if(qmLoadingHandles.has(element)) return qmLoadingHandles.get(element);
  const doc = element.ownerDocument, win = doc.defaultView;
  const original = [...element.childNodes];
  const svg = doc.createElementNS(qmSvgNamespace, 'svg'), path = doc.createElementNS(qmSvgNamespace, 'path');
  svg.setAttribute('viewBox', '-1.15 -1.15 2.3 2.3'); svg.setAttribute('aria-hidden','true'); svg.setAttribute('focusable','false');
  svg.append(path); element.replaceChildren(svg); element.classList.add('qm-loading-indicator'); element.setAttribute('role','progressbar');
  element.removeAttribute('aria-valuenow');
  let frame = null, last = null, elapsed = 0, position = 0, velocity = 0, disposed = false;
  function draw() {
    const whole = Math.floor(position), fraction = position - whole;
    let d = '';
    for (let index = 0; index < 96; index++) {
      const angle = index * Math.PI * 2 / 96;
      const radius = qmLoadingContour(((whole%7)+7)%7, angle)*(1-fraction) + qmLoadingContour((((whole+1)%7)+7)%7, angle)*fraction;
      d += `${index ? 'L' : 'M'}${(radius*Math.cos(angle)).toFixed(4)},${(radius*Math.sin(angle)).toFixed(4)}`;
    }
    path.setAttribute('d', d+'Z');
    path.setAttribute('transform', `rotate(${50*elapsed/650 + 90*position - 90})`);
  }
  function tick(now) {
    frame = null;
    if (disposed || doc.hidden || motionReduced(element) || !qmVisible(element)) {last = null; return;}
    const delta = last === null ? 0 : Math.min(64, now-last); last = now;
    // Small bounded integration steps retain spring velocity across shape targets.
    for (let remaining = delta; remaining > 0;) {
      const step = Math.min(4, remaining); remaining -= step; elapsed += step;
      const target = Math.floor(elapsed/650)+1, dt = step/1000;
      velocity += (200*(target-position) - 2*.6*Math.sqrt(200)*velocity)*dt;
      position += velocity*dt;
    }
    draw(); frame = win.requestAnimationFrame?.(tick);
  }
  function wake() { if (frame !== null) win.cancelAnimationFrame?.(frame); frame = null; last = null; if (!disposed && !doc.hidden && !motionReduced(element)) frame = win.requestAnimationFrame?.(tick) ?? null; }
  const observer = new win.MutationObserver(wake); observer.observe(doc.documentElement,{subtree:true,attributes:true,attributeFilter:['hidden','data-qm-motion']});
  const visibility = win.IntersectionObserver ? new win.IntersectionObserver(wake) : null; visibility?.observe(element);
  const media = win.matchMedia?.('(prefers-reduced-motion: reduce)'); media?.addEventListener?.('change',wake); doc.addEventListener('visibilitychange',wake);
  draw(); wake();
  const handle = {destroy() {if(disposed)return; disposed=true; win.cancelAnimationFrame?.(frame);observer.disconnect();visibility?.disconnect();media?.removeEventListener?.('change',wake);doc.removeEventListener('visibilitychange',wake);element.replaceChildren(...original);qmLoadingHandles.delete(element);}};
  qmLoadingHandles.set(element,handle);return handle;
}

export function initCommunicationComponents(root) {
  if(qmCommunicationInstances.has(root)) return qmCommunicationInstances.get(root);
  const doc = root.nodeType === 9 ? root : root.ownerDocument, win = doc.defaultView;
  const cleanups = [], listen = (target,type,callback) => {target.addEventListener(type,callback);cleanups.push(()=>target.removeEventListener(type,callback));};
  for(const host of qmCommunicationElements(root,'[data-qm-progress]')) cleanups.push(mountProgress(host).destroy);
  for(const host of qmCommunicationElements(root,'[data-qm-loading-indicator]')) cleanups.push(mountLoadingIndicator(host).destroy);
  let current = null;
  function close(restore = true) {
    if(!current)return;
    const {trigger, panel} = current;current=null;trigger.setAttribute('aria-expanded','false');
    transitionView({from:panel,to:null,pattern:'fade',update(){panel.hidden=true;}});
    if(restore&&trigger.isConnected)trigger.focus({preventScroll:true});
  }
  function position() {
    if(!current)return;const {trigger,panel}=current, rect=trigger.getBoundingClientRect(), box=panel.getBoundingClientRect();
    const inset=16, width=win.innerWidth||doc.documentElement.clientWidth, height=win.innerHeight||doc.documentElement.clientHeight;
    const start=win.getComputedStyle(trigger).direction==='rtl'?rect.right-box.width:rect.left;
    panel.style.left=`${Math.max(inset,Math.min(start,width-box.width-inset))}px`;
    panel.style.top=`${Math.max(inset,Math.min(rect.bottom+8,height-box.height-inset))}px`;
  }
  listen(root,'click',event=>{
    const trigger=event.target.closest?.('[data-qm-rich-tooltip]');
    if(trigger && (trigger===root||root.contains(trigger)) && !trigger.disabled && trigger.getAttribute('aria-disabled')!=='true') {
      const panel=doc.getElementById(trigger.dataset.qmRichTooltip);if(!panel)return;event.preventDefault();
      if(current?.trigger===trigger){close();return;}close(false);current={trigger,panel};
      trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-expanded','true');
      panel.setAttribute('role','dialog');panel.setAttribute('tabindex','-1');
      transitionView({from:null,to:panel,pattern:'fade',update(){panel.hidden=false;position();panel.focus({preventScroll:true});}});
    } else if(event.target.closest?.('[data-qm-rich-tooltip-close]')) close();
    else if(current && !current.panel.contains(event.target)) close(false);
  });
  listen(doc,'keydown',event=>{if(current&&event.key==='Escape'){event.preventDefault();close();}});
  listen(doc,'focusin',event=>{if(current&&!current.panel.contains(event.target)&&event.target!==current.trigger)close(false);});
  listen(win,'resize',position);listen(doc,'scroll',position);
  const cleanup=()=>{close(false);for(const stop of cleanups)stop();qmCommunicationInstances.delete(root);};
  qmCommunicationInstances.set(root,cleanup);return cleanup;
}
