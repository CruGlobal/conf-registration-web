# AngularJS and React Bridge Focus Areas

React 18 components run inside the AngularJS 1.8 app. Bugs hide at the seams: injection names, two kinds of promises, digest timing, and shared `$rootScope` state. TypeScript can't check most of these links, so review them by hand.

**Wrapping React for Angular (`react2angular`)**

- The current pattern is a `<Name>_angular.ts` file next to `<Name>.tsx` that only registers the component: `angular.module('confRegistrationWebApp').component('<camelName>', react2angular(<Name>, [bindings], [injectables]))`, imported in `app/scripts/main.js` under "React components" (see `PromoUploadPage_angular.ts`). `ExportModal.tsx`, `FormStatusModal.tsx`, and `GoogleLogin.tsx` register inside the component file, which is the older style. Jest skips coverage for `*_angular.ts`, so keep logic out of it.
- The second array is bindings, meaning what the Angular side passes in (`['resolve']` for route pages, `['resolve', 'modalInstance']` for `$uibModal` `component:` modals like `formStatusModal` and `exportModal`). The third array is injectables by their registered names (`'$filter'`, `'journalUploadService'`, `'modalMessage'`). Look for: a prop the component uses that is missing from these arrays (it is `undefined` at runtime even though the types say otherwise), a name typo, or a binding that doesn't match the template attribute (`<promo-upload-page resolve="$resolve" />`).
- Route pages are defined in `app.config.js` with `template: '<name resolve="$resolve" />'` and their `resolve:` data. They set `$rootScope.globalPage` in a `useEffect` keyed on the conference id.

**Typing injectables**

- Type Angular services passed as props with `types/injectables.ts` (`$Http`, `$Q`, `$RootScope`, `$Window`, `$UibModal`, `$Filter`, `ModalMessage`) or with the service's own class (`JournalUploadService`, `PromoReportService`). Add new shapes there. When React writes a new `$rootScope` field, add it to the `$RootScope` interface.
- Look for: `any` used for injectables in new code (as `envService: any` in `ExportModal.tsx`).

**`IPromise` vs native `Promise`**

- `$http` and `$q` return `IPromise`. Their callbacks run inside a digest, so Angular views update. Code after an `await`, or in a native `.then`, runs outside the digest.
- `useQuery` (`hooks/useQuery.ts`) needs `load` to return a native `Promise`. `promoReportService.ts` is `async` and wraps `$rootScope` writes in `this.$rootScope.$apply(...)` inside `finally`. `journalUploadService.ts` stays on `IPromise` with `.finally`. Pick one style per service. Look for: an `async` method that changes `$rootScope` or `$scope` state after an `await` with no `$apply` (the loader can get stuck), and `$apply` called where a digest may already be running (`$digest already in progress`); `$applyAsync` or `$evalAsync` is safer when you can't be sure.
- `ngimport` gives TS modules `$q` and `$http` without DI (`import { $q } from 'ngimport'` in `globalPromotionService.ts`). It only works after the Angular app boots, so never call it at module load.

**State ownership and digest**

- Data from Angular (`resolve.conference`, `resolve.registrationsData`) is input to React. Look for: React code that changes those objects in place. Angular deep watches (`$watch(..., true)`) elsewhere may react, and React won't re-render. Copy before changing.
- `$rootScope.loadingMsg` drives the full-page loader in `index.ejs`. Services set and clear it; components should not. Look for: paths (errors, early returns) that leave it set.
- `$window`, `$uibModal`, `modalMessage`, and `$filter` come in as props so tests can mock them. Look for: components that use `window.*` directly or import an Angular service module to call it.

**Angular templates and controllers opened from React**

- React opens Angular modals with `$uibModal.open({ templateUrl, controller, resolve })`, importing the template through the `features/` alias (`features/paymentModal/paymentsModal.html` in `usePaymentsModal.ts`, `features/journalUploadReview/journalUploadReview.html` in the upload pages). The controller name must exist (`paymentModal`, `journalUploadReviewModal`). `.result` rejects on dismiss and Escape, so catch it (`.result.catch(() => undefined)`) or you get unhandled rejections.
- In Jest, `.html` imports become the empty `__tests__/templateMock.ts`, so these modal templates and controllers are only covered by their Karma specs. Look for: a change to a modal's controller or `resolve` keys with no matching `*.controller.spec.js` change.

**`angular2react` and Next.js**

- `pages/LandingComponent.tsx` wraps the Angular `landingComponent` with `angular2react` and boots the app through `app/scripts/main-next.js`. Bindings are passed as `{}` today and must be copied from the Angular component if any get added. This path is experimental and not deployed. Look for: production features that depend on it.

**Tests across the seam**

- Jest tests pass mocked injectables (`{} as $RootScope`, `{ get: jest.fn() } as unknown as $Http`) and native Promise mocks (`mockResolvedValue`). They run no digest, so they can't catch a missing `$apply` or a wrong injectables array. Review those by reading the wrapper and the service code.

**Checklist**

- [ ] `<Name>_angular.ts` wrapper exists, is imported in `main.js`, and its arrays match the props
- [ ] Injectable props typed with `types/injectables.ts` or the service class
- [ ] `useQuery` loads return a native `Promise`; `$rootScope` writes after an `await` are wrapped in `$apply`
- [ ] `$uibModal` results caught; controller names and `resolve` keys exist
- [ ] `globalPage` set in `useEffect`; `loadingMsg` cleared on every path
- [ ] No in-place changes to Angular-owned objects from React

## Mined from PR history

- AngularJS services return `$q` promises. On a cache hit, return `$q.resolve(...)` (injected `$q` or `ngimport`), never `Promise.resolve` or `new Promise`, which resolve outside the digest so bound views don't update.
  <!-- evidence: PR #911, #914 -->
- Scope writes from native callbacks (`el.bind('change')`, `FileReader`, code after a native `await`) need `$scope.$apply`. Code inside `$q` or `$http` `.then` handlers must not add `$apply` or a `$timeout` wrapper. In TS services, prefer chaining `.then` / `.catch` / `.finally` on the `$http` promise (`journalUploadService.ts`) over `async` with `$apply` in `finally` (`promoReportService.ts`).
  <!-- evidence: PR #824, #825, #828 -->
- Register `react2angular` in a separate `<Name>_angular.ts` file and type the injectables, instead of registering at the bottom of the `.tsx` or adding `// @ts-ignore` above `$http` calls. Register every AngularJS component before `angular.bootstrap` in `main-next.js`, and load Angular code in `pages/` only through a client-only import (`React.lazy`), as `pages/index.page.tsx` does.
  <!-- evidence: PR #765, #782, #784 -->
