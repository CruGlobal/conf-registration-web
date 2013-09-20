'use strict';

angular.module('confRegistrationWebApp')
  .directive('crsDatetimepicker', function () {
    return {
      templateUrl: 'views/datepicker.html',
      restrict: 'E',
      scope: {
        'localModel':'=model'
      },
      controller: function ($timeout, $scope) {
        $scope.showWeeks = false;
        $scope.minDate = ($scope.minDate) ? null : new Date();
        $scope.dateOptions = {
          'starting-day': 0
        };

        $scope.open = function () {
          $timeout(function () {
            $scope.opened = true;
          });
        };
      }
    };
  });
