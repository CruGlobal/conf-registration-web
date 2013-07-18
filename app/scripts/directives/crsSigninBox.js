'use strict';

angular.module('confRegistrationWebApp')
  .directive('crsSigninBox', function () {
    return {
      templateUrl: 'views/crsSigninBox.html',
      restrict: 'E',
      controller: function ($scope, $document) {
        $scope.document = $document;
      },
      link: function postLink(scope, element) {
        scope.openBox = function () {
          scope.crsSigninBoxStatus ^= true;
        };
        scope.document.bind('click', function () {
          scope.$apply('crsSigninBoxStatus = false');
        });
        element.bind('click',function (event) {
          event.stopPropagation();
        });
      }
    };
  });
