'use strict';

angular.module('confRegistrationWebApp')
  .controller('AdminWizardCtrl', function ($scope, $modal, conference, Model, GrowlService, ConfCache, $http) {
    $scope.saveAvailable = false;

    setTimeout(function () {
      $scope.loadConferenceToScope();
    }, 400);

    $scope.loadConferenceToScope = function () {
      $scope.$apply(function () {
        $scope.conference = angular.copy(conference);
      });
    };

    $scope.saveConf = function () {
      $http.put('conferences/' + conference.id, $scope.conference).then(function () {
        conference = angular.copy($scope.conference);
        $scope.saveAvailable = false;

        //update cache
        ConfCache.update(conference.id, conference);
      });
    };

    $scope.$watch('conference', function (conf) {
      if (!angular.equals(conf, conference)) {
        $scope.saveAvailable = true;
      } else {
        $scope.saveAvailable = false;
      }
    }, true);

    $scope.deletePage = function (pageId, growl) {
      if (growl) {
        var page = _.find($scope.conference.registrationPages, {id: pageId});
        var message = 'Page "' + page.title + '" has been deleted.';
        GrowlService.growl('conferences/' + $scope.conference.id, $scope.conference, message);
      }
      $scope.deletePageFromConf(pageId);
    };

    $scope.deletePageFromConf = function (pageId) {
      var delPageIndex = _.findIndex($scope.conference.registrationPages, { id: pageId });
      $scope.conference.registrationPages.splice(delPageIndex, 1);
    };
  });
