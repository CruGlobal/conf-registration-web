'use strict';

angular.module('confRegistrationWebApp')
.controller('confirmCtrl', function ($scope, ConfCache, dialog) {
  $scope.close = function () {
    dialog.close(false);
  };
  $scope.submit = function () {
    dialog.close(true);
  };
});

angular.module('confRegistrationWebApp')
.controller('confirmPromptCtrl', function ($scope, ConfCache, dialog) {
  $scope.close = function () {
    dialog.close('');
  };
  $scope.submit = function () {
    dialog.close($scope.name);
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