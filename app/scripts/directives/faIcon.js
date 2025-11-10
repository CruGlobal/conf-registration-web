/**
 * @ngdoc directive
 * @name confRegistrationWebApp.directive:faIcon
 * @restrict A
 * @description
 * Adds aria-hidden="true" to Font Awesome icons for accessibility.
 * Decorative icons should be hidden from screen readers.
 *
 * @example
 * <i class="fa fa-check" fa-icon></i>
 */
angular.module('confRegistrationWebApp').directive('faIcon', function () {
  return {
    restrict: 'A',
    link: function (_scope, element) {
      element.attr('aria-hidden', 'true');
    },
  };
});
