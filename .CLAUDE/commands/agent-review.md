---
name: agent-review
description: Multi-agent PR review with smart selection, debate rounds, and consensus
approve_tools:
  - Bash(gh:*)
  - Bash(rm .ai-review.json)
  - Bash(git diff:*)
  - Bash(git branch:*)
  - Bash(git log:*)
  - Bash(date:*)
---

# Multi-Agent PR Code Review

AI-powered code review with smart agent selection, cross-examination debate, and consensus-driven findings.

**Usage**:

```bash
/agent-review           # Standard mode (smart selection, recommended)
/agent-review quick     # Quick feedback for simple PRs
/agent-review deep      # Comprehensive analysis for critical changes
```

---

## Stage 0A — Parse Review Mode & Initialize

### Determine Review Mode

Check command argument to determine mode:

- **quick**: 3 agents (Testing, Standards, Architecture), model: sonnet
- **standard** (default): Smart agent selection based on changes, model: opus
- **deep**: All 7 agents, model: opus

Print the mode banner:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[MODE BANNER based on selection]

quick:
  🏃 QUICK REVIEW MODE
  • 3 agents (Testing, Standards, Architecture)
  • Model: sonnet (fast, cost-effective)
  • Estimated time: ~2-3 minutes

standard:
  ⚡ STANDARD REVIEW MODE (Recommended)
  • Smart agent selection based on changes
  • Model: Opus
  • Estimated time: ~5-8 minutes

deep:
  🔬 DEEP REVIEW MODE
  • All 7 agents
  • Model: Opus (maximum quality)
  • Estimated time: ~10-15 minutes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

MODE: REVIEW ONLY of the current PR diff. Do NOT modify existing files or stage/commit.

---

## Stage 0B — Context Gathering & Risk Assessment

### Gather PR Context

```bash
# Check if we're in a PR branch
gh pr view --json number,title,baseRefName,headRefName,additions,deletions,changedFiles 2>/dev/null || echo "Not in a PR branch, using main as base"

# Get the day of week for reviewer recommendations
date +%A
```

Get the diff using PR refs (with fallback):

```bash
BASE_REF=$(gh pr view --json baseRefOid -q .baseRefOid 2>/dev/null)
HEAD_REF=$(gh pr view --json headRefOid -q .headRefOid 2>/dev/null)

if [ -n "$BASE_REF" ] && [ -n "$HEAD_REF" ]; then
  git diff $BASE_REF..$HEAD_REF --name-only
  git diff $BASE_REF..$HEAD_REF --stat
  git diff $BASE_REF..$HEAD_REF
else
  # Fallback: use gh pr diff (handles stacked PRs correctly)
  # IMPORTANT: Do NOT use git diff master...HEAD — it includes parent branch changes for stacked PRs
  gh pr diff --name-only 2>/dev/null || git diff master...HEAD --name-only
  gh pr diff 2>/dev/null || git diff master...HEAD
fi
```

Store the changed file list and diff content for use by all agents.

### Read Project Standards

Read `CLAUDE.md` to understand the project's coding standards and conventions. This context will be shared with all agents.

### Calculate Risk Score

Use the **exact same** risk scoring algorithm defined in `/pr-review` Stage 3 (read `.claude/commands/pr-review.md` Stage 3 for the full algorithm including file patterns, volume modifiers, scope multipliers, and special pattern detection). Do NOT duplicate the algorithm here — always reference the canonical version in pr-review.md.

Cap at 10. Display the risk assessment:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 PR RISK ASSESSMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Risk Score: [X]/10
Risk Level: [LOW | MEDIUM | HIGH | CRITICAL]

Files Changed: [N]
Lines Changed: +[X] -[Y]

Risk Factors Detected:
• [specific factors with point values]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 REVIEW RECOMMENDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Required Reviewer Level: [ANY | MID-LEVEL/SENIOR | SENIOR]
Reasoning: [1-2 sentence explanation]

[Day-of-week warnings if applicable]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Stage 0C — Smart Agent Selection

### Available Agents

This review system uses 7 specialized agents:

1. **Security** — Auth enforcement, XSS, CSRF, API interceptors, permission controls
2. **Architecture** — AngularJS/React patterns, service design, module structure, technical debt
3. **Data Integrity** — Cache services, type definitions, validation, API data handling
4. **Testing** — Karma/Jest coverage, test utilities, edge cases, code quality
5. **UX** — HTML templates, React components, AngularJS directives, SCSS, accessibility
6. **Financial** — Payment processing, promotions, cost calculations, decimal precision
7. **Standards** — CLAUDE.md compliance, ESLint/Prettier, TypeScript conventions

### Selection Logic

**Quick mode**: Testing, Standards, Architecture (always these 3)

**Deep mode**: All 7 agents

**Standard mode**: Smart selection based on changed files:

Always include: Architecture, Testing, Standards

Conditionally include:

- **Security Agent** — if any of these patterns appear in changed files:

  - `app/scripts/app_enforceAuth.js` or `app/scripts/app.config.js`
  - `app/scripts/services/authorizationInterceptor.js` or `app/scripts/services/unauthorizedInterceptor.js`
  - `app/scripts/services/loginDialog.js` or `app/scripts/services/logout.js`
  - `app/scripts/services/PermissionCache.js` or `types/permissions.ts`
  - `.env` files

