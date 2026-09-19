# Action and selection components

These components extend the black Quiet Material theme. Import the main stylesheet and call `initQuietMaterial(document)`; the core initializer includes `initActionComponents`. The action module can also be initialized independently. Its returned cleanup is idempotent. Initialize after mounting markup; dispose before removing that subtree. State is stored in native controls and ARIA attributes rather than a framework store.

## Buttons, icon buttons and groups

All buttons use a minimum 48px interaction target. Add an accessible name to icon-only controls; hide decorative icons from assistive technology. Native `disabled` is preferred. Links use `aria-disabled` only when the application also prevents navigation.

```html
<button type="button" class="qm-button qm-button--filled">Save</button>
<button type="button" class="qm-button qm-button--tonal">Preview</button>
<button type="button" class="qm-button qm-button--elevated">Upload</button>
<button type="button" class="qm-button qm-button--outlined">Cancel</button>
<button type="button" class="qm-button qm-button--text">Learn more</button>
<button type="button" class="qm-button qm-button--icon qm-button--outlined"
  data-qm-icon-toggle aria-pressed="false" aria-label="Bookmark">
  <span aria-hidden="true">☆</span>
</button>

<div class="qm-button-group qm-button-group--connected" role="group" aria-label="Document actions">
  <button type="button" class="qm-button qm-button--tonal">Edit</button>
  <button type="button" class="qm-button qm-button--tonal">Share</button>
</div>
```

Remove `qm-button-group--connected` for a standard spaced group. These groups are ordinary independent actions, each in the Tab sequence. For selectable choices use segmented buttons. Connected group pressed shape uses the standard fast spatial spring; state color uses the standard fast effects spring. The icon toggle emits `qm:icon-change` with `{pressed}`. Keep the accessible label stable while toggling.

Split buttons use two separate actions, with the trailing action opening a menu:

```html
<div class="qm-split-button" role="group" aria-label="Save actions">
  <button type="button" class="qm-button qm-button--filled">Save</button>
  <button type="button" class="qm-button qm-button--filled"
    data-qm-menu-trigger="save-options" aria-controls="save-options"
    aria-haspopup="menu" aria-expanded="false" aria-label="More save options">⌄</button>
</div>
<div class="qm-menu" id="save-options" role="menu" aria-label="Save options" hidden>
  <button type="button" role="menuitem">Save a copy</button>
  <button type="button" role="menuitem">Export</button>
</div>
```

The input component module manages menu opening, positioning, keyboard behavior and return focus. The application supplies the actual Save/Export actions.

## FABs and FAB menu

```html
<button type="button" class="qm-button qm-fab qm-fab--small" aria-label="Add">+</button>
<button type="button" class="qm-button qm-fab" aria-label="Add">+</button>
<button type="button" class="qm-button qm-fab qm-fab--large" aria-label="Add">+</button>
<button type="button" class="qm-button qm-fab qm-fab--extended">
  <span aria-hidden="true">+</span> Create note
</button>

<div class="qm-fab-menu" data-qm-fab-menu>
  <button type="button" class="qm-button qm-fab" data-qm-fab-toggle
    aria-controls="create-actions" aria-expanded="false" aria-label="Create">+</button>
  <div id="create-actions" class="qm-fab-menu__actions" data-qm-fab-actions hidden>
    <button type="button" class="qm-button qm-button--tonal">New note</button>
    <button type="button" class="qm-button qm-button--tonal">New folder</button>
  </div>
</div>
```

The small FAB has a 40px visual surface inside a 48px button. Standard and large visuals are 56px and 96px. Extended FABs size to their content. Add `qm-fab-menu--floating` to opt into viewport placement; position it above your bottom navigation and safe areas as appropriate for the host app.

The FAB menu is an accessible disclosure of ordinary buttons/links, not an ARIA menu. Keyboard activation or Arrow Up opens it and focuses the first action. Escape closes and returns focus; outside press, focus departure and action selection close it. Opening another FAB menu closes the previous one. Entry uses the standard default spatial/effects springs. Exit uses the shared MD3 fade transition; semantics close immediately while an inert visual snapshot fades. Reduced-motion preferences disable movement. Product action callbacks remain application-owned.

## Segmented buttons

```html
<div class="qm-segmented" data-qm-segmented="single" data-qm-name="period" aria-label="Period">
  <button type="button" data-value="day" aria-checked="true">Day</button>
  <button type="button" data-value="week">Week</button>
  <button type="button" data-value="month">Month</button>
</div>
<div class="qm-segmented" data-qm-segmented="multiple" data-qm-name="transport" aria-label="Transport">
  <button type="button" data-value="walk" aria-pressed="true">Walk</button>
  <button type="button" data-value="bike" aria-pressed="false">Bike</button>
</div>
```

Single selection is a `radiogroup` with one checked `radio`; arrow keys select and move focus, Home/End select the first/last enabled option, and only the selected option participates in Tab order. Horizontal arrows account for RTL. `aria-orientation="vertical"` switches layout and arrow behavior. Multiple selection uses a named `group` of toggle buttons; each remains in the Tab sequence, arrows move focus without changing selection, and Enter/Space toggles normally. Disabled options are skipped. Form reset restores initial selection.

Optional `data-qm-name` creates hidden form inputs, one for each selected enabled value. The component emits `qm:segmented-change` with `{value, values}` (`value` is `null` for multiple selection). Set explicit unique `data-value` strings. Use two to five options; chips are better for longer lists. Programmatic structural changes require cleanup/reinitialization. Native required validation is not synthesized for the button group; if selection is required in a form, single-selection initialization always chooses the first enabled option.

## Chips and cards

