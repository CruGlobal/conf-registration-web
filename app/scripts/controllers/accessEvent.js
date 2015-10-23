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
      }).success(function () {
        $modalInstance.close();
      }).error(function (data) {
        modalMessage.error(data.errorMessage);
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
