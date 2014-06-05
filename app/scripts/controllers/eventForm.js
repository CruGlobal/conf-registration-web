'use strict';

angular.module('confRegistrationWebApp')
  .controller('eventFormCtrl', function ($scope, $modal, conference, Model, GrowlService, ConfCache) {
    Model.subscribe($scope, 'conference', 'conferences/' + conference.id);

    //Update cache
    $scope.$watch('conference', function (conf) {
      if (angular.isDefined(conference)) {
        ConfCache.update(conference.id, conf);
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
