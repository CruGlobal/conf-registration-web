'use strict';

angular.module('confRegistrationWebApp')
  .controller('RegistrationCtrl', function ($scope, conference, $routeParams, $location) {
    $scope.validPages = {};
    $scope.$on('pageValid', function (event, validity) {
      event.stopPropagation();
      $scope.validPages[event.targetScope.page.id] = validity;
    });

    $scope.conference = conference;

    function getPageById(pageId) {
      var pages = conference.pages;

      for (var i = 0; i < pages.length; i++) {
        if(angular.equals(pageId, pages[i].id)) {
          return pages[i];
        }
      }
    }

    var pageId = $routeParams.pageId;
    $scope.activePageId = pageId;
    $scope.page = getPageById(pageId);

    function getPageAfterById(pageId) {
      var pages = conference.pages;

      for (var i = 0; i < pages.length; i++) {
        if(angular.equals(pageId, pages[i].id)) {
          return pages[i+1];
        }
      }
    }

    $scope.nextPage = getPageAfterById(pageId);

    $scope.validateAndGoToNext = function () {
      $location.path('/register/' + conference.id + '/page/' + $scope.nextPage.id);
    };
  });
