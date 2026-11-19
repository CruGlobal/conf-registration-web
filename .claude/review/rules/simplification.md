# Simplification & Reuse — Focus Areas

Generic baseline. `/agent-review:init` appends the repo-specific concerns; keep both.

This is an advisory lane. Its job is to make this diff smaller and simpler — not to restyle the
codebase, and not to propose generalizations. Report only cleanups the author can act on inside
this PR.

**Lane boundary** — neighboring lanes own the adjacent ground:

- Layering, placement, and pattern-consistency judgments belong to `architecture`
- Lint-level hygiene (unused imports, debug output, commented-out code) belongs to `standards`
- This lane owns code that need not exist: additions duplicating something the repo already has,
  abstractions with no second caller, computation the data path doesn't need, and code the PR
  adds but never exercises

**Severity cap — cleanups never block**

- Rate pure reuse/simplification/efficiency findings 1–4
- Use 5–6 only for substantial reimplementation of an existing, tested helper, or a demonstrable
  algorithmic problem on a data path that grows with users or records
- Never rate a pure cleanup ≥ 7 — the blocker machinery is for defects. The cross-cutting duty
  still applies: a real bug noticed while reading is reported at its honest severity

**Proof requirements** — every finding cites evidence the author can check, using your discovery
grep budget:

- A reuse claim names the existing helper at file:line, after you have read it and confirmed its
  semantics actually match this call site (arguments, edge cases, error behavior). A name-alike
  with different behavior is not a finding
- A duplication claim points at duplication this diff introduces; pre-existing duplication the
  change does not worsen is out of scope
- An efficiency claim names where the data comes from and why it can be large; no
  micro-optimizations, no complexity pedantry on collections that are bounded in practice
- A dependency-reuse claim cites the manifest entry for a library the repo already ships that
  does what the new code hand-rolls

**Reuse**

- Look for: a new helper, validator, formatter, or client wrapper that reimplements one that
  already exists in the repo's shared locations; a sibling file copy-pasted and lightly edited
  instead of extended; utility code hand-rolled despite an already-carried dependency that
  provides it

**Simplification**

- Look for: an abstraction with exactly one caller or one implementation (interface, base class,
  factory, registry) introduced by this diff; boolean parameters or config options no current
  caller sets; indirection added for cases that do not exist; a hand-rolled mechanism where the
  language or framework has a direct construct

**Efficiency**

- Look for: invariant work recomputed inside a loop; a query or fetch issued per item where the
  surrounding code already batches; a full-collection load used to read one row; repeated linear
  scans that a single keyed lookup structure would remove — on data that actually grows

**Dead weight**

- Look for: exports nothing imports, parameters no caller passes, branches no current input can
  reach — when this PR introduces them. Confirm with a repo-wide grep before flagging; absence
  from the diff is not absence from the codebase

**Finding budget.** Report at most 5 findings — the ones with the largest net line savings or
clearest wins. Suggestion density is what gets an advisory lane dismissed; if you found more than
5, keep the best and drop the rest silently.

<!-- init: extend this file with the repo's shared-helper locations (where utilities, validators, and formatters live — the directories to grep before accepting new ones) -->

## Repo-specific: where shared helpers live in conf-registration-web

Grep these before accepting a new helper, filter, hook, or component.

- `app/scripts/utils/`: `coupleTypeUtils.js` (`isCoupleType`, `isSpouseType`, `findCoupleForSpouse`, `findSpouseForCouple`, `isCoupleOrSpouseType`, `isRegistrantCouple`, `findCoupleRegistrants`, `syncCoupleNames`, `shouldShowRegistrantType`, `deleteSpouseType`), `conferenceLimits.ts` (`getFullPercentage`), `hostEnvironment.ts` (`isProductionHostname`, `environmentName`, `apiEnvironment`)
- `app/scripts/filters/`: `localizedCurrency`, `evtDateFormat`, `dateRangeFormat`, `eventAddressFormat`, `phoneFormat`, `paymentTypeFormat`, `joiner`, `unique`, `showQuestionFilter`, `toTrustedHtml`. Call them in JS as `$filter('<name>')(...)`; React pages get `$filter` as a prop
- `app/scripts/services/`: `validateRegistrant` (`validate`, `blockVisible`, `choiceVisible`, `isAnyChoiceVisible`, `shouldShowForRegistrantType`, `checkboxDisable`), `payment` (`validate`, `pay`, `tokenizeCreditCardPayment`), `registration` (`validatePayment`, `completeRegistration`), `error.errorFromResponse`, `modalMessage` (`error`, `info`, `confirm`), `uuid`, `DateRangeService`, `staffAccountService`, `GrowlService`, and the caches (`ConfCache`, `RegistrationCache`, `PermissionCache`, `ProfileCache`, `MinistriesCache`, `MinistryAdminsCache`)
- Constants: `services/constants.js` (`expenseTypesConstants`, `ruleTypeConstants`, `addressConstants`), `permissionConstants` in `services/PermissionCache.js`, and `app/scripts/constants/` (`ministryIds.js`, `gtmTagIds.js`)
- `app/scripts/hooks/`: `useQuery` (load, refresh, and drop out-of-date responses), `useWatch` (an effect that skips the first render), `useSelectedItems`, `usePaymentsModal`, `useAccountTransfers`, `usePromoRegistrationList`, `usePromoReport`, `usePromoReports`
- `app/scripts/components/`: `Pagination`, `RegistrationFilters`, `UploadPageHeader`, `TransactionsTable`, `JournalTransactionsTable`, `PromoTransactionsTable`
- Directives for small DOM jobs: `autoFocus`, `ngEnter`, `selectOnClick`, `stringToNumber`, `readFile`, `showErrors`
- Libraries already shipped (check `package.json` first): `lodash` (global `_` in Angular files), `moment` and `moment-timezone`, `country-region-data` (`allCountries`), the `@cruglobal/cru-payments` card, CVV, and expiry validators, `angular-ui-bootstrap` (`$uibModal`, popovers, typeahead), `react-bootstrap` 0.33
- Test fixtures: `test/spec/testData.spec.js` (Karma) and `__tests__/fixtures.ts` (Jest)

