'use strict';

angular.module('confRegistrationWebApp')
  .directive('body', function () {
    var matchRouteToClass = {};
    matchRouteToClass['/$'] = 'page--home';
    matchRouteToClass['/wizard/*.'] = 'page--wizard';
    matchRouteToClass['/adminData/*.'] = 'page--admin';
    matchRouteToClass['/register/*.*/page/*.*'] = 'page--register';
    matchRouteToClass['/adminDetails/*.'] = 'page--admin-details';
    return {
      restrict: 'E',
      link: function postLink(scope, element) {
        scope.$on('$locationChangeSuccess', function (event, location) {
          angular.forEach(matchRouteToClass, function (cssClass, regExpString) {
            element.removeClass(cssClass);
            if (new RegExp(regExpString).test(location)) {
              element.addClass(cssClass);
            }
          });
        });
      }
    };
  });
