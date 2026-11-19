# Security — Focus Areas

Generic baseline. `/agent-review:init` appends the repo-specific concerns; keep both.

**Authentication & authorization boundaries**

- Every server endpoint, background job, and privileged action independently verifies the caller's
  identity — never trusts a user id, tenant id, or role passed in from the client
- Authorization is enforced at the data layer (row/tenant scoping, ACL check), not only by hiding UI
- Look for: endpoints added without a session/permission check; ownership checks that compare
  against client-supplied identifiers; policy changes that widen who can read or write a record

**Privileged clients & credentials**

- Admin/service-level clients that bypass normal access control must stay server-only and must never
  be importable from browser or otherwise untrusted code
- Look for: privileged clients imported into client-side modules; secrets read in code that ships to
  the browser; credentials committed to the repo or baked into build artifacts

**Secrets exposure**

- Server-only environment variables must not be exposed through client-visible prefixes, build-time
  inlining, or error payloads
- Look for: new environment-variable references; API keys or tokens in logs, error messages, HTTP
  responses, or analytics events

**Input validation & injection**

- Untrusted input (request bodies, query params, headers, webhooks, third-party payloads, file
  uploads) is validated against an explicit schema before use
- Look for: raw string interpolation into SQL/shell/HTML/templates; parsers fed unvalidated JSON;
  client-side validation with no server-side counterpart; unbounded sizes and counts

**Cross-site and browser-surface risks**

- Look for: raw-HTML injection sinks; unsanitized user content rendered as markup; open redirects
  where a redirect target comes from a query parameter without an allowlist check; missing CSRF
  protection on state-changing requests; weakened CSP or security headers

**Session & cookie handling**

- Look for: session cookies missing `HttpOnly`/`Secure`/`SameSite`; tokens stored where scripts can
  read them; sessions that are not invalidated on logout, password change, or privilege change;
  long-lived or non-rotating credentials

**Webhooks & third-party integrations**

- Look for: webhook handlers that parse and act on a payload before verifying the signature against
  the raw body; missing replay protection; secrets or tokens forwarded to the client

**Supply chain & CI**

- Look for: new dependencies (who maintains them, what they pull in); CI workflow changes that widen
  permission scopes, echo secrets, or let untrusted contributors trigger privileged jobs; changes to
  the review configuration itself that weaken risk scoring or strip checks

<!-- init: extend this file with repo-specific focus areas and evidence links -->

## Repo-specific: conf-registration-web (Event Registration Tool)

This repo is only the browser app. The API (base URL from `envService.read('apiUrl')`) does the real access checks. The risks here are leaking the session token, opening HTML or script sinks, sending card data where it should not go, and trusting checks that only hide UI.

**Session token (`crsToken` cookie)**

- The API token lives in the `crsToken` cookie. The `/auth/:token` route in `app/scripts/app.config.js` writes it with `$cookies.put`, so page scripts can read it and any XSS can steal the session. Treat every new HTML sink as a session risk.
- `authorizationInterceptor.js` adds `Authorization: <crsToken>` and `withCredentials = true` to every `$http` request, and `httpUrlInterceptor.js` lets absolute `http(s)://` URLs through unchanged. Look for: `$http` calls to any absolute URL that is not the API. They would send the session token to that host.
- Look for: new reads of `$cookies.get('crsToken')` outside the interceptors, and the token placed in a URL, Rollbar payload, `analytics.track` / `dataLayer` data, `localStorage`, or `$rootScope`. Existing download links already pass `?Authorization=<token>` (`ExportModal.tsx`, `paymentCashCheckReport.controller.js`, `journalUploadReview.controller.js`). Do not spread that pattern to new places.
- Logout (the `/logout` route) and a failed sign in (the `/auth/:token` catch block) must remove `crsToken` (including the `eventregistrationtool.com` and `www.` domain variants) and call `ProfileCache.clearCache()`. Look for: new auth state (cookies, caches, `$rootScope` fields, Rollbar person data) that is not cleared on logout.

**HTML and script sinks**

- `modalMessage.error/info/confirm` (`app/scripts/services/modalMessage.js`) render `message` and `question` with `ng-bind-html="... | toTrustedHtml"` (`genericModal.html`, `confirmModal.html`). `toTrustedHtml` calls `$sce.trustAsHtml`, so nothing gets sanitized. Look for: server error text (`response.data.error.message`), registrant answers, conference names, or other user or admin text joined into a modal message. Many existing calls already do this (`reviewRegistration.controller.js`, `globalPromotionService.ts`, `previewEmail` in `eventDetails.controller.js`). Flag new ones and prefer plain-text messages.
- `$sce.trustAsHtml(...)` builds `notify.message` banners in `eventDetails.controller.js` and `eventForm.controller.js`, some with `response.data.error.message` or validation text joined in. Look for: new `trustAsHtml` calls or new values joined into these strings.
- Plain `ng-bind-html` with no filter (conference `description`, `block.title`, `block.content.paragraph`) goes through `$sanitize` from `ngSanitize`. That is the safe path for admin-written rich text. Look for: `| toTrustedHtml` or `$sce.trustAsHtml` added to those, or `dangerouslySetInnerHTML` in React.
- `GrowlService` runs `eval('growlScope.' + growlName + ...)`. `gtmService.js` writes `innerHTML` after checking the tag id against `/^GTM-[A-Z0-9]+$/`. Look for: callers passing anything but fixed, code-defined names into the growl, or a GTM change that drops the tag id check.

