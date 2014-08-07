'use strict';

angular.module('confRegistrationWebApp')
  .controller('eventDetailsCtrl', function ($rootScope, $scope, $http, $sce, conference, ConfCache, permissions, permissionConstants) {
    $rootScope.globalPage = {
      type: 'admin',
      mainClass: 'conference-details',
      bodyClass: '',
      title: conference.name,
      confId: conference.id,
      footer: true
    };
    if (permissions.permissionInt >= permissionConstants.UPDATE) {
      $scope.templateUrl = 'views/eventDetails.html';
    } else {
      $scope.templateUrl = 'views/permissionError.html';
    }

    $scope.paymentGateways = [
      {id: 'AUTHORIZE_NET', name: 'Authorize.Net'},
      {id: 'TRUST_COMMERCE', name: 'TrustCommerce'}
    ];

    $scope.conference = conference;

    $scope.saveEvent = function () {
      //validation check
      var validationErrors = [];

      //Event Name
      if (_.isEmpty($scope.conference.name)) {
        validationErrors.push('Please enter an event name.');
      }

      //Event Dates
      if ($scope.conference.eventStartTime > $scope.conference.eventEndTime) {
        validationErrors.push('Event end date/time must be after event start date/time.');
      }

      //Event Cost
      $scope.conference.conferenceCost = Number($scope.conference.conferenceCost);
      if (isNaN($scope.conference.conferenceCost) || $scope.conference.conferenceCost < 0) {
        validationErrors.push('Event cost must be a positive number.');
      } else {
        $scope.conference.conferenceCost = parseFloat($scope.conference.conferenceCost).toFixed(2);
      }

      //Credit cards
      if ($scope.conference.acceptCreditCards) {
        if (_.isEmpty($scope.conference.paymentGatewayId)) {
          validationErrors.push('Please enter a merchant account ID.');
        }

        if (Number($scope.conference.conferenceCost) <= 1) {
          validationErrors.push('Event cost must be great than or equal to $1 to accept credit cards.');
        }

        //Minimum Deposit
        $scope.conference.minimumDeposit = Number($scope.conference.minimumDeposit);
        if (Number($scope.conference.minimumDeposit) < 0) {
          validationErrors.push('Credit card minimum payment must be a positive number.');
        }

        if (Number($scope.conference.minimumDeposit) > Number($scope.conference.conferenceCost)) {
          validationErrors.push('Credit card minimum payment cannot be greater than the event cost.');
        }

        if (Number($scope.conference.minimumDeposit) !== Number($scope.conference.conferenceCost) && !$scope.conference.requireLogin) {
          validationErrors.push('Credit card minimum payment and event cost must be equal if Relay or Facebook login is not required.');
        }
      }

      //Early bird discount
      if ($scope.conference.earlyRegistrationDiscount) {
        $scope.conference.earlyRegistrationAmount = Number($scope.conference.earlyRegistrationAmount);
        if (isNaN($scope.conference.earlyRegistrationAmount) || $scope.conference.earlyRegistrationAmount < 0) {
          validationErrors.push('Early bird discount must be a positive number.');
        } else {
          $scope.conference.earlyRegistrationAmount = parseFloat($scope.conference.earlyRegistrationAmount).toFixed(2);
        }

        if (Number($scope.conference.earlyRegistrationAmount) > Number($scope.conference.conferenceCost)) {
          validationErrors.push('Early bird discount cannot be greater than the event cost.');
        }
      }
      //Registration Window
      if ($scope.conference.registrationStartTime > $scope.conference.registrationEndTime) {
        validationErrors.push('Registration end date/time must be after registration start date/time.');
      }


      window.scrollTo(0, 0);
      if (validationErrors.length > 0) {
        var errorMsg = '<strong>Error!</strong> Please fix the following issues:<ul>';
        angular.forEach(validationErrors, function (e) {
          errorMsg = errorMsg + '<li>' + e + '</li>';
        });
        errorMsg = errorMsg + '</ul>';
        $scope.notify = {
          class: 'alert-danger',
          message: $sce.trustAsHtml(errorMsg)
        };
      } else {
        $scope.notify = {
          class: 'alert-warning',
          message: $sce.trustAsHtml('Saving...')
        };

        var postData = angular.copy($scope.conference);
        $http(
          {method: 'PUT',
            url: 'conferences/' + conference.id,
            data: postData
        }).success(function () {
            $scope.notify = {
              class: 'alert-success',
              message: $sce.trustAsHtml('<strong>Saved!</strong> Your event details have been updated.')
            };

            //Clear cache
            ConfCache.empty();
          }).error(function (data) {
            window.scrollTo(0, 0);
            $scope.notify = {
              class: 'alert-danger',
              message: $sce.trustAsHtml('<strong>Error</strong> ' + data)
            };
          });
      }
    };
  });
