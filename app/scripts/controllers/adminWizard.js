'use strict';

angular.module('confRegistrationWebApp')
  .controller('AdminWizardCtrl', function ($scope, conference, Model) {
    Model.subscribe($scope, 'conference', 'conferences/' + conference.id);

    $scope.deletePage = function (pageId, confirmation) {
      var delPageIndex = $scope.getPageIndex(pageId);
      if (confirmation==true) {
        var r = confirm("Are you sure you want to delete this page?  All questions it contains will also be deleted?");
        if (r === false) {
          return;
        }
      }
      $scope.conference.registrationPages.splice(
        delPageIndex,
        1
      );
    };
  });
