import 'angular-mocks';

describe('Service: payment', () => {
  let payment;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(inject((_payment_) => {
    payment = _payment_;
  }));

  describe('getAcceptedPaymentMethods', () => {
    const registrantTypes = [
      {
        acceptCreditCards: true,
        acceptChecks: true,
        acceptTransfers: false,
        acceptScholarships: false,
        acceptPayOnSite: false,
      },
      {
        acceptCreditCards: false,
        acceptChecks: false,
        acceptTransfers: true,
        acceptScholarships: false,
        acceptPayOnSite: false,
      },
    ];

    it('calculates accepted payment methods for the registrant types', () => {
      expect(payment.getAcceptedPaymentMethods(registrantTypes)).toEqual({
        acceptCreditCards: true,
        acceptChecks: true,
        acceptTransfers: true,
        acceptScholarships: false,
        acceptPayOnSite: false,
      });
    });
  });
});
