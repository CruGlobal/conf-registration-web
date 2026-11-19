# Data Integrity — Focus Areas

Generic baseline. This is where domain-specific data invariants belong once `/agent-review:init`
appends them; keep both.

**Access scoping at the data layer**

- Every query and mutation is scoped to the authenticated user/tenant/household. New tables,
  columns, or collections need matching access policies
- Look for: policy changes that widen a `where`/`using`/`with check` clause; queries filtered only
  in application code where a shared or admin connection bypasses the policy

**Validation at external boundaries**

- Payloads from HTTP requests, webhooks, queues, and third-party APIs are parsed against an explicit
  schema before use
- Look for: external JSON consumed without validation; fields read off an untyped/`any` value; types
  that have drifted from the actual storage shape

**Cache correctness**

- Every write that changes displayed data invalidates or updates the cache entry that serves it
- Look for: mutations with no invalidation; cache keys that omit an input which changes the result
  (filter, tenant/account id, date range), which serves stale or cross-scope data; optimistic
  updates that don't match the server's response shape or don't roll back on error

**Idempotency & retries**

- Sync jobs, webhook handlers, and queue consumers must not double-apply work on retry or replay
- Look for: blind inserts where an upsert on a stable external id is needed; no dedupe key; partial
  writes with no transaction or compensating action

**Numeric precision**

- Values where exactness matters (money, quantities, percentages) must not accumulate floating-point
  drift; round at the display boundary, never mid-calculation
- Look for: repeated rounding inside a pipeline; mixing units or currencies without conversion;
  aggregate totals recomputed differently in two places

**Date & time handling**

- Look for: non-deterministic "now" inside calculations (makes behavior untestable and
  timezone-fragile); naive local-time arithmetic across DST; inconsistent serialization formats
  across boundaries

**Null, undefined, and partial writes**

- An omitted field, an explicit null, and an empty string are three different writes. Be intentional
- Look for: whole objects spread into an insert/update without an explicit field allowlist; defaults
  applied in one code path but not another

**Aggregation over partial data**

- Look for: totals summed client-side over a paginated or filtered subset, silently ignoring rows
  beyond the page — prefer a server-computed aggregate

<!-- init: extend this file with repo-specific focus areas and evidence links -->

## Repo-specific: conf-registration-web (Event Registration Tool)

**Whole-object saves**

- Many saves PUT the whole object: `PUT conferences/{id}` from `eventDetails.controller.js` and `eventForm.controller.js`, and `PUT registrations/{id}` from `RegistrationCache.update`, `registration.completeRegistration`, and `deletePromotion`. Anything the payload leaves out, or holds stale, gets overwritten. Look for: payloads built from an old copy (a cached object, or an `angular.copy` taken before other edits), fields dropped or nulled by accident (the `image = null` on `payloadWithoutImage` is on purpose), and two saves that can race.
- `eventForm.controller.js` refuses to save when a block that was saved before is missing from the payload (`missingBlockIds`, reported to Rollbar), because a missing block deletes the question and every answer to it. Look for: changes that weaken this guard, or new ways to delete blocks or pages that don't record `intentionallyRemovedBlockIds`.
- Before saving, `eventDetails.controller.js` trims each registrant type's `allowedRegistrantTypeSet` to the `selected` entries (or sets it to `null` when `familyStatus` is not `ENABLED`), and `syncCoupleNames` renames spouse types. Look for: payload changes that could drop a couple to spouse link or a child limit.

**Answers**

- `registration.controller.js` autosaves every 15 seconds (`$interval`) and on `$routeChangeStart`. It sends `PUT answers/{id}` only for answers that changed since `originalCurrentRegistration` and that are not in the invalid list from `validateRegistrant.validate`. Look for: changes that send every answer each tick, skip the diff, forget `$interval.cancel`, or lose answers on route change.
- Preview mode (`$rootScope.registerMode === 'preview'`) keeps data in `$rootScope.previewRegCache` and must never reach the API (see `RegistrationCache.update`, `updateCurrent`, and the answer save). Look for: new write paths with no preview check.
- When a rule hides a choice, `blockRegistration.js` clears it from the answer. Look for: new question types or rule changes that leave a hidden answer stored and still counted in price or validation.
- IDs for new registrants, answers, rules, pages, and conferences are made in the browser by the `uuid` constant. Keep using it so client and server agree on the ID.

**Caches**

