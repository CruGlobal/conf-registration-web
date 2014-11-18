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

    if(registration.registrants.length === 0) {
      $location.path('/' + ($rootScope.registerMode || 'register') + '/' + conference.id + '/page/');
    }

    $scope.conference = conference;
    $scope.currentRegistration = registration;
    $scope.blocks = [];
    $scope.regValidate = [];

    if (angular.isUndefined($rootScope.currentPayment)) {
      var paymentType;
      if(conference.acceptCreditCards){
        paymentType = 'CREDIT_CARD';
      }else if(conference.acceptTransfers){
        paymentType = 'TRANSFER';
      }

      $rootScope.currentPayment = {
        amount: 0,
        paymentType: paymentType,
        creditCard: {},
        transfer: {}
      };
    }
    $rootScope.currentPayment.amount = registration.calculatedTotalDue;

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

    $scope.confirmRegistration = function () {
      $scope.submittingRegistration = true;
      var errorMsg;

      if ($rootScope.currentPayment.amount < registration.calculatedMinimumDeposit) {
        errorMsg = 'You are required to pay at least the minimum deposit of ' + $filter('moneyFormat')(registration.calculatedMinimumDeposit) + ' to register for this event.';
      }

      if ($rootScope.currentPayment.amount === 0 || !$scope.anyPaymentMethodAccepted()) {
        setRegistrationAsCompleted();
        return;
      }


      if($scope.currentPayment.paymentType === 'TRANSFER'){
        if(!$scope.currentPayment.transfer.source){
          errorMsg = 'Please enter a Chart Field or Account Number.';
        }
      }
      if (errorMsg) {
        $modal.open({
          templateUrl: 'views/modals/errorModal.html',
          controller: 'genericModal',
          resolve: {
            data: function () {
              return errorMsg;
            }
          }
        });
        $scope.submittingRegistration = false;
        return;
      }

      var currentPayment = angular.copy($rootScope.currentPayment);
      currentPayment.readyToProcess = true;
      currentPayment.registrationId =  registration.id;

      $http.post('payments/', currentPayment).success(function () {
        delete $rootScope.currentPayment;
        setRegistrationAsCompleted();
      }).error(function () {
        $scope.submittingRegistration = false;
        $modal.open({
          templateUrl: 'views/modals/errorModal.html',
          controller: 'genericModal',
          backdrop: 'static',
          keyboard: false,
          resolve: {
            data: function () {
              return 'Your payment was declined, please verify your details or use a different payment method.';
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
      return conference.acceptCreditCards || conference.acceptTransfers;
    };
  });