- **Data Integrity Agent** — if any of these patterns appear:

  - `types/` (TypeScript type definitions / data models)
  - `app/scripts/services/*Cache.js` or `app/scripts/services/*Cache.ts` (state management caches)
  - `app/scripts/services/validateRegistrant.js` (data validation)
  - `app/scripts/services/*Interceptor.js` (HTTP interceptors)

- **UX Agent** — if any of these patterns appear:

  - `app/views/` (HTML templates)
  - `app/styles/` (SCSS stylesheets)
  - `app/scripts/components/` (React components)
  - `app/scripts/directives/` (AngularJS directives)
  - `pages/` (Next.js pages)

- **Financial Agent** — if any of these patterns appear in changed files:
  - Payment files: `app/scripts/services/payment.js`, `app/scripts/services/paymentReportService.js`, `app/scripts/controllers/paymentModal.js`, `app/scripts/controllers/paymentApproval.js`
  - `app/scripts/directives/payment.js` or `app/views/paymentMethods/` (payment form templates)
  - `app/views/modals/paymentsModal.html`
  - Promotion files: `app/scripts/services/globalPromotionService.ts`, `app/scripts/services/promoReportService.ts`, `app/scripts/directives/promotion.ts`
  - Financial type definitions: `types/registration.ts`, `types/promotion.ts`, `types/accountTransfer.ts`, `types/globalPromotion.ts`
  - OR if diff content contains: `totalPaid`, `remainingBalance`, `calculatedTotalDue`, `calculatedMinimumDeposit`, `calculatedPromotionDiscounts`, `calculatedAdditionalDiscounts`

Display selection results:

```
🤖 Analyzing PR to select relevant agents...

✅ Architecture Agent — Always included
✅ Testing Agent — Always included
✅ Standards Agent — Always included
[✅/❌] Security Agent — [reason]
[✅/❌] Data Integrity Agent — [reason]
[✅/❌] UX Agent — [reason]
[✅/❌] Financial Agent — [reason]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Selected: [N] of 7 agents
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Stage 1 — Launch Specialized Review Agents (Parallel)

**IMPORTANT:** Use a SINGLE message with multiple Task tool invocations to launch all selected agents in parallel. Each agent runs as a separate subagent.

Display: "🚀 Launching [N] specialized review agents in parallel..."

### Shared Context for All Agents

Every agent prompt MUST include:

1. The full diff content (from Stage 0B)
2. The list of changed files
3. The risk score and level
4. Instruction to read CLAUDE.md for project conventions
5. Instruction to read FULL file content (not just diff) for context
6. Instruction to search codebase before flagging issues (avoid false positives)

### Agent 1: Security Review 🔒

**Task tool config:**

- description: "Security code review"
- subagent_type: "general-purpose"
- model: "opus" (or "sonnet" in quick mode)

**Prompt focus areas:**

- Auth enforcement: `app_enforceAuth.js` route protection — verify permission checks are correct and not bypassed
- Authorization interceptor: `crsToken` cookie-based auth — verify tokens are sent correctly and not exposed
- XSS: `ng-bind-html` without `$sce.trustAsHtml`, `dangerouslySetInnerHTML` in React — must sanitize user content
- Permission checks: `PermissionCache.js` permission levels (CREATOR, FULL, UPDATE, CHECK_IN, SCHOLARSHIP, VIEW) — verify correct level required per action
- Data access controls: Users should only access their own registrations and events they have permission for
- Secret exposure: No hardcoded API keys, credentials, or secrets in code — check `.env` patterns and `app.config.js` environment configs
- Cookie/session security: `crsToken` cookie handling, `withCredentials` CORS settings
- Payment data security: Credit card data should only be handled via `@cruglobal/cru-payments` tokenization — no raw card data in application code
- HTTP interceptor chain: Verify interceptors (`authorizationInterceptor`, `unauthorizedInterceptor`, `validationInterceptor`) cannot be bypassed or misconfigured
- Angular expression injection: User input interpolated in Angular templates could execute arbitrary expressions — verify `ng-bind` is used instead of `{{ }}` with user data

**Output format:**

```
## 🔒 Security Agent Review

### Critical Security Issues (BLOCKING) — Severity: 10/10
- **File:Line** — Issue description
  - Severity: 10/10
  - Risk: What attack vector this enables
  - Impact: What could happen
  - Fix: Specific code change needed

### Security Concerns (IMPORTANT) — Severity: 6-9/10
[Same format with severity scores]

### Security Suggestions — Severity: 3-5/10
[Improvement suggestions]

### Questions for Other Agents
- **To [Agent]**: Question

