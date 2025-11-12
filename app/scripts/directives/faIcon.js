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
    link: function (_scope, element, attrs) {
      element.addClass('fa');

      if (attrs.icon) {
        element.addClass('fa-' + attrs.icon);
      }

      element.attr('aria-hidden', 'true');
    },
  };
});
