import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { flattenTokens, resolveTokens } from '../scripts/token-utils.mjs';

const base = new URL('../', import.meta.url);
const read = (relative) => readFile(new URL(relative, base), 'utf8');
const source = JSON.parse(await read('tokens/quiet-material.tokens.json'));
const paths = [
  'styles/tokens.css',
  'exports/quiet-material.tokens.resolved.json',
  'exports/quiet-material.tokens.ts',
  'platforms/android/src/main/kotlin/com/quietmaterial/QuietTokens.kt',
  'platforms/apple/Sources/QuietMaterial/QuietTokens.swift',
  'platforms/flutter/lib/src/quiet_tokens.dart',
];
const [css, json, ts, kotlin, swift, dart] = await Promise.all(paths.map(read));
const flat = JSON.parse(json);

// Independent source traversal: export parity must not merely repeat the generator's conversion.
const leaves = [];
function collect(group, prefix = [], inheritedType) {
  for (const [key, value] of Object.entries(group)) {
    if (key.startsWith('$')) continue;
    const type = value.$type ?? group.$type ?? inheritedType;
    const trail = [...prefix, key];
    if ('$value' in value) leaves.push([trail, value, type]);
    else collect(value, trail, type);
  }
}
collect(source);
function resolve(value) {
  if (typeof value !== 'string' || !value.startsWith('{')) return value;
  const target = value.slice(1, -1).split('.').reduce((group, name) => group[name], source);
  return resolve(target.$value);
}
const exportedName = (trail) => trail.map((part, index) => index ? part[0].toUpperCase() + part.slice(1) : part).join('');
const numberLiteral = (value) => Number.isInteger(value) ? `${value}.0` : String(value);

function nativeLine(text, name) {
  const line = text.split('\n').find((entry) => new RegExp(`\\b${name}(?:\\s*:|\\s*=)`).test(entry));
  assert.ok(line, `Native export is missing ${name}`);
  return line;
}

