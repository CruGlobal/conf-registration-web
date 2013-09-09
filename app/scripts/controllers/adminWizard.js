'use strict';

angular.module('confRegistrationWebApp')
  .controller('AdminWizardCtrl', function ($scope, $dialog, conference, Model, GrowlService) {
    Model.subscribe($scope, 'conference', 'conferences/' + conference.id);

    $scope.deletePage = function (pageId, confirmation) {
      if (confirmation) {
        var delPageIndex = _.findIndex($scope.conference.registrationPages, { id: pageId });
        var pageTitle = $scope.conference.registrationPages[delPageIndex].title;
        GrowlService.growl('conferences/' + $scope.conference.id,
          $scope.conference, 'Page "' + pageTitle + '" has been deleted.');
        $scope.deletePageFromConf(pageId);
      } else {
        $scope.deletePageFromConf(pageId);
      }
    };

    $scope.deletePageFromConf = function (pageId) {
      var delPageIndex = _.findIndex($scope.conference.registrationPages, { id: pageId });
      $scope.conference.registrationPages.splice(
        delPageIndex,
        1
      );
    };
  });
