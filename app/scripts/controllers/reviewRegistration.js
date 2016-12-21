'use strict';

angular.module('confRegistrationWebApp')
  .controller('ReviewRegistrationCtrl', function ($scope, $rootScope, $location, $route, $window, modalMessage, $http, currentRegistration, conference, error, spouse, registration, validateRegistrant, gettextCatalog) {
    $rootScope.globalPage = {
      type: 'registration',
      mainClass: 'container front-form',
      bodyClass: 'user-registration',
      conference: conference,
      confId: conference.id,
      footer: false
    };

    if(_.isEmpty(currentRegistration.registrants) && !currentRegistration.completed) {
      $location.path('/' + ($rootScope.registerMode || 'register') + '/' + conference.id + '/page/');
    }

    $scope.conference = conference;
    $scope.currentRegistration = currentRegistration;
    $scope.blocks = [];
    $scope.regValidate = [];

    //check if group registration is allowed based on registrants already in registration
    if(!_.isEmpty(currentRegistration.registrants)){
      $scope.allowGroupRegistration = false;
      angular.forEach(currentRegistration.registrants, function(r){
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
        amount: currentRegistration.remainingBalance,
        paymentType: paymentType
      };
    }

    angular.forEach(_.flatten(conference.registrationPages, 'blocks'), function (block) {
      if (block.type.indexOf('Content') === -1) {
        $scope.blocks.push(block);
      }
    });

    angular.forEach(currentRegistration.registrants, function (r) {
      $scope.regValidate[r.id] = validateRegistrant.validate(conference, r);
    });

    $scope.findAnswer = function (blockId) {
      return _.find($scope.answers, {blockId: blockId});
    };

    $scope.getBlock = function (blockId) {
      return _.find($scope.blocks, {id: blockId});
    };

    $scope.getConfirmButtonName = function () {
      if (currentRegistration.completed || !$scope.spouseRegistration) {
        return gettextCatalog.getString('Confirm');
      } else {
        return gettextCatalog.getString('one of the Register buttons');
      }
    };

    // Return a boolean indicating whether the register button(s) should be disabled
    $scope.registerDisabled = function () {
      return $scope.registerMode === 'preview' || !$scope.allRegistrantsValid() || $scope.submittingRegistration;
    };

    // Display an error that occurred during registration completion
    function handleRegistrationError (error) {
      modalMessage.error({
        'message': error.message || 'An error occurred while attempting to complete your registration.',
        'forceAction': true
      });
      throw error;
    }

    // Navigate to the correct page after completing a registration
    function navigateToPostRegistrationPage () {
      if (conference.registrationCompleteRedirect) {
        $window.location.href = conference.registrationCompleteRedirect;
      } else {
        $route.reload();
      }
    }

    // Called when the user clicks the confirm button
    $scope.confirmRegistration = function () {
      $scope.submittingRegistration = true;
      registration.submitPayment($scope.currentPayment, currentRegistration, $scope.acceptedPaymentMethods()).then(function() {
        return registration.completeRegistration(currentRegistration);
      }).then(function () {
        navigateToPostRegistrationPage();

        $scope.submittingRegistration = false;
      }).catch(function (error) {
        handleRegistrationError(error);

        $scope.submittingRegistration = false;
      });
    };

    $scope.editRegistrant = function (id) {
      $location.path('/' + ($rootScope.registerMode || 'register') + '/' + conference.id + '/page/' + conference.registrationPages[0].id).search('reg', id);
    };

    $scope.removeRegistrant = function (id) {
      modalMessage.confirm({
        'title': 'Delete registrant?',
        'question': 'Are you sure you want to delete this registrant?'
      }).then(function(){
        $http({
          method: 'DELETE',
          url: 'registrants/' + id
        }).success(function () {
          $route.reload();
        }).error(function(data){
          modalMessage.error({
            'message': data.error ? data.error.message : 'An error occurred while removing registrant.'
          });
        });
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
      angular.forEach(currentRegistration.registrants, function (r) {
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

    $scope.blockVisibleForRegistrant = function(block, registrant){
      return validateRegistrant.blockVisible(block, registrant);
    };

    $scope.acceptedPaymentMethods = function(){
      var regTypesInRegistration =  _.uniq(_.pluck(currentRegistration.registrants, 'registrantTypeId')).map(function(registrantTypeId) {
        return $scope.getRegistrantType(registrantTypeId);
      });

      var paymentMethods = {
        acceptCreditCards: _.some(regTypesInRegistration, 'acceptCreditCards'),
        acceptChecks:_.some(regTypesInRegistration, 'acceptChecks'),
        acceptTransfers: _.some(regTypesInRegistration, 'acceptTransfers'),
        acceptScholarships: _.some(regTypesInRegistration, 'acceptScholarships'),
        acceptPayOnSite: _.some(regTypesInRegistration, 'acceptPayOnSite') && !currentRegistration.completed
      };
      return !_.some(paymentMethods) ? false : paymentMethods;
    };

    $scope.registrantDeletable = function(r){
      if(currentRegistration.completed){
        return false;
      }
      var groupRegistrants = 0, noGroupRegistrants = 0;
      angular.forEach(currentRegistration.registrants, function(r){
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

    $scope.validatePromo = function(inputCode){
      $scope.addingPromoCode = true;
      $http.post('registrations/' + currentRegistration.id + '/promotions', {code: inputCode}).success(function () {
        $route.reload();
      }).error(function (data, status) {
        $scope.addingPromoCode = false;
        var msg = data.error ? data.error.message : 'An error has occurred.';
        modalMessage.error({
          'message': status === 404 ? 'The promo code you have entered is invalid or does not apply to your registration.' : msg,
          'title': 'Invalid Code',
          'forceAction': true
        });
      });
    };

    $scope.deletePromotion = function (promoId) {
      modalMessage.confirm({
        'title': 'Delete Promotion',
        'question': 'Are you sure you want to delete this promotion?'
      }).then(function(){
        var regCopy = angular.copy(currentRegistration);
        _.remove(regCopy.promotions, {id: promoId});
        $http.put('registrations/' + currentRegistration.id, regCopy).success(function () {
          $route.reload();
        }).error(function (data) {
          modalMessage.error(data.error ? data.error.message : 'An error occurred while deleting promotion.');
        });
      });
    };

    $scope.hasPendingPayments = function(payments){
      return _.some(payments, { status: 'REQUESTED' }) || _.some(payments, { status: 'PENDING' });
    };

    $scope.hasPendingCheckPayment = function(payments){
      return _.some(payments, { paymentType: 'CHECK', status: 'PENDING' });
    };

    spouse.getSpouseRegistration(conference.id).then(function (spouseRegistration) {
      // The spouse is registered
      $scope.spouseRegistration = spouseRegistration;

      // Check whether the current user is registered on their spouse's registration
      $scope.alreadyRegistered = spouseRegistration ? registration.overlapsRegistration(currentRegistration, spouseRegistration) : false;
    });

    // Called when the user clicks the register together button
    $scope.mergeAndConfirmRegistration = function () {
      // Pay for the spouse's registration before merging it with the spouse
      $scope.submittingRegistration = true;

      // merge registration prior to submitting payment to ensure payment can be validated in the context of the merge
      registration.mergeWithSpouse(currentRegistration, $scope.spouseRegistration).then(function () {
        // Reload the merged spouse registration
        return registration.load($scope.spouseRegistration.id);
      }).then(function (mergedRegistration) {
        return registration.submitPayment($scope.currentPayment, mergedRegistration, $scope.acceptedPaymentMethods());
      }).then(function () {
        // Reload the merged spouse registration
        return registration.load($scope.spouseRegistration.id);
      }).then(function (mergedRegistration) {
        // Update the UI to show the merged registration because it includes all of the registrants
        $scope.currentRegistration = currentRegistration = mergedRegistration;

        // Hide certain elements and sections in the UI because the current user is not able make changes to their
        // spouse's registration, even though they are now a registrant on that registration
        $scope.mergedRegistration = true;

        $scope.submittingRegistration = false;
      }).catch(function (error) {
        handleRegistrationError(error);

        $scope.submittingRegistration = false;
      });
    };
  });
