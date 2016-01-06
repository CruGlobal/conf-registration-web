'use strict';

angular.module('confRegistrationWebApp')
  .controller('eventDetailsCtrl', function ($rootScope, $scope, $http, $sce, $timeout, $window, $modal, modalMessage, $filter, $location, conference, ConfCache, permissions, permissionConstants, uuid) {
    $rootScope.globalPage = {
      type: 'admin',
      mainClass: 'container event-details',
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
      {id: 'promotions', name: 'Promotions', view: 'views/eventDetails/promotions.html'},
      {id: 'contactInfo', name: 'Contact Information', view: 'views/eventDetails/contactInfo.html'}
    ];

    $scope.changeTab = function(tab){
      $scope.activeTab = tab;
    };
    $scope.changeTab($scope.tabs[0]);

    $scope.paymentGateways = [
      {id: 'AUTHORIZE_NET', name: 'Authorize.Net'}
    ];

    $scope.conference = angular.copy(conference);

    $scope.$on('$locationChangeStart', function(event, newLocation) {
      if(!angular.equals(conference, $scope.conference)){
        event.preventDefault();
        modalMessage.confirm({
          title: 'Warning: Unsaved Changes',
          question: 'You have some unsaved changes on this page, are you sure you want to leave? Your changes will be lost.',
          yesString: 'Discard changes',
          noString: 'Stay on this page',
          normalSize: true
        }).then(function(){
          conference = angular.copy($scope.conference);
          $location.url($location.url(newLocation).hash());
        });
      }
    });

    $scope.addPromotion = function(){
      $scope.conference.promotions.push({
        id: uuid(),
        applyToAllRegistrants: true,
        registrantTypeIds: _.pluck($scope.conference.registrantTypes, 'id'),
        activationDate: $scope.conference.registrationStartTime,
        deactivationDate: $scope.conference.registrationEndTime
      });
    };

    $scope.promotionRegistrantTypeToggle = function (registrantTypes, id) {
      if (registrantTypes.indexOf(id) === -1) {
        registrantTypes.push(id);
      } else {
        registrantTypes.splice(registrantTypes.indexOf(id), 1);
      }
    };

    $scope.addRegType = function(){
      var modalInstance = $modal.open({
        templateUrl: 'views/modals/addRegistrantType.html',
        controller: function($scope, $modalInstance, registrantTypes){
          $scope.types = registrantTypes.data;

          $scope.selectType = function (type) {
            $modalInstance.close(type);
          };
        },
        resolve: {
          registrantTypes: function () {
            return $http.get('registranttypes', {cache: true});
          }
        }
      });

      modalInstance.result.then(function(type) {
        type.id = uuid();
        $scope.conference.registrantTypes.push(type);
      });

      return modalInstance;
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

    $scope.addEarlyRegistrationDiscount = function(type){
      type.earlyRegistrationDiscounts.push({id: uuid(), enabled: true});
    };

    $scope.saveEvent = function () {
      //validation check
      var validationErrors = [];

      //contact website
      var urlPattern = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi);
      if(!_.isEmpty($scope.conference.contactWebsite)) {
        if (!urlPattern.test($scope.conference.contactWebsite)) {
          validationErrors.push('Please enter an valid website.');
        } else {
          var httpPattern = new RegExp(/^(http){1}s{0,1}:\/\//gi);
          if (!httpPattern.test($scope.conference.contactWebsite)) {
            $scope.conference.contactWebsite = 'http://' + $scope.conference.contactWebsite;
          }
        }
      }



      //Event Name
      if (_.isEmpty($scope.conference.name)) {
        validationErrors.push('Please enter an event name.');
      }

      if($scope.conference.abbreviation.length > 10) {
        validationErrors.push('Event abbreviation must be no longer than 10 characters.');
      }

      //Event Dates
      if ($scope.conference.eventStartTime > $scope.conference.eventEndTime) {
        validationErrors.push('Event end date/time must be after event start date/time.');
      }

      //Registration Window
      if ($scope.conference.registrationStartTime > $scope.conference.registrationEndTime) {
        validationErrors.push('Registration end date/time must be after registration start date/time.');
      }

      //Promo codes
      angular.forEach($scope.conference.promotions, function(p, index) {
        if (_.isEmpty(p.code)) {
          validationErrors.push('Please enter a code for promotion ' + (index + 1) + '.');
        }else{
          if(p.code.length < 5 || p.code.length > 20){
            validationErrors.push('Code for promotion ' + (index + 1) + ' must be greater than 5 characters and less than 20.');
          }

          if(/[^a-zA-Z0-9]/.test(p.code)){
            validationErrors.push('Code for promotion ' + (index + 1) + ' must only contain letters and/or numbers.');
          }
        }

        if (!p.amount || Number(p.amount) <= 0) {
          validationErrors.push('Please enter a discount amount greater than 0 for promotion ' + (index + 1) + '.');
        }
      });

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

      //Credit cards
      if (_.isEmpty($scope.conference.paymentGatewayId) && _.some($scope.conference.registrantTypes, 'acceptCreditCards')) {
        validationErrors.push('Please enter a credit card Account ID and Key under the "Payment Options" tab.');
      }

      //Minimum Deposit
      angular.forEach($scope.conference.registrantTypes, function(t) {
        if ($scope.conference.requireLogin && $scope.anyPaymentMethodAccepted(t) && String(t.minimumDeposit).length > 0 && !_.isNull(t.minimumDeposit)) {
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
        angular.forEach(t.earlyRegistrationDiscounts, function(d, index){
          if (d.enabled) {
            d.amountOfDiscount = Number(d.amountOfDiscount);
            if (d.amountOfDiscount <= 0) {
              validationErrors.push('Early registration discount ' + (index + 1) + ' for \'' + t.name + '\' must be a positive number.');
            }
            if (!d.deadline) {
              validationErrors.push('Early registration discount ' + (index + 1) + ' for \'' + t.name + '\' must include a valid date and time.');
            }
          }
        });
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

            conference = angular.copy($scope.conference);
            //Clear cache
            ConfCache.empty();
          }).error(function (data) {
            $scope.notify = {
              class: 'alert-danger',
              message: $sce.trustAsHtml('<strong>Error</strong> ' + (data.errorMessage || data))
            };
          });
      }
    };

    $scope.anyPaymentMethodAccepted = function(type){
      return type.acceptCreditCards || type.acceptChecks || type.acceptTransfers || type.acceptScholarships;
    };

    $scope.previewEmail = function(reg){
      var cost = $filter('currency')(reg.cost, '$');
      var eventStartTime = moment(conference.eventStartTime).format('dddd, MMMM D YYYY, h:mm a');
      var eventEndTime = moment(conference.eventEndTime).format('dddd, MMMM D YYYY, h:mm a');
      modalMessage.info({
        'title': 'Email Preview',
        'message': '<p>Hello ' + $rootScope.globalGreetingName + '!</p><p>You are registered for ' + $scope.conference.name + '.</p>' +
        '<p><strong>Start Time:</strong> ' + eventStartTime + '<br><strong>End Time:</strong> ' + eventEndTime + '</p>' +
        '<p><strong>Total Cost:</strong> ' + cost + '<br><strong>Total Amount Paid:</strong> ' + cost + '<br><strong>Remaining Balance:</strong> $0.00</p>' +
        reg.customConfirmationEmailText,
        'okString': 'Close'
      });
    };

    $scope.disableField = function(field, defaultTypeKey){
      var fields = {
        groupSubRegistrantType: ['SPOUSE', 'CHILD']
      };
      return _.contains(fields[field], defaultTypeKey);
    };
  });
