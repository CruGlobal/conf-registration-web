'use strict';

angular.module('confRegistrationWebApp')
  .directive('crsSigninBox', function () {
    return {
      templateUrl: 'views/crsSigninBox.html',
      restrict: 'E',
      controller: function ($scope, $document, Model) {
        $scope.document = $document;
        Model.subscribe($scope, 'profileData', 'profile');
      },
      link: function postLink(scope, element) {
        scope.openBox = function () {
          scope.crsSigninBoxStatus = !scope.crsSigninBoxStatus;
        };
        scope.document.bind('click', function () {
          scope.$apply('crsSigninBoxStatus = false');
        });
        element.bind('click', function (event) {
          event.stopPropagation();
        });
      }
    };
  });
