// Opt-in, single-cycle motion studies. GIFs are never the initial image source.
export function initMotionStudies(root, {isReduced, announce = () => {}}) {
  const studies = [...root.querySelectorAll('[data-motion-study]')];
  const active = new Map();
  let sequence = 0;
  function stop(study) {
    clearTimeout(active.get(study));
    active.delete(study);
    const image = study.querySelector('img');
    const button = study.querySelector('[data-motion-play]');
    image.src = image.dataset.poster;
    button.textContent = 'Play animation';
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', `Play ${study.dataset.motionName} animation`);
  }
  function stopAll() { for (const study of studies) stop(study); }
  const handlers = studies.map(study => {
    const button = study.querySelector('[data-motion-play]');
    const handler = () => {
      if (active.has(study)) { stop(study); announce('Animation stopped.'); return; }
      if (isReduced()) { stopAll(); announce('Reduced motion is enabled. The still image remains visible.'); return; }
      stopAll(); // Keep only one moving example on screen.
      const image = study.querySelector('img');
      const source = image.dataset.animation;
      const suffix = source.startsWith('data:') ? '#' : '?';
      image.src = `${source}${suffix}play=${Date.now()}-${++sequence}`;
      button.textContent = 'Stop animation';
      button.setAttribute('aria-label', `Stop ${study.dataset.motionName} animation`);
      button.setAttribute('aria-pressed', 'true');
      const duration = Number(study.dataset.duration);
      active.set(study, setTimeout(() => {stop(study); announce('Animation complete.');}, duration));
      announce(`Playing ${study.dataset.motionName} once.`);
    };
    button.addEventListener('click', handler);
    return [button, handler];
  });
  return {stopAll, destroy() {stopAll(); handlers.forEach(([button, handler]) => button.removeEventListener('click', handler));}};
}
