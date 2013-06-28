'use strict';

angular.module('confRegistrationWebApp')
  .controller('PageCtrl', function ($scope, conference, $routeParams, $location) {
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

    function getPageAfterById(pageId) {
      var pages = conference.pages;

      for (var i = 0; i < pages.length; i++) {
        if(angular.equals(pageId, pages[i].id)) {
          return pages[i+1];
        }
      }
    }

    $scope.nextPage = getPageAfterById($routeParams.pageId);

    $scope.validateAndGoToNext = function () {
      $location.path('/register/' + conference.id + '/page/' + $scope.nextPage.id);
    };
  });
