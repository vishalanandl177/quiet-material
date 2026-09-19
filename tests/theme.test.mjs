import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const styleDir = new URL('../styles/', import.meta.url);
const flat = JSON.parse(await readFile(new URL('../exports/quiet-material.tokens.resolved.json', import.meta.url), 'utf8'));
const source = JSON.parse(await readFile(new URL('../tokens/quiet-material.tokens.json', import.meta.url), 'utf8'));

/** Component stylesheets, excluding the generated token layer that legitimately holds literals. */
async function componentStyles() {
  const names = (await readdir(styleDir)).filter((name) => name.endsWith('.css') && name !== 'tokens.css');
  return Promise.all(names.map(async (name) => [name, await readFile(new URL(name, styleDir), 'utf8')]));
}

/** Drop forced-colors blocks: CSS system colours are required there and are not brand literals. */
function withoutForcedColors(css) {
  let out = '', index = 0;
  while (index < css.length) {
    const start = css.indexOf('@media (forced-colors: active)', index);
    if (start === -1) return out + css.slice(index);
    out += css.slice(index, start);
    let cursor = css.indexOf('{', start), depth = 0;
    do { if (css[cursor] === '{') depth++; else if (css[cursor] === '}') depth--; cursor++; } while (depth > 0 && cursor < css.length);
    index = cursor;
  }
  return out;
}

const COLOUR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g;

test('component stylesheets express every colour through a token', async () => {
  for (const [name, css] of await componentStyles()) {
    const offenders = [...withoutForcedColors(css).matchAll(COLOUR_LITERAL)].map((match) => match[0]);
    assert.deepEqual(offenders, [], `${name} must not hardcode colour: ${offenders.join(', ')}`);
  }
});

test('example stylesheets express every colour through a token', async () => {
  for (const name of ['demo.css', 'showcase.css']) {
    const css = await readFile(new URL(`../${name}`, import.meta.url), 'utf8').catch(() => null);
    if (css === null) continue;
    const offenders = [...withoutForcedColors(css).matchAll(COLOUR_LITERAL)].map((match) => match[0]);
    assert.deepEqual(offenders, [], `${name} must not hardcode colour: ${offenders.join(', ')}`);
  }
});

test('component stylesheets take every corner radius and stacking tier from the scale', async () => {
  for (const [name, css] of await componentStyles()) {
    const radii = [...css.matchAll(/border-radius:\s*([^;}]+)/g)]
      .map((match) => match[1].trim())
      // 50% draws a circle and 0 removes a corner; neither belongs to the step scale.
      .filter((value) => /\d(px|rem|em)/.test(value));
    assert.deepEqual(radii, [], `${name} must use radius tokens, found: ${radii.join(' | ')}`);

    const layers = [...withoutForcedColors(css).matchAll(/z-index:\s*([^;}]+)/g)]
      .map((match) => match[1].trim())
      // A negated tier such as calc(var(--qm-layer-raised) * -1) is still token-driven.
      .filter((value) => !/var\(--qm-layer-/.test(value));
    assert.deepEqual(layers, [], `${name} must use layer tokens, found: ${layers.join(' | ')}`);
  }
});

test('the neutral default theme selects no hue for primary, focus or selection', () => {
  const neutral = (hex) => {
    const [r, g, b] = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
    return r === g && g === b;
  };
  for (const role of ['colorPrimary', 'colorOnPrimary', 'colorPrimaryContainer', 'colorOnPrimaryContainer',
    'colorSecondary', 'colorOnSecondary', 'colorFocus', 'colorFocusContrast', 'colorOutline',
    'colorOutlineVariant', 'colorBackground', 'colorSurface', 'colorSurfaceLow', 'colorSurfaceHigh',
    'colorText', 'colorTextMuted', 'colorDisabled', 'colorAction', 'colorOnAction']) {
    assert.ok(neutral(flat[role]), `${role} must stay neutral in the default theme, got ${flat[role]}`);
  }
  assert.equal(flat.colorPrimary, '#f4f4f4');
  assert.equal(flat.colorOnPrimary, '#000000');
  assert.equal(flat.colorFocus, '#f4f4f4');
});

test('semantic status colours keep their hue and stay distinguishable from the neutral chrome', () => {
  assert.equal(flat.colorSuccess, '#86d9ae');
  assert.equal(flat.colorWarning, '#f3d17d');
  assert.equal(flat.colorDanger, '#ffb4ab');
  // The palette entries existing consumers may still reference must remain defined and unmoved.
  assert.equal(flat.colorPaletteBlue, '#a8c7fa');
  assert.equal(flat.colorPaletteMint, '#86d9ae');
  assert.equal(flat.colorPaletteBlueContainer, '#24354e');
  assert.equal(flat.colorPaletteMintContainer, '#153d2b');
});

test('surfaces step from pure black through three near-black levels', () => {
  assert.equal(flat.colorBackground, '#000000');
  const levels = [flat.colorBackground, flat.colorSurfaceLow, flat.colorSurface, flat.colorSurfaceHigh]
    .map((hex) => parseInt(hex.slice(1, 3), 16));
  assert.deepEqual(levels, [0, 8, 16, 24]);
  for (let i = 1; i < levels.length; i++) assert.ok(levels[i] > levels[i - 1], 'each surface step must lighten');
  assert.ok(levels.at(-1) <= 40, 'surfaces must stay near-black rather than becoming medium gray');
});

