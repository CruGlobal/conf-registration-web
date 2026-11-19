# Accessibility Focus Areas

Registrants fill out forms here, often on phones and sometimes with a screen reader or a keyboard only. AngularJS templates live in `app/features/<feature>/*.html`, `app/scripts/directives/**/*.html`, `app/scripts/services/*.html`, and `app/index.ejs`. React components live in `app/scripts/components/`. Bootstrap 3 provides `sr-only`, `sr-only-focusable`, `form-group`, and `control-label`.

**Labels and names**

- Question blocks follow `directives/blockRegistration/blockRegistration.html`: `<label id="block-label-{{block.id}}" for="block-input-{{block.id}}">` with the input's `id="block-input-{{block.id}}"`. Choice groups add `role="radiogroup" aria-labelledby="block-label-{{block.id}}"` (`blocks/radioQuestion.html`). New question types should use the same ids.
- A `<label>` that wraps its control is also fine (`<label><span translate>Card Number</span><input ...></label>` in `paymentMethods/creditCard.html`). In React use `htmlFor` with a matching `id` (`report-select-id` in `UploadPageHeader.tsx`).
- Look for: inputs, selects, and textareas with only a `placeholder`, or a `<label>` that neither wraps the control nor has `for`. The "other" text box in `blocks/radioQuestion.html` and the `<label>Registrant Name:</label>` captions in `FormStatusModal.tsx` show the problem.
- Icon-only buttons and links need a name: `aria-label="{{'...' | translate}}"` or `sr-only` text. Decorative icons get `aria-hidden="true"`, as the `fa` icons in `index.ejs` do.
- Images: `alt=""` when decorative (the conference banner in `registration.html`), real `alt` text when the image carries meaning.

**Groups, required, and errors**

- Related controls sit in a `<fieldset>` with a `<legend>` (`sr-only` is fine), as in `payment.html` and `paymentMethods/creditCard.html`. Look for: new radio or checkbox sets, or multi-part inputs (name, address, date range), with no group name.
- Required: the visible `*` is `aria-hidden="true"`, and the input uses `ng-required` so the browser exposes `required`. Look for: new required fields that only show the star.
- `show-errors` toggles Bootstrap's `has-error` class, which is a color change. Look for: new error states shown by color alone. Add text, and tie it to the field with `aria-describedby` and `aria-invalid` where you can.

**Headings and page structure**

- `index.ejs` renders the `<h1>` for admin pages (page title or event name) and for registration pages (event name), and wraps the view in `<main id="main" tabindex="-1">`. Templates for those pages start at `<h2>` and go down in order (`UploadPageHeader` uses `<h2 class="page-title">`; to change size use a class like `h4`, not a lower level). Landing, help, and Okta pages render their own `<h1>`. Look for: a new `<h1>` in an admin or registration template, and skipped levels.
- Keep the skip link working ("Skip to content", `getMainContentUrl()` to `#main`). Look for: changes that remove `id="main"` or the link's `sr-only-focusable` class.
- Tables use `<th>` for headers. Look for: `<a href="#">` used as a header with no action (as in `JournalUploadPage.tsx` and `PromoUploadPage.tsx`). It adds a fake link to the tab order. Use plain text or a real sort button.

**Keyboard and focus**

- Actions must be a real `<button type="button">` or `<a href>`. Look for: `ng-click` or `onClick` on a `div`, `span`, `i`, `td`, or `tr`, or an `<a>` with no `href` (the "Show advanced options" link in `ExportModal.tsx`). Keyboard users can't reach these. If a non-button is truly needed, it needs `role="button"`, `tabindex="0"`, and Enter and Space handling.
- The `autoFocus` directive moves focus after 300 ms. It fits a modal's first field. Look for: focus taken on page load where the user would not expect it.
- Modal close buttons in `services/genericModal.html`, `services/confirmModal.html`, and `FormStatusModal.tsx` are marked `aria-hidden="true"`, which hides a focusable button from screen readers. New modals should give the close button `aria-label="{{'Close' | translate}}"` instead of copying that.
- `ng-enter` belongs on inputs (`createEvent.html`, the promo code box in `reviewRegistration.html`), not on generic containers.
- The full-page loader (`$rootScope.loadingMsg`, `.rootLoadingMsg` in `index.ejs`) has no live region. If a PR changes it, suggest `role="status"`.

**React specifics**

- `react-bootstrap` 0.33 is old. Check that `Pagination.Item`, modals, and buttons render with readable names. `Pagination.tsx` keeps `disabled` on the end items, which screen readers use.
- Jest tests that query by role and name (`getByRole('button', { name: '3' })`) also check the accessible name. Prefer them over `data-testid` for controls.

**Checklist**

- [ ] Every new form control has a label tied by `for`/`id` (or wrapping it), with translated text
- [ ] Related controls grouped with `fieldset` and `legend`, or `role="radiogroup"` plus `aria-labelledby`
- [ ] Errors and required state not shown by color or a star alone
- [ ] Headings in order; no new `<h1>` in admin or registration templates
- [ ] Every action works by keyboard through a real button or link
- [ ] Icon-only controls have a name; decorative icons are `aria-hidden`
- [ ] Images have `alt`

## Mined from PR history

- Actions are native `<button type="button">` elements (with `class="btn-unstyled"` inside table cells, closed with `</button>`, never self-closed). Flag `ng-click` on `td`, `tr`, `i`, or `span`, `<a href="">` actions, and `role="button"` with hand-written key handlers. Use `<table>` for rows of registrant data and `<fieldset><legend>` for radio groups.
  <!-- evidence: PR #891, #899, #900, #902 -->
- `aria-describedby` and `aria-labelledby` hold element ids, never text. Inside `ng-repeat` they are unique per item (`help-block-{{block.id}}`, `registrant-name-{{r.id}}`), and the id must exist (use `ng-attr-aria-describedby` with a matching `ng-if`). An inline error sets `aria-invalid` and is linked the same way.
  <!-- evidence: PR #896, #899, #902, #903 -->
- Every control has a name: a label tied with `for`/`id` or wrapping it, a translated `aria-label` on number inputs shown by a "limit" checkbox (`regTypes.html`, `eventInformation.html`), `id="block-input-{{block.id}}"` on question controls, and `fieldset`/`legend` for payment fields. A `<label class="col-sm-3 control-label">` must not wrap the whole `col-sm-9` input column.
  <!-- evidence: PR #812, #861, #876, #903, #931, #935, #1009 -->
- Decorative icons, currency `input-group-addon`s, and separator glyphs get `aria-hidden="true"`. Don't add `aria-label` on top of visible text, a wrapping label, or a `<legend>`; keep it for icon-only controls.
  <!-- evidence: PR #900, #901, #902, #903 -->
- When a heading level changes to fix the order, keep the old look with a Bootstrap class (`<h3 class="h1">`) and update SCSS selectors that targeted the old tag. Don't change brand color variables in `app/styles/variables.scss` to fix one element's contrast.
  <!-- evidence: PR #898 -->
- Help that users need to fill in a field must not live only in a hover popover (`popover-trigger="'mouseenter'"` on an `<i>`). Put it inline or link it with `aria-describedby`; a popover trigger must be a focusable button with `'mouseenter focus'`.
  <!-- evidence: PR #779, #783, #812, #903 -->
