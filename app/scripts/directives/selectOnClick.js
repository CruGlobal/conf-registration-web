'use strict';

angular.module('confRegistrationWebApp').directive('selectOnClick', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      element.on('click', function () {
        var elementToSelect = attrs.selectOnClick;
        if (_.isEmpty(elementToSelect)) {
          this.select();
        } else {
          document.getElementById(elementToSelect).select();
        }

      });
    }
  };
});