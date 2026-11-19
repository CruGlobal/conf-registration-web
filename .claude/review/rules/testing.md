# Testing — Focus Areas

Generic baseline. `/agent-review:init` appends this repo's test conventions (runner, layout,
mocking idioms); keep both.

**Prefer pure-function unit tests**

- Business and domain logic should be extracted out of UI/handler code into plain functions and
  tested directly, rather than asserted through a rendered surface or an HTTP round trip
- Look for: new logic that is only reachable through a component or endpoint, with no seam to test

**Use the repo's existing test framework and idioms**

- Match the repo's test runner, assertion style, mocking helpers, and import conventions. Do not
  assume a framework, rendering harness, or helper library that the repo does not already depend on
- Look for: tests introducing a second runner or harness; imports of libraries absent from the
  manifest

**Mock at module/external boundaries**

- External services (databases, third-party APIs, mail, payments, LLMs) are mocked at the module
  boundary, not by patching global network primitives ad hoc
- Look for: real network or filesystem access in unit tests; mocks that drift from the real
  signature; over-mocking that leaves the logic under test unexercised

**Determinism**

- Time-dependent logic uses the runner's fake-timer/clock control rather than real system time.
  Random values are seeded or injected
- Look for: tests that depend on the current date, timezone, ordering of a map/set, or on another
  test having run first

**Coverage of the shape of the input**

- Every new test should exercise: empty, zero / one / many, boundary values, and at least one happy
  path
- Look for: tests that only assert the happy path; parameters whose invalid values are never tested

**Error paths**

- Validation rejections, rejected promises, timeouts, and the failure branches of domain functions
  are tested, not just success
- Look for: `catch` branches with no covering test

**Test placement and naming**

- Follow the repo's convention for where tests live and how they're named
- Test names describe the behavior asserted, not the function name alone

**Quality gates**

