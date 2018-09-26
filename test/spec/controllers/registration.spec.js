import 'angular-mocks';

describe('Controller: RegistrationCtrl', function () {
  var scope, registrant;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(angular.mock.inject(function ($rootScope, $controller, testData) {
    registrant = testData.registration.registrants[0];

    scope = $rootScope.$new();
    scope.answers = registrant.answers;

    $controller('RegistrationCtrl', {
      $scope: scope, currentRegistration: testData.registration, conference: testData.conference, $routeParams: { reg: registrant.id }
    });
  }));

  it('currentRegistrantObject should receive the correct Registrant', function () {
    expect(scope.currentRegistrantObject.id).toBe(registrant.id);
  });
});
