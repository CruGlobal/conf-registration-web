angular
  .module('confRegistrationWebApp')
  .directive('selectOnClick', function ($window) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        element.on('click', function () {
          var elementToSelect = attrs.selectOnClick;
          if (_.isEmpty(elementToSelect)) {
            this.select();
          } else {
            $window.document.getElementById(elementToSelect).select();
          }
        });
      },
    };
  });