- `RegistrationCache` keys by API path (`registrations/{id}`, `conferences/{id}/registrations/current`) and broadcasts updates on `$rootScope`. `/eventOverview` calls `ConfCache.empty()` before loading so counts are fresh, and `/reviewRegistration` calls `RegistrationCache.emptyCache()`. Look for: a new write that leaves `ConfCache` or `RegistrationCache` serving the old object on the next route.
- `globalPromotionService.ts` keys its cache by `ministryId:ministryActivityId` (or `:all`). Look for: writes that update one key while the same promotion also shows under another key.

**Server-owned numbers**

- Totals and balances (`calculatedTotalDue`, `remainingBalance`, `calculatedMinimumDeposit`, `totalPaid`) and capacity (`availableCapacity`, `availableSlots`) come from the API and are a snapshot from when the conference or registration loaded. Look for: the client computing them itself, treating them as live, or summing amounts across a paged list (`getRegistrationData` pages hold 20 rows by default).

**Shapes from the API**

- API shapes are typed by hand in `types/*.ts`, and nothing checks them at runtime. Look for: new fields read from a response with no type change, types widened to `any`, and fields the API can send as `null` typed as always present (`Nullable<T>` in `types/helpers.ts` exists for this). Note `Permissions` in `types/permissions.ts` has no `permissionInt`, which `PermissionCache` adds at runtime.
- `validationInterceptor.js` copies `parameterViolations[0].message` into `data.error.message`, and `statusInterceptor` copies `data.statusCode` onto `status`. Look for: error handlers that read other fields and miss these.

**Dates**

- Event times are strings like `'YYYY-MM-DD HH:mm:ss'` (see `ConfCache.create`), shown in the event's zone with `moment-timezone` (`evtDateFormat`, `conference.eventTimezone`). Look for: `new Date(...)` parsing these strings (it reads them as the browser's local time), and date-range pricing (`DateRangeService.calculateDateRange`, `daysForBlock()`) changed with no tests.

## Mined from PR history

- View-only fields (`name` and `selected` on `allowedRegistrantTypeSet` entries, a combined `allPromotions` list) are stripped from an `angular.copy` right before the PUT, never deleted from the scope object the templates read. Every save path needs the same cleanup. Don't add view-only fields to API interfaces in `types/*.ts`.
  <!-- evidence: PR #835, #839, #840, #924 -->
- Treat data as possibly missing. Older records lack newer keys (`block.content.otherOption`, `answer.value.country` saved as `''`). `$rootScope.globalUser()` is undefined until the profile loads, and `$scope.currentRegistration` is undefined in the form builder and preview. `_.find` over registrant types or blocks can return nothing (a rule whose parent is an admin-only block). Guard before reading fields, never index `allCountries.find(...)[2]` without a fallback, and add a spec with the missing value.
  <!-- evidence: PR #779, #803, #805, #821, #822, #854, #857, #880, #989, #991 -->
- After admin actions that change server-computed fields like `availableCapacity`, evict the conference (`ConfCache.remove(id)` or `ConfCache.empty()`) and read it again. Never compute conference totals from one page of `RegistrationCache.getAllForConference(...)` (about 20 rows). In caching services, update the cached list on create and update, and reset a stored in-flight promise when the request fails so the next call retries.
  <!-- evidence: PR #890, #897, #911, #914, #958 -->
- Build export and other API URLs from one params object (`URLSearchParams`): set each key once, encode every user-typed value, and match names and values to the API (`includeWithdrawn=yes|no`). `ExportModal.tsx` needed five fixes for hand-built query strings.
  <!-- evidence: PR #782, #799, #804, #807, #808, #810 -->
- Dates: a directive with an `=` binding (like `localModel` in `datepicker.js`) must not write a reformatted value back to the bound model, since that broke every event save. Parse date-only answers with `moment(value, 'YYYY-MM-DD')`, not `new Date(value)`, which reads them as UTC. Build API datetimes with `moment().format('YYYY-MM-DD HH:mm:ss')`, not `toISOString()`.
  <!-- evidence: PR #841, #842, #843, #844, #845, #918 -->
- In `eventForm.controller.js`, keep the debounced save, `flushPendingSave`, and the `missingBlockIds` guard. New code that removes blocks adds their ids to `intentionallyRemovedBlockIds`, and `copyBlock` resets fields that must be unique (`id`, `profileType`, `blockTagType`). The API treats a block missing from the PUT as a delete and wipes its answers.
  <!-- evidence: PR #896, #1006 -->
