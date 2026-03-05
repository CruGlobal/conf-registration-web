import 'angular-mocks';
import { PromotionValidationService } from '../../../app/scripts/services/promotionValidationService';

describe('Service: promotionValidationService', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let testData, service, mockHttp;

  beforeEach(inject((_testData_) => {
    testData = _testData_;
    mockHttp = { post: jasmine.createSpy('post') };
    service = new PromotionValidationService(mockHttp);
  }));

  describe('verifyPromotionUsage', () => {
    it('should skip verification when no promotions exist', async () => {
      const registration = {
        ...testData.registration,
        promotions: [],
        globalPromotions: [],
      };

      await service.verifyPromotionUsage(registration);

      expect(mockHttp.post).not.toHaveBeenCalled();
    });

    it('should skip verification when promotions are undefined', async () => {
      const registration = {
        ...testData.registration,
        promotions: undefined,
        globalPromotions: undefined,
      };

      await service.verifyPromotionUsage(registration);

      expect(mockHttp.post).not.toHaveBeenCalled();
    });

    it('should post promotion codes for verification', async () => {
      mockHttp.post.and.resolveTo({});

      const expectedPromoCodes = testData.registration.promotions.map(
        (promotion) => promotion.code,
      );
      const expectedGlobalCodes = testData.registration.globalPromotions.map(
        (promotion) => promotion.code,
      );

      await service.verifyPromotionUsage(testData.registration);

      expect(mockHttp.post).toHaveBeenCalledWith(
        `registrations/${testData.registration.id}/promotions/verify`,
        {
          promotions: expectedPromoCodes,
          globalPromotions: expectedGlobalCodes,
        },
      );
    });

    it('should post with only regular promotion codes when no global promotions are present', async () => {
      mockHttp.post.and.resolveTo({});

      const registration = {
        ...testData.registration,
        globalPromotions: [],
      };

      const expectedPromoCodes = testData.registration.promotions.map(
        (promotion) => promotion.code,
      );

      await service.verifyPromotionUsage(registration);

      expect(mockHttp.post).toHaveBeenCalledWith(
        `registrations/${testData.registration.id}/promotions/verify`,
        {
          promotions: expectedPromoCodes,
          globalPromotions: [],
        },
      );
    });

    it('should post with only global promotion codes when no regular promotions are present', async () => {
      mockHttp.post.and.resolveTo({});

      const registration = {
        ...testData.registration,
        promotions: [],
      };

      const expectedGlobalCodes = testData.registration.globalPromotions.map(
        (promotion) => promotion.code,
      );

      await service.verifyPromotionUsage(registration);

      expect(mockHttp.post).toHaveBeenCalledWith(
        `registrations/${testData.registration.id}/promotions/verify`,
        {
          promotions: [],
          globalPromotions: expectedGlobalCodes,
        },
      );
    });

    it('should throw with 409 message when promotion limit exceeded', async () => {
      mockHttp.post.and.rejectWith({
        status: 409,
        data: {
          promotions: [testData.registration.promotions[0].code],
          globalPromotions: [testData.registration.globalPromotions[0].code],
        },
      });

      try {
        await service.verifyPromotionUsage(testData.registration);
        fail('Expected promise to reject');
      } catch (error) {
        expect(error.status).toBe(409);
        expect(error.message).toContain(
          testData.registration.promotions[0].code,
        );

        expect(error.message).toContain(
          testData.registration.globalPromotions[0].code,
        );

        expect(error.message).toContain('reached their usage limit');

        expect(error.message).toContain(
          'Please remove the invalid promotion(s) and try again.',
        );
      }
    });

    it('should use fallback text when 409 has no failed codes', async () => {
      mockHttp.post.and.rejectWith({
        status: 409,
        data: {},
      });

      try {
        await service.verifyPromotionUsage(testData.registration);
        fail('Expected promise to reject');
      } catch (error) {
        expect(error.status).toBe(409);
        expect(error.message).toContain('one or more promotions');
      }
    });

    it('should throw with generic message when non-409 error has no message', async () => {
      mockHttp.post.and.rejectWith({
        status: 500,
        data: {},
      });

      try {
        await service.verifyPromotionUsage(testData.registration);
        fail('Expected promise to reject');
      } catch (error) {
        expect(error.status).toBe(500);
        expect(error.message).toBe(
          'Unable to verify promotion availability. Please try again.',
        );
      }
    });
  });
});
