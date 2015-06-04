'use strict';

angular.module('confRegistrationWebApp')
  .directive('page', function () {
    return {
      templateUrl: 'views/components/pageDirective.html',
      restrict: 'E',
      controller: function ($scope, $location) {
        $scope.wizard = $location.path().indexOf('eventForm') !== -1;
      }
    };
  });
