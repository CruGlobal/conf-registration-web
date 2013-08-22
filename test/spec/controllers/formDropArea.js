'use strict';

describe('Controller: FormDropAreaCtrl', function () {

  // load the controller's module
  beforeEach(module('confRegistrationWebApp'));

  var FormDropAreaCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    FormDropAreaCtrl = $controller('FormDropAreaCtrl', {
      $scope: scope
    });
  }));
});
