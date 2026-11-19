# Standards — Checklist

Generic baseline. Every item here is mandatory unless the repo's own conventions override it —
`/agent-review:init` appends the repo-specific checklist, and both layers are kept.

This is an explicit checklist: report compliance for each **bold group below** in the
`### Rule Checklist Results` section of your output (✅ / ⚠️ / ❌ / N/A), and raise anything
non-compliant as a finding at the severity its impact warrants.

**Exports & Naming**

- [ ] Export style matches the repo's convention (named vs default) — don't introduce a second style
- [ ] File and directory naming follows the existing convention (casing, suffixes, special filenames
      the framework requires)
- [ ] Public identifiers are descriptive; abbreviations match ones already used in the codebase
- [ ] Imports use the repo's alias/path convention rather than deep relative traversal

**Types**

- [ ] No escape hatches that disable type checking in new code (untyped `any`-equivalents, suppression
      comments) without an inline comment explaining why
- [ ] No non-null/force-unwrap assertions on values that can legitimately be absent — check explicitly
- [ ] Types are derived from a single source of truth rather than hand-duplicated alongside it

**Input & Forms**

- [ ] User input is validated with the repo's established validation approach, not ad-hoc checks
- [ ] Every client-side validation rule has a server-side counterpart
- [ ] Submit/confirm actions are disabled or guarded while in flight so they can't double-fire

**Data**

- [ ] Writes invalidate or update the cached data they affect
- [ ] Cache/query keys are stable, descriptive, and scoped to the resource and its inputs
- [ ] Queries rely on the real authorization boundary, not on a client-side filter

**Dates & Numbers**

- [ ] Date math uses the repo's chosen date library and format conventions, not ad-hoc arithmetic
- [ ] Numeric formatting and rounding happen at the display boundary, consistently

**Testing**

- [ ] Every new function, hook, and non-trivial component has a test in the repo's conventional
      location
- [ ] Tests use the repo's runner and mocking idioms
- [ ] Test code is typed as strictly as production code

**Code Quality**

- [ ] Lint, type-check, and format commands pass
- [ ] No debug output left behind (console/print statements, debuggers, `TODO` without a tracked issue
      reference)
- [ ] No unused imports, variables, or dead parameters
- [ ] No commented-out code blocks (delete, don't comment)
- [ ] No empty catch blocks that swallow errors silently
- [ ] Package-manager usage matches the repo's lockfile (don't mix tools)

<!-- init: extend this file with repo-specific focus areas and evidence links -->

## Repo-specific checklist: conf-registration-web (Event Registration Tool)

Report each bold group below in `### Rule Checklist Results` as well.

**AngularJS files and registration**

- [ ] Route controllers live at `app/features/<feature>/<feature>.controller.js` (or `.ts`) next to the route's `.html` template; directives at `app/scripts/directives/<name>/<name>.js` with `<name>.html`; filters at `app/scripts/filters/<name>.js`; services at `app/scripts/services/<name>.js` or `.ts`. Nothing new goes in `app/scripts/controllers/` or a `views/` folder
- [ ] Registered on the one app module with the chained form `angular.module('confRegistrationWebApp').controller('name', ...)` (same for `.directive`, `.factory`, `.service`, `.filter`, `.constant`, `.component`), and named like the neighbors: route controllers `<feature>Ctrl` in camelCase (`eventDetailsCtrl`, `globalPromotionsCtrl`), modal controllers `<name>Modal` (`paymentModal`, `journalUploadReviewModal`), class services `<name>Service`, caches `<Thing>Cache`
- [ ] The new file is imported in `app/scripts/main.js` under the right heading, and its templates are imported as modules (`import template from './x.html'`, then `templateUrl: template`)
- [ ] DI still works after minifying: functions passed straight to `.controller(...)`, `.factory(...)`, and route `resolve` are handled by `babel-plugin-angularjs-annotate`; class constructors carry `/* @ngInject */` like `globalPromotionService.ts`, `MinistriesCache.ts`, and `globalPromotions.controller.ts`; spots the plugin may not see (`resolveRedirectTo`, inline modal `controller:` functions) use `/*@ngInject*/` as in `app.config.js` and `loginDialog.js`. `@babel/plugin-transform-function-name` stays excluded in `babel-angular.config.js`
- [ ] No `replace: true` on directives, no `$http(...).success()` / `.error()`, no `$cookieStore` (`angular/no-directive-replace`, `angular/no-http-callback`, and `angular/no-cookiestore` are errors)

