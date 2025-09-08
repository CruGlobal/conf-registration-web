import 'angular-mocks';

describe('Service: registration', () => {
  let $httpBackend, $rootScope, modalMessage, payment, registration, testData;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(inject((
    _$httpBackend_,
    _$rootScope_,
    _modalMessage_,
    _payment_,
    _registration_,
    _testData_,
  ) => {
    $httpBackend = _$httpBackend_;
    $rootScope = _$rootScope_;
    modalMessage = _modalMessage_;
    payment = _payment_;
    registration = _registration_;
    testData = _testData_;
  }));

  describe('processRegistrations', () => {
    let registrationItem;

    beforeEach(() => {
      spyOn(payment, 'validate').and.returnValue(true);
      spyOn(payment, 'pay');
      registrationItem = {
        payment: {},
        registration: testData.registration,
        conference: testData.conference,
      };
    });

    afterEach(() => {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('handles validation errors', () => {
      spyOn(modalMessage, 'error');
      payment.validate.and.returnValue(false);

      registration.processRegistrations([registrationItem]);

      $rootScope.$digest();

      expect(modalMessage.error).toHaveBeenCalledTimes(1);
      expect(modalMessage.error.calls.argsFor(0)[0].title).toBe(
        'Please correct the following errors:',
      );
    });

    it('handles single registrations', () => {
      registration.processRegistrations([registrationItem]);

      $rootScope.$digest();

      expect(payment.pay).toHaveBeenCalledTimes(1);
    });

    it('handles multiple registrations', () => {
      registration.processRegistrations([registrationItem, registrationItem]);

      $rootScope.$digest();

      expect(payment.pay).toHaveBeenCalledTimes(2);
    });

    it('completes incomplete registrations', () => {
      $httpBackend
        .expectPUT(`registrations/${testData.registration.id}`)
        .respond(200, {});

      const currentRegistration = {
        ...testData.registration,
        completed: false,
      };
      registration.processRegistrations([
        {
          payment: {},
          registration: currentRegistration,
          conference: testData.conference,
        },
      ]);

      $rootScope.$digest();
      $httpBackend.flush();
    });

    it('handles errors', () => {
      payment.pay.and.throwError('Payment failed');

      spyOn(modalMessage, 'error');

      registration.processRegistrations([registrationItem]);

      $rootScope.$digest();

      expect(modalMessage.error).toHaveBeenCalledTimes(1);
      expect(modalMessage.error.calls.argsFor(0)[0].message).toBe(
        'Payment failed',
      );
    });
  });
});
