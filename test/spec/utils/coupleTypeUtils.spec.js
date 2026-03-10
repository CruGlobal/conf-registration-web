import * as coupleTypeUtils from '../../../app/scripts/utils/coupleTypeUtils';
import 'angular-mocks';

describe('coupleTypeUtils', () => {
  let testData;
  // Matches couple and spouse in testData
  const spouseTypeId = 'a1b2c3d4-e5f6-7890-abcd-1234567890ef';
  const coupleTypeId = 'b2c3d4e5-f6a7-8901-bcde-234567890abc';

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(
    angular.mock.inject(function (_testData_) {
      testData = _testData_;
    }),
  );

  describe('deleteSpouseType', () => {
    it('should remove spouse type from registrant types', () => {
      coupleTypeUtils.deleteSpouseType(
        spouseTypeId,
        testData.conference.registrantTypes,
      );

      expect(
        testData.conference.registrantTypes.find(
          (type) => type.id === spouseTypeId,
        ),
      ).toBeUndefined();
    });

    it('should remove spouse associations from all registrant types', () => {
      coupleTypeUtils.deleteSpouseType(
        spouseTypeId,
        testData.conference.registrantTypes,
      );

      const coupleType = testData.conference.registrantTypes.find(
        (type) => type.id === coupleTypeId,
      );

      expect(coupleType.allowedRegistrantTypeSet.length).toBe(0);
    });
  });

  describe('findCoupleForSpouse', () => {
    it('should find couple type for given spouse', () => {
      const result = coupleTypeUtils.findCoupleForSpouse(
        'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
        testData.conference.registrantTypes,
      );

      expect(result).toBeTruthy();
      expect(result.id).toBe(coupleTypeId);
    });

    it('should return null if no couple found for spouse', () => {
      const result = coupleTypeUtils.findCoupleForSpouse(
        'nonexistent',
        testData.conference.registrantTypes,
      );

      expect(result).toBeNull();
    });

    it('should return null if couple type has no allowedRegistrantTypeSet', () => {
      const coupleType = testData.conference.registrantTypes.find(
        (type) => type.id === coupleTypeId,
      );
      coupleType.allowedRegistrantTypeSet = null;

      const result = coupleTypeUtils.findCoupleForSpouse(
        spouseTypeId,
        testData.conference.registrantTypes,
      );

      expect(result).toBeNull();
    });
  });

  describe('findSpouseForCouple', () => {
    it('should find spouse type for given couple', () => {
      const result = coupleTypeUtils.findSpouseForCouple(
        coupleTypeId,
        testData.conference.registrantTypes,
      );

      expect(result).toBeTruthy();
      expect(result.id).toBe(spouseTypeId);
    });

    it('should return null if couple not found', () => {
      const result = coupleTypeUtils.findSpouseForCouple(
        'nonexistent',
        testData.conference.registrantTypes,
      );

      expect(result).toBeNull();
    });

    it('should return null if couple has no allowedRegistrantTypeSet', () => {
      const coupleType = testData.conference.registrantTypes.find(
        (type) => type.id === coupleTypeId,
      );
      coupleType.allowedRegistrantTypeSet = null;

      const result = coupleTypeUtils.findSpouseForCouple(
        coupleTypeId,
        testData.conference.registrantTypes,
      );

      expect(result).toBeNull();
    });

    it('should return null if no selected association found', () => {
      const coupleType = testData.conference.registrantTypes.find(
        (type) => type.id === coupleTypeId,
      );
      coupleType.allowedRegistrantTypeSet[0].selected = false;

      const result = coupleTypeUtils.findSpouseForCouple(
        coupleTypeId,
        testData.conference.registrantTypes,
      );

      expect(result).toBeNull();
    });
  });

  describe('syncCoupleNames', () => {
    it('should sync spouse name when couple name changes', () => {
      // Deep copy the full array for old and new
      const oldRegistrantTypes = JSON.parse(
        JSON.stringify(testData.conference.registrantTypes),
      );
      const newRegistrantTypes = JSON.parse(
        JSON.stringify(testData.conference.registrantTypes),
      );

      // Change the couple name in the new array
      const couple = newRegistrantTypes.find(
        (t) => t.defaultTypeKey === 'COUPLE',
      );
      couple.name = 'Married Couple';

      coupleTypeUtils.syncCoupleNames(newRegistrantTypes, oldRegistrantTypes);

      const spouse = newRegistrantTypes.find(
        (t) => t.defaultTypeKey === 'SPOUSE' && t.id === spouseTypeId,
      );

      expect(spouse.name).toBe('Married Couple Spouse');
    });

    describe('shouldShowRegistrantType', () => {
      it('should return true for non-spouse types', () => {
        const individualType = testData.conference.registrantTypes.find(
          (type) => type.id === '67c70823-35bd-9262-416f-150e35a03514',
        );

        const result = coupleTypeUtils.shouldShowRegistrantType(
          individualType,
          testData.conference.registrantTypes,
        );

        expect(result).toBe(true);
      });

      it('should return false for spouse type with associated couple', () => {
        const spouseType = testData.conference.registrantTypes.find(
          (type) => type.id === spouseTypeId,
        );

        const result = coupleTypeUtils.shouldShowRegistrantType(
          spouseType,
          testData.conference.registrantTypes,
        );

        expect(result).toBe(false);
      });

      it('should return true for spouse type without associated couple', () => {
        testData.conference.registrantTypes[0].allowedRegistrantTypeSet = [];
        const spouseType = testData.conference.registrantTypes.find(
          (type) => type.id === 'f3c2e1d4-7b8a-4c6f-9e2b-9876543210fe',
        );

        const result = coupleTypeUtils.shouldShowRegistrantType(
          spouseType,
          testData.conference.registrantTypes,
        );

        expect(result).toBe(true);
      });
    });

    describe('findCoupleRegistrants', () => {
      it('should return group registrants when groupId exists and couple type found', () => {
        const mockRegistrant = {
          id: 'reg1',
          groupId: 'group1',
          registrantTypeId: 'coupleTypeId',
        };
        const mockRegistration = {
          groupRegistrants: [
            { id: 'reg1', groupId: 'group1', registrantTypeId: 'coupleTypeId' },
            { id: 'reg2', groupId: 'group1', registrantTypeId: 'spouseTypeId' },
            {
              id: 'reg3',
              groupId: 'group2',
              registrantTypeId: 'individualTypeId',
            },
          ],
        };
        const mockGetRegistrantType = (id) => {
          if (id === 'coupleTypeId') return { defaultTypeKey: 'COUPLE' };
          if (id === 'spouseTypeId') return { defaultTypeKey: 'SPOUSE' };
          return { defaultTypeKey: 'INDIVIDUAL' };
        };

        const result = coupleTypeUtils.findCoupleRegistrants(
          mockRegistrant,
          mockRegistration,
          mockGetRegistrantType,
        );

        expect(result.length).toBe(2);
        expect(result.every((reg) => reg.groupId === 'group1')).toBe(true);
      });

      it('should return single registrant when no couple type found in group', () => {
        const mockRegistrant = {
          id: 'reg1',
          groupId: 'group1',
          registrantTypeId: 'individualTypeId',
        };
        const mockRegistration = {
          groupRegistrants: [
            {
              id: 'reg1',
              groupId: 'group1',
              registrantTypeId: 'individualTypeId',
            },
            {
              id: 'reg2',
              groupId: 'group1',
              registrantTypeId: 'individualTypeId',
            },
          ],
        };
        const mockGetRegistrantType = () => {
          return { defaultTypeKey: 'INDIVIDUAL' };
        };

        const result = coupleTypeUtils.findCoupleRegistrants(
          mockRegistrant,
          mockRegistration,
          mockGetRegistrantType,
        );

        expect(result.length).toBe(1);
        expect(result[0]).toBe(mockRegistrant);
      });

      it('should return single registrant when no groupId', () => {
        const mockRegistrant = { id: 'reg1' };
        const mockRegistration = {};

        const result = coupleTypeUtils.findCoupleRegistrants(
          mockRegistrant,
          mockRegistration,
          null,
        );

        expect(result.length).toBe(1);
        expect(result[0]).toBe(mockRegistrant);
      });
    });

    describe('isRegistrantCouple', () => {
      it('should return true when registrant has couple group', () => {
        const mockRegistrant = {
          id: 'reg1',
          groupId: 'group1',
          registrantTypeId: 'coupleTypeId',
        };
        const mockRegistration = {
          groupRegistrants: [
            { id: 'reg1', groupId: 'group1', registrantTypeId: 'coupleTypeId' },
            { id: 'reg2', groupId: 'group1', registrantTypeId: 'spouseTypeId' },
          ],
        };
        const mockGetRegistrantType = (id) => {
          if (id === 'coupleTypeId') return { defaultTypeKey: 'COUPLE' };
          if (id === 'spouseTypeId') return { defaultTypeKey: 'SPOUSE' };
          return { defaultTypeKey: 'INDIVIDUAL' };
        };

        const result = coupleTypeUtils.isRegistrantCouple(
          mockRegistrant,
          mockRegistration,
          mockGetRegistrantType,
        );

        expect(result).toBe(true);
      });

      it('should return false when registrant is individual', () => {
        const mockRegistrant = { id: 'reg1' };
        const mockRegistration = {};

        const result = coupleTypeUtils.isRegistrantCouple(
          mockRegistrant,
          mockRegistration,
          null,
        );

        expect(result).toBe(false);
      });
    });

    describe('isCoupleType', () => {
      it('should return true for couple type', () => {
        const coupleType = { defaultTypeKey: 'COUPLE' };

        expect(coupleTypeUtils.isCoupleType(coupleType)).toBe(true);
      });

      it('should return false for non-couple type', () => {
        const spouseType = { defaultTypeKey: 'SPOUSE' };

        expect(coupleTypeUtils.isCoupleType(spouseType)).toBe(false);
      });
    });

    describe('isSpouseType', () => {
      it('should return true for spouse type', () => {
        const spouseType = { defaultTypeKey: 'SPOUSE' };

        expect(coupleTypeUtils.isSpouseType(spouseType)).toBe(true);
      });

      it('should return false for non-spouse type', () => {
        const coupleType = { defaultTypeKey: 'COUPLE' };

        expect(coupleTypeUtils.isSpouseType(coupleType)).toBe(false);
      });
    });

    describe('isCoupleOrSpouseType', () => {
      it('should return true for couple/spouse types that are associated', () => {
        expect(
          coupleTypeUtils.isCoupleOrSpouseType(
            'b2c3d4e5-f6a7-8901-bcde-234567890abc',
            testData.conference.registrantTypes,
          ),
        ).toBe(true);

        expect(
          coupleTypeUtils.isCoupleOrSpouseType(
            'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
            testData.conference.registrantTypes,
          ),
        ).toBe(true);
      });

      it('should return false for unassociated type', () => {
        expect(
          coupleTypeUtils.isCoupleOrSpouseType(
            '67c70823-35bd-9262-416f-150e35a03514',
            testData.conference.registrantTypes,
          ),
        ).toBe(false);
      });

      it('should return false for a Spouse type with no relation to a Couple type', () => {
        expect(
          coupleTypeUtils.isCoupleOrSpouseType(
            'f3c2e1d4-7b8a-4c6f-9e2b-9876543210fe',
            testData.conference.registrantTypes,
          ),
        ).toBe(false);
      });
    });
  });
});
