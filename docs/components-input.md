# Menus, search, dropdowns and pickers

Import the core stylesheet (which includes these component styles) and initialize the core package, or initialize `initInputComponents(root)` from `src/components-input.js` directly. Initialization is idempotent per root; call its returned cleanup function before discarding that root. Mount helpers also return `destroy()` for owned DOM/listener cleanup. A host should belong to only one mounted picker/search instance.

This implementation follows [Material date picker variants](https://developer.android.com/develop/ui/compose/components/datepickers), [Material dial/input time pickers](https://developer.android.com/develop/ui/compose/components/time-pickers), the [WAI-ARIA combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/), and [menu button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/). Every popup here shares one appearance: a #181818 surface with a decorative 1px #242424 edge and the level-2 shadow, raised onto the popover tier by the positioner or onto the browser top layer when native `popover` is used. Semantic state updates immediately; MD3 fade transitions enhance popup/dialog changes, and standard spring tokens animate selection surfaces and clock movement. Both operating-system reduced motion and `data-qm-motion="reduced"` on the document root are respected.

## Menu

```html
<button class="qm-button" data-qm-menu-trigger="project-menu"
  aria-controls="project-menu" aria-haspopup="menu" aria-expanded="false">
  Project actions
</button>
<div id="project-menu" class="qm-menu" role="menu" aria-label="Project actions" hidden>
  <button type="button" role="menuitem" data-value="rename">Rename</button>
  <button type="button" role="menuitemcheckbox" aria-checked="false" data-value="sync">Sync</button>
  <div role="group" aria-label="View density">
    <button type="button" role="menuitemradio" aria-checked="true" data-value="comfortable">Comfortable</button>
    <button type="button" role="menuitemradio" aria-checked="false" data-value="compact">Compact</button>
  </div>
</div>
```

A menu panel is at least 220px wide at the 24px card radius, and its items are 16px-radius rows that take the #242424 graphite container with white content when hovered or keyboard-active, the same current-row treatment lists use. A checked `menuitemcheckbox` or `menuitemradio` adds a white checkmark at the end of its row, so the checked state is a glyph plus `aria-checked`, not a fill. Separators are the decorative #242424, and a disabled item drops to #777777.

Use ordinary buttons or links with menuitem roles. `disabled` and `aria-disabled="true"` items cannot activate. Up/Down, Home/End and typeahead move focus; Enter/Space activates; Escape returns to the invoker; Tab closes the menu and resumes page navigation. Pointer/focus outside dismisses it. A submenu trigger is a menuitem with its own `data-qm-menu-trigger` and `aria-haspopup`; horizontal arrows respect RTL. Menus can optionally use `popover="manual"` for the browser top layer, or use the hidden/fixed-position fallback. Positioning flips vertically and clamps to the viewport; it updates on scroll/resize. For menus inside clipping containers, use the native popover option.

Listen for `qm:menu-select` with `{value, checked, item}`. Checkbox/radio state is updated before dispatch. Applications perform the selected action; the menu never evaluates item content as code. Values default to text when `data-value` is absent.

## Exposed dropdown

```html
<div class="qm-exposed-dropdown qm-exposed-dropdown--filled" data-qm-combobox>
  <label for="platform-choice">Platform</label>
  <input id="platform-choice" role="combobox" readonly>
  <div role="listbox" aria-label="Platforms" hidden>
    <div role="option" data-value="android">Android</div>
    <div role="option" data-value="ios">iOS</div>
    <div role="option" data-value="web">Web</div>
  </div>
</div>
```

The closed control is a field first: #080808 fill, functional 1px #828282 edge, 16px control radius and a 56px height, with its label above it in #b7b7b7. The filled variant fills with #181818 and keeps a single functional bottom edge; the outlined variant keeps the full edge. Focus turns that edge white, an invalid control turns it #ffb4ab, and a disabled one drops its content to #777777. The listbox is the shared popup surface at the 16px control radius. Its rows use the current-row treatment rather than the white selection fill: both the keyboard-active option and the already-selected option take the #242424 graphite container with white content, and the committed choice is additionally carried by `aria-selected`, the input's displayed label and `input.dataset.value`. A disabled option shows #777777.

Use `qm-exposed-dropdown--outlined` for the outlined variant. Keep `readonly` for select-only behavior, or remove it for editable filtering. Editing retains input focus, with `aria-activedescendant` identifying the active option. Up/Down navigates, Enter commits, Escape dismisses. Home/End and typeahead apply to select-only controls; editable controls preserve text-editing shortcuts. Disabled options use `aria-disabled="true"`. Selection updates the input's displayed label, `input.dataset.value`, native `change`, and `qm:combobox-change` with `{value,label}`. A custom `data-label` on an option overrides its display text. Bind the selected value to your form model/hidden input if submission requires the option value instead of its visible label.

## Date picker

```js
import { mountDatePicker } from './src/components-input.js';
const travelDates = mountDatePicker(document.querySelector('#travel-dates'), {
  range: true,
  value: { start: '2026-09-19', end: '2026-09-25' },
  min: '2026-01-01',
  max: '2027-12-31',
  locale: 'en-IN',
  weekStartsOn: 1,
  modal: true,
  label: 'Choose travel dates',
  onChange(value) { console.log(value.start, value.end); }
});
travelDates.open();
// travelDates.value; travelDates.setValue({ start: '2026-10-01', end: '2026-10-05' });
// travelDates.close(); // cancels the current draft
// travelDates.destroy();
```

Single-date mode is the default and takes/returns a `YYYY-MM-DD` string. Range mode takes/returns `{start,end}`. Omit `value` to begin empty. `min` and `max` are inclusive civil dates; default bounds are years 0001-9999. No UTC parsing or ISO timestamp conversion occurs. Invalid initialization/setValue values throw `RangeError` before modifying the selection. The calendar renders localized month, weekday and accessible day names; the input mode deliberately uses an unambiguous `YYYY-MM-DD` format, with labels and errors.

The calendar is a #101010 picker surface at the 32px dialog radius, with weekday headers in #b7b7b7. Day cells are circular and transparent until something is true about them: hover adds #181818; today, when it is not selected, gets an inset ring in the functional #828282; a selected day is the white #f4f4f4 fill with a #000000 numeral; a day outside the shown month stays #b7b7b7; and a disabled day is #777777. In range mode the days between the endpoints take the #242424 graphite container with white numerals and square corners, and the two endpoints keep the white circular fill, so the span reads as a run with two chosen ends. A focused white-filled day adds the inner #000000 separation ring inside the white focus ring, which keeps focus distinct from selection while moving through a month.

Every date cell preserves a 48 × 48 CSS-pixel target. The calendar scrolls horizontally inside its labeled region when the viewport cannot fit seven targets; it never requires the picker itself to become wider than its container. Keyboard focus on a day lets the browser reveal that day within the scroll region. The keyboard-input toggle remains outside the scroll region as a compact alternative.

The date grid supports arrows, RTL horizontal arrows, Home/End for week boundaries, PageUp/PageDown for month changes, and Shift+PageUp/PageDown for years. Leap years and month lengths are respected. Clicking two range endpoints in reverse order produces an ordered range. Out-of-bounds dates are disabled. The first selection starts a new range after a completed one.

Selection updates a draft (`qm:date-input`); **OK** commits `qm:date-change`/`onChange`; **Cancel** or dialog Escape discards it (`qm:date-cancel`). Numeric input validates real calendar dates, bounds and ordered endpoints before enabling OK. Inline calendars and modal date/range dialogs use the same controller.

Declarative equivalents:

```html
<div data-qm-date-picker data-label="Travel date" data-value="2026-09-19"></div>
<div data-qm-date-picker data-range data-modal data-label="Travel dates"
  data-value="2026-09-19/2026-09-25" data-min="2026-01-01" data-max="2027-12-31"></div>
```

## Time picker

```js
import { mountTimePicker } from './src/components-input.js';
const reminderTime = mountTimePicker(document.querySelector('#reminder-time'), {
  value: '14:35', hour24: false, modal: true, label: 'Reminder time',
  onChange(value) { console.log(value); } // Always HH:mm (24-hour value)
});
```

Options: `value` defaults to `09:30`; `hour24` defaults to true; `modal` defaults to false. Controller: `open()`, `close()` (cancel), `setValue('HH:mm')`, readonly `value`, `destroy()`. Invalid time strings throw `RangeError`.

The hour and minute fields are #181818 tiles at the 12px tile radius, and the active field takes the white fill with black digits; the AM/PM selector is a pill with a functional #828282 edge whose chosen half takes the same white fill. Both add the inner #000000 ring when focused. The dial is a #181818 circle with white numerals, a white fill under the selected mark and a hairline white hand with a white center knob; nothing on it depends on hue.

The clock provides pointer/touch selection and a focusable slider for keyboard/screen-reader use. The 24-hour clock has outer 1-12 and inner 13-23/00 rings. Minute dragging selects every minute; printed marks show five-minute intervals. Selecting an hour by pointer advances to minutes. Arrow keys adjust one step, PageUp/PageDown five, Home/End the bounds, and Enter/Space changes the active hour/minute field. Explicit hour/minute buttons are also provided. Input mode validates hours/minutes, including noon/midnight conversion for 12-hour input. AM/PM stays visible in both modes.

Drafts emit `qm:time-input`; OK emits `qm:time-change` with `{value}` and calls `onChange`. Cancel/Escape restores the committed value and emits `qm:time-cancel`.

```html
<div data-qm-time-picker data-value="14:35" data-hour24="false"
  data-modal data-label="Reminder time"></div>
```

## Search bar and search view

```js
import { mountSearch } from './src/components-input.js';
const search = mountSearch(document.querySelector('#catalog-search'), {
  label: 'Search component catalog',
  placeholder: 'Find a component',
  modal: true,
  suggestions: ['Buttons', { label: 'Motion tokens', value: 'motion' }],
  async onSearch(query) {
    const results = await searchCatalog(query); // Product-owned function
    renderResults(results); // Render within the search view or your application
  }
});
// search.setSuggestions(['Cards', 'Dialogs']);
// search.input; search.open(); search.close(); search.destroy();
```

The search bar is a #101010 pill, 56px tall, with a functional 1px #828282 edge; its inner input is transparent with no second border, and its placeholder renders in #b7b7b7 supporting color at full opacity rather than the #777777 disabled color. Suggestions drop into the shared popup surface at the 16px control radius, with the keyboard-active suggestion taking the #242424 graphite container with white content. The status line under the bar is #b7b7b7 and disappears when empty. Inline mode shows a search bar with suggestions; modal mode opens a search view with Back, editable search and clear controls. The semantic `search` form handles Enter and its submit button. Suggestions use the same keyboard combobox pattern. A selected suggestion submits its visible query; its separate value remains available in `qm:combobox-change`. Every submission emits `qm:search` with `{query}`; `onSearch` is optional and can return a promise. Loading, completion, empty-query and error status are announced. Stale promises cannot overwrite the latest status. Applications must similarly guard their own asynchronous results before rendering. Strings are always inserted as text; the component does not inject suggestion HTML, send network requests, or navigate automatically.

```html
<div data-qm-search data-modal data-label="Search components"
  data-suggestions='["Buttons","Cards","Motion tokens"]'></div>
```

## Validation and implementation scope

The dependency-free web controllers are tested with jsdom for calendar arithmetic/bounds, leap days, input validation, draft/cancel/commit, keyboard focus behavior, selection, async search status, safe text rendering, pointer coordinate conversion, cleanup and reinitialization. These are DOM behavior tests, not claims of screen-reader, real-browser rendering or device certification. Modal variants require a browser with native `HTMLDialogElement.showModal()` support. Native mobile adapters use platform toolkit components; these HTML widgets are not native Android/iOS controls.

The calendar uses the Gregorian civil calendar with configurable display locale/week start. Calendar systems other than Gregorian, recurring schedules, timezone-aware appointments, locale-specific free-form date parsing, multi-date selection, and application search-result rendering are product-level extensions. The input contract never infers a timezone from a calendar date or a time-of-day string.