**Redirects and loaded URLs**

- `navigateToPostRegistrationPage` (`reviewRegistration.controller.js`) sets `$window.location.href` to the admin-set `registrationCompleteRedirect`. `logoutService` (`services/logout.js`) follows `googleUrl` / `facebookUrl` / `oktaUrl` from the logout response. Look for: new `location.href` assignments from data with no check for an `http:` or `https:` URL (a `javascript:` URL would run code).
- After sign in, the app returns to the `intendedRoute` cookie with `$location.path(...)` (`app_enforceAuth.js`, `/auth/:token`). Look for: changes that switch this to `$window.location` or accept a full URL, which would create an open redirect.
- `index.ejs` loads `globalPage.conference.cssUrl` as a stylesheet. Ministry events load Google Tag Manager on `/register/` and `/reviewRegistration/`, and the review page is where card numbers get typed. Look for: new third-party scripts or styles on registration or payment pages, and new `<script>` or CDN tags in `index.ejs` with no `integrity` (production builds use `SubresourceIntegrityPlugin`).

**Client checks are not access control**

- Route `authorization` (`requireLogin`, `allowNoneAuth`, `eventAdminPermissionLevel`) in `app.config.js`, enforced in `app_enforceAuth.js`, and `permissions.permissionInt < permissionConstants.X` checks (for example in `paymentModal.controller.js`) only hide UI. Look for: a new admin route with no `authorization` block, and new money or permission actions (refunds, expenses, discounts, permission grants) guarded only on the client. Ask whether the API checks the same rule.

**Card data**

- Card number and CVV go only to TSYS, through `cruPayments.encrypt` in `app/scripts/services/payment.js`. The API gets `tsepToken` and `lastFourDigits`. Look for: raw `creditCard.number` or `cvvNumber` in an `$http` body, a log, Rollbar, analytics, a cache, or `$rootScope`. `errorNotify.js` scrubs `creditCard` and telemetry inputs. Keep `scrubFields` up to date if card fields get new names.

**Build-time values and environments**

- `EnvironmentPlugin` in `webpack.config.js` puts `ROLLBAR_ACCESS_TOKEN`, `ROLLBAR_ENDPOINT`, and `GIT_COMMIT_SHA` into the public bundle. Look for: new keys there or in a `DefinePlugin`. Anything added ships to every browser.
- `apiEnvironment()` in `app/scripts/utils/hostEnvironment.ts` picks the API and the TSYS mode by an exact hostname match against `hostnames.json`. Look for: loose matching (`includes`, or `endsWith` on production names) that could send a non-production host to the production API or production TSYS.

**CI**

- `.github/workflows/ci.yml` sets `permissions: contents: read`, and `pipeline-v2.yml` starts from `permissions: {}`. Look for: wider permissions, secrets used in jobs that run on `pull_request`, or the parked `deploy` job (`if: false`) turned back on.

## Mined from PR history

- Admin- or registrant-entered text (`conference.description`, `block.title`, `block.content`, answers) renders with plain `ng-bind-html` so ngSanitize cleans it. Flag `| toTrustedHtml` or `$sce.trustAsHtml` added to such values, and new server error text passed into a `modalMessage` message, which renders through `toTrustedHtml`.
  <!-- evidence: PR #778, #781, #783, #825, #828 -->
- Pick the environment only through `apiEnvironment()` in `app/scripts/utils/hostEnvironment.ts`. Flag a new `envServiceProvider.check()`, a `domains:` config, or a substring host test (`location.host.includes(...)`), which can send a non-production host to the production API and production TSYS. An AI-written PR added the shared helper but kept the old loose matcher until a reviewer caught it.
  <!-- evidence: PR #985, #1013 -->
- Keep `scrubTelemetryInputs: true` and card fields in `scrubFields` in `app/scripts/errorNotify.js` (telemetry once recorded card input values). New `Rollbar.error(message, response)` calls pass the status, URL, and error message, not a whole `$http` response, whose `config.data` holds answers or payment data.
  <!-- evidence: PR #852, #853 -->
- Workflows keep a top-level `permissions: {}` or `contents: read` and grant `id-token: write` only to the job that needs it. `.dockerignore` stays an allow list (`*`, then `!app`, `!package.json`, and so on) so local files never reach the image build.
  <!-- evidence: PR #1013, #1017 -->
