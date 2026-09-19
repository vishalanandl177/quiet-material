import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const source = JSON.parse(await readFile(new URL('../tokens/quiet-material.tokens.json', import.meta.url), 'utf8'));
const cssURL = new URL('../styles/tokens.css', import.meta.url);

function token(path) {
  const node = path.split('.').reduce((group, key) => group?.[key], source);
  assert.ok(node && '$value' in node, `Token ${path} must exist`);
  const value = node.$value;
  return typeof value === 'string' && value.startsWith('{') ? token(value.slice(1, -1)) : value;
}
function luminance(name) {
  const color = token(`color.${name}`);
  assert.equal(color.colorSpace, 'srgb');
  assert.equal(color.alpha, 1, `Contrast test requires an opaque ${name}`);
  const channels = color.components.map((value) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}
function contrast(a, b) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + .05) / (values[1] + .05);
}

test('page canvas remains pure opaque black', () => {
  assert.deepEqual(token('color.background').components, [0, 0, 0]);
  assert.equal(token('color.background').alpha, 1);
});

test('normal text, muted text, and links meet WCAG AA on every supported surface', () => {
  for (const foreground of ['text', 'textMuted', 'primary']) {
    for (const background of ['background', 'surfaceLow', 'surface', 'surfaceHigh']) {
      const ratio = contrast(foreground, background);
      assert.ok(ratio >= 4.5, `${foreground}/${background}: ${ratio.toFixed(2)} must reach 4.5:1`);
    }
  }
});

test('action and status text meet WCAG AA inside their containers', () => {
  const pairs = [['onAction', 'action'], ['onPrimary', 'primary'], ['onPrimaryContainer', 'primaryContainer'], ['success', 'successContainer'], ['warning', 'warningContainer'], ['danger', 'dangerContainer']];
  for (const [foreground, background] of pairs) {
    const ratio = contrast(foreground, background);
    assert.ok(ratio >= 4.5, `${foreground}/${background}: ${ratio.toFixed(2)} must reach 4.5:1`);
  }
});

test('control boundaries and focus indicators reach 3:1 on supported surfaces', () => {
  for (const foreground of ['outline', 'focus']) {
    for (const background of ['background', 'surfaceLow', 'surface', 'surfaceHigh']) {
      const ratio = contrast(foreground, background);
      assert.ok(ratio >= 3, `${foreground}/${background}: ${ratio.toFixed(2)} must reach 3:1`);
    }
  }
});

test('token build is deterministic and committed CSS matches the source', async () => {
  const before = await readFile(cssURL, 'utf8');
  const script = fileURLToPath(new URL('../scripts/build-tokens.mjs', import.meta.url));
  execFileSync(process.execPath, [script]);
  const first = await readFile(cssURL, 'utf8');
  execFileSync(process.execPath, [script]);
  const second = await readFile(cssURL, 'utf8');
  assert.equal(first, second, 'Repeated builds must be byte-identical');
  assert.equal(before, first, 'Run npm run build:tokens and commit the generated CSS');
  assert.match(first, /prefers-reduced-motion: reduce/);
});
