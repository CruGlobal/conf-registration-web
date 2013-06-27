'use strict';

angular.module('confRegistrationWebApp')
  .controller('PageCtrl', function ($scope, conference, $routeParams) {
    $scope.conference = conference;

    function getPageById(pageId) {
      var pages = conference.pages;

      for (var i = 0; i < pages.length; i++) {
        if(angular.equals(pageId, pages[i].id)) {
          return pages[i];
        }
      }
    }

    $scope.page = getPageById($routeParams.pageId);
  });
