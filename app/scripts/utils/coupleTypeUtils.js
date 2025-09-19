/* --- eventDetails.js helpers --- */

export function deleteSpouseType(spouseId, registrantTypes) {
  _.remove(registrantTypes, {
    id: spouseId,
  });

  registrantTypes.forEach((type) => {
    _.remove(type.allowedRegistrantTypeSet, {
      childRegistrantTypeId: spouseId,
    });
  });
}

/**
 * Finds the couple type that is associated with the given spouse type.
 * Returns the couple registrant type object, or null if not found.
 */
export function findCoupleForSpouse(
  spouseId,
  registrantTypes,
  checkSelected = true,
) {
  const couple = registrantTypes.find((regType) => {
    if (
      regType.defaultTypeKey !== 'COUPLE' ||
      !angular.isArray(regType.allowedRegistrantTypeSet)
    ) {
      return false;
    }
    if (!checkSelected) {
      return regType.allowedRegistrantTypeSet.some(
        (association) => association.childRegistrantTypeId === spouseId,
      );
    }
    return regType.allowedRegistrantTypeSet.some(
      (association) =>
        association.childRegistrantTypeId === spouseId &&
        association.selected === true,
    );
  });
  return couple || null;
}

/**
 * Finds the spouse type that is associated with the given couple type.
 * Returns the spouse registrant type object, or null if not found.
 */
export function findSpouseForCouple(coupleId, registrantTypes) {
  const coupleType = registrantTypes.find(
    (type) => type.id === coupleId && type.defaultTypeKey === 'COUPLE',
  );

  if (!coupleType || !angular.isArray(coupleType.allowedRegistrantTypeSet)) {
    return null;
  }

  const association = coupleType.allowedRegistrantTypeSet.find(
    (assoc) => assoc.selected === true,
  );

  if (!association) {
    return null;
  }

  const spouse = registrantTypes.find(
    (type) => type.id === association.childRegistrantTypeId,
  );

  return spouse || null;
}

/**
 * These two functions check the property defaultTypeKey on a registrant type
 */
export function isCoupleType(type) {
  return type.defaultTypeKey === 'COUPLE';
}
export function isSpouseType(type) {
  return type.defaultTypeKey === 'SPOUSE';
}

/**
 * Returns true if the given typeId corresponds to either a couple or spouse type.
 * Unlike isCoupleType or isSpouseType, this function checks Primary-Dependent association.
 */
export function isCoupleOrSpouseType(typeId, registrantTypes) {
  if (findSpouseForCouple(typeId, registrantTypes)) {
    return true;
  }
  if (findCoupleForSpouse(typeId, registrantTypes)) {
    return true;
  }
  return false;
}

/**
 * Syncs spouse descriptions to match their associated couple's description.
 * Modifies the registrantTypes array in place.
 */
export function syncCoupleDescriptions(registrantTypes, oldRegistrantTypes) {
  const oldCoupleDescMap = {};
  oldRegistrantTypes.forEach((type) => {
    if (type.defaultTypeKey === 'COUPLE') {
      oldCoupleDescMap[type.id] = type.description;
    }
  });

  registrantTypes.forEach((type) => {
    if (type.defaultTypeKey !== 'COUPLE') {
      return;
    }
    if (type.description !== oldCoupleDescMap[type.id]) {
      const spouseType = findSpouseForCouple(type.id, registrantTypes);
      if (spouseType) {
        spouseType.description = type.description;
      }
    }
  });
}

/**
 * Specifically for hiding spouse types in the UI when they are not associated with any couple type.
 */
export function shouldShowRegistrantType(type, registrantTypes) {
  if (type.defaultTypeKey !== 'SPOUSE') {
    return true;
  }

  const associatedCoupleFound = findCoupleForSpouse(type.id, registrantTypes);

  // If no associated couple type is found, hide this spouse type
  if (associatedCoupleFound) {
    return false;
  }
  // Show spouse type if no associated couple type is found
  return true;
}

/* --- eventRegistrations.js helpers --- */

/**
 * Helper function to find Couple-Spouse pair to delete using registration.groups
 * At this point, we know that registrant is either a couple or spouse type
 */
export function findCoupleRegistrants(
  registrant,
  registration,
  getRegistrantType,
) {
  if (!registration || !registration.groupRegistrants) {
    return [registrant];
  }

  const group = registration.groupRegistrants.filter(
    (groupRegistrant) => groupRegistrant.groupId === registrant.groupId,
  );

  if (!group || group.length === 0) {
    return [registrant];
  }

  // Check if any registrant in the group is a couple or spouse type
  const foundCoupleOrSpouse = group.find((groupRegistrant) => {
    const registrantType = getRegistrantType(groupRegistrant.registrantTypeId);
    // We only really care if a couple type exists, since other types can have a spouse
    // but no group should be able to have a couple
    return registrantType && registrantType.defaultTypeKey === 'COUPLE';
  });

  if (!foundCoupleOrSpouse) {
    return [registrant];
  }
  return group;
}

/**
 * Returns true if the given registrant is part of a couple (either couple or spouse type)
 */
export function isRegistrantCouple(
  registrant,
  registration,
  getRegistrantType,
) {
  const coupleRegistrants = findCoupleRegistrants(
    registrant,
    registration,
    getRegistrantType,
  );

  // Final check
  return coupleRegistrants.length === 2;
}
