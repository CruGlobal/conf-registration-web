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

  it('Make sure js-flip only exists on flipped card', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
