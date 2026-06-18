import 'angular-mocks';

describe('Controller: registrationModal', function () {
  let scope,
    modalInstance,
    modalMessage,
    testData,
    $httpBackend,
    RegistrationCache;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(
    angular.mock.inject(function (
      $rootScope,
      $controller,
      _testData_,
      _modalMessage_,
      _$httpBackend_,
      _RegistrationCache_,
    ) {
      scope = $rootScope.$new();
      modalInstance = {
        close: jasmine.createSpy('modalInstance.close'),
        dismiss: jasmine.createSpy('modalInstance.dismiss'),
        result: {
          then: jasmine.createSpy('modalInstance.result.then'),
        },
      };
      testData = _testData_;
      modalMessage = _modalMessage_;
      $httpBackend = _$httpBackend_;
      RegistrationCache = _RegistrationCache_;

      $controller('registrationModal', {
        $scope: scope,
        $uibModalInstance: modalInstance,
        modalMessage: modalMessage,
        conference: testData.conference,
        primaryRegistration: null,
        typeId: null,
        openedFromGroupModal: null,
      });
    }),
  );

  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('register', () => {
    it('closes modal with close() on successful new registration', function () {
      $httpBackend
        .expectPOST(`conferences/${testData.conference.id}/registrations`)
        .respond(201, {});

      spyOn(RegistrationCache, 'emptyCache');

      scope.register();
      $httpBackend.flush();

      expect(RegistrationCache.emptyCache).toHaveBeenCalledWith();
      expect(modalInstance.close).toHaveBeenCalledWith();
    });

    it('does not close modal on registration error', function () {
      $httpBackend
        .expectPOST(`conferences/${testData.conference.id}/registrations`)
        .respond(500, { error: { message: 'Server error' } });

      spyOn(modalMessage, 'error');

      scope.register();
      $httpBackend.flush();

      expect(modalInstance.close).not.toHaveBeenCalled();
      expect(modalMessage.error).toHaveBeenCalledWith('Server error');
    });
  });
});
