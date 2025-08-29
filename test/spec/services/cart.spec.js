import 'angular-mocks';

describe('Service: Cart', () => {
  let cart, $window;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(inject(function (_cart_, _$window_) {
    cart = _cart_;
    $window = _$window_;
    $window.localStorage.clear();
  }));

  it('should return an empty array if nothing is in localStorage', () => {
    expect(cart.getRegistrationIds()).toEqual([]);
  });

  it('should add a registration id and retrieve it', () => {
    cart.addRegistrationId('123');

    expect(cart.getRegistrationIds()).toEqual(['123']);
  });

  it('should not add duplicate ids', () => {
    cart.addRegistrationId('123');
    cart.addRegistrationId('123');

    expect(cart.getRegistrationIds()).toEqual(['123']);
  });

  it('should check if an id exists', () => {
    cart.addRegistrationId('123');

    expect(cart.hasRegistrationId('123')).toBe(true);
    expect(cart.hasRegistrationId('456')).toBe(false);
  });

  it('should store multiple ids as comma-separated', () => {
    cart.addRegistrationId('123');
    cart.addRegistrationId('456');

    expect(cart.getRegistrationIds()).toEqual(['123', '456']);
    expect($window.localStorage.getItem('cartRegistrationIds')).toBe('123,456');
  });
});