```html
<button type="button" class="qm-chip qm-chip--assist">Add to calendar</button>
<button type="button" class="qm-chip qm-chip--suggestion">Try a shorter route</button>
<button type="button" class="qm-chip qm-chip--filter" aria-pressed="false">Unread</button>
<span class="qm-chip qm-chip--input" data-qm-input-chip data-value="design">
  <span>Design</span>
  <button type="button" data-qm-chip-remove aria-label="Remove Design">×</button>
</span>
<article class="qm-card qm-card--filled">Filled card content</article>
<article class="qm-card qm-card--outlined">Outlined card content</article>
<article class="qm-card qm-card--elevated">Elevated card content</article>
```

Assist/suggestion chips invoke app actions. Filter chip state is handled by the existing core `qm:chip-change` event. Add `qm-chip--elevated` to opt into elevation. A removable input chip uses a container plus a separate remove button, avoiding invalid nested buttons. It dispatches cancelable `qm:chip-remove` with `{value}` before removal; call `preventDefault()` when the app needs to confirm or handle state itself. Focus moves to the next available control or the preceding one. For a tag editor, place a labeled input after the chips, and maintain the application/form value when removing a chip. Set the remove button `disabled` for disabled chips. Cards carry no automatic click behavior: use a link or button inside a card for actions.

## Filled and outlined fields

```html
<div class="qm-text-field qm-text-field--filled" data-qm-text-field>
  <div class="qm-text-field__control">
    <input id="subject" name="subject" placeholder=" " maxlength="40" aria-describedby="subject-hint">
    <label for="subject">Subject</label>
  </div>
  <div class="qm-text-field__support">
    <span class="qm-helper" id="subject-hint">Keep it descriptive</span>
    <span data-qm-field-counter></span>
  </div>
</div>
```

Use `qm-text-field--outlined` for the outlined variant. `textarea` uses the same structure and can grow vertically. A real label/ID association is required. Keep `placeholder=" "` so CSS can detect an empty field before initialization. The floating label follows focus, input and browser autofill; counters retain existing `aria-describedby` references and use the same UTF-16 length definition as HTML `maxlength`. `input`/`change` events and form reset update the counter. For programmatic value changes, dispatch a bubbling `input` event. Native required/type/pattern/readonly/disabled behavior is preserved. Set `aria-invalid="true"` and link an error message when the application reports an error.

For a prefix, insert `.qm-text-field__prefix` before the input and add `.qm-text-field__control--with-prefix` to the control. Put `.qm-text-field__suffix` after the label for a suffix or a labeled action button. Use decorative icons with `aria-hidden="true"`; provide accessible names for suffix buttons.

## Checkbox, radio and sliders

```html
<label><input class="qm-checkbox" type="checkbox" name="updates"> Email updates</label>
<label><input class="qm-radio" type="radio" name="delivery" value="daily"> Daily</label>
<label><input class="qm-radio" type="radio" name="delivery" value="weekly"> Weekly</label>

<div class="qm-range-slider" data-qm-range-slider role="group" aria-label="Price range">
  <div class="qm-range-slider__track" data-qm-range-track>
    <input type="range" data-qm-range-low min="0" max="100" step="5" value="20" name="priceMin" aria-label="Minimum price">
    <input type="range" data-qm-range-high min="0" max="100" step="5" value="80" name="priceMax" aria-label="Maximum price">
  </div>
  <output data-qm-range-output></output>
</div>

<div class="qm-slider" data-qm-slider>
  <label for="volume">Volume <output data-qm-slider-output></output></label>
  <input class="qm-range" id="volume" name="volume" type="range" min="0" max="100" step="20" value="40" list="volume-ticks">
  <datalist id="volume-ticks">
    <option value="0" label="0"></option><option value="20" label="20"></option>
    <option value="40" label="40"></option><option value="60" label="60"></option>
    <option value="80" label="80"></option><option value="100" label="100"></option>
  </datalist>
</div>
```

Checkboxes and radios retain native keyboard, grouping and form behavior; their visual styles use Quiet Material roles and effects springs. Set `checkbox.indeterminate = true` for mixed state. Labels provide 48px targets. Forced-colors mode restores native checkbox/radio appearance.

The range slider has two native form controls and two individually named focus targets. The low input defines shared min/max/step; initialization applies these to both inputs. Crossing is clamped instead of swapping thumb meaning. Arrow keys change one step, Page Up/Down ten steps, Home/End reach the legal limit; horizontal arrows respect RTL. Track interaction picks the closest enabled thumb. Each thumb has a 48px pointer target around its visual handle. Native `input`/`change` are preserved and bubbling `qm:range-input`/`qm:range-change` report `{low, high}`. Outputs can show both values or set `data-qm-range-output="low"` / `"high"`. Reset restores default native values. Continuous sliders may use `step="any"`; keyboard increments are 1% of the domain in that case. Tick rendering for the native discrete single slider follows browser support; the visible output always shows its current value.

## Validation and sources

Behavior tests cover single/multi state, RTL keyboard movement, disabled controls, form values/reset, FAB focus/close, cancellable chip removal, text counters, range crossing and track input. They use jsdom and do not establish browser rendering or screen-reader interoperability. Native device validation and visual comparison to official samples remain separate release checks.

Reference component behavior was checked against Google's official [FAB documentation](https://developer.android.com/develop/ui/compose/components/fab), [segmented button documentation](https://developer.android.com/develop/ui/compose/components/segmented-button), [chip documentation](https://developer.android.com/develop/ui/compose/components/chip) and [slider documentation](https://developer.android.com/develop/ui/compose/components/slider). Quiet Material customizes color and some shapes; its implementation should not be described as a certified pixel-identical reproduction of every platform component.