- The repo's test, type-check, lint, and format commands must all pass
- Look for: skipped or `.only` tests left behind; loosely-typed mocks that defeat type checking;
  assertions that can never fail (e.g. asserting on the mock's own return)

<!-- init: extend this file with repo-specific focus areas and evidence links -->

## Repo-specific: conf-registration-web (Event Registration Tool)

**Two runners**

- `yarn test` runs `karma start && jest`. Karma + Jasmine runs every `*.spec.js` under `test/spec/`, `app/features/`, and `app/scripts/` (see `test/all-tests.spec.js`) in headless Chrome, bundled by webpack with `scripts/main.js`. Jest + Testing Library runs `*.test.ts(x)` under `app/scripts/` only (`roots` in `jest.config.js`).
- Choose by what the code is. AngularJS controllers, directives, services, filters, and helpers they use (even `.ts` ones like `conferenceLimits.ts`, `journalUploadService.ts`, `globalPromotions.controller.ts`) get a `*.spec.js` next to them. React components and hooks get a `*.test.tsx` / `*.test.ts` next to them. Look for: a `*.test.ts` under `app/features/` (Jest never runs it) or a `*.spec.ts` (Karma only loads `.spec.js`).

**Karma idioms**

- Start with `import 'angular-mocks';` and `beforeEach(angular.mock.module('confRegistrationWebApp'))`. Get services with `inject((_$httpBackend_, ...) => ...)`, build controllers with `$controller('eventDetailsCtrl', { $scope, ...stubs })`, and compile directives with `$compile` after stubbing the template with `$templateCache.put('scripts/directives/<name>/<name>.html', '')`.
- Fixtures: inject the `testData` service (`test/spec/testData.spec.js`) and add new conference, registrant type, or registration cases there instead of building large one-off objects. Each test gets a fresh copy, so changing it inside a test is safe.
- HTTP: `test/spec/mockHttpBackend.spec.js` applies to every Karma test. It removes `httpUrlInterceptor` (so test URLs are relative, like `'payments/scholarship/' + paymentHash`) and adds default `whenGET/POST/PUT` answers for `conferences`, `registrations`, and `answers`. Look for: tests that pass only because a default answer caught the call. When the call is what you test, use `expectGET`/`expectPUT`, then `$httpBackend.flush()`, and `verifyNoOutstandingExpectation()` / `verifyNoOutstandingRequest()` in `afterEach` (see `paymentApproval.controller.spec.js`).
- `$q` promises settle only on a digest. Look for: checks on async results with no `$rootScope.$digest()`, `scope.$apply()`, or `$httpBackend.flush()` first.

**Jest idioms**

- `render` from `@testing-library/react` (v12), `userEvent` v14 (`await userEvent.click(...)`), and queries by role and name (`getByRole('button', { name: '3' })`). Hooks use `renderHook` and `act` from `@testing-library/react-hooks`. `jest-dom` matchers load from `__tests__/util/setup.ts`, and `clearMocks: true` resets mock calls between tests.
- Fixtures come from `__tests__/fixtures.ts` (`conference`, `registrationsData`, `promoReport`, `promotionAll`, and more), imported by relative path. Add to it rather than copying objects.
- Angular injectables are props, mocked as plain objects with casts (`{} as $RootScope`, `{ get: jest.fn() } as unknown as $Http`, `{ submitPromos } as unknown as PromoReportService`). Sibling hooks are mocked with `jest.mock('../../hooks/usePaymentsModal', ...)`. `.html` imports map to `__tests__/templateMock.ts`.
- Use `__tests__/util/withEnv.ts` to set `process.env` for a test, and a `@jest-environment-options` docblock for a fake `location` (see `errorNotify.test.ts`). Look for: tests that change `process.env`, `window`, or module state and don't put it back.

**Coverage**

- CI uploads `coverage/karma/lcov.info` and `coverage/jest/lcov.info` to Codecov with `fail_ci_if_error: true`. Jest skips coverage for `*_angular.ts`, for `app/scripts/services/*.ts` (Karma covers those), and for `ExportModal`, `FormStatusModal`, and `GoogleLogin` (marked to be removed once tests exist). Look for: new paths added to the `collectCoverageFrom` excludes, and `/* istanbul ignore next */` with no comment saying why (`PromoUploadPage.tsx` shows the right way).

**Where tests matter most**

- Registration and payment rules carry the most risk. Changes to `registrationTypeFull`, `registrationFull`, `validateRegistrant` (`validate`, `blockVisible`, rule operands), `coupleTypeUtils.js`, `validatePayment` in `directives/payment/payment.js`, `payment.validate`, or `confirmRegistration` need specs for: couple types counting as 2, exempt types, type limits (`useLimit`), AND and OR rules, hidden parent blocks, admin-only blocks, and the charge-once path.

**Lint gaps in tests**

- `plugin:jasmine/recommended` catches `fit` and `fdescribe`, and `jasmine/no-spec-dupes` / `no-suite-dupes` warnings fail `yarn lint` because of `--max-warnings=0`. There is no Jest ESLint plugin, so `it.only`, `describe.only`, and `it.skip` in `*.test.ts(x)` are not caught. Look for them by hand. `__tests__/` is not in the `yarn lint` glob either.

## Mined from PR history

- AI-written specs repeat the same slips. Flag `var` (lint won't, since `no-var` and `prefer-const` are off), one-letter callback names like `(p) =>`, throwaway variables that only feed the next line, and repeated `verifyNoOutstandingExpectation()` / `verifyNoOutstandingRequest()` calls inside an `it` when an `afterEach` already runs them.
  <!-- evidence: PR #914, #919, #982 -->
- Fixtures match the real API. When a model in `types/*.ts` gains a field, add it with a real value to every matching object in `test/spec/testData.spec.js`. Dates use `YYYY-MM-DD HH:mm:ss`, and ids line up across objects. Don't accept "the test passes anyway" for a missing field: an AI-written reply defended fixtures with no `activationDate`, and since `moment(undefined)` means "now", the `isPromotionActive` specs turned flaky.
  <!-- evidence: PR #924, #925, #927, #928, #932, #935 -->
- A test must fail without the fix. Keep `beforeEach` in the all-conditions-true state and flip one condition per `it`. Test both the passing and failing side of new validation. Don't loosen asserts (`expect(['', null]).toContain(...)`). Assert on `$httpBackend.expectGET(...)` and the resulting model, not on values put on `$scope` only for the test.
  <!-- evidence: PR #841, #856, #857, #860, #867, #906, #932, #937 -->
- A fix ships with a spec for the exact input that broke: a missing `block.content.otherOption`, an empty FileList, a null currency, a rule whose parent block is gone, an uppercase email. Several hotfix chains (#807 to #810 on exports, #770 to #771 on the email regex) had no test at all.
  <!-- evidence: PR #770, #771, #804, #807, #808, #810, #821, #822, #824, #989, #991 -->
- Read the injected `testData` and look up blocks or answers only inside `beforeEach` or `it`, never at `describe` scope: a throw there silently skips the tests, and one batch of rule tests never ran. Make a fresh `$rootScope.$new()` for each test, and call `spyOn` only in `beforeEach` or `it`.
  <!-- evidence: PR #866, #867, #889, #893, #895 -->
- Capacity and limit specs include the exact boundary (available equals needed), a negative `availableCapacity`, a couple type with 1 spot left, an exempt dependent, and `manuallyClosed` with spots left.
  <!-- evidence: PR #936, #939, #953, #955 -->
