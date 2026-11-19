# Financial Focus Areas

This app takes money for event registrations. Card data goes to TSYS through `@cruglobal/cru-payments`. The API records payments (`payments/`), expenses and discounts (`expenses`), journal account transfers (`account/transfers`), and promo postings (`promotion/post`). Bugs here can charge someone twice, lose money, or post wrong entries to finance. Rate real money bugs high.

**Card tokenization (TSYS)**

- Card payments go through `payment.tokenizeCreditCardPayment(conference, payment)` in `app/scripts/services/payment.js`. It loads `payments/appManifest`, calls `cruPayments.init(envService.read('tsysEnvironment'), deviceId, manifest)` and then `cruPayments.encrypt(...)`, then replaces `creditCard.number` with `tsepToken` and sets `lastFourDigits` and `network`. Only `paymentGatewayType === 'TSYS'` is supported.
- Look for: a card path that posts to `payments/` without tokenizing first (both `payment.pay` and `processTransaction` in `paymentModal.controller.js` tokenize); raw `number` or `cvvNumber` kept on an object that is later sent, logged, cached, or copied; `tsysEnvironment` taken from anywhere but `envService` (production TSYS must only run on production hosts, see `hostEnvironment.ts`).
- Look for: card checks moved off the `cruPayments.card.validate.*`, `cvv.validate.*`, and `expiryDate.validate.*` helpers used in `directives/payment/payment.js`.

**Charge once**

- `confirmRegistration` in `reviewRegistration.controller.js` pays first, then marks the registration complete. The `paymentCharged` flag skips payment on a retry, and `paymentChargedMessage()` tells the user their card was charged. Look for: changes that reorder pay and complete, reset `paymentCharged`, or call `payment.pay` again after it worked.
- Money actions must be blocked while in flight: `submittingRegistration` (review page), `processing` (payments modal), `addingPromoCode`. On the upload pages, Submit (`UploadPageHeader.tsx`) only checks that something is selected, and the services warn the user not to resend "or charges will be duplicated". Look for: changes that make a double post easier, or new money actions with no in-flight guard.
- `payment.pay` returns without a request when the amount is 0, no payment methods are accepted, or the type is `PAY_ON_SITE`. Look for: new payment types that need the same early return.

**Amount rules**

- `payment.validate`: the first payment must be at least `registration.calculatedMinimumDeposit`, and no payment may be more than `remainingBalance`. Gift cards (`FL_GIFT_CARD`) send `calculatedTotalDue` as the amount. Pay on site and gift cards always need payment in full (`minimumPaymentAccepted` in `eventDetails.controller.js`).
- Inputs give strings, and existing code uses `Number(...)` before comparing or posting. Look for: string compares, `parseInt` on amounts, or `+` that joins strings instead of adding.
- Admin transactions (`processTransaction`): the amount must be more than 0; `DISCOUNT` posts to `expenses` as a negative amount; `ADDITIONAL_EXPENSE` and `DISCOUNT` need a description and `FULL` permission; users with `SCHOLARSHIP` permission may only add scholarships; admin-added scholarships are saved as `APPROVED`. Look for: sign mistakes and dropped permission checks.
- Refunds: `calculateRefundableAmount` is the payment minus earlier refunds with the same `refundedPaymentId`. `canBeRefunded` blocks `REFUND`, `TRANSFER`, `SCHOLARSHIP`, and `FL_GIFT_CARD`. `canDeletePayment` blocks card and gift card payments, card refunds, and anything `reported`. Look for: changes that allow refunding more than was paid, or deleting a payment finance already has.
- Totals and balances (`calculatedTotalDue`, `remainingBalance`, `totalPaid`) come from the API. Look for: the client computing its own totals.

**Currency and display**

- One currency per event: `conference.currency.currencyCode`, with `shortSymbol` for input labels. Stored amounts carry no currency. Show money with `localizedCurrency` and the event's code. That filter falls back to USD when the code is missing or bad, so a missing code shows the wrong symbol with no error. Look for: hard-coded `$`, `toFixed(2)` strings, `localizedCurrency` called with no code, and raw amounts in new UI (`PromoUploadPage.tsx` shows `promotion.amount * count` unformatted; don't copy that).
- Screens with no conference (global promotions are ministry-level) may use `localizedCurrency:'USD'`. Flag hard-coded currency only where `conference.currency.currencyCode` is in scope.
- Look for: float sums over many items done in the client. Round only for display.

**Promotions and global promotions**

- Registrants add a code with `POST registrations/{id}/promotions` (`validatePromo`), and a 404 means the code is not valid. Removing one PUTs the registration without it, from both `promotions` and `globalPromotions` (`deletePromotion`). The API decides whether a code applies and how much it takes off. Look for: client code that applies a discount itself.
- Global promotions (`app/features/globalPromotions/`, `services/globalPromotionService.ts`) are scoped by `ministryId` and an optional `ministryActivityId`, and need ministry admin access (`MinistryAdminsCache`). Look for: cache key mistakes (`getCacheKey`) and start or end date checks with `moment()` that ignore time zones.
- Hard-coded promos like `utils/wtrSave50Promo.js` are display only and have a fixed date window. Look for: new hard-coded promo logic that is not display only, has no end date, or has no ticket reference. A promo hint must hide once that code is applied.
- `isPromoPosted` in the payments modal blocks deleting a promo that is already in a promo report.

