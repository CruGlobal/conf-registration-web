'use strict';

angular.module('confRegistrationWebApp')
  .controller('AdminWizardCtrl', function ($scope, $dialog, conference, Model, GrowlService) {
    Model.subscribe($scope, 'conference', 'conferences/' + conference.id);

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
