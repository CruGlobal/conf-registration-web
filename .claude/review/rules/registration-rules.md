# Registration Rules Focus Areas

These are the core rules of the Event Registration Tool: whether an event is open, who can register and as what type, how many people can register, which questions each person sees, and when a registration is done. The team's own PR-review prompt names couple and spouse integrity, registration type limits, and event state as key checks. Most rules here are client checks that mirror the API. The client should never be looser than the API, or a registrant hits an error late, sometimes after paying.

**Open, closed, full**

- `registration.controller.js`: `closed = !registrationOpen || manuallyClosed`; `full = useTotalCapacity && availableCapacity <= 0 && !hasPrimaryExemptType()`; `almostFull` when `getFullPercentage` (`utils/conferenceLimits.ts`) is at least 80 and under 100. Someone who already has registrants, or who arrives with a `regType` that is `exemptFromConferenceCapacity`, still gets in.
- Look for: lost exempt cases, math on `totalCapacity` when `useTotalCapacity` is false, and code that treats `availableCapacity` as live (it is a snapshot from `ConfCache`).

**Limits when adding registrants**

- `registrationTypeFull(type)` in `directives/registrationTypeSelect/registrationTypeSelect.js`: a couple type adds 2 people (`isCoupleType`) and other types add 1; the type limit (`useLimit` with `availableSlots`) is checked first; `exemptFromConferenceCapacity` types skip the event limit; exempt registrants already in the registration don't count against `availableCapacity`.
- `registrationFull()` in `reviewRegistration.controller.js` checks the event limit again at confirm time. `registerDisabled()` also blocks preview mode, invalid registrants, a submit in progress, and a missing spouse.
- Look for: one of these changed without the other, a couple counted as 1, `>` and `>=` swaps, and specs (`registrationTypeSelect.spec.js`, `reviewRegistration.controller.spec.js`) not updated.

**Which types a user can pick**

- `visibleRegistrantTypes` in `registrationTypeSelect.js`: a `?regType=` link limits the list to that one type before anyone is registered; `hidden` types are removed unless already in the registration; `groupSubRegistrantType` types are removed until a primary exists; in a group registration only the group type's `allowedRegistrantTypeSet` children show, each capped by `numberOfChildRegistrants` (0 means no cap).
- `regType` survives sign in through the `regType` cookie (`app_enforceAuth.js`, then the `/auth/:token` route). Look for: changes that drop it.

**Couples and spouses**

- Use `utils/coupleTypeUtils.js` (`isCoupleType`, `isSpouseType`, `findCoupleForSpouse`, `findSpouseForCouple`, `isCoupleOrSpouseType`, `isRegistrantCouple`, `findCoupleRegistrants`, `syncCoupleNames`, `shouldShowRegistrantType`, `deleteSpouseType`) instead of comparing `defaultTypeKey` to `'COUPLE'` or `'SPOUSE'` by hand. The team's review prompt flags hard-coded type keys.
- The couple to spouse link is an entry in the couple type's `allowedRegistrantTypeSet` whose `childRegistrantTypeId` is the spouse type. Saved data holds only linked entries. The admin details screen expands the list to every type and marks links with `selected` (`refreshAllowedRegistrantTypes`), then trims back to the selected ones on save. So registrant-side and payment code call `findCoupleForSpouse(id, types, false)` (as `reviewRegistration.controller.js` and `paymentModal.controller.js` do), while `findSpouseForCouple` and the default `checkSelected = true` only fit the expanded admin data. Look for: the wrong mode for the data at hand, and code that finds a spouse another way (by name, or by list order like `allowedRegistrantTypeSet[0]` in `registrationModal.controller.js`).
- Rules in place: a registration whose primary is a couple type can't be confirmed without a spouse (`requireSpouseRegistration`); after completion, couple and spouse registrants can't be removed (`registrantDeletable`), and group add is blocked once the pair exists (`allowGroupRegistration`); renaming a couple type renames its spouse type to `"<couple name> Spouse"`; deleting a spouse type also removes it from every `allowedRegistrantTypeSet`.
- Look for: any change that can leave a couple without a spouse, a spouse type with no couple, or a pair split by a delete or edit, including admin paths (`eventRegistrations.controller.js` with `findCoupleRegistrants`, `registrationModal.controller.js`).

**Questions, rules, and hidden questions**