### Confidence
- Overall: High/Medium/Low
- Areas needing deeper analysis: [list]
```

**CODEBASE CONTEXT SEARCH:** Before flagging an issue, the agent MUST search the codebase for how similar code is handled. Don't flag patterns that are used consistently across the codebase.

**AUTOMATED FIX GENERATION:** For every issue with a clear fix, generate a ready-to-apply code patch. Show the exact file path and line range. Provide a before/after code block (JavaScript/TypeScript/HTML as appropriate). Only generate fixes where the correct solution is unambiguous. Label each fix with its severity and the issue it addresses.

---

### Agent 2: Architecture Review 🏗️

**Task tool config:**

- description: "Architecture code review"
- subagent_type: "general-purpose"
- model: "opus" (or "sonnet" in quick mode)

**Prompt focus areas:**

- Thin controllers — AngularJS controllers should delegate logic to services, not contain business logic directly
- Service design — AngularJS services and cache services (`ConfCache`, `RegistrationCache`, etc.) follow consistent patterns
- React/Angular integration — `react2angular` and `angular2react` wrappers used correctly, props passed properly
- Module structure — dependencies declared correctly in `app.module.js`, no circular dependencies
- Cache management — `$cacheFactory` usage is correct, cache invalidation happens when data changes, `$rootScope.$broadcast` events are consistent
- HTTP interceptor chain — interceptors in `app.config.js` are ordered correctly and don't conflict
- Component design — React components are focused, use hooks appropriately, AngularJS directives have proper scope isolation
- TypeScript migration — new code uses TypeScript where appropriate, types are defined in `types/` directory
- Webpack/build impact — new dependencies or imports don't cause bundle bloat or circular dependencies
- Error handling — Rollbar integration for error tracking, proper error propagation through promise chains
- Technical debt — created vs reduced by this PR
- Pattern consistency with CLAUDE.md conventions

**Output format:**

```
## 🏗️ Architecture Agent Review

### Critical Architecture Issues (BLOCKING) — Severity: 10/10
- **File:Line** — Issue
  - Severity: 10/10
  - Problem: What's architecturally wrong
  - Impact: Long-term consequences
  - Alternative: Better approach

### Architecture Concerns (IMPORTANT) — Severity: 6-9/10
[Same format]

### Architecture Suggestions — Severity: 3-5/10
[Better patterns and approaches]

### Technical Debt Analysis
- Debt Added: [what new debt]
- Debt Removed: [what debt fixed]
- Net Impact: Better/Worse/Neutral

### Pattern Compliance
- Follows CLAUDE.md standards: Yes/No/Partial
- Violations: [list]

### Questions for Other Agents
### Confidence
```

**CODEBASE CONTEXT SEARCH:** Before flagging an issue, the agent MUST search the codebase for how similar code is handled. Don't flag patterns that are used consistently across the codebase.

**AUTOMATED FIX GENERATION:** For every issue with a clear fix, generate a ready-to-apply code patch. Show the exact file path and line range. Provide a before/after code block (JavaScript/TypeScript/HTML as appropriate). Only generate fixes where the correct solution is unambiguous.

---

### Agent 3: Data Integrity Review 💾

**Task tool config:**

- description: "Data integrity review"
- subagent_type: "general-purpose"
- model: "opus"

**Prompt focus areas:**

- **Cache service integrity**: `ConfCache`, `RegistrationCache`, `ProfileCache`, `PermissionCache`, `MinistriesCache`, `MinistryAdminsCache` — verify cache invalidation occurs when underlying data changes (via `cache.remove()`, `cache.removeAll()`, `emptyCache()`), no stale data served after mutations
- **Type definition consistency**: TypeScript types in `types/` directory (`registrant.ts`, `registration.ts`, `conference.ts`, `promotion.ts`, `permissions.ts`, etc.) must match API response shapes — verify new fields are added to types when API contracts change
- **Form validation completeness**: `validateRegistrant.js` validates required fields per block type (`nameQuestion`, `emailQuestion`, `numberQuestion`, `phoneQuestion`, `addressQuestion`, `checkboxQuestion`, `selectQuestion`, `radioQuestion`, `campusQuestion`) — verify all required visible non-admin blocks are checked, edge cases handled (empty strings, null, undefined)
- **Registration data relationships**: Couple/spouse integrity via `coupleTypeUtils.js` — couples must have spouses (`findSpouseForCouple`/`findCoupleForSpouse`), `allowedRegistrantTypeSet` constraints enforced, `groupId` associations maintained
- **HTTP interceptor chain**: Six interceptors (`authorizationInterceptor`, `httpUrlInterceptor`, `httpReturnStatusInterceptor`, `validationInterceptor`, `unauthorizedInterceptor`, `currentRegistrationInterceptor`) — verify they don't corrupt request/response data, error interceptors propagate rejections correctly
- **Cache broadcast consistency**: `RegistrationCache` uses `$rootScope.$broadcast(path, object)` when cache updates — verify event names (path-based like `'registrations/{id}'`) match between publishers and `$scope.$on()` listeners in controllers
- **Promise chain integrity**: `.then()` / `.catch()` chains must not silently swallow errors — rejected promises must be handled (via `error.errorFromResponse()` or `modalMessage.error()`) or re-thrown
- **Preview mode data isolation**: `$rootScope.previewRegCache` holds preview registration data in memory — verify preview mode changes don't write to backend API or contaminate real registration cache
- **Conference capacity tracking**: `useTotalCapacity`, `availableCapacity`, `exemptFromConferenceCapacity` — verify capacity calculations are correct and race conditions on registration don't over-subscribe
- **Data transformation safety**: Data mapping between API responses and view models via `$scope` bindings — verify no data loss during transformation (type coercion, missing properties, angular.copy deep clone correctness)
- **LocalStorage usage**: Only UI preferences stored (`lastAccess:{confId}`, `visibleBlocks:{confId}`, `builtInColumnsVisibleStorage`) — no sensitive data in localStorage, `crsToken` stays in cookies only

**Output format:**

```
## 💾 Data Integrity Agent Review

### Critical Data Issues (BLOCKING) — Severity: 10/10
- **File:Line** — Issue
  - Severity: 10/10
  - Problem: Data integrity concern
  - Impact: What could go wrong (stale cache, data loss, broken relationships, etc.)
  - Fix: Required action

