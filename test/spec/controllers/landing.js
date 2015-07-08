'use strict';

describe('Controller: landingCtrl', function () {
  var scope, controller;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(angular.mock.inject(function($rootScope, $controller) {
    scope = $rootScope.$new();
    scope.eventFilters = {
      date: 'This Week'
    };

    controller = $controller('landingCtrl', {
      $scope: scope
    });
  }));

  it('dateFilter should return true', function () {
    expect(scope.dateFilter({
      "id": "34e4f769-3b80-44e1-88b5-xxxxxx",
      "eventStartTime": moment(),
      "eventEndTime": moment().add(4, 'days')
    })).toBe(true);
  });
});