'use strict';

angular.module('confRegistrationWebApp')
  .directive('crsSigninBox', function () {
    return {
      templateUrl: 'views/crsSigninBox.html',
      restrict: 'E',
      controller: function ($scope, $document, ProfileCache) {
        $scope.document = $document;
        ProfileCache.get().then(function (profileData) {
          $scope.profileData = profileData;
          $scope.loggedIn = angular.isDefined(profileData);
        });
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
