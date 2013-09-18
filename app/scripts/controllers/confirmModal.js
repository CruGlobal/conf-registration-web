'use strict';

angular.module('confRegistrationWebApp')
.controller('confirmCtrl', function ($scope, ConfCache, $modalInstance) {
  $scope.close = function () {
    $modalInstance.close(false);
  };
  $scope.submit = function () {
    $modalInstance.close(true);
  };
});

angular.module('confRegistrationWebApp')
.controller('confirmPromptCtrl', function ($scope, $modalInstance) {
  $scope.close = function () {
    $modalInstance.close('');
  };
  $scope.submit = function (newPageName) {
    $modalInstance.close(newPageName);
  };
});

angular.module('confRegistrationWebApp').directive('ngEnter', function () {
  return function (scope, element, attrs) {
    element.bind('keypress', function (event) {
      if (event.which === 13) {
        scope.$apply(function () {
          scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  };
});