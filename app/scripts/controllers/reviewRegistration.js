'use strict';

angular.module('confRegistrationWebApp')
  .controller('ReviewRegistrationCtrl', function ($scope, $rootScope, $location, $route, $modal, $http, registration, conference, RegistrationCache, validateRegistrant, $filter) {
    $rootScope.globalPage = {
      type: 'registration',
      mainClass: 'container front-form',
      bodyClass: 'frontend',
      title: conference.name,
      confId: conference.id,
      footer: false
    };

    if(_.isEmpty(registration.registrants)) {
      $location.path('/' + ($rootScope.registerMode || 'register') + '/' + conference.id + '/page/');
    }

    $scope.conference = conference;
    $scope.currentRegistration = registration;
    $scope.blocks = [];
    $scope.regValidate = [];

    //check if group registration is allowed based on registrants already in registration
    if(!_.isEmpty(registration.registrants)){
      $scope.allowGroupRegistration = false;
      angular.forEach(registration.registrants, function(r){
        if($scope.allowGroupRegistration){
          return;
        }
        var regType = _.find(conference.registrantTypes, { 'id': r.registrantTypeId });
        $scope.allowGroupRegistration = regType.allowGroupRegistrations;
      });
    }

    if (angular.isUndefined($scope.currentPayment)) {
      var paymentType;
      if(conference.acceptCreditCards) {
        paymentType = 'CREDIT_CARD';
      }else if(conference.acceptChecks){
        paymentType = 'CHECK';
      }else if(conference.acceptTransfers){
        paymentType = 'TRANSFER';
      }else if(conference.acceptScholarships){
        paymentType = 'SCHOLARSHIP';
      }

      $scope.currentPayment = {
        amount: $scope.currentRegistration.remainingBalance,
        paymentType: paymentType,
        creditCard: {},
        transfer: {},
        scholarship: {}
      };
    }

    angular.forEach(_.flatten(conference.registrationPages, 'blocks'), function (block) {
      if (block.type.indexOf('Content') === -1) {
        $scope.blocks.push(block);
      }
    });

    angular.forEach(registration.registrants, function (r) {
      $scope.regValidate[r.id] = validateRegistrant.validate(conference, r);
    });

    $scope.findAnswer = function (blockId) {
      return _.find($scope.answers, {blockId: blockId});
    };

    $scope.getBlock = function (blockId) {
      return _.find($scope.blocks, {id: blockId});
    };

    $scope.confirmRegistration = function () {
      $scope.submittingRegistration = true;

      /*if the totalPaid (previously) AND the amount of this payment are less than the minimum required deposit, then
        show and error message. the first payment must be at least the minimum deposit amount.  subsequent payments
        can be less than the amount.  this is confirmed by making sure the total previously paid is above the min deposit amount.
        */
      if ($scope.currentRegistration.totalPaid < $scope.currentRegistration.calculatedMinimumDeposit &&
          ($scope.currentPayment.amount + $scope.currentRegistration.totalPaid) < $scope.currentRegistration.calculatedMinimumDeposit) {
        $scope.currentPayment.errors.push('You are required to pay at least the minimum deposit of ' + $filter('moneyFormat')(registration.calculatedMinimumDeposit) + ' to register for this event.');
      }

      if($scope.currentPayment.amount > $scope.currentRegistration.remainingBalance) {
        $scope.currentPayment.errors.push('You are paying more than the total due of ' + $filter('moneyFormat')(registration.remainingBalance) + ' to register for this event.');
      }
      if ($scope.currentPayment.amount === 0 || !$scope.anyPaymentMethodAccepted()) {
        setRegistrationAsCompleted();
        return;
      }

      if (!_.isEmpty($scope.currentPayment.errors)) {
        $modal.open({
          templateUrl: 'views/modals/errorModal.html',
          controller: 'genericModal',
          resolve: {
            data: function () {
              return $scope.currentPayment.errors;
            }
          }
        });
        $scope.submittingRegistration = false;
        return;
      }

      if($scope.currentPayment.paymentType === 'CHECK'){
        if(!$scope.currentRegistration.completed){
          setRegistrationAsCompleted();
        }else{
          $scope.submittingRegistration = false;
        }
        return;
      }

      var currentPayment = angular.copy($scope.currentPayment);
      currentPayment.readyToProcess = true;
      currentPayment.registrationId =  registration.id;
      delete currentPayment.errors;

      $http.post('payments/', currentPayment).success(function () {
        delete $scope.currentPayment;
        if(!$scope.currentRegistration.completed) {
          setRegistrationAsCompleted();
        } else {
          window.scrollTo(0, 0);
          $route.reload();
        }
      }).error(function (data, status, headers) {
        $scope.submittingRegistration = false;
        $modal.open({
          templateUrl: 'views/modals/errorModal.html',
          controller: 'genericModal',
          backdrop: 'static',
          keyboard: false,
          resolve: {
            data: function () {
              return headers('X-Payment-Client-Error-Message');
            }
          }
        });
      });
    };

    var setRegistrationAsCompleted = function() {
      window.scrollTo(0, 0);
      registration.completed = true;

      RegistrationCache.update('registrations/' + registration.id, registration, function () {
        RegistrationCache.emptyCache();
        $route.reload();
      }, function () {
        $scope.currentRegistration.completed = false;
        $scope.submittingRegistration = false;
        alert('An error occurred while submitting your registration.');
      });
    };

    $scope.editRegistrant = function (id) {
        $location.path('/' + ($rootScope.registerMode || 'register') + '/' + conference.id + '/page/' + conference.registrationPages[0].id).search('reg', id);
    };

    $scope.removeRegistrant = function (id) {
      _.remove($scope.currentRegistration.registrants, function(r) { return r.id === id; });
      RegistrationCache.update('registrations/' + $scope.currentRegistration.id, $scope.currentRegistration, function() {
        $route.reload();
      });
    };

    $scope.getRegistrantType = function(id){
      return _.find(conference.registrantTypes, { 'id': id });
    };

    $scope.isBlockInvalid = function(rId, bId){
      return _.contains($scope.regValidate[rId], bId);
    };

    $scope.allRegistrantsValid = function(){
      var returnVal = true;
      angular.forEach(registration.registrants, function (r) {
        if (angular.isUndefined($scope.regValidate[r.id])) {
          returnVal = false;
        }else{
          if($scope.regValidate[r.id].length){
            returnVal = false;
          }
        }
      });
      return returnVal;
    };

    $scope.registrantName = function(r) {
      var nameBlock = _.find(_.flatten(conference.registrationPages, 'blocks'), { 'profileType': 'NAME' }).id;
      var registrant = _.find(registration.registrants, { 'id': r.id });
      var returnStr;
      nameBlock = _.find(registrant.answers, { 'blockId': nameBlock });

      if(angular.isDefined((nameBlock))){
        nameBlock = nameBlock.value;
        if(angular.isDefined((nameBlock.firstName))){
          returnStr = nameBlock.firstName + ' ' + (nameBlock.lastName || '');
        }
      }

      return returnStr || _.find(conference.registrantTypes, { 'id': r.registrantTypeId }).name;
    };

    $scope.blockInRegType = function(block, regTypeId){
      return !_.contains(block.registrantTypes, regTypeId);
    };

    $scope.anyPaymentMethodAccepted = function(){
      return conference.acceptCreditCards || conference.acceptChecks || conference.acceptTransfers || conference.acceptScholarships;
    };

    $scope.registrantDeletable = function(r){
      var groupRegistrants = 0, noGroupRegistrants = 0;
      angular.forEach(registration.registrants, function(r){
        var regType = _.find(conference.registrantTypes, { 'id': r.registrantTypeId });
        if(regType.allowGroupRegistrations){
          groupRegistrants++;
        }else{
          noGroupRegistrants++;
        }
      });

      var regType = _.find(conference.registrantTypes, { 'id': r.registrantTypeId });
      if(regType.allowGroupRegistrations && groupRegistrants === 1 && noGroupRegistrants){
        return false;
      }
      return true;
    };
  });
