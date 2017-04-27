'use strict';

angular.module('confRegistrationWebApp')
  .controller('AccessEventCtrl', function ($scope, $http, $modalInstance, modalMessage) {
    //default to true
    $scope.eventSearchHistoric = true;

    $scope.close = function () {
      $modalInstance.dismiss();
    };

    $scope.submit = function (conference, reasonForRequest) {
      $http({
        method: 'POST',
        url: 'conferences/' + conference.id + '/permissions',
        data: {
          conferenceId: conference.id,
          reasonForRequest: reasonForRequest,
          permissionLevel: 'REQUESTED'
        }
      }).then(function () {
        $modalInstance.close();
      }).catch(function (response) {
        modalMessage.error(response.data && response.data.error ? response.data.error.message : 'An error has occurred');
      });
    };

    $scope.eventSearch = function(val) {
      return $http.get('conferences', {
        params: {
          conferenceName: val,
          historic: $scope.eventSearchHistoric
        }
      }).then(function(response){
        return response.data;
      });
    };

    $scope.selectEvent = function(item){
      $scope.selectedEvent = item;
    };
  });