### Data Concerns (IMPORTANT) — Severity: 6-9/10
[Same format]

### Data Suggestions — Severity: 3-5/10

### Application-Specific Checks
- Cache invalidation: [issues with stale data in cache services]
- Type consistency: [TypeScript types out of sync with API]
- Event broadcasting: [mismatched event names or missing listeners]
- Promise handling: [unhandled rejections or swallowed errors]
- Registration relationships: [couple/spouse integrity issues]

### Questions for Other Agents
### Confidence
```

**CODEBASE CONTEXT SEARCH:** Before flagging an issue, the agent MUST search the codebase for how similar code is handled. Don't flag patterns that are used consistently across the codebase.

**AUTOMATED FIX GENERATION:** For every issue with a clear fix, generate a ready-to-apply code patch. Show the exact file path and line range. Provide a before/after code block (JavaScript/TypeScript/HTML as appropriate). Only generate fixes where the correct solution is unambiguous.

---

### Agent 4: Testing & Quality Review 🧪

**Task tool config:**

- description: "Testing and quality review"
- subagent_type: "general-purpose"
- model: "opus" (or "sonnet" in quick mode)

**Prompt focus areas:**

- **Test coverage**: Every new method/component/service must have tests — `*.spec.js` for AngularJS (Karma/Jasmine), `*.test.ts/tsx` for React/TypeScript (Jest)
- **Karma test patterns**: Use `angular.mock.module` and `inject()` for setup, `$httpBackend` for HTTP mocking, `jasmine.createSpy()` for spies, `testData` service for shared fixtures
- **Jest test patterns**: Use `@testing-library/react` for React components, `@testing-library/react-hooks` for hooks, typed fixtures from `__tests__/fixtures.ts`
- **Test data conventions**: Karma uses `testData` service (`test/spec/testData.spec.js`), Jest uses typed fixtures from `__tests__/fixtures.ts` — avoid inline test data duplication
- **Edge cases**: Null/undefined values, zero amounts, negative amounts, empty strings, boundary conditions, preview mode vs live mode
- **Error path testing**: Not just happy paths — test `$httpBackend` error responses, promise rejections, validation failures, auth failures
- **Code quality issues**: Unused imports, debug output (`console.log`/`console.warn`/`console.error`/`debugger`), leftover `alert()` calls
- **Code smell patterns**: Empty `.catch()` blocks that silently swallow errors, overly broad `try/catch`, hardcoded magic numbers/strings that should be constants, `setTimeout`/`setInterval` in production code without cleanup
- **ESLint/Prettier compliance**: Code should pass `yarn lint` (zero warnings) and `yarn prettier:check`

**Output format:**

```
## 🧪 Testing & Quality Agent Review

### Critical Testing Gaps (BLOCKING) — Severity: 10/10
- **File:Line** — Gap
  - Severity: 10/10
  - Missing: What's not tested
  - Risk: Why it's critical
  - Required: What tests to add (with skeleton)

### Testing Concerns (IMPORTANT) — Severity: 6-9/10
[Same format]

### Code Quality Issues — Severity: varies
- Debug output left in: [file:line list]
- Unused variables/methods: [list]
- ESLint/Prettier violations: [list]

### Testing Suggestions — Severity: 3-5/10

### Coverage Assessment
- New code tested: Yes/Partial/No
- Edge cases covered: [list]
- Error handling tested: Yes/Partial/No
- Missing critical tests: [list with skeletons]

### Questions for Other Agents
### Confidence
```

**CODEBASE CONTEXT SEARCH:** Before flagging an issue, the agent MUST search the codebase for how similar code is handled. Don't flag patterns that are used consistently across the codebase.

**AUTOMATED FIX GENERATION:** For every issue with a clear fix, generate a ready-to-apply code patch. Show the exact file path and line range. Provide a before/after code block (JavaScript/TypeScript/HTML as appropriate). Only generate fixes where the correct solution is unambiguous.

---

### Agent 5: UX Review 👤

**Task tool config:**

- description: "UX and accessibility review"
- subagent_type: "general-purpose"
- model: "opus"

**Prompt focus areas:**

- **AngularJS template correctness**: No business logic in `app/views/` HTML templates — use controllers/services. Proper use of `ng-if`/`ng-show`/`ng-hide`, `ng-repeat` with `track by`, `ng-bind` over `{{ }}` for user data
- **React component patterns**: Functional components with TypeScript, proper hook usage, `react2angular` wrappers in `*_angular.ts` files follow conventions
- **Bootstrap 3 / SASS**: Use Bootstrap 3 classes (`.btn`, `.panel`, `.form-group`, `.modal`, `.alert`), consistent SASS in `app/styles/`. Use UI-Bootstrap components (`$uibModal`, popovers, datepickers) for interactive elements
- **AngularJS directive design**: Proper scope isolation (`=`, `@`, `&` bindings), `restrict: 'E'` or `'A'` used correctly, template URLs reference `views/components/`
- **Loading states**: Async operations should set `$rootScope.loadingMsg` for global loading indicator, `ng-disabled` on buttons during submission
- **Error display**: User-friendly error messages via `modalMessage.error()` — use `{title, message, forceAction}` object format, not raw strings
- **Accessibility**: ARIA labels on interactive elements, semantic HTML, keyboard navigation, proper `<label>` associations with form inputs
- **i18n**: New user-facing strings should use `translate` directive or `gettextCatalog.getString()` for angular-gettext extraction
- **Form UX**: Proper labels, `showErrors` directive for validation feedback, `ng-disabled` states during submission

**Output format:**

```
## 👤 UX Agent Review

