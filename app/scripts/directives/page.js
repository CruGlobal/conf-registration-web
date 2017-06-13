import pageEditorTemplate from 'views/components/pageEditor.html';
import pageRegistrationTemplate from 'views/components/pageRegistration.html';

angular.module('confRegistrationWebApp')
  .directive('page', function ($route) {
    return {
      templateUrl: function() {
        return $route.current.controller === 'eventFormCtrl' ? pageEditorTemplate : pageRegistrationTemplate;
      },
      restrict: 'E'
    };
  });
