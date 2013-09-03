'use strict';

angular.module('confRegistrationWebApp')
  .controller('AdminWizardCtrl', function ($scope, $dialog, conference, Model) {
    Model.subscribe($scope, 'conference', 'conferences/' + conference.id);

    $scope.deletePage = function (pageId, confirmation) {
      if (confirmation) {
        $dialog.dialog({
          templateUrl: 'views/confirmDeletePage.html',
          controller: 'confirmCtrl'
        }).open().then(function (result) {
            if (result) {
              $scope.deletePageFromConf(pageId);
            }
          });
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