### Critical UX Issues (BLOCKING) — Severity: 10/10
- **File:Line** — Issue
  - Severity: 10/10
  - Problem: UX concern
  - User Impact: How it affects users
  - Fix: Required action

### UX Concerns (IMPORTANT) — Severity: 6-9/10
[Same format]

### Accessibility Issues
- Missing ARIA labels: [file:line list]
- Keyboard navigation: [issues]
- Screen reader support: [concerns]

### Design System Compliance
- Bootstrap 3 classes used correctly: Yes/No
- SASS patterns consistent with `app/styles/`: Yes/No
- i18n strings use angular-gettext: Yes/No/N/A

### UX Suggestions — Severity: 3-5/10
### Questions for Other Agents
### Confidence
```

**CODEBASE CONTEXT SEARCH:** Before flagging an issue, the agent MUST search the codebase for how similar code is handled. Don't flag patterns that are used consistently across the codebase.

**AUTOMATED FIX GENERATION:** For every issue with a clear fix, generate a ready-to-apply code patch. Show the exact file path and line range. Provide a before/after code block (JavaScript/TypeScript/HTML as appropriate). Only generate fixes where the correct solution is unambiguous.

---

### Agent 6: Financial Accuracy Review 💰

**Task tool config:**

- description: "Financial accuracy review"
- subagent_type: "general-purpose"
- model: "opus"

**Prompt focus areas:**

- **Payment validation**: `payment.js` service — `validate()` enforces `calculatedMinimumDeposit` on first payment, prevents overpayment vs `remainingBalance`. Verify validation logic is correct and not bypassed
- **Payment tokenization**: Credit card data must flow through `@cruglobal/cru-payments` tokenization (`cruPayments.init()` + `cruPayments.encrypt()`) — no raw card numbers stored or logged. Only TSYS gateway is supported
- **Payment type handling**: All payment types (`CREDIT_CARD`, `OFFLINE_CREDIT_CARD`, `CASH`, `CHECK`, `SCHOLARSHIP`, `TRANSFER`, `REFUND`, `ADDITIONAL_EXPENSE`, `FL_GIFT_CARD`) must be handled correctly — verify `PAY_ON_SITE` skips payment, gift cards send `calculatedTotalDue`
- **Permission-gated payment actions**: `paymentModal.js` — CHECK_IN for adding payments/refunds, SCHOLARSHIP for scholarship-only, FULL for expenses/discounts, UPDATE for deleting promotions. Verify correct permission level enforced per action
- **Promotion limit enforcement**: `promotionValidationService.ts` — verify `/promotions/verify` pre-check before payment, 409 handling for exceeded limits, correct error messages with promo code names
- **Server-computed financial fields**: `calculatedTotalDue`, `calculatedMinimumDeposit`, `calculatedPromotionDiscounts`, `calculatedAdditionalDiscounts`, `remainingBalance` — these are server-computed and should never be manually set or overridden on the client
- **Promotion date logic**: `GlobalPromotionService.isPromotionActive()` uses `moment` for activation/deactivation date checks — verify timezone handling and edge cases
- **Rounding**: Any arithmetic on monetary values — check for floating-point errors in JavaScript
- **Edge cases**: Zero payment amounts, negative `remainingBalance`, promo with `numberLimit: 0` (unlimited) vs `numberLimit: 1`, `applyToAllRegistrants` flag behavior

**Output format:**

```
## 💰 Financial Accuracy Agent Review

### Critical Financial Issues (BLOCKING) — Severity: 10/10
[Money errors are unacceptable — be thorough]
- **File:Line** — Issue
  - Severity: 10/10
  - Problem: Financial calculation error
  - Impact: Incorrect payment amount / overcharge / undercharge
  - Fix: Required correction

### Financial Concerns (IMPORTANT) — Severity: 6-9/10
[Same format]

### Financial Suggestions — Severity: 3-5/10

### Financial Checklist
- Payment validation logic correct: Yes/No/N/A
- Credit card tokenization via cru-payments only: Yes/No/N/A
- Server-computed fields not overridden: Yes/No/N/A
- Promotion limit enforcement correct: Yes/No/N/A
- Permission checks match required action: Yes/No/N/A

### Questions for Other Agents
### Confidence
- Overall: High/Medium/Low
- Calculations reviewed: [list what was checked]