**React and TypeScript files**

- [ ] Components at `app/scripts/components/<Name>/<Name>.tsx` (PascalCase) with `<Name>.test.tsx`; when Angular uses the component, a separate `<Name>_angular.ts` holds only the `react2angular` registration (the inline registration in `ExportModal.tsx`, `FormStatusModal.tsx`, and `GoogleLogin.tsx` is the older style)
- [ ] Hooks at `app/scripts/hooks/use<Name>.ts` with `use<Name>.test.ts`, and the return type written out with a short comment per field (see `usePromoReport.ts`, `useQuery.ts`)
- [ ] Named exports only in `app/**/*.ts(x)` (`export const PromoUploadPage`, `export class JournalUploadService`), with props typed by an exported `interface <Name>Props`. Default exports appear only in Next.js `pages/` and two JS files (`app.module.js`, `analytics.service.js`)
- [ ] Shared API shapes go in `types/<name>.ts` and hold types only, no runtime values

**Imports and aliases**

- [ ] Use the `tsconfig.json` aliases: `scripts/*` for `app/scripts/*`, `features/*` for `app/features/*`, and bare names for `types/*` (`from 'conference'`, `from 'injectables'`). No deep relative paths into `types/` (`'../../../../types/registrant'` in `FormStatusModal.tsx` is the thing to avoid)
- [ ] In code that Jest loads (`app/scripts/components`, `app/scripts/hooks`, and what they import), runtime imports are relative (`'../../hooks/useWatch'`). Jest maps only `.html` files (to `__tests__/templateMock.ts`), so a runtime `scripts/...` import breaks Jest; imports from `types/*` only work because they are type-only, so prefer `import type`
- [ ] Rollbar comes from `import { Rollbar } from 'scripts/errorNotify.js'` (as in `payment.js` and `error.js`), not `$window.Rollbar` (older code in `validateRegistrant.js`)

**Types**

- [ ] `tsconfig.json` is `"strict": true` with `"isolatedModules": true`, and `yarn lint:ts` passes
- [ ] ESLint turns off `@typescript-eslint/no-explicit-any` and `@typescript-eslint/ban-ts-comment`, so lint won't catch `any`, `@ts-ignore`, or `@ts-expect-error`. Each new one has a reason in a comment; prefer a real type or `unknown`
- [ ] Angular services used from TS are typed with `types/injectables.ts` (`$Http`, `$Q`, `$RootScope`, `$UibModal`, `$Window`, `$Filter`, `ModalMessage`, `RegistrationQueryParams`) or the service class; missing shapes get added there, not copied locally

**Validation and forms**

- [ ] Registrant answers are checked in `validateRegistrant.validate` (one `case` per block type) and shown with the `show-errors` directive. Payment input is checked in `validatePayment` (`directives/payment/payment.js`, using the `cruPayments` validators) and `payment.validate` (deposit and balance), with errors collected in an `errors` array and shown by `modalMessage.error({ title: 'Please correct the following errors:', message: errors })`. New rules extend these, not ad-hoc checks in a controller or template
- [ ] Actions that save money or a registration are blocked while in flight with the existing flags (`submittingRegistration`, `processing`, `addingPromoCode`, `savingAnswers`) or the same kind of flag
- [ ] New user-facing text in `.js` and `.html` files is marked for translation (see `i18n.md`)

**HTTP, dates, and money**

- [ ] API calls use `$http` with relative paths and `.then` / `.catch` / `.finally`; no `fetch`, `axios`, or hard-coded hosts. A `$rootScope.loadingMsg` set for a request is cleared in `.finally`
- [ ] Dates use `moment` / `moment-timezone` and the `evtDateFormat` / `dateRangeFormat` filters; no new date library
- [ ] Money is shown with the `localizedCurrency` filter and `conference.currency.currencyCode` (`$filter('localizedCurrency')(amount, code)` in JS and React); no hand-built `$` strings
- [ ] `lodash` is checked before writing a new helper (global `_` in Angular JS files, `import { ... } from 'lodash'` in TS)

