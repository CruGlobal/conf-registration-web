import 'angular-mocks';

describe('Service: loginDialog', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let loginDialog, $rootScope, $uibModal, deferred;
  beforeEach(inject((_loginDialog_, _$rootScope_, $q, _$uibModal_) => {
    loginDialog = _loginDialog_;
    $rootScope = _$rootScope_;
    $uibModal = _$uibModal_;

    spyOn($uibModal, 'open').and.callFake(() => {
      deferred = $q.defer();
      return {
        result: deferred.promise,
      };
    });
  }));

  describe('show()', () => {
    it('should not open another modal when the first modal is open', () => {
      loginDialog.show({});
      loginDialog.show({});

      expect($uibModal.open).toHaveBeenCalledTimes(1);
    });

    it('should open another modal with the first modal is closed', () => {
      loginDialog.show({});

      expect($uibModal.open).toHaveBeenCalledTimes(1);

      deferred.resolve();
      $rootScope.$digest();

      loginDialog.show({});

      expect($uibModal.open).toHaveBeenCalledTimes(2);
    });

    it('should set loginModalOpen to true while modal is open', () => {
      expect($rootScope.loginModalOpen).toBeUndefined();

      loginDialog.show({});

      expect($rootScope.loginModalOpen).toBe(true);

      deferred.resolve();
      $rootScope.$digest();

      expect($rootScope.loginModalOpen).toBe(false);
    });
  });
});