IMPORTANT: If no financial code is in the PR, note "No financial code in this PR" and skip to confidence.
```

**CODEBASE CONTEXT SEARCH:** Before flagging an issue, the agent MUST search the codebase for how similar code is handled. Don't flag patterns that are used consistently across the codebase.

**AUTOMATED FIX GENERATION:** For every issue with a clear fix, generate a ready-to-apply code patch. Show the exact file path and line range. Provide a before/after code block (JavaScript/TypeScript/HTML as appropriate). Only generate fixes where the correct solution is unambiguous.

---

### Agent 7: ERT Standards Compliance Review 📋

**Task tool config:**

- description: "ERT standards compliance review"
- subagent_type: "general-purpose"
- model: "opus" (or "sonnet" in quick mode)

**Prompt focus areas:**

Read CLAUDE.md thoroughly, then check each standard:

**Architecture Standards:**

- [ ] Controllers are thin — business logic delegated to AngularJS services
- [ ] Cache services (`ConfCache`, `RegistrationCache`, etc.) follow existing patterns — `$cacheFactory`, `emptyCache()`, broadcast on update
- [ ] React/Angular bridge uses `react2angular` / `angular2react` correctly with `*_angular.ts` wrapper files
- [ ] New dependencies registered in `app.module.js` and imported in `app/scripts/main.js`

**Component Standards:**

- [ ] AngularJS directives use proper scope isolation (`=`, `@`, `&` bindings)
- [ ] React components are functional with TypeScript, use hooks appropriately
- [ ] TypeScript types defined in `types/` directory and match API response shapes
- [ ] HTTP calls use relative URLs (interceptor prepends API base) via `$http` or typed `$http.get<T>()`

**Data Integrity Standards:**

- [ ] Cache invalidation occurs after mutations — no stale data
- [ ] Promise chains handle errors — no silently swallowed rejections
- [ ] `$rootScope.$broadcast` event names match between publishers and `$scope.$on()` listeners
- [ ] Preview mode (`$rootScope.previewRegCache`) doesn't write to backend API
- [ ] Server-computed fields (`calculatedTotalDue`, `remainingBalance`, etc.) not manually overridden

**Testing Standards:**

- [ ] Karma tests (`*.spec.js`) for AngularJS code — use `testData` service, `$httpBackend`, `angular.mock.module`
- [ ] Jest tests (`*.test.ts/tsx`) for React/TypeScript — use `@testing-library/react`, typed fixtures from `__tests__/fixtures.ts`
- [ ] New components/services have corresponding test files
- [ ] Error paths tested, not just happy paths

**Code Quality Standards:**

- [ ] Passes `yarn lint` with zero warnings
- [ ] Passes `yarn prettier:check`
- [ ] No debug output (`console.log`/`console.warn`/`console.error`/`debugger`/`alert`)
- [ ] No `TODO` without ticket reference
- [ ] New user-facing strings use `translate` directive or `gettextCatalog.getString()` for i18n
- [ ] Errors reported to Rollbar where appropriate

**Output format:**

```
## 📋 ERT Standards Compliance Review

### Standards Violations (BLOCKING) — Severity: 8-10/10
- **File:Line** — Violation
  - Severity: [8-10]/10
  - Standard: What standard is violated
  - Issue: What's wrong
  - Fix: How to fix

### Standards Concerns (IMPORTANT) — Severity: 5-7/10
[Same format]

### Standards Checklist Results
**Architecture**: ✅/⚠️/❌
**Component**: ✅/⚠️/❌
**Data Integrity**: ✅/⚠️/❌
**Testing**: ✅/⚠️/❌
**Code Quality**: ✅/⚠️/❌

### Pattern Deviations
[List deviations from CLAUDE.md patterns]

### Questions for Other Agents
### Confidence
```

**CODEBASE CONTEXT SEARCH:** Before flagging an issue, the agent MUST search the codebase for how similar code is handled. Don't flag patterns that are used consistently across the codebase.

**AUTOMATED FIX GENERATION:** For every issue with a clear fix, generate a ready-to-apply code patch. Show the exact file path and line range. Provide a before/after code block (JavaScript/TypeScript/HTML as appropriate). Only generate fixes where the correct solution is unambiguous.

---

After launching all selected agents, display:

```
✅ All [N] agents launched in parallel
⏳ Waiting for agents to complete their reviews...
```

---

## Stage 1B — Dependency Impact Analysis (Parallel)

While agents are running, analyze dependency impact for each changed file:

**Services:** Search for the service name in `inject()` calls, controller function parameters, and other services across `app/scripts/`.

**Controllers:** Search for the controller name in route definitions (`app.config.js`) and test files (`test/spec/controllers/`).

**Directives:** Search for the directive's element/attribute name in HTML templates (`app/views/`) and other templates.

**TypeScript types:** Search for type imports (`import { TypeName }`) across `app/scripts/` and `types/`.

**Cache services:** Search for cache service usage in controllers and other services — changes to cache behavior affect all consumers.

**Utilities:** Search for imports of utility functions across the codebase.

For high-impact files (10+ dependents), flag as critical. Display:

```
📦 DEPENDENCY IMPACT ANALYSIS

🚨 CRITICAL IMPACT: app/scripts/services/RegistrationCache.js — [N] dependents
⚠️  HIGH IMPACT: app/scripts/services/payment.js — [N] dependents
📊 MEDIUM IMPACT: types/registration.ts — [N] dependents

