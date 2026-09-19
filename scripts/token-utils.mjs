/** Resolve the DTCG source once for all generated platform exports. */
export const BASE_FONT_SIZE = 16;

export const camelName = (name) => name.split('.').map((part, index) => index ? part[0].toUpperCase() + part.slice(1) : part).join('');
export const cssName = (name) => `--qm-${name.replaceAll('.', '-').replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
export const aliasTarget = (value) => typeof value === 'string' && /^\{[^}]+\}$/.test(value) ? value.slice(1, -1) : null;

export function flattenTokens(source) {
  const tokens = new Map();
  function walk(node, trail = [], inheritedType) {
    for (const [name, value] of Object.entries(node)) {
      if (name.startsWith('$')) continue;
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`Invalid token group: ${[...trail, name].join('.')}`);
      const key = [...trail, name];
      const type = value.$type ?? node.$type ?? inheritedType;
      if ('$value' in value) tokens.set(key.join('.'), { ...value, $type: type });
      else walk(value, key, type);
    }
  }
  walk(source);
  const names = new Set();
  for (const key of tokens.keys()) {
    const name = camelName(key);
    if (names.has(name)) throw new Error(`Duplicate exported token name: ${name}`);
    names.add(name);
  }
  return tokens;
}

export function resolveTokens(tokens) {
  const resolved = new Map();
  function resolve(key, stack = new Set()) {
    if (resolved.has(key)) return resolved.get(key);
    const token = tokens.get(key);
    if (!token) throw new Error(`Unknown token reference: ${key}`);
    if (stack.has(key)) throw new Error(`Cyclic token reference: ${key}`);
    const target = aliasTarget(token.$value);
    let value = token.$value;
    if (target) {
      const referenced = resolve(target, new Set([...stack, key]));
      if (token.$type && token.$type !== referenced.$type) throw new Error(`Token reference type mismatch: ${key} → ${target}`);
      value = referenced.$value;
      token.$type ??= referenced.$type;
    }
    const result = { ...token, $value: value };
    // Validate before producing any output files.
    portableValue(result);
    resolved.set(key, result);
    return result;
  }
  return new Map([...tokens.keys()].map((key) => [key, resolve(key)]));
}

export function colorBytes(value) {
  if (value?.colorSpace !== 'srgb' || !Array.isArray(value.components) || value.components.length !== 3) throw new Error('Only three-channel sRGB colors are supported');
  const channels = [...value.components, value.alpha ?? 1];
  if (channels.some((part) => !Number.isFinite(part) || part < 0 || part > 1)) throw new Error('sRGB color channels must be numbers from 0 to 1');
  return channels.map((part) => Math.round(part * 255));
}

export function dimensionValue(value) {
  if (!Number.isFinite(value?.value) || !['px', 'rem'].includes(value.unit)) throw new Error('Dimensions must use finite px or rem values');
  return value.value * (value.unit === 'rem' ? BASE_FONT_SIZE : 1);
}

export function portableValue(token) {
  const value = token.$value;
  switch (token.$type) {
    case 'color': {
      const bytes = colorBytes(value);
      return `#${bytes.slice(0, bytes[3] === 255 ? 3 : 4).map((byte) => byte.toString(16).padStart(2, '0')).join('')}`;
    }
    case 'dimension': return dimensionValue(value);
    case 'duration': {
      if (!Number.isFinite(value?.value) || value.value < 0 || !['ms', 's'].includes(value.unit)) throw new Error('Durations must be nonnegative finite ms or s values');
      const milliseconds = value.value * (value.unit === 's' ? 1000 : 1);
      if (!Number.isSafeInteger(milliseconds)) throw new Error('Portable durations must resolve to whole milliseconds');
      return milliseconds;
    }
    case 'cubicBezier':
      if (!Array.isArray(value) || value.length !== 4 || value.some((part) => !Number.isFinite(part)) || value[0] < 0 || value[0] > 1 || value[2] < 0 || value[2] > 1) throw new Error('Invalid cubicBezier token');
      return value;
    case 'fontFamily': {
      const families = Array.isArray(value) ? value : [value];
      if (!families.length || families.some((family) => typeof family !== 'string' || !family.length)) throw new Error('fontFamily must contain nonempty strings');
      return families;
    }
    case 'fontWeight':
      if (!Number.isInteger(value) || value < 1 || value > 1000) throw new Error('fontWeight must be an integer from 1 to 1000');
      return value;
    case 'number':
      if (!Number.isFinite(value)) throw new Error('Number tokens must be finite');
      return value;
    default: throw new Error(`Unsupported token type: ${token.$type}`);
  }
}
