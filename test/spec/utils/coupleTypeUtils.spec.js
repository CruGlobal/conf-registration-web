import * as coupleTypeUtils from '../../../app/scripts/utils/coupleTypeUtils';
import _ from 'lodash';
import 'angular-mocks';

// Make lodash globally available for the coupleTypeUtils module
global._ = _;

describe('coupleTypeUtils', () => {
  let testData;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(
    angular.mock.inject(function (_testData_) {
      testData = _testData_;
    }),
  );

  describe('deleteSpouseType', () => {
    it('should remove spouse type from registrant types', () => {
      coupleTypeUtils.deleteSpouseType(
        'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
        testData.conference.registrantTypes,
      );

      expect(
        testData.conference.registrantTypes.find(
          (type) => type.id === 'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
        ),
      ).toBeUndefined();
    });

    it('should remove spouse associations from all registrant types', () => {
      coupleTypeUtils.deleteSpouseType(
        'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
        testData.conference.registrantTypes,
      );

      const coupleType = testData.conference.registrantTypes.find(
        (type) => type.id === 'b2c3d4e5-f6a7-8901-bcde-234567890abc',
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
      expect(result.id).toBe('b2c3d4e5-f6a7-8901-bcde-234567890abc');
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
        (type) => type.id === 'b2c3d4e5-f6a7-8901-bcde-234567890abc',
      );
      coupleType.allowedRegistrantTypeSet = null;

      const result = coupleTypeUtils.findCoupleForSpouse(
        'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
        testData.conference.registrantTypes,
      );
      expect(result).toBeNull();
    });
  });

  describe('findSpouseForCouple', () => {
    it('should find spouse type for given couple', () => {
      const result = coupleTypeUtils.findSpouseForCouple(
        'b2c3d4e5-f6a7-8901-bcde-234567890abc', // Couple ID from testData
        testData.conference.registrantTypes,
      );
      expect(result).toBeTruthy();
      expect(result.id).toBe('a1b2c3d4-e5f6-7890-abcd-1234567890ef'); // Spouse ID from testData
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
        (type) => type.id === 'b2c3d4e5-f6a7-8901-bcde-234567890abc',
      );
      coupleType.allowedRegistrantTypeSet = null;

      const result = coupleTypeUtils.findSpouseForCouple(
        'b2c3d4e5-f6a7-8901-bcde-234567890abc',
        testData.conference.registrantTypes,
      );
      expect(result).toBeNull();
    });

    it('should return null if no selected association found', () => {
      const coupleType = testData.conference.registrantTypes.find(
        (type) => type.id === 'b2c3d4e5-f6a7-8901-bcde-234567890abc',
      );
      coupleType.allowedRegistrantTypeSet[0].selected = false;

      const result = coupleTypeUtils.findSpouseForCouple(
        'b2c3d4e5-f6a7-8901-bcde-234567890abc',
        testData.conference.registrantTypes,
      );
      expect(result).toBeNull();
    });
  });

  describe('syncCoupleDescriptions', () => {
    it('should sync spouse description when couple description changes', () => {
      // Deep copy the full array for old and new
      const oldRegistrantTypes = JSON.parse(
        JSON.stringify(testData.conference.registrantTypes),
      );
      const newRegistrantTypes = JSON.parse(
        JSON.stringify(testData.conference.registrantTypes),
      );

      // Change the couple description in the new array
      const couple = newRegistrantTypes.find(
        (t) => t.defaultTypeKey === 'COUPLE',
      );
      couple.description = 'New Description';

      coupleTypeUtils.syncCoupleDescriptions(
        newRegistrantTypes,
        oldRegistrantTypes,
      );

      const spouse = newRegistrantTypes.find(
        (t) =>
          t.defaultTypeKey === 'SPOUSE' &&
          t.id === 'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
      );
      expect(spouse.description).toBe('New Description');
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
          (type) => type.id === 'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
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
      it('should return group registrants when groupId exists', () => {
        const mockRegistrant = { id: 'reg1', groupId: 'group1' };
        const mockRegistration = {
          groupRegistrants: [
            { id: 'reg1', groupId: 'group1' },
            { id: 'reg2', groupId: 'group1' },
            { id: 'reg3', groupId: 'group2' },
          ],
        };

        const result = coupleTypeUtils.findCoupleRegistrants(
          mockRegistrant,
          mockRegistration,
        );

        expect(result.length).toBe(2);
        expect(result.every((reg) => reg.groupId === 'group1')).toBe(true);
      });

      it('should return single registrant when no groupId', () => {
        const mockRegistrant = { id: 'reg1' };
        const mockRegistration = {};

        const result = coupleTypeUtils.findCoupleRegistrants(
          mockRegistrant,
          mockRegistration,
        );

        expect(result.length).toBe(1);
        expect(result[0]).toBe(mockRegistrant);
      });
    });

    describe('isRegistrantCouple', () => {
      it('should return true when registrant has couple group', () => {
        const mockRegistrant = { id: 'reg1', groupId: 'group1' };
        const mockRegistration = {
          groupRegistrants: [
            { id: 'reg1', groupId: 'group1' },
            { id: 'reg2', groupId: 'group1' },
          ],
        };

        const result = coupleTypeUtils.isRegistrantCouple(
          mockRegistrant,
          mockRegistration,
        );

        expect(result).toBe(true);
      });

      it('should return false when registrant is individual', () => {
        const mockRegistrant = { id: 'reg1' };
        const mockRegistration = {};

        const result = coupleTypeUtils.isRegistrantCouple(
          mockRegistrant,
          mockRegistration,
        );

        expect(result).toBe(false);
      });
    });
  });
});
