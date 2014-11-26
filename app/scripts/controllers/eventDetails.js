'use strict';

angular.module('confRegistrationWebApp')
  .controller('eventDetailsCtrl', function ($rootScope, $scope, $http, $sce, $timeout, $window, $modal, $filter, conference, ConfCache, permissions, permissionConstants, uuid) {
    $rootScope.globalPage = {
      type: 'admin',
      mainClass: 'container conference-details',
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

    $scope.tabs = [
      {id: 'eventInfo', name: 'Event Information', view: 'views/eventDetails/eventInformation.html'},
      {id: 'regOptions', name: 'Registration Options', view: 'views/eventDetails/regOptions.html'},
      {id: 'regTypes', name: 'Registration Types', view: 'views/eventDetails/regTypes.html'},
      {id: 'paymentOptions', name: 'Payment Options', view: 'views/eventDetails/paymentOptions.html'},
      {id: 'contactInfo', name: 'Contact Information', view: 'views/eventDetails/contactInfo.html'}
    ];

    $scope.changeTab = function(tab){
      $scope.activeTab = tab;
    };
    $scope.changeTab($scope.tabs[0]);

    $scope.paymentGateways = [
      {id: 'AUTHORIZE_NET', name: 'Authorize.Net'},
      {id: 'TRUST_COMMERCE', name: 'TrustCommerce'}
    ];

    $scope.conference = conference;

    $scope.addRegType = function(){
      $scope.conference.registrantTypes.push({
        id: uuid(),
        cost: 0,
        earlyRegistrationCutoff: moment().add(7, 'days').format('YYYY-MM-DD HH:mm:ss')
      });
    };

    $scope.deleteRegType = function(id){
      if ($scope.conference.registrantTypes.length > 1) {
        _.remove($scope.conference.registrantTypes, function(type) { return type.id === id; });
      } else {
        $scope.notify = {
          class: 'alert-danger',
          message: $sce.trustAsHtml('You must have at least one registration type per event.')
        };
        $timeout(function() { $scope.notify = {}; }, 3500);
      }
    };

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

      //Registration Window
      if ($scope.conference.registrationStartTime > $scope.conference.registrationEndTime) {
        validationErrors.push('Registration end date/time must be after registration start date/time.');
      }

      //Credit cards
      if ($scope.conference.acceptCreditCards) {
        if (_.isEmpty($scope.conference.paymentGatewayId)) {
          validationErrors.push('Please enter a merchant account ID.');
        }
      }

      //Registrant Name
      angular.forEach($scope.conference.registrantTypes, function(t) {
        if (_.isEmpty(t.name)) {
          validationErrors.push('Please enter a name for all registration types.');
        }
      });

      //Event Cost
      angular.forEach($scope.conference.registrantTypes, function(t) {
        t.cost = Number(t.cost);
        if ( _.isNaN(t.cost) || t.cost < 0) {
          validationErrors.push('Event cost for \'' + t.name + '\' must be a positive number.');
        }
      });

      //Minimum Deposit
      angular.forEach($scope.conference.registrantTypes, function(t) {
        if ($scope.conference.requireLogin && $scope.anyPaymentMethodAccepted() && String(t.minimumDeposit).length > 0 && !_.isNull(t.minimumDeposit)) {
          t.minimumDeposit = Number(t.minimumDeposit);
          if (t.minimumDeposit > t.cost) {
            validationErrors.push('The minimum deposit for \'' + t.name + '\' must be less than the cost.');
          }
        } else {
          t.minimumDeposit = null;
        }

      });

      //Early bird discount
      angular.forEach($scope.conference.registrantTypes, function(t) {
        if (t.earlyRegistrationDiscount) {
          t.earlyRegistrationAmount = Number(t.earlyRegistrationAmount);
          if (t.earlyRegistrationAmount > t.cost) {
            validationErrors.push('The early registration discount for \'' + t.name + '\' must be less than the cost.');
          }
          if (t.earlyRegistrationAmount < 0) {
            validationErrors.push('The early registration discount for \'' + t.name + '\' must be a positive number.');
          }
        }
      });

      $window.scrollTo(0, 0);
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

        $http(
          {method: 'PUT',
            url: 'conferences/' + conference.id,
            data: $scope.conference
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

    $scope.anyPaymentMethodAccepted = function(){
      return $scope.conference.acceptCreditCards || $scope.conference.acceptChecks || $scope.conference.acceptTransfers || conference.acceptScholarships;
    };

    $scope.previewEmail = function(reg){
      var cost = $filter('moneyFormat')(reg.cost);
      var eventStartTime = moment(conference.eventStartTime).format('dddd, MMMM D YYYY, h:mm a');
      var eventEndTime = moment(conference.eventEndTime).format('dddd, MMMM D YYYY, h:mm a');
      $modal.open({
          template: '<div class="modal-header"><button type="button" class="close" ng-click="close()" aria-hidden="true">&times;</button><h4>Email Preview</h4></div>' +
          '<div class="modal-body"><p>Hello ' + $rootScope.globalGreetingName + '!</p><p>You are registered for ' + $scope.conference.name + '.</p>' +
            '<p><strong>Start Time:</strong> ' + eventStartTime + '<br><strong>End Time:</strong> ' + eventEndTime + '</p>' +
            '<p><strong>Total Cost:</strong> ' + cost + '<br><strong>Total Amount Paid:</strong> ' + cost + '<br><strong>Remaining Balance:</strong> $0.00</p>' +
            reg.customConfirmationEmailText +
            '</div>',
          controller: 'genericModal',
          resolve: {
            data: function () {
              return '';
            }
          }
        });
    };
  });
