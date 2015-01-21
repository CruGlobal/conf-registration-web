'use strict';

angular.module('confRegistrationWebApp')
  .directive('pickADate', function () {
    return {
      templateUrl: 'views/components/pickadate.html',
      restrict: 'E',
      scope: {
        'model': '=model',
        'required': '=required',
        'disabled': '=disabled'
      },
      link: function (scope, element) {
        $(element).find('input').pickadate({
          format: 'yyyy/mm/dd',
          selectYears: true
        });
      }
    };
  });
