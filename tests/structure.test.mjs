import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const indexURL = new URL('../index.html', import.meta.url);
const html = await readFile(indexURL, 'utf8');
// Parse the shipped example without executing application code or loading resources.
const { document } = new JSDOM(html, { url: indexURL.href }).window;
const describe = (element) => `<${element.localName}${element.id ? `#${element.id}` : ''}>`;
const referencedIds = (element, attribute) => (element.getAttribute(attribute) || '').trim().split(/\s+/).filter(Boolean);

test('example IDs are unique so navigation and accessible relationships remain unambiguous', () => {
  const seen = new Set();
  for (const element of document.querySelectorAll('[id]')) {
    assert.ok(element.id.trim(), `${describe(element)} must have a nonempty ID`);
    assert.ok(!seen.has(element.id), `Duplicate ID: ${element.id}`);
    seen.add(element.id);
  }
});

test('all ARIA labels, descriptions, control relationships, and native labels resolve', () => {
  for (const attribute of ['aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns', 'aria-activedescendant', 'aria-errormessage', 'for']) {
    for (const element of document.querySelectorAll(`[${attribute}]`)) {
      for (const id of referencedIds(element, attribute)) {
        assert.ok(document.getElementById(id), `${describe(element)} ${attribute} references missing #${id}`);
      }
    }
  }
});

test('local assets, documentation links, and page fragments in the example exist', async () => {
  const links = [...document.querySelectorAll('[href], [src]')];
  for (const element of links) {
    for (const attribute of ['href', 'src']) {
      const value = element.getAttribute(attribute);
      if (!value) continue;
      const target = new URL(value, indexURL);
      if (target.protocol !== 'file:') continue;
      if (target.pathname === indexURL.pathname && target.hash) {
        const id = decodeURIComponent(target.hash.slice(1));
        assert.ok(document.getElementById(id), `${describe(element)} links to missing #${id}`);
      }
      target.hash = '';
      target.search = '';
      await assert.doesNotReject(access(target), `${describe(element)} ${attribute} points to missing ${value}`);
    }
  }
});

test('every editable native form control has a nonempty associated label', () => {
  for (const control of document.querySelectorAll('input:not([type="hidden"]), select, textarea')) {
    const nativeLabel = [...(control.labels || [])].some((label) => label.textContent.trim());
    const ariaLabel = control.getAttribute('aria-label')?.trim();
    const referencedLabel = referencedIds(control, 'aria-labelledby').some((id) => document.getElementById(id)?.textContent.trim());
    assert.ok(nativeLabel || ariaLabel || referencedLabel, `${describe(control)} ${control.name || control.type || ''} is missing a label`);
  }
});

test('dialog and popover triggers point to named, appropriate native containers', () => {
  for (const trigger of document.querySelectorAll('[data-qm-dialog-open]')) {
    const id = trigger.getAttribute('data-qm-dialog-open').replace(/^#/, '');
    const target = document.getElementById(id);
    assert.equal(target?.localName, 'dialog', `${describe(trigger)} must open an existing native dialog #${id}`);
    assert.ok(target.hasAttribute('aria-label') || target.hasAttribute('aria-labelledby'), `Dialog #${id} must be named`);
  }
  for (const trigger of document.querySelectorAll('[popovertarget]')) {
    const id = trigger.getAttribute('popovertarget');
    assert.ok(document.getElementById(id)?.hasAttribute('popover'), `${describe(trigger)} needs an existing popover #${id}`);
  }
  for (const close of document.querySelectorAll('[data-qm-dialog-close]')) {
    assert.ok(close.closest('dialog'), `${describe(close)} must have a parent dialog`);
  }
});

test('initial tabs have reciprocal panel labels and one visible selected panel per group', () => {
  for (const tablist of document.querySelectorAll('[role="tablist"]')) {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    assert.equal(tabs.filter((tab) => tab.getAttribute('aria-selected') === 'true').length, 1, 'Exactly one tab should start selected');
    for (const tab of tabs) {
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      assert.equal(panel?.getAttribute('role'), 'tabpanel', `${describe(tab)} must control a tabpanel`);
      assert.ok(referencedIds(panel, 'aria-labelledby').includes(tab.id), `Panel #${panel.id} must be labeled by its tab`);
      const selected = tab.getAttribute('aria-selected') === 'true';
      assert.equal(panel.hidden, !selected, `Panel #${panel.id} visibility must match its selected tab`);
      assert.equal(tab.tabIndex, selected ? 0 : -1, `${describe(tab)} must participate correctly in the initial keyboard sequence`);
    }
  }
});

test('component CSS references only declared Quiet Material variables', async () => {
  const tokens = await readFile(new URL('../styles/tokens.css', import.meta.url), 'utf8');
  const components = await readFile(new URL('../styles/quiet-material.css', import.meta.url), 'utf8');
  const declared = new Set([...`${tokens}\n${components}`.matchAll(/(--qm-[a-z0-9-]+)\s*:/g)].map((match) => match[1]));
  const used = new Set([...components.matchAll(/var\(\s*(--qm-[a-z0-9-]+)/g)].map((match) => match[1]));
  for (const name of used) assert.ok(declared.has(name), `Component CSS references undeclared token ${name}`);
});
