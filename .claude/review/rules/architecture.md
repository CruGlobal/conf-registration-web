# Architecture — Focus Areas

Generic baseline. `/agent-review:init` appends the repo-specific concerns; keep both.

**Layering & boundaries**

- Business logic lives in testable modules, not inline in entry points (route/page/controller/CLI
  handlers). Entry points compose and delegate
- Server-only code stays out of code paths that ship to a client or untrusted runtime
- Look for: domain math embedded in view code; a module reaching across layers it shouldn't know
  about; new circular dependencies

**Placement & structure**

- New files land where the existing convention says they belong; shared code goes to the shared
  location only when it is genuinely used by more than one feature
- Look for: one-off code dropped into a "shared"/"common"/"utils" bucket; parallel structures that
  duplicate an existing module instead of extending it; new top-level directories

**Pattern consistency**

- The change should look like the code around it. Deviating is fine when the existing pattern is
  what's being fixed — but then it should be fixed consistently, not forked
- Look for: a second way of doing something the codebase already does one way (data fetching, error
  handling, configuration, logging); framework features reimplemented by hand

**State & data flow**

- Cached/derived state has a clear owner, and writes invalidate or update what they affect
- Look for: the same state maintained in two places; refetching in an effect what a cache already
  owns; values threaded through three or more layers that would be better read closer to use

**Effects & lifecycle**

- Look for: effects whose dependency list omits referenced values (stale closures); work in an
  effect that belongs in an event handler or a derived value; subscriptions and timers without
  cleanup

**Concurrency & performance shape**

- Look for: sequential awaits on independent work that could run concurrently; N+1 query patterns;
  unbounded loops over remote calls; work done per-item that could be batched

**Error handling & resilience**

- Look for: swallowed errors (empty catch, error logged and ignored); failures that leave state
  half-written; missing error/loading boundaries on user-facing surfaces; retries without backoff or
  idempotency

**Technical debt**

- Weigh debt added against debt removed. A refactor that only moves code without improving clarity
  is neutral, not positive. When a convention is ambiguous, raise it as a question rather than a
  blocking finding

<!-- init: extend this file with repo-specific focus areas and evidence links -->

## Repo-specific: conf-registration-web (Event Registration Tool)

**Where code goes**

- Each route has a folder `app/features/<feature>/` with `<feature>.controller.js` (or `.ts`) and its `.html` templates. Routes are wired in `app/scripts/app.config.js` by importing the template and naming the controller. Older docs mention `app/views/` and `app/scripts/controllers/`, but `app/views/` is gone and `app/scripts/controllers/` only holds `angularUiTreeConfig.js`. Look for: new route code put in those old spots.
- Shared AngularJS code goes in `app/scripts/services/`, `app/scripts/directives/<name>/`, and `app/scripts/filters/`. React components go in `app/scripts/components/<Name>/`, React hooks in `app/scripts/hooks/`, plain helpers in `app/scripts/utils/`, shared API types in `types/`, and constants in `app/scripts/constants/` or `services/constants.js`.
- Every Angular file registers itself as a side effect, so it must be imported in `app/scripts/main.js` under the matching heading. Karma loads `main.js` too. Look for: a new controller, directive, filter, service, or `*_angular.ts` wrapper with no `main.js` import. It silently never registers.
- `pages/` (Next.js 12, `*.page.tsx`, booted through `app/scripts/main-next.js`) is an experiment. `yarn build` does not build it and it is not deployed. Look for: real features added there.

**Business logic placement**

- Registration and payment rules belong in testable helpers: `utils/coupleTypeUtils.js`, `utils/conferenceLimits.ts`, `services/validateRegistrant.js`, `services/payment.js`, `services/registration.js`. Look for: capacity, couple/spouse, rule visibility, or payment math written straight into a controller, a template `ng-if`, or a React component.
- Look for: a new copy of logic that already exists. Event capacity is already checked in three places (`registrationTypeFull` in `registrationTypeSelect.js`, `registrationFull` in `reviewRegistration.controller.js`, `$scope.full` in `registration.controller.js`). A change to one usually needs the others, or a shared helper.

**Data access and caches**

