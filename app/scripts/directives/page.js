'use strict';

angular.module('confRegistrationWebApp')
  .directive('page', function () {
    return {
      templateUrl: function() {
        var eventQuestionEditor = window.location.hash.indexOf('eventForm') !== -1;
        return eventQuestionEditor ? 'views/components/pageEditor.html' : 'views/components/pageRegistration.html';
      },
      restrict: 'E',
      controller: function ($scope, $location) {
        $scope.wizard = $location.path().indexOf('eventForm') !== -1;
      }
    };
  });
