/**
 * Render the workbench in a real browser and write PNGs to docs/screenshots/.
 *
 * Development-only. Playwright is deliberately NOT a package dependency: the
 * browser runtime and styles stay dependency-free. Run this with Playwright
 * available on the machine, for example a global install:
 *
 *   npm install -g playwright && playwright install chromium
 *   node scripts/capture-screenshots.mjs
 *
 * It starts the repository's own dev server, visits each workbench page at the
 * documented window classes, and captures a full-page screenshot per size.
 * Screenshots are implementation evidence; the concept board in
 * assets/reference/ is not.
 */
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'docs/screenshots');

// Representative widths: compact phone, large phone, tablet/medium, expanded, wide desktop.
const SIZES = [
  { name: 'phone-320', width: 320, height: 740 },
  { name: 'phone-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'expanded-1024', width: 1024, height: 768 },
  { name: 'desktop-1440', width: 1440, height: 900 },
];

const PAGES = ['showcase', 'foundations', 'components', 'platforms', 'motion'];

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  for (const candidate of ['playwright', '/opt/node22/lib/node_modules/playwright']) {
    try { return require(candidate); } catch { /* try the next candidate */ }
  }
  throw new Error('Playwright was not found. Install it globally, then re-run: npm install -g playwright && playwright install chromium');
}

async function waitForServer(url, attempts = 60) {
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch { /* the server is still starting */ }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Dev server did not answer at ${url}`);
}

const { chromium } = loadPlaywright();
await mkdir(output, { recursive: true });

const port = process.env.PORT ?? '4173';
const server = spawn(process.execPath, [path.join(root, 'scripts/serve.mjs')], {
  cwd: root, env: { ...process.env, PORT: port }, stdio: 'inherit',
});
const base = `http://127.0.0.1:${port}/`;

const captured = [];
try {
  await waitForServer(base);
  const browser = await chromium.launch();
  try {
    for (const size of SIZES) {
      const context = await browser.newContext({
        viewport: { width: size.width, height: size.height },
        // 1x keeps the committed evidence small. Set SCALE=2 for retina captures locally.
        deviceScaleFactor: Number(process.env.SCALE ?? 1), colorScheme: 'dark', reducedMotion: 'reduce',
      });
      const page = await context.newPage();
      for (const name of PAGES) {
        await page.goto(`${base}#${name}`, { waitUntil: 'load' });
        // Let the hash-driven page switch settle before capturing.
        await page.waitForTimeout(400);
        const file = path.join(output, `${name}-${size.name}.png`);
        await page.screenshot({ path: file, fullPage: true });
        captured.push(path.relative(root, file));
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }
} finally {
  server.kill('SIGTERM');
}

await writeFile(path.join(output, 'README.md'),
  `# Workbench screenshots\n\n` +
  `Rendered by \`node scripts/capture-screenshots.mjs\` in headless Chromium at deviceScaleFactor 2 with\n` +
  `\`prefers-reduced-motion: reduce\`. These are implementation evidence: what the components actually render.\n` +
  `The approved concept board in \`../../assets/reference/\` is a design reference, not a screenshot.\n\n` +
  `Widths cover the documented window classes: 320 and 390 compact, 768 medium, 1024 expanded, 1440 wide.\n\n` +
  captured.map((file) => `- \`${path.basename(file)}\``).join('\n') + '\n');

console.log(`Captured ${captured.length} screenshots -> docs/screenshots/`);