Breaking Changes:
[List any removed functions, renamed exports, or changed service interfaces]
```

---

## Stage 2 — Collect Agent Reports

Wait for all agents to complete and display progress:

```
Agent Reviews Complete:
✅ 🔒 Security Agent — Found [X] critical, [Y] concerns
✅ 🏗️ Architecture Agent — Found [X] critical, [Y] concerns
✅ 💾 Data Integrity Agent — Found [X] critical, [Y] concerns
✅ 🧪 Testing Agent — Found [X] critical, [Y] concerns
✅ 👤 UX Agent — Found [X] critical, [Y] concerns
✅ 💰 Financial Agent — Found [X] critical, [Y] concerns
✅ 📋 Standards Agent — Found [X] violations, [Y] concerns
```

Parse each agent's output and extract:

- Critical issues with severity scores
- Important concerns with severity scores
- Suggestions
- Questions for other agents
- Confidence level

---

## Stage 2B — Extract & Organize Automated Fixes

Parse agent outputs for automated fix patches:

**Process:**

1. Extract every before/after code patch from all agent reports
2. Group patches by file path
3. If multiple agents suggest fixes for the same file:line, merge or pick the highest-severity version
4. Deduplicate identical suggestions
5. Sort by severity (highest first)

**Display:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 AUTOMATED FIX PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[N] fixes across [M] files

Fix #1 — Severity [X]/10 — [Agent Name]
File: [path]:[line]
[before/after code block]

Fix #2 — ...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Note: These fixes are for reference during the review. This command does NOT modify files. If you want to apply fixes, use `/review-and-fix` after this review completes.

---

## Stage 3 — Cross-Examination Debate (Round 1)

Display: "🗣️ Starting cross-examination debate round..."

For EACH agent, launch a NEW Task with their original findings PLUS all other agents' findings. All debate agents run in parallel.

**Debate prompt for each agent:**

```
You are the [Agent Name] in the cross-examination debate phase.

