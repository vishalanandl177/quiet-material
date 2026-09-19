import { readFile, writeFile, mkdir, rename, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { aliasTarget, BASE_FONT_SIZE, camelName, colorBytes, cssName, dimensionValue, flattenTokens, portableValue, resolveTokens } from './token-utils.mjs';

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

const css = `/* ${generated} */\n:root {\n${[...tokens].map(([name, token]) => `  ${cssName(name)}: ${cssValue(name, token)};`).join('\n')}\n}\n\n@media (prefers-reduced-motion: reduce) {\n  :root {\n${[...resolved].filter(([, token]) => token.$type === 'duration').map(([name]) => `    ${cssName(name)}: 0ms;`).join('\n')}\n  }\n}\n`;
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
