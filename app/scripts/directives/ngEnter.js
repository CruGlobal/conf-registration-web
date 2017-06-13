
angular.module('confRegistrationWebApp').directive('ngEnter', function () {
  return function (scope, element, attrs) {
    element.on('keypress', function (event) {
      if (event.which === 13) {
        scope.$apply(function () {
          scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  };
});