**Tests**

- [ ] Tests sit next to the code: `<file>.spec.js` (Karma + Jasmine, `angular.mock.module('confRegistrationWebApp')`, the `testData` service) for Angular code, and `<file>.test.ts(x)` (Jest + Testing Library, `__tests__/fixtures.ts`) for React components and hooks. See `testing.md`

**Commands and hygiene**

- [ ] These pass, since CI runs each one: `yarn lint` (`eslint '@(app|test)/**/*.{js,ts,tsx}' --max-warnings=0`, so warnings fail too), `yarn lint:ts` (`tsc`), `yarn prettier:check`, `yarn test` (`karma start && jest`), and `yarn build`
- [ ] Prettier style is single quotes and trailing commas (`.prettierrc.js`), HTML templates included; Husky runs `npx pretty-quick --staged` on commit. `types/`, `__tests__/`, and `pages/` are outside the `yarn lint` and `yarn prettier:check` globs, so read changes there with extra care
- [ ] No `console.*` (`no-console` is an error, and only `test/spec/mockHttpBackend.spec.js` turns it off); errors go to Rollbar or `error.errorFromResponse`. New ESLint disables are single-line and name the rule (`// eslint-disable-next-line angular/on-watch` in `app_enforceAuth.js`)
- [ ] yarn 4 only (`"packageManager": "yarn@4.7.0"`, CI runs `yarn install --immutable`): `yarn.lock` changes match `package.json` changes, and there is no `package-lock.json`

## Mined from PR history

- New route code goes in `app/features/<feature>/` (controller, `.html`, and `.controller.spec.js` together), directives in `app/scripts/directives/<name>/` with their template and spec, and `test/spec/` holds only shared fixtures. `app/views/` is gone and `app/scripts/controllers/` holds only `angularUiTreeConfig.js`. Flag new files in the old spots. Almost every batch of PRs raised this, and older docs listed the old spots until PR #1018.
  <!-- evidence: PR #789, #924, #945, #977, #984, #1002 -->
- Compare ministries and activities by id from `app/scripts/constants/ministryIds.js` (camelCase exports like `familyLifeMinistryId`, `wtrActivityId`), and keep GTM ids in `gtmTagIds.js`. Flag name checks (`getMinistry()?.name === 'Family Life'`) and UUID or `GTM-` literals written inline, and return early before an API call that only one ministry needs.
  <!-- evidence: PR #896, #954, #961, #967, #969, #977 -->
- For a user-facing warning, use `modalMessage.error` / `modalMessage.info` (with `forceAction: true` when it must be seen). Flag new `$rootScope` banner state, new markup in `app/index.ejs`, or new `position: fixed` CSS built for one message. An AI-built toast for the staff login warning was missed by users and replaced with `modalMessage` three weeks later.
  <!-- evidence: PR #1010, #1012 -->
- Event Details validation goes in the `validationErrors` list built in `saveEvent` (`eventDetails.controller.js`), with a spec in `eventDetails.controller.spec.js`. Flag `$watch` blocks that set `$scope.notify` for validation, and HTML `min` or `required` on inputs that `ng-show` hides, which quietly disables Save (use `ng-if`).
  <!-- evidence: PR #953, #955, #957, #960, #962 -->
- New and changed JS lines use `const`, or `let` when the value is reassigned, never `var`, even in older files that still use `var`. Reviewers ask for this often, and lint won't catch it.
  <!-- evidence: PR #835, #836, #842, #845 -->
- Attribute directives that sit on other components (like `show-errors`) must not declare `scope: {...}`. Read attributes with `scope.$eval(attrs.x)` or `$parse`. An isolate scope there throws "Multiple directives asking for new/isolated scope" on elements like `<pick-a-date>`.
  <!-- evidence: PR #830, #832 -->
- A Node version change updates both `.node-version` (read by Netlify) and `.tool-versions` (read by asdf and CI) to the same value. CI passing does not prove the Netlify build works.
  <!-- evidence: PR #866, #878, #879, #892 -->