- All API calls use `$http` with relative paths (`'conferences/' + id`). The interceptors registered in `app.config.js` add the base URL and auth header, handle 401s, copy `statusCode` onto `status`, fill in validation messages, transform campus answers, and turn a 404 on `registrations/current` into a create. Look for: `fetch`, `axios`, or hard-coded API hosts that skip this chain.
- Route data is loaded in `resolve:` blocks in `app.config.js` and injected by name (`conference`, `currentRegistration`, `permissions`, `registrationsData`). React route pages get it through the `resolve` binding. Look for: a controller or component that fetches again what its route already resolved.
- Caches are `$cacheFactory` services: `ConfCache`, `RegistrationCache`, `PermissionCache`, `ProfileCache`, `MinistriesCache`, `MinistryAdminsCache`, and the cache inside `globalPromotionService.ts`. Writes must update or clear them (`ConfCache.update` / `ConfCache.empty()`, `RegistrationCache.emptyCache()`). Look for: a new write with no cache update, or a second cache for a resource that already has one.

**Global page state**

- Every page sets `$rootScope.globalPage` (`type`, `mainClass`, `bodyClass`, `confId`, `footer`), which drives the header, nav, and footer in `app/index.ejs`. Long requests set `$rootScope.loadingMsg` to show the full-page loader. Look for: a new page that does not set `globalPage`, and a `loadingMsg` that is not cleared in a `.finally` (or `finally`) on every path.

**Promises and digest**

- Angular services return `$q` `IPromise`. React hooks built on `useQuery` need a native `Promise`. Two styles exist today: `journalUploadService.ts` stays on `IPromise`, and `promoReportService.ts` uses `async` with `$rootScope.$apply`. See `angular-react-bridge.md`. Look for: a third style, or both styles mixed in one service.

**Errors**

- Shared paths: `error.errorFromResponse(defaultMessage)` (reports to Rollbar, then throws an `Error` with the API message), `modalMessage.error(...)`, and `Rollbar` from `scripts/errorNotify.js`. `exceptionHandler.js` forwards Angular exceptions to Rollbar. `$qProvider.errorOnUnhandledRejections(false)` is set, so a rejected `$q` promise with no `.catch` fails without a sign. Look for: user actions whose `$http` call has no `.catch`, `.catch(angular.noop)` hiding a real failure, and new `console` or `$log` use in place of Rollbar.

**Pattern consistency**

- JS controllers use `$scope` with function DI. TS controllers are classes with `/* @ngInject */` and `controllerAs: '$ctrl'` (`globalPromotions.controller.ts`). Both are fine. Flag mixed styles inside one feature.
- The team's own PR-review prompt calls out direct DOM work in place of Angular directives. Look for: jQuery or `document` calls in controllers or services where a directive (`autoFocus`, `ngEnter`, `selectOnClick`, `readFile`) or a binding would do.
- New React admin pages follow the upload-page shape: `<Name>.tsx`, `<Name>_angular.ts`, hooks in `app/scripts/hooks/`, and shared pieces (`UploadPageHeader`, `RegistrationFilters`, `TransactionsTable`, `Pagination`). Look for: a React page that rebuilds those pieces.

## Mined from PR history

- Code that adds nodes to `document.head` or `document.body` (like `GtmService.loadGtmScript`) must dedupe by element id, be removed on a `$routeChangeStart` that leaves the flow (not on scope `$destroy`, which fires between registration pages and re-adds the tag), load from every entry route of the flow (`registration` and `reviewRegistration`), and guard `next.originalPath`, which is null for the `.otherwise()` route.
  <!-- evidence: PR #973, #977 -->
- Shared promotion and ministry logic lives in a service (`globalPromotionService`, `MinistriesCache`, `MinistryAdminsCache`), not copied into two controllers. Keep route `resolve:` functions to one service call; joins and filters belong in the service (`MinistryAdminsCache.processMinistries`). Keep `globalPromotionService` about global promotions only, so callers OR in `conference.promotions.length > 0` themselves.
  <!-- evidence: PR #923, #924, #927, #946 -->
- A new `$http` interceptor checks `config.method` and a `config.url` pattern for the endpoints it changes, instead of walking every request body. Don't add "skip this endpoint" checks like `!rejection.config.url.includes('/profile')` to `unauthorizedInterceptor.js`; fix the caller instead, since those lists keep growing.
  <!-- evidence: PR #792, #982 -->
- Only one login modal may open. Keep the `$rootScope.loginModalOpen` guard in `loginDialog.show`, send 401s through `unauthorizedInterceptor` instead of calling `loginDialog.show` directly, and show errors with `modalMessage`, which stays quiet while the login modal is open.
  <!-- evidence: PR #829, #942 -->
- A major UI library bump (`react-bootstrap` away from `^0.33.x`, which matches the Bootstrap 3 SASS) goes in its own PR with screenshots of the React pages that use it. A 2.x bump inside the Node 24 upgrade broke the upload pages and had to be reverted.
  <!-- evidence: PR #879, #883 -->
