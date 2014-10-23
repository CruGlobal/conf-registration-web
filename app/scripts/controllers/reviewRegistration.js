'use strict';

angular.module('confRegistrationWebApp')
  .controller('ReviewRegistrationCtrl', function ($scope, $rootScope, $location, $route, $modal, $http, registration, conference, RegistrationCache, validateRegistrant) {
    $rootScope.globalPage = {
      type: 'registration',
      mainClass: 'container front-form',
      bodyClass: 'frontend',
      title: conference.name,
      confId: conference.id,
      footer: false
    };
    $scope.currentYear = new Date().getFullYear();

    if(registration.registrants.length === 0) {
      $location.path('/' + ($rootScope.registerMode || 'register') + '/' + conference.id + '/page/');
    }

    $scope.conference = conference;
    $scope.currentRegistration = registration;
    $scope.blocks = [];
    $scope.regValidate = [];

    if (angular.isUndefined($rootScope.currentPayment)) {
      $rootScope.currentPayment = {
        amount: 0,
        creditCard: []
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
      if ($rootScope.currentPayment.amount === 0 || !conference.acceptCreditCards) {
        setRegistrationAsCompleted();
        return;
      }

      var currentPayment = angular.copy($rootScope.currentPayment);
      currentPayment.paymentType = 'CREDIT_CARD';
      currentPayment.readyToProcess = true;
      currentPayment.registrationId =  registration.id;

      $http.post('payments/', currentPayment).success(function () {
        setRegistrationAsCompleted();
        delete $rootScope.currentPayment;
      }).error(function () {
        $scope.submittingRegistration = false;
        $modal.open({
          templateUrl: 'views/modals/errorModal.html',
          controller: 'genericModal',
          backdrop: 'static',
          keyboard: false,
          resolve: {
            data: function () {
              return 'Your card was declined, please verify your details or use a different card.';
            }
          }
        });
      });
    };

    var setRegistrationAsCompleted = function() {
      window.scrollTo(0, 0);
      registration.completed = true;

      RegistrationCache.update('registrations/' + registration.id, registration, function () {
        $scope.currentRegistration.completed = true;
        RegistrationCache.emptyCache();
        $scope.submittingRegistration = false;
      }, function () {
        $scope.currentRegistration.completed = false;
        alert('An error occurred while submitting your registration.');
        $scope.submittingRegistration = false;
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
  });