**Known repeat spots** (a new copy added here is a finding; old copies the diff doesn't touch are not)

- Event capacity counting with exempt types: `registrationTypeFull` (`registrationTypeSelect.js`), `registrationFull` (`reviewRegistration.controller.js`), and `$scope.full` with `hasPrimaryExemptType` (`registration.controller.js`)
- "Pages with a visible block for this registrant": `validPages`, `checkValidPages`, and `getValidFirstPage` in `registration.controller.js`, plus a type-only version in `newRegistrant` (`registrationTypeSelect.js`)
- Journal and promo upload: `JournalUploadPage.tsx` / `PromoUploadPage.tsx` and `journalUploadService.ts` / `promoReportService.ts` are near twins. Shared parts belong in `UploadPageHeader`, `RegistrationFilters`, `TransactionsTable`, or a hook, not in a third copy
- Rule checks: `blockVisibleRuleCheck` and `choiceVisibleRuleCheck` in `validateRegistrant.js` repeat the same operator loop. A new operator should land in one shared place

## Mined from PR history

- Capacity checks ("is full", "would overflow", "percent full") belong in one helper in `app/scripts/utils/conferenceLimits.ts` next to `getFullPercentage`. Flag new inline `useTotalCapacity && availableCapacity` checks in controllers, templates, or `registrationTypeSelect.js`, and mirror wrappers like `isRegistrationOpen = () => !isRegistrationClosed()`. Copies of this check were fixed one file at a time.
  <!-- evidence: PR #936, #938, #940, #953, #955, #956, #959, #962 -->
- Use the `coupleTypeUtils.js` helpers instead of inline `defaultTypeKey === 'COUPLE'` / `'SPOUSE'` checks, `allowedRegistrantTypeSet[0]` lookups, or a filter pasted into two directives (`excludeNonAllowedType` in both `registrationModal` and `registrationTypeSelect`).
  <!-- evidence: PR #880, #886, #888, #894 -->
- Look up ministries and activities through `MinistriesCache` (`get`, `getMinistry`, `getMinistryName`, `getActivityName`) and admin rights through `MinistryAdminsCache`, not a new `$http.get('ministries')` or a repeated `$scope.ministries.find(...)` block.
  <!-- evidence: PR #923, #928, #929, #948, #954 -->
- "Pages with a visible block" logic already exists in `registration.controller.js`, `reviewRegistration.controller.js`, and `registrationTypeSelect.js`. Reuse one of them or move it to `validateRegistrant`; a new copy means the next fix (like #780) has to land in one more place.
  <!-- evidence: PR #776, #780, #789 -->
- AI review suggestions caused needless code. Flag a new wrapper helper around a one-line id check (`isFamilyLifeEvent()` wrapping `conference.ministry === familyLifeMinistryId`) and edits to files outside the PR's feature that came from applying review-bot advice. The reviewer said the version before the AI pass was clearer.
  <!-- evidence: PR #973, #977 -->
- AI reviewer false positives the team rejected. Duplication that existed before the diff is a non-blocking follow-up, posted once. Before a reuse finding, confirm the line is on the `+` side of the diff (a bot once flagged a removed line). Don't demand cache invalidation for `MinistriesCache` (static reference data), and don't ask for tests of states the API can't return (a registration with zero registrants).
  <!-- evidence: PR #880, #948 -->