YOUR ORIGINAL FINDINGS:
[Paste that agent's original review output with severity scores]

OTHER AGENTS' FINDINGS:
[All other agents' findings with severity scores]

MISSION: Review other agents' findings from your specialized perspective.

DEBATE ACTIONS (use severity scores to prioritize):
1. **CHALLENGE** — Disagree with a finding (max 3 challenges, focus on severity 7+)
   - Cite your reasoning with evidence
   - Suggest revised severity score
2. **SUPPORT** — Strongly agree and add context (for severity 8+)
3. **EXPAND** — Build on a finding with additional concerns
4. **QUESTION** — Ask for clarification

RULES:
- Maximum 3 challenges (focus on important disagreements)
- Provide specific reasoning and evidence
- Reference file:line when possible
- Suggest severity score adjustments (1-10)
- Be constructive, not combative
- IMPORTANT: Do not speculate. Only challenge or support with evidence from actual code.

OUTPUT FORMAT:

## [Agent Name] — Cross-Examination

### Challenges
- **Challenge to [Agent X] re: [finding]**
  - Original severity: [X]/10
  - Why I disagree: [reasoning with code evidence]
  - Revised severity: [Y]/10

### Strong Support
- **Support for [Agent X] re: [finding]**
  - Additional context: [your perspective]
  - Severity agreement: [X]/10 is correct

### Expansions
- **Building on [Agent X]'s [topic]**:
  - Additional severity: [+N] points
  - Reasoning: [why more severe]

### Questions
- **To [Agent X]**: [question]

### Summary
- Challenges: [N]
- Supports: [N]
- Key disagreements: [main contentions]
```

Launch all debate agents in parallel.

---

## Stage 4 — Rebuttals (Debate Round 2)

Collect all challenges from Stage 3 and give each challenged agent a chance to respond.

Display: "🔄 Starting rebuttal round..."

For each agent that received challenges, launch a new Task:

```
You are the [Agent Name] responding to challenges from debate round 1.

YOUR ORIGINAL FINDINGS:
[Their original findings with severity scores]

CHALLENGES RAISED AGAINST YOU:
[List each challenge with severity score adjustments]

MISSION: Respond to each challenge, adjusting severity scores based on evidence.

RESPONSE OPTIONS:
1. **DEFEND** — Additional evidence supports your finding (maintain severity)
2. **CONCEDE** — Acknowledge challenge, downgrade/remove finding
3. **REVISE** — Update finding based on new perspective
4. **ESCALATE** — Flag as unresolved, needs human senior review

OUTPUT FORMAT:

## [Agent Name] — Rebuttals

### Response to Challenge #1 from [Agent]
- Original Severity: [X]/10
- Decision: DEFEND/CONCEDE/REVISE/ESCALATE
- Reasoning: [explanation with code evidence]
- Final Severity: [Y]/10
- Updated Finding (if revised): [description]

### Summary
- Defended: [N]
- Conceded: [N]
- Revised: [N]
- Escalated: [N]
```

---

## Stage 5 — Consensus Synthesis & Cross-Cutting Analysis

Analyze all findings, debates, and final severity scores to build consensus. Then perform a cross-cutting consistency check that no individual agent can do alone.

**Process:**

1. Collect all final findings with severity scores (after debate adjustments)
2. Group by similarity (same file:line or same general issue)
3. Calculate average severity score for each finding
4. Count agent agreement

**Cross-Cutting Consistency Check (post-debate):**

This step catches bugs that individual agents miss because they review from a single perspective.

1. **Operation Inventory**: List every distinct operation the PR implements (e.g., "add a payment", "apply a promotion", "complete a registration"). For each operation, identify ALL code paths that perform it — including admin modal actions, registrant-facing flows, service methods, and controller handlers.

2. **Safeguard Parity Check**: For each operation with multiple code paths, verify they all have equivalent:

| Code path | Authorization | Audit trail | Validation | Error handling | Locking |
| --------- | ------------- | ----------- | ---------- | -------------- | ------- |

Flag any row that is missing a safeguard present in another row. These are must-fix (severity 9+).

3. **"Fix One, Fix All" Check**: If the PR fixes a pattern in one place (e.g., replacing `ng-bind-html` with `ng-bind`, adding error handling to a `.then()` chain), search for ALL other instances of that same pattern in the PR. Flag remaining instances.

**Consensus Levels:**

- **Average 9-10, 4+ agents**: CRITICAL BLOCKER
- **Average 8-9, 3+ agents**: HIGH PRIORITY BLOCKER
- **Average 7-8, 3+ agents**: IMPORTANT (should fix before merge)
- **Average 5-7, 2+ agents**: MEDIUM PRIORITY
- **Average 3-5, 1-2 agents**: SUGGESTION
- **Agents differ by 4+ severity points**: NEEDS HUMAN REVIEW

Display consensus summary:

```
📊 Consensus Analysis:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Critical Blockers (Severity 9-10): [N]
High Priority Blockers (Severity 8-9): [N]
Important Issues (Severity 7-8): [N]
Medium Priority (Severity 5-7): [N]
Suggestions (Severity 3-5): [N]
Unresolved Debates: [N]

Total Findings: [N]
Average Confidence: [High/Medium/Low]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Stage 6 — Generate Review Report

Print the comprehensive review report:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 MULTI-AGENT CODE REVIEW REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Agents: [N] specialized reviewers with debate rounds
Mode: [quick/standard/deep]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Sections in order:**

### 📊 Risk Assessment

[From Stage 0B — risk score, level, reviewer recommendation]

### 📦 Dependency Impact

[From Stage 1B — high-impact files, breaking changes]

### 🚫 Critical Blockers (Severity 9-10)

For each:

- Severity: [X.X]/10 (Consensus from [N] agents)
- File: [file:line]
- Flagged by: [Agent 1 (score), Agent 2 (score), ...]
- Problem: [detailed description]
- Debate Summary: [challenges and resolutions]
- Required Action: [specific fix]

### 🔴 High Priority Blockers (Severity 8-9)

[Same format as critical]

### ⚠️ Important Issues (Severity 7-8)

For each:

- Severity: [X.X]/10
- File: [file:line]
- Flagged by: [Agents]
- Issue: [description]
- Recommended Fix: [how to address]

### 💡 Medium Priority (Severity 5-7)

[Bulleted list with file:line and brief description]

### 💭 Suggestions (Severity 3-5)

[Grouped by category, bulleted list]

### 🤔 Unresolved Debates

For each:

- Debate Topic: [what]
- Severity Range: [Low]-[High]/10
- Positions: [Agent A argues X, Agent B argues Y]
- Why unresolved: [explanation]
- Recommendation: Senior developer should decide

### 📝 Review Summary Table

| Agent             | Critical | High    | Important | Suggestions | Confidence |
| ----------------- | -------- | ------- | --------- | ----------- | ---------- |
| 🔒 Security       | [N]      | [N]     | [N]       | [N]         | [H/M/L]    |
| 🏗️ Architecture   | [N]      | [N]     | [N]       | [N]         | [H/M/L]    |
| 💾 Data Integrity | [N]      | [N]     | [N]       | [N]         | [H/M/L]    |
| 🧪 Testing        | [N]      | [N]     | [N]       | [N]         | [H/M/L]    |
| 👤 UX             | [N]      | [N]     | [N]       | [N]         | [H/M/L]    |
| 💰 Financial      | [N]      | [N]     | [N]       | [N]         | [H/M/L]    |
| 📋 Standards      | [N]      | [N]     | [N]       | [N]         | [H/M/L]    |
| **Total**         | **[N]**  | **[N]** | **[N]**   | **[N]**     |            |

### Verdict

Based on consensus:

- **BLOCKERS FOUND**: [N] critical + [N] high priority issues must be resolved before merge
- **APPROVED WITH SUGGESTIONS**: No blockers, but [N] improvements recommended
- **CLEAN**: No significant issues found

---

## Stage 7 — Deliver Results

**Step 1: Get PR metadata**

```bash
COMMIT_SHA=$(gh pr view --json commits --jq '.commits[-1].oid' 2>/dev/null)
PR_NUM=$(gh pr view --json number --jq '.number' 2>/dev/null)
```

If no PR exists, print to terminal only.

**Step 2: Ask delivery method**

"How would you like your feedback?"

- **Post to GitHub**: Comments will be left on your GitHub PR
- **Print to Terminal**: Comments will be printed here in terminal
- **Both**: Post to GitHub AND print to terminal

**For GitHub posting:**

Create `.ai-review.json` with all findings as line-anchored comments using `line` + `side` fields (same format as `/pr-review` Stage 8), then:

```bash
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  "/repos/CruGlobal/conf-registration-web/pulls/${PR_NUM}/reviews" \
  --input .ai-review.json || echo "Failed to post review"

rm .ai-review.json
echo "Review posted to PR #${PR_NUM}"
```

**Line number calculation rules** (same as `/pr-review`):

- Use `line` (actual file line number) + `side` (`"RIGHT"` for new/context lines, `"LEFT"` for deleted lines)
- Use the `+N` side of `@@` hunk headers to determine line numbers in the new file
- Before finalizing, re-read the diff and verify each line number falls within a valid hunk range

**For terminal printing:**

- Group comments by file path
- Show line numbers with each comment
- Display the review body/summary at the top

After delivery, print:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Multi-agent review complete for PR #[NUMBER]
   [N] agents | [N] findings | [N] blockers
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
