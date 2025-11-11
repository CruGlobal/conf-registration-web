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
      icon: '@?',
    },
    link: function (scope, element, attrs) {
      const iconElement = angular.element('<i></i>');

      iconElement.addClass('fa');

      if (scope.icon) {
        iconElement.addClass('fa-' + scope.icon);
      }

      if (attrs.class) {
        iconElement.addClass(attrs.class);
      }

      if (attrs.ngClass) {
        iconElement.attr('ng-class', attrs.ngClass);
      }

      iconElement.attr('aria-hidden', 'true');

      element.replaceWith(iconElement);
    },
  };
});