- A block shows for a registrant when `validateRegistrant.blockVisible(block, registrant, isAdmin, conference)` is true: its `SHOW_QUESTION` rules pass (`content.ruleoperand`, AND by default), each rule's parent block is visible too (checked again and again up the chain), the registrant's type is not in `block.registrantTypes` (that list holds the types that should NOT see it), at least one choice is visible for choice questions, and `adminOnly` blocks show only to admins.
- Rule types come from `ruleTypeConstants` (`SHOW_QUESTION`, `FORCE_SELECTION`, `SHOW_OPTION`). `showQuestionFilter` treats a missing or empty `ruleType` as `SHOW_QUESTION` for old data. Operators are `=`, `!=`, `>`, and `<`; number-like strings compare as floats; checkbox answers are objects keyed by choice. Rules can only point at earlier questions (`ruleBlocks` in `directives/rule/rule.js`), and choice rules default to `OR`.
- `validateRegistrant.validate(conference, registrant, page?)` skips admin-only, hidden, and optional blocks (address blocks still get a format check). Look for: a new block type with no `case` in `validate` (it falls to `_.isEmpty`), a visibility rule applied in the UI but not in `validate` (or the reverse), and hidden answers that still count.
- Pages with no visible block are skipped (`validPages`, `getValidFirstPage`, and `newRegistrant` in `registrationTypeSelect.js`). Look for: code that assumes `validPages[0]` exists.

**Register, review, complete**

- Routes: `/register/:conferenceId/page/:pageId?` and `/preview/...` use `RegistrationCtrl`; `/reviewRegistration/:conferenceId` uses `ReviewRegistrationCtrl`. A completed registration opened with no page id goes to review. A missing current registration is created by `currentRegistrationInterceptor` (a 404 on `.../registrations/current` turns into a POST).
- Preview mode (`$rootScope.registerMode === 'preview'`) keeps data in `$rootScope.previewRegCache` and must never write to the API.
- Completion: `confirmRegistration` validates the payment, pays once, then `registration.completeRegistration` PUTs `completed: true`, then goes to `registrationCompleteRedirect` or reloads. `allowEditRegistrationAfterComplete` controls edits after that, and pay on site is not offered once complete.
- Look for: steps reordered, `completed` set on the shared object before the PUT succeeds, or edits and deletes allowed after completion when the event forbids them.

**Checklist**

- [ ] Capacity math counts couples as 2, checks type limits first, and skips exempt types
- [ ] `registrationTypeFull` and `registrationFull` agree
- [ ] Couple and spouse helpers used in the right mode; no way to leave an orphan couple or spouse
- [ ] Visibility logic and `validate` agree; `block.registrantTypes` read as an exclude list
- [ ] Preview mode never writes
- [ ] Specs updated: `registrationTypeSelect*.spec.js`, `coupleTypeUtils.spec.js`, `conferenceLimits.spec.js`, `validateRegistrant.spec.js`, `blockRegistration.spec.js`, `rule.spec.js`, `registration.controller.spec.js`, `reviewRegistration.controller.spec.js`

## Mined from PR history

- "Full" means `availableCapacity <= 0`, never `=== 0`, because admins can push capacity negative. Check the type's own `useLimit` first, then skip the event limit for `exemptFromConferenceCapacity` types (a couple marked exempt makes its spouse exempt too), and count couple types as 2 with `isCoupleType`. An exempt dependent was once blocked at 1 spot left because the checks ran in the wrong order.
  <!-- evidence: PR #936, #937, #939, #953, #955, #956, #959 -->
- Hidden questions: don't create answers for blocks hidden by registrant type (`shouldShowForRegistrantType` is false), since null or default answers fail the API's checks. A hidden block that is `required` still needs a non-null default. This area took three fixes in a row.
  <!-- evidence: PR #889, #906, #980 -->
- Visibility goes through `validateRegistrant.blockVisible(block, registrant, isAdmin, conference)` for the registrant being shown, and `conference` is always passed (without it the hidden-parent check is silently skipped). Flag direct reads of `block.registrantTypes` and use of `currentRegistration.registrants[0]` for the current registrant. Call `checkValidPages()` again before moving on, since an answer can reveal a later page.
  <!-- evidence: PR #776, #780, #789, #859, #867, #889, #896 -->
- A standalone Spouse type is not a couple's spouse. Couple-only behavior ("Delete Both", "Withdraw Both", "cost included in couple price", hiding the type in `regTypes.html`) checks the link with `findCoupleForSpouse` or `isRegistrantCouple`, not `defaultTypeKey === 'SPOUSE'`.
  <!-- evidence: PR #880, #886, #894 -->
- A change to a question block in `directives/blocks/blocks.js` that reads registration or user state must work in all four places a block renders: the registrant's own form, the admin edit modal (`adminEditRegistrant`), a non-primary registrant in a group, and the form builder or preview (no `currentRegistration`). The staff profile lock needed three follow-up fixes, one per missed place.
  <!-- evidence: PR #854, #855, #856, #857 -->
- Answer rules enforced only in UI change handlers (campus lookup, email or address format) also go in `validateRegistrant.validate`, because autofill and saved answers skip those handlers. Keep their limits and patterns in one constant in `services/constants.js` (like `addressConstants`) that both the template and the service read.
  <!-- evidence: PR #842, #844, #847, #1002 -->
- A question type allowed only once per form (`campusV2Question` with profile type `CAMPUS_V2`) is blocked when it is added (`insertBlock` in `eventForm.controller.js`) and its Copy button is disabled. Don't warn after the save, by which point a second block has saved with `profileType: null`.
  <!-- evidence: PR #995, #1001 -->