**Scholarships and account transfers**

- Scholarships need a staff approver picked through `staffAccountService.searchStaff` (`selectStaff` sets `staffApprovalName` and `staffEmail`). Approval happens at `/approvePayment/:paymentHash` (`paymentApproval.controller.js`). In the admin payment form, scholarships are checked as `TRANSFER`.
- Transfers by `accountType`: `STAFF` fills the account number from the user's profile (`getProfileStaffAccountNumber`) and locks the field, with an error when there is none; `MINISTRY` needs business unit, operating unit, and department; `NON_US_STAFF` defaults to `INTLM` / `GENL` and also needs an account number. Look for: a registrant able to type a staff account number that should be locked, or required chart-of-account fields dropped.
- Journal upload (`JournalUploadPage`, `journalUploadService.submitAccountTransfers`) posts to `account/transfers` after removing the UI-only `included` key. Promo upload (`promoReportService.submitPromos`) posts to `promotion/post` with one entry per registration. A timeout returns `null` and shows a "still processing" message instead of an error. Look for: UI-only fields leaking into the post, grouping changes, the error sections going missing, and loss of the timeout handling.

**Checklist**

- [ ] Card data tokenized before any API call; no raw card data stored, logged, or sent
- [ ] `paymentCharged` charge-once guard intact; money actions blocked while in flight
- [ ] Amounts converted with `Number()` and checked against deposit, balance, and refundable limits
- [ ] Money shown with `localizedCurrency` and `conference.currency.currencyCode`
- [ ] Promo and discount amounts decided by the API
- [ ] Permission checks match `permissionConstants` for each transaction type (and the API enforces them too)
- [ ] Specs updated where logic changed: `directives/payment/payment.spec.js`, `paymentModal.controller.spec.js`, `reviewRegistration.controller.spec.js`, `paymentApproval.controller.spec.js`, `globalPromotionService.spec.js`, `journalUploadService.spec.js`, and the upload page Jest tests

## Mined from PR history

- A new or renamed `paymentType` is wired into every switch point: the template map and validation in `directives/payment/payment.js`, `filters/paymentTypeFormat.js`, `canEditPayment` / `canBeRefunded` / `canDeletePayment` in `paymentModal.controller.js`, `acceptedPaymentMethods` in `reviewRegistration.controller.js`, and `minimumPaymentAccepted` in `eventDetails.controller.js`. Names match the API enum (`FL_GIFT_CARD`, `giftCard.giftCardId`, `acceptFlGiftCards`); the UI first shipped guessed names that later PRs renamed everywhere.
  <!-- evidence: PR #922, #928, #929, #945, #952, #954 -->
- When a payment flag only shows behind an eligibility check (like `acceptFlGiftCards` behind `giftCardEligible()` in `regTypes.html`), clear it on every registrant type when eligibility turns false. `ng-if` hides the checkbox, but the old `true` still saves.
  <!-- evidence: PR #928, #929 -->
- Decide whether a global promotion is active only with `globalPromotionService.isPromotionActive`, which checks both `activationDate` and `deactivationDate`. Decide eligibility from the registrants in the registration (`hasPromotionsForRegistration`), not from whether the conference has any eligible type. A new promotion setting (like `disallowPromotionStacking`) applies in both `reviewRegistration` and `paymentModal`, for both conference and global promotions.
  <!-- evidence: PR #925, #927, #932, #966, #967 -->
- Keep the `paymentCharged` guard in `confirmRegistration`: a retry after `completeRegistration` fails must not call `payment.pay` again, and the spec that checks `payment.pay` runs once across two tries stays. Flag new steps between pay and complete that can throw, and `$route.reload()` on that error path, since the guard lives only as long as the controller.
  <!-- evidence: PR #998, #999 -->
- Staff account numbers are filled and checked through `staffAccountService.getProfileStaffAccountNumber()` at every STAFF entry point (`payment.js` and `transfer.html`, `scholarshipAdmin.html`, `paymentsModal.html`, `paymentApproval`). Never prefill an admin payment from the admin's own profile. When the source field changes (`employeeId` to `staffAccountNumber`), keep a fallback until production fills the new field, and don't copy one source's format (`.slice(-7)`) onto another.
  <!-- evidence: PR #975, #979, #981, #1008, #1009 -->
- A template that negates an amount (`x * -1`) before `localizedCurrency` must not show `-$0.00`. Guard zero, or normalize `-0` once in `filters/localizedCurrency.js`.
  <!-- evidence: PR #954, #963 -->
