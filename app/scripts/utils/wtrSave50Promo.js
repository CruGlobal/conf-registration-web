/**
 * HARDCODED: Family Life WTR half-off couples promotion (SAVE50).
 *
 * Self-contained on purpose since this is a short-lived hardcode for HS-1717378
 *
 * Display only: the registrant still types the code, and the API stays the
 * authority on whether it actually applies.
 *
 * Replace with real feature support for flagging a global promotion for display and
 * targeting it at specific registrant types.
 */
import moment from 'moment';
import {
  familyLifeMinistryId,
  wtrActivityId,
} from 'scripts/constants/ministryIds';

const registrantTypeName = 'Attendee';
const coupleDefaultTypeKey = 'COUPLE';
const startDate = '2026-08-31';
const endDate = '2026-09-21';

function isEligibleRegistrantType(registrantType) {
  return (
    registrantType.defaultTypeKey === coupleDefaultTypeKey &&
    (registrantType.name || '').trim().toLowerCase() ===
      registrantTypeName.toLowerCase()
  );
}

export function showWtrSave50Promo(conference, registration) {
  if (
    conference.ministry !== familyLifeMinistryId ||
    conference.ministryActivity !== wtrActivityId
  ) {
    return false;
  }

  const eligibleTypeIds = conference.registrantTypes
    .filter(isEligibleRegistrantType)
    .map((registrantType) => registrantType.id);

  const hasEligibleRegistrant = registration.registrants.some((registrant) =>
    eligibleTypeIds.includes(registrant.registrantTypeId),
  );

  if (!hasEligibleRegistrant) {
    return false;
  }

  return moment().isBetween(moment(startDate), moment(endDate), 'day', '[]');
}
