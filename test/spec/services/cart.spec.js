import angular from 'angular';
import 'angular-mocks';

describe('Service: Cart', () => {
  let cart,
    $q,
    $rootScope,
    $window,
    ConfCache,
    RegistrationCache,
    mockConference,
    mockConference2,
    mockRegistration,
    mockRegistration2;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(inject(function (
    _cart_,
    _$q_,
    _$rootScope_,
    _$window_,
    _ConfCache_,
    _RegistrationCache_,
    testData,
  ) {
    cart = _cart_;
    $window = _$window_;
    $rootScope = _$rootScope_;
    $q = _$q_;
    RegistrationCache = _RegistrationCache_;
    ConfCache = _ConfCache_;

    mockConference = angular.copy(testData.conference);
    mockRegistration = {
      ...angular.copy(testData.registration),
      completed: false,
      remainingBalance: 100,
    };
    mockConference2 = {
      ...angular.copy(testData.conference),
      id: 'conf2',
    };
    mockRegistration2 = {
      ...angular.copy(testData.registration),
      id: 'reg2',
      conferenceId: mockConference2.id,
      completed: false,
      remainingBalance: 150,
    };

    $window.localStorage.getItem(
      'cartRegistrationIds',
      `${mockRegistration.id},${mockRegistration2.id}`,
    );

    spyOn(ConfCache, 'get').and.callFake((id) =>
      $q.resolve(_.find([mockConference, mockConference2], { id })),
    );
    spyOn(RegistrationCache, 'get').and.callFake((id) =>
      $q.resolve(_.find([mockRegistration, mockRegistration2], { id })),
    );
    spyOn($rootScope, '$broadcast').and.callThrough();
  }));

  it('should return an empty array if nothing is in localStorage', () => {
    expect(cart.registrations).toEqual([]);
  });

  function getRegistrationIds() {
    return cart.registrations.map((item) => item.registration.id);
  }

  describe('addRegistration', () => {
    it('should add a registration', () => {
      cart.addRegistration(mockRegistration, mockConference);

      expect(getRegistrationIds()).toEqual([mockRegistration.id]);
    });

    it('should not add duplicate registrations', () => {
      cart.addRegistration(mockRegistration, mockConference);
      cart.addRegistration(mockRegistration, mockConference);

      expect(getRegistrationIds()).toEqual([mockRegistration.id]);

      cart.addRegistration(mockRegistration2, mockConference2);

      expect(getRegistrationIds()).toEqual([
        mockRegistration.id,
        mockRegistration2.id,
      ]);
    });
  });

  describe('hasRegistration', () => {
    it('should check if a registration exists', () => {
      cart.addRegistration(mockRegistration, mockConference);

      expect(cart.hasRegistration(mockRegistration.id)).toBe(true);
      expect(cart.hasRegistration('123')).toBe(false);
    });
  });

  describe('removeRegistration', () => {
    beforeEach(() => {
      cart.addRegistration(mockRegistration, mockConference);
      cart.addRegistration(mockRegistration2, mockConference2);
    });

    it('should remove the registration and broadcast cartUpdated', () => {
      cart.removeRegistration(mockRegistration.id);

      expect(getRegistrationIds()).toEqual([mockRegistration2.id]);
      expect($rootScope.$broadcast).toHaveBeenCalledWith('cartUpdated');
    });

    it('should handle removing non-existent id gracefully', () => {
      cart.removeRegistration('999');

      expect(getRegistrationIds()).toEqual([
        mockRegistration.id,
        mockRegistration2.id,
      ]);

      expect($window.localStorage.getItem('cartRegistrationIds')).toBe(
        `${mockRegistration.id},${mockRegistration2.id}`,
      );
    });
  });

  describe('loadRegistrations', () => {
    beforeEach(() => {
      $window.localStorage.setItem(
        'cartRegistrationIds',
        `${mockRegistration.id},${mockRegistration2.id}`,
      );
    });

    it('should load registrations from localStorage and broadcast cartUpdated', () => {
      cart.loadRegistrations();
      $rootScope.$digest();

      expect(getRegistrationIds()).toEqual([
        mockRegistration.id,
        mockRegistration2.id,
      ]);

      expect($rootScope.$broadcast).toHaveBeenCalledWith('cartUpdated');
    });

    it('should filter out completed registrations', () => {
      mockRegistration.completed = true;

      cart.loadRegistrations();
      $rootScope.$digest();

      expect(getRegistrationIds()).toEqual([mockRegistration2.id]);
    });

    it('should filter out registrations with zero balance', () => {
      mockRegistration.remainingBalance = 0;

      cart.loadRegistrations();
      $rootScope.$digest();

      expect(getRegistrationIds()).toEqual([mockRegistration2.id]);
    });

    it('should filter out registrations with no valid accepted payment methods', () => {
      mockConference.registrantTypes.forEach((registrantType) => {
        Object.assign(registrantType, {
          acceptChecks: true,
          acceptCreditCards: false,
          acceptTransfers: false,
          acceptPayOnSite: true,
          acceptScholarships: false,
        });
      });

      cart.loadRegistrations();
      $rootScope.$digest();

      expect(getRegistrationIds()).toEqual([mockRegistration2.id]);
    });

    it('should ignore registrations that fail to load', () => {
      RegistrationCache.get.and.callFake((id) => {
        return id === mockRegistration.id
          ? $q.reject('error')
          : $q.resolve(mockRegistration2);
      });

      cart.loadRegistrations();
      $rootScope.$digest();

      expect(getRegistrationIds()).toEqual([mockRegistration2.id]);
    });

    it('should ignore conferences that fail to load', () => {
      ConfCache.get.and.callFake((id) => {
        return id === mockConference.id
          ? $q.reject('error')
          : $q.resolve(mockConference2);
      });

      cart.loadRegistrations();
      $rootScope.$digest();

      expect(getRegistrationIds()).toEqual([mockRegistration2.id]);
    });
  });
});
