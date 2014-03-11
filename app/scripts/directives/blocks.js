'use strict';

angular.module('confRegistrationWebApp')
  .directive('nameQuestion', function () {
    return {
      templateUrl: 'views/nameQuestion.html',
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('addressQuestion', function () {
    return {
      templateUrl: 'views/addressQuestion.html',
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('checkboxQuestion', function () {
    return {
      templateUrl: 'views/checkboxQuestion.html',
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('emailQuestion', function () {
    return {
      templateUrl: 'views/emailQuestion.html',
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('numberQuestion', function () {
    return {
      templateUrl: 'views/numberQuestion.html',
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('phoneQuestion', function () {
    return {
      templateUrl: 'views/phoneQuestion.html',
      restrict: 'E',
      link: function (scope, elements) {
        elements.find('input').bind('blur', function () {
          scope.updateAnswer();
        });
      }
    };
  });

angular.module('confRegistrationWebApp')
  .directive('radioQuestion', function () {
    return {
      templateUrl: 'views/radioQuestion.html',
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('selectQuestion', function () {
    return {
      templateUrl: 'views/selectQuestion.html',
      restrict: 'E',
      link: function (scope, elements) {
        elements.find('input').bind('blur', function () {
          scope.updateAnswer();
        });
      }
    };
  });

angular.module('confRegistrationWebApp')
  .directive('textQuestion', function () {
    return {
      templateUrl: 'views/textQuestion.html',
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('genderQuestion', function () {
    return {
      templateUrl: 'views/genderQuestion.html',
      restrict: 'E'
    };
  });