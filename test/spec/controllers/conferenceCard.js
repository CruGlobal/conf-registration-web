'use strict';

describe('Controller: ConferencecardCtrl', function () {

  // load the controller's module
  beforeEach(module('confRegistrationWebApp'));

  var ConferencecardCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ConferencecardCtrl = $controller('ConferencecardCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
