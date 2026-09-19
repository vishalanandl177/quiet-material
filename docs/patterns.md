# Product patterns

Use these compositions to keep interfaces calm as they grow. They are design guidance; the repository supplies primitives, not backend workflows.

## Page structure

Use a black page, one clear title, one short context sentence and a primary action only when the task needs one. Group related controls in a charcoal surface. Keep most content unboxed; do not put every paragraph into a card. Make the primary reading path obvious through type size and spacing before introducing color.

Desktop pages may use a navigation rail and a main column. Compact screens collapse to one content column; critical actions stay in normal reading order. Avoid a fixed bottom bar that covers focused content. Use a narrow prose measure for documentation and a wider content region for tables or galleries.

## Settings

Group related preferences under descriptive headings. A row contains a label, optional supporting text and one control. Switches apply immediately; forms use an explicit Save action when a set of changes must be validated together. Do not mix those two models without clear copy. For risky settings, explain the consequence before the control.

Keep status visible near the setting. A snackbar may confirm a save, but a persistent error belongs beside the affected preference. Changes to animation settings must take effect immediately and still honor the operating system's reduced-motion preference.

## Forms

Start with the smallest useful set of fields. Show persistent labels and short help only where it prevents mistakes. Mark optional fields consistently. Validate on submission or after a completed field interaction; do not show errors before the user has a chance to answer. Retain entered data when submission fails.

A form has one primary submit action. Cancel returns to the previous state without silently committing changes. During submission, expose busy state and prevent duplicate requests while preserving understandable status. Success leads to a durable result; failure explains the next step.

## Destructive actions

Use plain action labels such as “Delete project.” Explain the affected object and whether recovery is possible. Require a dialog for an irreversible or unusually costly action. Give the least destructive action initial emphasis. For a reversible action, immediate feedback with a durable Undo route is often simpler. A temporary snackbar alone is not a sufficient recovery path.

## Empty, loading and error states

| State | Show | Avoid |
| --- | --- | --- |
| First use | What belongs here and one useful first action | Decorative dashboard metrics with invented values |
| No results | Applied filters, a clear reset and a search suggestion | Implying the data was deleted |
| Loading | Stable layout, labeled progress or a quiet skeleton | Indefinite shimmer with no explanation |
| Partial failure | The working content and a local retry | Replacing a whole page for one failed item |
| Offline or unavailable | Last known state, its age and a retry path | Silent optimistic success |
| Permission denied | Plain reason and appropriate contact or access route | Revealing private resource details |

Skeletons should resemble the content footprint and never masquerade as real data. A progress value is meaningful only when measured. Preserve focus and scroll during retries.

## Notifications

Use an inline status for task-local feedback. Use a snackbar for brief supplementary confirmation. Use a dialog only for a decision that must interrupt the current task. Badges summarize unread or outstanding counts; they are not a substitute for accessible notification text. Avoid continuous movement and repeated live announcements.

## Navigation and data

Links navigate; buttons change state. Tabs switch related views in the same context. Breadcrumbs communicate hierarchy and use aria-current="page" on the current location. Pagination changes a collection's page with clear labels and a persistent current-page state. Tables remain semantic tables; sorting requires explicit buttons in headers and aria-sort updates in the consuming product.

## Content voice

Use familiar words and active verbs. Labels describe the user's outcome: “Save changes,” “Create project,” “Retry.” Sentence case is the default. Avoid unexplained abbreviations, decorative exclamation marks, all-capital paragraphs and vague errors such as “Something went wrong” without a recovery action.
