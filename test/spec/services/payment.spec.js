import 'angular-mocks';

describe('Service: payment', () => {
  let payment, testData;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(inject((_payment_, _testData_) => {
    payment = _payment_;
    testData = _testData_;
  }));

  describe('getAcceptedPaymentMethods', () => {
    it('calculates accepted payment methods for the registration', () => {
      expect(
        payment.getAcceptedPaymentMethods(
          testData.registration,
          testData.conference,
        ),
      ).toEqual({
        acceptCreditCards: true,
        acceptChecks: true,
        acceptTransfers: true,
        acceptScholarships: false,
        acceptPayOnSite: false,
      });
    });
  });
});
