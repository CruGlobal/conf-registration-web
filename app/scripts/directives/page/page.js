import pageEditorTemplate from './pageEditor.html';
import pageRegistrationTemplate from './pageRegistration.html';

angular.module('confRegistrationWebApp').directive('page', function ($route) {
  return {
    templateUrl: function () {
      return $route.current.controller === 'eventFormCtrl'
        ? pageEditorTemplate
        : pageRegistrationTemplate;
    },
    restrict: 'E',
  };
});