test('every DTCG token appears in resolved JSON, typed TypeScript, and all native exports', () => {
  assert.equal(Object.keys(flat).length, leaves.length);
  const typedValues = JSON.parse(ts.match(/export const quietTokens = ([\s\S]+) as const;/)[1]);
  assert.deepEqual(typedValues, flat);
  assert.match(ts, /export type QuietTokenName = keyof typeof quietTokens/);
  for (const [trail] of leaves) {
    const name = exportedName(trail);
    assert.ok(Object.hasOwn(flat, name), `Missing portable token: ${name}`);
    for (const native of [kotlin, swift, dart]) nativeLine(native, name);
  }
  assert.doesNotMatch(json, /\{color\.|\{space\.|\{radius\.|\{size\./);
});

test('sRGB color channels and alpha remain identical across web and native exports', () => {
  for (const [trail, node, type] of leaves) {
    if (type !== 'color') continue;
    const name = exportedName(trail);
    const value = resolve(node.$value);
    const [r, g, b] = value.components.map((channel) => Math.round(channel * 255));
    const a = Math.round((value.alpha ?? 1) * 255);
    const hex = (channels) => channels.map((channel) => channel.toString(16).padStart(2, '0')).join('');
    assert.equal(flat[name], `#${hex(a === 255 ? [r, g, b] : [r, g, b, a])}`, name);
    assert.ok(nativeLine(kotlin, name).includes(`Color(0x${hex([a, r, g, b]).toUpperCase()})`), name);
    assert.ok(nativeLine(dart, name).includes(`Color(0x${hex([a, r, g, b]).toUpperCase()})`), name);
    const swiftColor = nativeLine(swift, name).match(/red: ([\d.]+) \/ 255\.0, green: ([\d.]+) \/ 255\.0, blue: ([\d.]+) \/ 255\.0, opacity: ([\d.]+) \/ 255\.0/);
    assert.ok(swiftColor, `Swift sRGB channel encoding: ${name}`);
    assert.deepEqual(swiftColor.slice(1).map(Number), [r, g, b, a], name);
  }
});

test('logical dimensions and duration milliseconds are equal across all platform APIs', () => {
  for (const [trail, node, type] of leaves) {
    if (!['dimension', 'duration'].includes(type)) continue;
    const name = exportedName(trail);
    const value = resolve(node.$value);
    const expected = value.value * (value.unit === 'rem' ? 16 : value.unit === 's' ? 1000 : 1);
    assert.equal(flat[name], expected, name);
    const k = nativeLine(kotlin, name).match(/= (-?[\d.e+-]+)f?$/);
    const s = nativeLine(swift, name).match(/= (-?[\d.e+-]+)$/);
    const d = nativeLine(dart, name).match(/= (-?[\d.e+-]+);$/);
    for (const match of [k, s, d]) {
      assert.ok(match, `Numeric value expected: ${name}`);
      assert.equal(Number(match[1]), expected, name);
    }
    if (type === 'dimension') {
      assert.match(nativeLine(kotlin, name), /: Float =/);
      assert.match(nativeLine(swift, name), /: CGFloat =/);
      assert.match(nativeLine(dart, name), /static const double /);
    } else {
      assert.match(nativeLine(kotlin, name), /: Int =/);
      assert.match(nativeLine(swift, name), /: Double =/);
      assert.match(nativeLine(dart, name), /static const int /);
    }
  }
});

test('native motion curves retain the four shared control points', () => {
  for (const [trail, node, type] of leaves) {
    if (type !== 'cubicBezier') continue;
    const name = exportedName(trail), expected = resolve(node.$value);
    assert.deepEqual(flat[name], expected);
    assert.ok(nativeLine(kotlin, name).includes(`floatArrayOf(${expected.map((part) => `${numberLiteral(part)}f`).join(', ')})`));
    assert.ok(nativeLine(swift, name).includes(`[${expected.map(numberLiteral).join(', ')}]`));
    assert.ok(nativeLine(dart, name).includes(`<double>[${expected.map(numberLiteral).join(', ')}]`));
  }
});

test('typography remains relative on the web and responsive tokens use the agreed logical sizes', () => {
  for (const [trail, node, type] of leaves) {
    if (type !== 'dimension' || trail[0] !== 'type') continue;
    const value = resolve(node.$value);
    const rem = value.value * (value.unit === 'px' ? 1 / 16 : 1);
    const variable = `--qm-${trail.join('-').replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}`;
    assert.ok(css.includes(`${variable}: ${rem}rem;`), `${variable} must respect text zoom`);
  }
  assert.deepEqual([
    flat.breakpointMedium, flat.breakpointExpanded, flat.breakpointWide,
    flat.layoutPagePaddingCompact, flat.layoutPagePaddingMedium, flat.layoutPagePaddingExpanded,
    flat.radiusCardCompact, flat.sizeTouchTarget,
  ], [600, 840, 1200, 20, 32, 48, 24, 48]);
  assert.equal(flat.colorBackground, '#000000');
});

test('all generated platform files are committed in deterministic sync with the source', async () => {
  const before = await Promise.all(paths.map(read));
  const script = fileURLToPath(new URL('scripts/build-tokens.mjs', base));
  execFileSync(process.execPath, [script]);
  const first = await Promise.all(paths.map(read));
  execFileSync(process.execPath, [script]);
  const second = await Promise.all(paths.map(read));
  for (let index = 0; index < paths.length; index++) {
    assert.equal(before[index], first[index], `Run npm run build and commit ${paths[index]}`);
    assert.equal(first[index], second[index], `Nondeterministic build: ${paths[index]}`);
  }
});

test('invalid token references fail before any platform export can silently diverge', () => {
  assert.throws(() => resolveTokens(flattenTokens({ one: { $type: 'dimension', $value: '{absent}' } })), /Unknown token reference/);
  assert.throws(() => resolveTokens(flattenTokens({ one: { $type: 'dimension', $value: '{two}' }, two: { $type: 'dimension', $value: '{one}' } })), /Cyclic token reference/);
  assert.throws(() => resolveTokens(flattenTokens({ one: { $type: 'dimension', $value: '{two}' }, two: { $type: 'number', $value: 1 } })), /type mismatch/);
  assert.throws(() => flattenTokens({ one: { two: { $type: 'number', $value: 1 } }, oneTwo: { $type: 'number', $value: 2 } }), /Duplicate exported token name/);
});