test('the shape scale covers detail, tile, control, card, feature, dialog and pill', () => {
  assert.deepEqual([flat.radiusSmall, flat.radiusTile, flat.radiusControl, flat.radiusCard,
    flat.radiusFeature, flat.radiusDialog, flat.radiusPill], [8, 12, 16, 24, 32, 32, 999]);
  assert.equal(flat.radiusCardCompact, flat.radiusCard, 'the compact card alias must follow the card radius');
});

test('elevation, layering and state-layer families are defined and exported to every platform', async () => {
  for (const name of ['elevationLevel1OffsetY', 'elevationLevel1Blur', 'elevationLevel1Color',
    'elevationLevel2OffsetY', 'elevationLevel2Blur', 'elevationLevel2Color',
    'elevationLevel3OffsetY', 'elevationLevel3Blur', 'elevationLevel3Color']) {
    assert.ok(Object.hasOwn(flat, name), `missing ${name}`);
  }
  assert.deepEqual([flat.layerBase, flat.layerRaised, flat.layerSticky, flat.layerFloating,
    flat.layerOverlay, flat.layerPopover], [0, 1, 10, 20, 30, 40]);
  assert.deepEqual([flat.stateHover, flat.stateFocus, flat.statePressed, flat.stateDragged], [0.08, 0.12, 0.12, 0.16]);
  assert.equal(flat.colorScrim, '#000000cc');
  assert.equal(flat.borderFocusOffset, 2);

  const kotlin = await readFile(new URL('../platforms/android/src/main/kotlin/com/quietmaterial/QuietTokens.kt', import.meta.url), 'utf8');
  const swift = await readFile(new URL('../platforms/apple/Sources/QuietMaterial/QuietTokens.swift', import.meta.url), 'utf8');
  const dart = await readFile(new URL('../platforms/flutter/lib/src/quiet_tokens.dart', import.meta.url), 'utf8');
  for (const name of ['colorOutlineVariant', 'colorScrim', 'colorFocusContrast', 'radiusTile', 'radiusFeature', 'layerPopover', 'stateHover']) {
    for (const [label, text] of [['Kotlin', kotlin], ['Swift', swift], ['Dart', dart]]) {
      assert.match(text, new RegExp(`\\b${name}\\b`), `${label} export is missing ${name}`);
    }
  }
});

test('the decorative outline role is documented as decorative and never replaces the control boundary', () => {
  const luminance = (hex) => {
    const channel = (value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    const [r, g, b] = [1, 3, 5].map((index) => channel(parseInt(hex.slice(index, index + 2), 16) / 255));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a, b) => {
    const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
    return (x + 0.05) / (y + 0.05);
  };
  assert.match(source.color.outlineVariant.$description ?? '', /decorat/i, 'outlineVariant must document that it is decorative');
  // The functional boundary keeps non-text contrast on every surface it can land on.
  for (const surface of ['colorBackground', 'colorSurfaceLow', 'colorSurface', 'colorSurfaceHigh']) {
    assert.ok(contrast(flat.colorOutline, flat[surface]) >= 3,
      `colorOutline on ${surface} is ${contrast(flat.colorOutline, flat[surface]).toFixed(2)}, below 3:1`);
  }
  // The focus ring reads on the black canvas and, with its separation ring, on a white-filled control.
  assert.ok(contrast(flat.colorFocus, flat.colorBackground) >= 3);
  assert.ok(contrast(flat.colorFocusContrast, flat.colorPrimary) >= 3,
    'the focus separation ring must contrast against a white-filled control');
});

test('disabled content stays distinguishable and is never the placeholder colour', () => {
  const luminance = (hex) => {
    const channel = (value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    const [r, g, b] = [1, 3, 5].map((index) => channel(parseInt(hex.slice(index, index + 2), 16) / 255));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a, b) => {
    const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
    return (x + 0.05) / (y + 0.05);
  };
  for (const surface of ['colorBackground', 'colorSurfaceLow', 'colorSurface', 'colorSurfaceHigh']) {
    assert.ok(contrast(flat.colorDisabled, flat[surface]) >= 3,
      `colorDisabled on ${surface} is ${contrast(flat.colorDisabled, flat[surface]).toFixed(2)}, below 3:1`);
  }
  assert.notEqual(flat.colorDisabled, flat.colorTextMuted, 'supporting text must not reuse the disabled colour');
});

test('component stylesheets use the spacing scale rather than repeating its raw values', async () => {
  // Every raw value that maps exactly onto a 4-unit step should be a token instead.
  const steps = new Map(Array.from({ length: 13 }, (_, index) => [`${index * 4}px`, `--qm-space-${index}`]));
  for (const [name, css] of await componentStyles()) {
    const offenders = [];
    for (const match of withoutForcedColors(css).matchAll(/(?:^|[;{])\s*(padding|margin|gap|row-gap|column-gap)(-[a-z]+)?:\s*([^;}]+)/g)) {
      for (const part of match[3].trim().split(/\s+/)) {
        if (steps.has(part)) offenders.push(`${match[1]}${match[2] ?? ''}: ${part}`);
      }
    }
    assert.deepEqual(offenders, [], `${name} should use the spacing scale: ${offenders.slice(0, 8).join(' | ')}`);
  }
});

test('state-layer opacities come from the state family', async () => {
  for (const [name, css] of await componentStyles()) {
    const offenders = [...withoutForcedColors(css).matchAll(/opacity:\s*(\.08|0\.08|\.12|0\.12|\.16|0\.16)\b/g)].map((match) => match[0]);
    assert.deepEqual(offenders, [], `${name} must use the state tokens: ${offenders.join(', ')}`);
  }
});
