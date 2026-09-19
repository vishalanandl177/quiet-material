import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { quietTokens } from '../exports/quiet-material.tokens.js';
import { quietMotion } from '../exports/quiet-material.motion.js';
import { cubicProgress, emphasizedProgress, sampleSpring } from '../scripts/token-utils.mjs';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const source = JSON.parse(await read('tokens/quiet-material.tokens.json'));
const css = await read('styles/tokens.css');

test('all sixteen MD3 duration slots have their specified values and preserve old aliases', () => {
  const scale = { Short: [50, 100, 150, 200], Medium: [250, 300, 350, 400], Long: [450, 500, 550, 600], ExtraLong: [700, 800, 900, 1000] };
  for (const [group, values] of Object.entries(scale)) values.forEach((value, index) => {
    assert.equal(quietTokens[`duration${group}${index + 1}`], value);
  });
  assert.deepEqual([quietTokens.durationInstant, quietTokens.durationShort, quietTokens.durationMedium, quietTokens.durationLong], [100, 150, 250, 350]);
  assert.equal(source.duration.short.$value, '{duration.short3}');
});

test('MD3 standard, emphasized entry/exit and linear curves retain official control points', () => {
  const curves = { Standard: [.2, 0, 0, 1], StandardAccelerate: [.3, 0, 1, 1], StandardDecelerate: [0, 0, 0, 1], EmphasizedAccelerate: [.3, 0, .8, .15], EmphasizedDecelerate: [.05, .7, .1, 1], Linear: [0, 0, 1, 1] };
  for (const [name, value] of Object.entries(curves)) assert.deepEqual(quietTokens[`easing${name}`], value);
  assert.equal(source.easing.enter.$value, '{easing.standardDecelerate}');
  assert.equal(source.easing.exit.$value, '{easing.standardAccelerate}');
});

test('emphasized path retains both exact segments and is not replaced by the standard cubic', () => {
  const path = quietMotion.emphasized;
  assert.equal(path.path, 'M 0,0 C 0.05,0 0.133333,0.06 0.166666,0.4 C 0.208333,0.82 0.25,1 1,1');
  assert.equal(path.joinX, .166666);
  assert.equal(path.joinY, .4);
  const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-12, `${actual} ≠ ${expected}`);
  near(path.first[0] * path.joinX, .05);
  near(path.first[2] * path.joinX, .133333);
  near(path.first[3] * path.joinY, .06);
  near(path.second[0] * (1 - path.joinX) + path.joinX, .208333);
  near(path.second[1] * (1 - path.joinY) + path.joinY, .82);
  near(path.second[2] * (1 - path.joinX) + path.joinX, .25);
  near(emphasizedProgress(path, path.joinX), .4);
  assert.equal(emphasizedProgress(path, 0), 0);
  assert.equal(emphasizedProgress(path, 1), 1);
  assert.ok(Math.abs(emphasizedProgress(path, .1) - cubicProgress([.2, 0, 0, 1], .1)) > .01);
});

test('sampled CSS emphasized curve stays within 0.0001 of the exact segmented path', () => {
  const matches = css.match(/--qm-easing-emphasized: linear\(([^;]+)\);/);
  assert.ok(matches, 'Progressive CSS must expose the segmented path');
  const points = matches[1].split(', ').map((pair) => pair.split(' ').map((part) => Number(part.replace('%', ''))));
  let index = 0;
  for (let step = 0; step <= 8000; step++) {
    const x = step / 8000;
    while (index + 1 < points.length - 1 && points[index + 1][1] / 100 < x) index++;
    const [y0, p0] = points[index], [y1, p1] = points[index + 1];
    const interpolated = y0 + (y1 - y0) * ((x * 100 - p0) / (p1 - p0));
    assert.ok(Math.abs(interpolated - emphasizedProgress(quietMotion.emphasized, x)) < .0001, `CSS path error at ${x}`);
  }
  assert.match(css, /Compatibility approximation for browsers without CSS linear/);
});

