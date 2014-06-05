'use strict';

angular.module('confRegistrationWebApp')
  .controller('eventDetailsCtrl', function ($rootScope, $scope, $http, $sce, conference, ConfCache) {
    $rootScope.globalPage = {
      type: 'admin',
      class: 'conference-details',
      title: conference.name,
      confId: conference.id,
      footer: true
    };
    $scope.conference = conference;


    $scope.saveEvent = function(){
      //validation check
      var validationErrors = [];

      //Event Name
      if(_.isEmpty($scope.conference.name)){
        validationErrors.push('Please enter an event name.');
      }

      //Event Dates
      if($scope.conference.eventStartTime > $scope.conference.eventEndTime){
        validationErrors.push('Event end date/time must be after event start date/time.');
      }

      //Event Cost
      $scope.conference.conferenceCost = parseFloat($scope.conference.conferenceCost);
      if(isNaN($scope.conference.conferenceCost) || $scope.conference.conferenceCost < 0){
        validationErrors.push('Event cost must be a positive number.');
      }

      //Credit cards
      if($scope.conference.acceptCreditCards){
        if($scope.conference.conferenceCost === 0){
          validationErrors.push('Event cost must be great than 0 to accept credit cards.');
        }

        //Minimum Deposit
        $scope.conference.minimumDeposit = parseFloat($scope.conference.minimumDeposit);
        if(isNaN($scope.conference.minimumDeposit) || $scope.conference.minimumDeposit < 0){
          validationErrors.push('Credit card minimum payment must be a positive number.');
        }

        if($scope.conference.minimumDeposit > $scope.conference.conferenceCost){
          validationErrors.push('Credit card minimum payment cannot be greater than the event cost.');
        }

        if($scope.conference.minimumDeposit !== $scope.conference.conferenceCost && !$scope.conference.requireLogin){
          validationErrors.push('Credit card minimum payment and event cost must be equal if Relay or Facebook login is not required.');
        }
      }

      //Early bird discount
      if($scope.conference.earlyRegistrationDiscount){
        $scope.conference.earlyRegistrationAmount = parseFloat($scope.conference.earlyRegistrationAmount);
        if(isNaN($scope.conference.earlyRegistrationAmount) || $scope.conference.earlyRegistrationAmount < 0){
          validationErrors.push('Early bird discount must be a positive number.');
        }

        if($scope.conference.earlyRegistrationAmount > $scope.conference.conferenceCost){
          validationErrors.push('Early bird discount cannot be greater than the event cost.');
        }
      }
      //Registration Window
      if($scope.conference.registrationStartTime > $scope.conference.registrationEndTime){
        validationErrors.push('Registration end date/time must be after registration start date/time.');
      }


      window.scrollTo(0, 0);
      if(validationErrors.length > 0){
        var errorMsg = '<strong>Error!</strong> Please fix the following issues:<ul>';
        angular.forEach(validationErrors, function(e){
          errorMsg = errorMsg + '<li>' + e + '</li>';
        });
        errorMsg = errorMsg + '</ul>';
        $scope.notify = {
          class: 'alert-danger',
          message: $sce.trustAsHtml(errorMsg)
        };
      }else{
        $scope.notify = {
          class: 'alert-warning',
          message: $sce.trustAsHtml('Saving...')
        };

        $http({method: 'PUT', url: 'conferences/' + conference.id, data: $scope.conference}).
          success(function(data, status, headers, config) {
            $scope.notify = {
              class: 'alert-success',
              message: $sce.trustAsHtml('<strong>Saved!</strong> Your event details have been updated.')
            };

            //Update cache
            if (angular.isDefined(conference)) {
              ConfCache.update(conference.id, $scope.conference);
            }
          }).
          error(function(data, status, headers, config) {
            window.scrollTo(0, 0);
            $scope.notify = {
              class: 'alert-danger',
              message: $sce.trustAsHtml('<strong>Error</strong> ' + data)
            };
          });
      }
    };
  });
