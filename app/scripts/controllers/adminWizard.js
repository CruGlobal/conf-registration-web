'use strict';

angular.module('confRegistrationWebApp')
  .controller('AdminWizardCtrl', function ($scope, $dialog, conference, Model, GrowlService) {
    Model.subscribe($scope, 'conference', 'conferences/' + conference.id);

    $scope.deletePage = function (pageId, confirmation) {
      if (confirmation) {
        GrowlService.growl('conferences/' + $scope.conference.id, $scope.conference,'Page has been deleted.');
        $scope.deletePageFromConf(pageId);

        /*$dialog.dialog({
          templateUrl: 'views/confirmDeletePage.html',
          controller: 'confirmCtrl'
        }).open().then(function (result) {
            if (result) {

            }
          });*/
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
