export function deleteSpouseType(spouseId, registrantTypes) {
  _.remove(registrantTypes, {
    id: spouseId,
  });

  _.forEach(registrantTypes, (type) => {
    _.remove(type.allowedRegistrantTypeSet, {
      childRegistrantTypeId: spouseId,
    });
  });
}

/**
 * Finds the couple type that is associated with the given spouse type.
 * Returns the couple registrant type object, or null if not found.
 */
export function findCoupleForSpouse(spouseId, registrantTypes) {
  const couple = _.find(registrantTypes, (regType) => {
    if (
      regType.defaultTypeKey !== 'COUPLE' ||
      !regType.allowedRegistrantTypeSet
    ) {
      return false;
    }

    const isCouple = _.some(regType.allowedRegistrantTypeSet, (association) => {
      return (
        association.childRegistrantTypeId === spouseId &&
        association.selected === true
      );
    });
    return isCouple;
  });
  return couple || null;
}

/**
 * Finds the spouse type that is associated with the given couple type.
 * Returns the spouse registrant type object, or null if not found.
 */
export function findSpouseForCouple(coupleId, registrantTypes) {
  const coupleType = _.find(registrantTypes, {
    id: coupleId,
    defaultTypeKey: 'COUPLE',
  });

  if (!coupleType || !coupleType.allowedRegistrantTypeSet) {
    return null;
  }

  const association = _.find(coupleType.allowedRegistrantTypeSet, {
    selected: true,
  });

  if (!association) {
    return null;
  }

  const spouse = _.find(registrantTypes, {
    id: association.childRegistrantTypeId,
  });

  return spouse || null;
}

/**
 * Syncs spouse descriptions to match their associated couple's description.
 * Modifies the registrantTypes array in place.
 */
export function syncCoupleDescriptions(registrantTypes, oldRegistrantTypes) {
  const oldCoupleDescMap = {};
  _.forEach(oldRegistrantTypes, (type) => {
    if (type.defaultTypeKey === 'COUPLE') {
      oldCoupleDescMap[type.id] = type.description;
    }
  });

  _.forEach(registrantTypes, (type) => {
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

/*
 * Specifically for hiding spouse types in the UI when they are not associated with any couple type.
 */
export function shouldShowRegistrantType(type, registrantTypes) {
  if (type.defaultTypeKey !== 'SPOUSE') {
    return true;
  }

  const isThisSpouseAssociatedWithCouple = !!findCoupleForSpouse(
    type.id,
    registrantTypes,
  );
  return !isThisSpouseAssociatedWithCouple;
}
