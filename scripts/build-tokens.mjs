import { readFile, writeFile, mkdir, rename, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { aliasTarget, BASE_FONT_SIZE, camelName, colorBytes, cssName, cubicProgress, dimensionValue, emphasizedProgress, flattenTokens, portableValue, resolveTokens, sampleSpring } from './token-utils.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = JSON.parse(await readFile(path.join(root, 'tokens/quiet-material.tokens.json'), 'utf8'));
const tokens = flattenTokens(source);
const resolved = resolveTokens(tokens);
const flat = Object.fromEntries([...resolved].map(([name, token]) => [camelName(name), portableValue(token)]));
const generated = 'Generated from tokens/quiet-material.tokens.json. Run npm run build. Do not edit.';
const units = 'Dimensions are logical units (CSS px / Android dp or sp / Apple pt / Flutter logical pixels); rem uses a 16-unit baseline. Durations are milliseconds. Apply native text scaling and reduced-motion preferences in components.';

function cssValue(name, token) {
  const value = token.$value;
  const target = aliasTarget(value);
  if (target) {
    // CSS aliases keep theme overrides live; text/nontext cross-aliases need explicit unit conversion.
    if (token.$type === 'dimension' && name.startsWith('type.') !== target.startsWith('type.')) {
      const dimension = dimensionValue(resolved.get(name).$value);
      return name.startsWith('type.') ? `${dimension / BASE_FONT_SIZE}rem` : `${dimension}px`;
    }
    return `var(${cssName(target)})`;
  }
  switch (token.$type) {
    case 'color': {
      const [red, green, blue, alpha] = colorBytes(value);
      return alpha === 255 ? portableValue(token) : `rgb(${red} ${green} ${blue} / ${alpha / 255})`;
    }
    case 'dimension': return name.startsWith('type.') ? `${dimensionValue(value) / BASE_FONT_SIZE}rem` : `${dimensionValue(value)}px`;
    case 'duration': return `${portableValue(token)}ms`;
    case 'cubicBezier': return `cubic-bezier(${value.join(', ')})`;
    case 'fontFamily': return portableValue(token).map((family) => /\s/.test(family) ? JSON.stringify(family) : family).join(', ');
    case 'fontWeight':
    case 'number': return String(value);
    default: throw new Error(`Unsupported token type: ${token.$type}`);
  }
}

const emphasized = {
  path: source.easing.emphasized.$extensions['com.quietmaterial.motion'].path,
  first: flat.easingEmphasizedFirst, second: flat.easingEmphasizedSecond,
  joinX: flat.easingEmphasizedJoinX, joinY: flat.easingEmphasizedJoinY,
};
const emphasizedSamples = [...new Set([...Array.from({ length: 1025 }, (_, i) => i / 1024), emphasized.joinX])].sort((a, b) => a - b);
const emphasizedCSS = `linear(${emphasizedSamples.map((time) => `${Number(emphasizedProgress(emphasized, time).toFixed(9))} ${Number((time * 100).toFixed(9))}%`).join(', ')})`;
const springs = Object.fromEntries(['standard', 'expressive'].map((scheme) => [scheme,
  Object.fromEntries(['fast', 'default', 'slow'].map((speed) => [speed,
    Object.fromEntries(['spatial', 'effects'].map((kind) => {
      const prefix = camelName(`spring.${scheme}.${speed}.${kind}`);
      return [kind, sampleSpring(flat[`${prefix}Damping`], flat[`${prefix}Stiffness`])];
    }))
  ]))
]));
const recipes = Object.fromEntries(Object.entries(source.motion).filter(([name]) => !name.startsWith('$') && name !== 'ripple').map(([name, recipe]) => [name, {
  duration: flat[camelName(`motion.${name}.duration`)],
  easing: recipe.$extensions?.['com.quietmaterial.motion']?.easingPath ? 'emphasized' : flat[camelName(`motion.${name}.easing`)],
}]));
// MaterialFade reaches full incoming opacity at .3 of the eased progress.
// Include the exact clamp boundary so linear interpolation cannot round its knee.
let fadeKneeLow = 0, fadeKneeHigh = 1;
for (let i = 0; i < 40; i++) {
  const middle = (fadeKneeLow + fadeKneeHigh) / 2;
  if (cubicProgress(recipes.fadeEnter.easing, middle) < .3) fadeKneeLow = middle;
  else fadeKneeHigh = middle;
}
const fadeOpacityTimes = [...new Set([...Array.from({ length: 1025 }, (_, i) => i / 1024), (fadeKneeLow + fadeKneeHigh) / 2])].sort((a, b) => a - b);
const fadeOpacityCSS = `linear(${fadeOpacityTimes.map((time) => `${Number(Math.min(1, cubicProgress(recipes.fadeEnter.easing, time) / .3).toFixed(9))} ${Number((time * 100).toFixed(9))}%`).join(', ')})`;
const ripple = Object.fromEntries(Object.keys(source.motion.ripple).filter((name) => !name.startsWith('$')).map((name) => [name, flat[camelName(`motion.ripple.${name}`)]]));
const motion = {
  emphasized, springs, recipes, ripple,
  webSampling: { mass: 1, initialVelocity: 0, displacementThreshold: 0.001, velocityThreshold: 0.001, minimumFramesPerSecond: 60,
    description: 'Finite sampled web approximation. Spring durations are derived from conservative settling envelopes, not MD3 duration slots. Native engines use physical parameters and may settle differently.' },
};
const springCSS = Object.entries(springs).flatMap(([scheme, speeds]) => Object.entries(speeds).flatMap(([speed, kinds]) => Object.entries(kinds).map(([kind, value]) => [`--qm-spring-${scheme}-${speed}-${kind}`, value])));
const pathAliases = Object.entries(recipes).filter(([, recipe]) => recipe.easing === 'emphasized').map(([name]) => `  ${cssName(`motion.${name}.easing`)}: var(--qm-easing-emphasized);`);
const reducedDurations = [...resolved].filter(([, token]) => token.$type === 'duration').map(([name]) => cssName(name)).concat(springCSS.map(([name]) => `${name}-duration`));
const css = `/* ${generated} */\n:root {\n${[...tokens].map(([name, token]) => `  ${cssName(name)}: ${cssValue(name, token)};`).join('\n')}\n  /* Compatibility approximation for browsers without CSS linear() easing. */\n  --qm-easing-emphasized: var(--qm-easing-standard);\n  /* Approximate uniform fade when CSS linear() timing is unavailable. */\n  --qm-motion-fade-enter-opacity-easing: linear;\n${pathAliases.join('\n')}\n${springCSS.map(([name, value]) => `  ${name}-duration: ${value.duration}ms;\n  ${name}-easing: var(--qm-easing-standard);`).join('\n')}\n}\n\n/* Sampled exact path / zero-velocity spring trajectories when linear() is supported. */\n@supports (animation-timing-function: linear(0, 1)) {\n  :root {\n    --qm-easing-emphasized: ${emphasizedCSS};\n    --qm-motion-fade-enter-opacity-easing: ${fadeOpacityCSS};\n${springCSS.map(([name, value]) => `    ${name}-easing: ${value.cssEasing};`).join('\n')}\n  }\n}\n\n:root[data-qm-motion="reduced"] {\n${reducedDurations.map((name) => `  ${name}: 0ms;`).join('\n')}\n}\n\n@media (prefers-reduced-motion: reduce) {\n  :root {\n${reducedDurations.map((name) => `    ${name}: 0ms;`).join('\n')}\n  }\n}\n`;
const json = `${JSON.stringify(flat, null, 2)}\n`;
const typescript = `// ${generated}\n// ${units}\nexport const quietTokens = ${JSON.stringify(flat, null, 2)} as const;\n\nexport type QuietTokenName = keyof typeof quietTokens;\nexport type QuietTokens = typeof quietTokens;\n`;

const decimal = (value) => Number.isInteger(value) ? `${value}.0` : String(value);
const argb = (value) => {
  const [red, green, blue, alpha] = colorBytes(value);
  return [alpha, red, green, blue].map((byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
};
function kotlinLine(name, token) {
  const key = camelName(name), value = portableValue(token);
  switch (token.$type) {
    case 'color': return `    val ${key}: Color = Color(0x${argb(token.$value)})`;
    case 'dimension':
    case 'number': return `    const val ${key}: Float = ${decimal(value)}f`;
    case 'fontWeight':
    case 'duration': return `    const val ${key}: Int = ${value}`;
    case 'fontFamily': return `    val ${key}: List<String> = listOf(${value.map(JSON.stringify).join(', ')})`;
    case 'cubicBezier': return `    val ${key}: FloatArray = floatArrayOf(${value.map((part) => `${decimal(part)}f`).join(', ')})`;
  }
}
function swiftLine(name, token) {
  const key = camelName(name), value = portableValue(token);
  switch (token.$type) {
    case 'color': {
      const [red, green, blue, alpha] = colorBytes(token.$value);
      return `    public static let ${key}: Color = Color(.sRGB, red: ${decimal(red)} / 255.0, green: ${decimal(green)} / 255.0, blue: ${decimal(blue)} / 255.0, opacity: ${decimal(alpha)} / 255.0)`;
    }
    case 'dimension': return `    public static let ${key}: CGFloat = ${decimal(value)}`;
    case 'fontWeight': return `    public static let ${key}: Int = ${value}`;
    case 'number':
    case 'duration': return `    public static let ${key}: Double = ${decimal(value)}`;
    case 'fontFamily': return `    public static let ${key}: [String] = [${value.map(JSON.stringify).join(', ')}]`;
    case 'cubicBezier': return `    public static let ${key}: [Double] = [${value.map(decimal).join(', ')}]`;
  }
}
function dartLine(name, token) {
  const key = camelName(name), value = portableValue(token);
  switch (token.$type) {
    case 'color': return `  static const Color ${key} = Color(0x${argb(token.$value)});`;
    case 'dimension':
    case 'number': return `  static const double ${key} = ${decimal(value)};`;
    case 'fontWeight':
    case 'duration': return `  static const int ${key} = ${value};`;
    case 'fontFamily': return `  static const List<String> ${key} = <String>[${value.map(JSON.stringify).join(', ')}];`;
    case 'cubicBezier': return `  static const List<double> ${key} = <double>[${value.map(decimal).join(', ')}];`;
  }
}

const outputs = new Map([
  ['styles/tokens.css', css],
  ['exports/quiet-material.tokens.resolved.json', json],
  ['exports/quiet-material.tokens.ts', typescript],
  ['exports/quiet-material.tokens.js', `// ${generated}\n// ${units}\nexport const quietTokens = ${JSON.stringify(flat, null, 2)};\n`],
  ['exports/quiet-material.motion.json', `${JSON.stringify(motion, null, 2)}\n`],
  ['exports/quiet-material.motion.js', `// ${generated}\n// Durations in milliseconds. Exact physical springs and finite web approximations are both included.\nexport const quietMotion = ${JSON.stringify(motion, null, 2)};\n`],
  ['platforms/android/src/main/kotlin/com/quietmaterial/QuietTokens.kt', `// ${generated}\n// ${units}\npackage com.quietmaterial\n\nimport androidx.compose.ui.graphics.Color\n\nobject QuietTokens {\n${[...resolved].map(([name, token]) => kotlinLine(name, token)).join('\n')}\n}\n`],
  ['platforms/apple/Sources/QuietMaterial/QuietTokens.swift', `// ${generated}\n// ${units}\nimport SwiftUI\n\npublic enum QuietTokens {\n${[...resolved].map(([name, token]) => swiftLine(name, token)).join('\n')}\n}\n`],
  ['platforms/flutter/lib/src/quiet_tokens.dart', `// ${generated}\n// ${units}\nimport 'package:flutter/painting.dart';\n\nabstract final class QuietTokens {\n${[...resolved].map(([name, token]) => dartLine(name, token)).join('\n')}\n}\n`],
]);

// Atomic writes avoid truncated generated assets when concurrent checks run a build.
for (const [relative, contents] of outputs) {
  const destination = path.join(root, relative);
  await mkdir(path.dirname(destination), { recursive: true });
  if (await readFile(destination, 'utf8').catch(() => null) === contents) continue;
  const temporary = `${destination}.${process.pid}.tmp`;
  try {
    await writeFile(temporary, contents);
    await rename(temporary, destination);
  } finally {
    await rm(temporary, { force: true });
  }
}
console.log(`Built ${tokens.size} tokens → CSS, resolved JSON, TypeScript, Kotlin, Swift, Dart`);
