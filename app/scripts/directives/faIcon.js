/**
 * @ngdoc directive
 * @name confRegistrationWebApp.directive:faIcon
 * @restrict E
 * @description
 * Adds aria-hidden="true" to Font Awesome icons for accessibility.
 * Decorative icons should be hidden from screen readers.
 *
 * @example <fa-icon icon="users"></fa-icon>
 */
angular.module('confRegistrationWebApp').directive('faIcon', function () {
  return {
    restrict: 'E',
    scope: {
      icon: '@',
    },
    link: function (_scope, element) {
      element.addClass('fa');

      _scope.$watch('icon', function (newValue, oldValue) {
        if (oldValue) {
          element.removeClass('fa-' + oldValue);
        }
        if (newValue) {
          element.addClass('fa-' + newValue);
        }
      });

      element.attr('aria-hidden', 'true');
    },
  };
});
