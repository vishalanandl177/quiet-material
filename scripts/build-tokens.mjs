import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = JSON.parse(await readFile(path.join(root, 'tokens/quiet-material.tokens.json'), 'utf8'));
const tokens = new Map();

function walk(node, trail = [], inheritedType) {
  for (const [name, value] of Object.entries(node)) {
    if (name.startsWith('$')) continue;
    const key = [...trail, name];
    const type = value.$type ?? node.$type ?? inheritedType;
    if ('$value' in value) tokens.set(key.join('.'), { ...value, $type: type });
    else walk(value, key, type);
  }
}
walk(source);

const kebab = (name) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
const variable = (name) => `--qm-${kebab(name.replaceAll('.', '-'))}`;

function cssValue(token) {
  const value = token.$value;
  if (typeof value === 'string' && /^\{[^}]+\}$/.test(value)) {
    const target = value.slice(1, -1);
    if (!tokens.has(target)) throw new Error(`Unknown token reference: ${target}`);
    return `var(${variable(target)})`;
  }
  switch (token.$type) {
    case 'color': {
      if (value.colorSpace !== 'srgb') throw new Error('Only sRGB colors are supported');
      const rgb = value.components.map((part) => Math.round(part * 255));
      if (value.alpha !== undefined && value.alpha !== 1) return `rgb(${rgb.join(' ')} / ${value.alpha})`;
      return `#${rgb.map((part) => part.toString(16).padStart(2, '0')).join('')}`;
    }
    case 'dimension':
    case 'duration': return `${value.value}${value.unit}`;
    case 'cubicBezier': return `cubic-bezier(${value.join(', ')})`;
    case 'fontFamily': return (Array.isArray(value) ? value : [value]).map((family) => /\s/.test(family) ? JSON.stringify(family) : family).join(', ');
    case 'fontWeight':
    case 'number': return String(value);
    default: throw new Error(`Unsupported token type: ${token.$type}`);
  }
}

// Detect alias cycles before generating variables that would fail at computed-value time.
for (const key of tokens.keys()) {
  const visited = new Set();
  let current = key;
  while (current) {
    if (visited.has(current)) throw new Error(`Cyclic token reference: ${current}`);
    visited.add(current);
    const value = tokens.get(current)?.$value;
    current = typeof value === 'string' && /^\{[^}]+\}$/.test(value) ? value.slice(1, -1) : null;
  }
}

const css = `/* Generated from tokens/quiet-material.tokens.json. Run npm run build. */\n:root {\n${[...tokens].map(([name, token]) => `  ${variable(name)}: ${cssValue(token)};`).join('\n')}\n}\n\n@media (prefers-reduced-motion: reduce) {\n  :root {\n    --qm-duration-instant: 0ms;\n    --qm-duration-short: 0ms;\n    --qm-duration-medium: 0ms;\n    --qm-duration-long: 0ms;\n  }\n}\n`;
await writeFile(path.join(root, 'styles/tokens.css'), css);
console.log(`Built ${tokens.size} tokens → styles/tokens.css`);