test('both MD3 spring schemes provide six correct physical roles and finite web samples', () => {
  const spatial = { standard: { fast: [.9, 1400], default: [.9, 700], slow: [.9, 300] }, expressive: { fast: [.6, 800], default: [.8, 380], slow: [.8, 200] } };
  for (const [scheme, speeds] of Object.entries(spatial)) {
    for (const [speed, pair] of Object.entries(speeds)) {
      assert.deepEqual([quietMotion.springs[scheme][speed].spatial.damping, quietMotion.springs[scheme][speed].spatial.stiffness], pair);
      const effects = quietMotion.springs[scheme][speed].effects;
      assert.equal(effects.damping, 1);
      assert.equal(effects.stiffness, { fast: 3800, default: 1600, slow: 800 }[speed]);
      for (const kind of ['spatial', 'effects']) {
        const spring = quietMotion.springs[scheme][speed][kind];
        assert.ok(spring.duration > 0 && spring.duration < 2000);
        assert.equal(spring.samples[0], 0);
        assert.equal(spring.samples.at(-1), 1);
        assert.ok((spring.samples.length - 1) / (spring.duration / 1000) >= 60);
        assert.ok(spring.samples.every(Number.isFinite));
        if (kind === 'effects') assert.ok(spring.samples.every((x) => x >= 0 && x <= 1), 'Effects cannot overshoot opacity/color bounds');
        // Check a generated critical response sample independently of the generator.
        if (kind === 'effects') {
          const t = spring.duration / (spring.samples.length - 1) / 1000;
          const omega = Math.sqrt(spring.stiffness);
          assert.ok(Math.abs(spring.samples[1] - (1 - (1 + omega * t) * Math.exp(-omega * t))) < 1e-8);
        }
        assert.match(css, new RegExp(`--qm-spring-${scheme}-${speed}-${kind}-duration: ${spring.duration}ms;`));
      }
    }
  }
  assert.throws(() => sampleSpring(0, 100), /positive MD3 spring/);
});

test('transition bindings follow current MD3 component theme slots, not legacy fallback timings', () => {
  assert.deepEqual(Object.fromEntries(['container', 'containerReturn', 'sharedAxis', 'fadeThrough', 'fadeEnter', 'fadeExit'].map((name) => [name, quietMotion.recipes[name].duration])), {
    container: 500, containerReturn: 400, sharedAxis: 450, fadeThrough: 450, fadeEnter: 400, fadeExit: 150,
  });
  for (const name of ['container', 'containerReturn', 'sharedAxis', 'fadeThrough']) assert.equal(quietMotion.recipes[name].easing, 'emphasized');
  assert.deepEqual(quietMotion.recipes.fadeEnter.easing, [.05, .7, .1, 1]);
  assert.deepEqual(quietMotion.recipes.fadeExit.easing, [.3, 0, .8, .15]);
  assert.deepEqual(quietMotion.ripple, { growDuration: 450, minimumPressDuration: 225, touchDelay: 150, fadeInDuration: 105, fadeDuration: 375, hoverDuration: 15, easing: [.2, 0, 0, 1] });
});

test('every system, component and derived spring duration respects both reduced-motion controls', () => {
  const local = css.match(/:root\[data-qm-motion="reduced"\] \{([^}]+)\}/)[1];
  const os = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
  const durationNames = [...css.matchAll(/\s(--qm-[\w-]+): \d+ms;/g)].map((match) => match[1]);
  for (const name of new Set(durationNames)) {
    assert.ok(local.includes(`${name}: 0ms;`), `Local reduction missing ${name}`);
    assert.ok(os.includes(`${name}: 0ms;`), `OS reduction missing ${name}`);
  }
});

test('generated runtime exports match JSON and rebuild deterministically', async () => {
  assert.deepEqual(quietTokens, JSON.parse(await read('exports/quiet-material.tokens.resolved.json')));
  assert.deepEqual(quietMotion, JSON.parse(await read('exports/quiet-material.motion.json')));
  const files = ['exports/quiet-material.tokens.js', 'exports/quiet-material.motion.js', 'exports/quiet-material.motion.json'];
  const before = await Promise.all(files.map(read));
  execFileSync(process.execPath, [fileURLToPath(new URL('scripts/build-tokens.mjs', root))]);
  assert.deepEqual(await Promise.all(files.map(read)), before);
  const provenance = JSON.parse(await read('tokens/motion-sources.json'));
  assert.ok(provenance.sources.filter((entry) => entry.url.includes('github.com')).every((entry) => /\/blob\/[a-f0-9]{40}\//.test(entry.url)));
});
