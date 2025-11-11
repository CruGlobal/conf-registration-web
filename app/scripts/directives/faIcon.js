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
angular
  .module('confRegistrationWebApp')
  .directive('faIcon', function ($compile) {
    return {
      restrict: 'E',
      // High priority + terminal allows transforming <fa-icon> to <i> before ng-if/ng-show run
      // Manually copied directives are re-compiled on the new element to work correctly
      priority: 1000,
      terminal: true,
      link: function (scope, element, attrs) {
        const iconElement = angular.element('<i></i>');

        iconElement.addClass('fa');

        if (attrs.icon) {
          iconElement.addClass('fa-' + attrs.icon);
        }

        if (attrs.class) {
          iconElement.addClass(attrs.class);
        }

        if (attrs.style) {
          iconElement.attr('style', attrs.style);
        }

        if (attrs.ngClass) {
          iconElement.attr('ng-class', attrs.ngClass);
        }

        // Manually copy ng-if, ng-show, ng-hide to the new element
        if (attrs.ngIf) {
          iconElement.attr('ng-if', attrs.ngIf);
        }
        if (attrs.ngShow) {
          iconElement.attr('ng-show', attrs.ngShow);
        }
        if (attrs.ngHide) {
          iconElement.attr('ng-hide', attrs.ngHide);
        }

        iconElement.attr('aria-hidden', 'true');

        element.replaceWith(iconElement);
        $compile(iconElement)(scope);
      },
    };
  });
