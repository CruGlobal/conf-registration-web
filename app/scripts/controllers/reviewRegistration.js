'use strict';

angular.module('confRegistrationWebApp')
  .controller('ReviewRegistrationCtrl', function ($cacheFactory, $scope, $rootScope, $location, $route, $window, modalMessage, $q, $http, registration, conference, spouse, RegistrationCache, validateRegistrant, gettextCatalog, $filter, uuid) {
    $rootScope.globalPage = {
      type: 'registration',
      mainClass: 'container front-form',
      bodyClass: 'user-registration',
      conference: conference,
      confId: conference.id,
      footer: false
    };

    if(_.isEmpty(registration.registrants) && !registration.completed) {
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
        paymentType: paymentType
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

    $scope.getConfirmButtonName = function () {
      if ($scope.currentRegistration.completed || !$scope.spouseRegistration) {
        return gettextCatalog.getString('Confirm');
      } else {
        return gettextCatalog.getString('one of the Register buttons');
      }
    };

    // Return a boolean indicating whether the register button(s) should be disabled
    $scope.registerDisabled = function () {
      return $scope.registerMode === 'preview' || !$scope.allRegistrantsValid() || $scope.submittingRegistration;
    };

    // Generate a promise catch handler that generates an Error object from an HTTP response object
    function errorFromResponse (defaultErrorMessage) {
      return function (res) {
        // Extract the error from the payload
        var error = res.data && res.data.error;

        // Use the error message if present or the provided default message otherwise
        throw new Error(error ? error.message : defaultErrorMessage);
      };
    }

    // Validate the current payment and return a boolean indicating whether or not it is valid
    function validatePayment () {
      /*
      If the totalPaid (previously) AND the amount of this payment are less than the minimum required deposit, then
      show and error message. The first payment must be at least the minimum deposit amount. Subsequent payments can be
      less than the amount. This is confirmed by making sure the total previously paid is above the min deposit amount.
      */

      if ($scope.currentRegistration.pastPayments.length === 0 && Number($scope.currentPayment.amount) < $scope.currentRegistration.calculatedMinimumDeposit) {
        $scope.currentPayment.errors.push('You are required to pay at least the minimum deposit of ' + $filter('currency')(registration.calculatedMinimumDeposit, '$') + ' to register for this event.');
      }

      if(Number($scope.currentPayment.amount) > $scope.currentRegistration.remainingBalance) {
        $scope.currentPayment.errors.push('You are paying more than the total due of ' + $filter('currency')(registration.remainingBalance, '$') + ' to register for this event.');
      }

      // The payment is valid if it has no errors
      return _.isEmpty($scope.currentPayment.errors);
    }

    // Modify a credit card payment to use a tokenized credit card instead of real credit card data
    function tokenizeCreditCardPayment (payment) {
      return $http.get('payments/ccp-client-encryption-key').then(function (res) {
        var ccpClientEncryptionKey = res.data;
        ccp.initialize(ccpClientEncryptionKey);
        payment.creditCard.lastFourDigits = ccp.getAbbreviatedNumber(payment.creditCard.number);
        payment.creditCard.number = ccp.encrypt(payment.creditCard.number);
        payment.creditCard.cvvNumber = ccp.encrypt(payment.creditCard.cvvNumber);
      }).catch(errorFromResponse('An error occurred while requesting the ccp encryption key. Please try your payment again.'));
    }

    // Submit payment for the current registration
    function payPayment () {
      if (Number($scope.currentPayment.amount) === 0 || !$scope.acceptedPaymentMethods() ||
          $scope.currentPayment.paymentType === 'PAY_ON_SITE') {
        // No payment is necessary, so no work needs to be done here
        return $q.when();
      }

      // Prepare the payment object
      var currentPayment = angular.copy($scope.currentPayment);
      currentPayment.registrationId = registration.id;
      delete currentPayment.errors;

      return $q.when().then(function () {
        if (currentPayment.paymentType === 'CREDIT_CARD') {
          // Credit card payments must be tokenized first
          return tokenizeCreditCardPayment(currentPayment);
        }
      }).then(function () {
        // Submit the payment
        return $http.post('payments/', currentPayment);
      }).catch(errorFromResponse('An error occurred while attempting to process your payment.'));
    }

    // Mark the current registration as completed
    function completeRegistration () {
      return $q(function (resolve, reject) {
        var registration = angular.copy($scope.currentRegistration);

        if (registration.completed) {
          // The registration is already completed, so nothing needs to be done
          resolve();
          return;
        }

        registration.completed = true;
        RegistrationCache.update('registrations/' + registration.id, registration, function () {
          RegistrationCache.emptyCache();
          resolve();
        }, function (data) {
          $scope.currentRegistration.completed = false;
          reject(data);
        });
      }).catch(errorFromResponse('An error occurred while submitting your registration.'));
    }

    // Display an error that occurred during registration completion
    function handleRegistrationError (error) {
      modalMessage.error({
        'message': error.message || 'An error occurred while attempting to complete your registration.',
        'forceAction': true
      });
      throw error;
    }

    // Finalize the current registration, which includes submitting payment if necessary and marking it as completed
    function confirmRegistration () {
      if (!validatePayment()) {
        modalMessage.error({
          'title': 'Please correct the following errors:',
          'message': $scope.currentPayment.errors
        });
        return $q.reject();
      }

      return payPayment().then(function () {
        return completeRegistration();
      });
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
      confirmRegistration().catch(handleRegistrationError).then(function () {
        navigateToPostRegistrationPage();
        $scope.submittingRegistration = false;
      }).catch(function () {
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

    $scope.blockVisibleForRegistrant = function(block, registrant){
      return validateRegistrant.blockVisible(block, registrant);
    };

    $scope.acceptedPaymentMethods = function(){
      var regTypesInRegistration = [];
      angular.forEach(_.uniq(_.pluck(registration.registrants, 'registrantTypeId')), function(registrantTypeId) {
        regTypesInRegistration.push($scope.getRegistrantType(registrantTypeId));
      });

      var paymentMethods = {
        acceptCreditCards: _.some(regTypesInRegistration, 'acceptCreditCards'),
        acceptChecks:_.some(regTypesInRegistration, 'acceptChecks'),
        acceptTransfers: _.some(regTypesInRegistration, 'acceptTransfers'),
        acceptScholarships: _.some(regTypesInRegistration, 'acceptScholarships'),
        acceptPayOnSite: _.some(regTypesInRegistration, 'acceptPayOnSite') && !registration.completed
      };
      return (!_.some(paymentMethods) ? false : paymentMethods);
    };

    $scope.registrantDeletable = function(r){
      if(registration.completed){
        return false;
      }
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

    $scope.validatePromo = function(inputCode){
      $scope.addingPromoCode = true;
      $http.post('registrations/' + registration.id + '/promotions', {code: inputCode}).success(function () {
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
        var regCopy = angular.copy($scope.currentRegistration);
        _.remove(regCopy.promotions, {id: promoId});
        $http.put('registrations/' + registration.id, regCopy).success(function () {
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

    ////// START EVENT-433 //////
    spouse.getSpouseRegistration(conference.id).then(function (spouseRegistration) {
      // The spouse is registered
      $scope.spouseRegistration = spouseRegistration;

      // Check whether the current user is registered on their spouse's registration
      $scope.alreadyRegistered = $scope.spouseRegistration && !_.isEmpty(_.intersection(
        _.map($scope.currentRegistration.registrants, 'email'),
        _.map($scope.spouseRegistration.registrants, 'email')
      ));
    });

    // Load a registration from the server
    // Returns a promise the resolves to the registration once it has been loaded
    function loadRegistration (registrationId) {
      return $http.get('/registrations/' + registrationId).then(function (res) {
        return res.data;
      });
    }

    // Create a new registration on the server
    // Returns a promise the resolves when the registration has been created
    function createRegistration (registration) {
      return $http.put('/registrations/' + registration.id, registration);
    }

    // Delete a registration on the server
    function deleteRegistration (registration) {
      return $http.delete('/registrations/' + registration.id);
    }

    // Create a new registrant on the server
    // Returns a promise the resolves when the registrant has been created
    function createRegistrant (registrant) {
      return $http.put('/registrants/' + registrant.id, registrant);
    }

    // Take the current registration and merge it into the spouse's registration
    function mergeWithSpouse () {
      // Generate an array of new registrants that include all attributes
      var newRegistrants = $scope.currentRegistration.registrants.map(function (registrant) {
        var newRegistrantId = uuid();

        // Make a copy of the answers, but overwrite the id and registrantId attributes
        var answers = registrant.answers.map(function(answer) {
          return _.assign({}, answer, {
            id: uuid(),
            registrantId: newRegistrantId
          });
        });

        return {
          id: newRegistrantId,
          registrationId: $scope.spouseRegistration.id,
          registrantTypeId: registrant.registrantTypeId,
          answers: answers,
          firstName: registrant.firstName,
          lastName: registrant.lastName,
          email: registrant.email
        };
      });

      //Payload for new spouse registration
      var newSpouseRegistration = {
        id: $scope.spouseRegistration.id,
        conferenceId: $scope.currentRegistration.conferenceId,
        registrants: newRegistrants.map(function (registrant) {
          // When creating a new registration, only a few registrant attributes are required, so only keep a few of the
          // registrant attributes
          var sparseRegistrant = _.pick(registrant, ['id', 'registrationId', 'registrantTypeId']);
          sparseRegistrant.answers = [];
          return sparseRegistrant;
        })
      };

      //Add new registration
      return createRegistration(newSpouseRegistration)
        .then(function () {
          //Add registrants to new registration
          // Advance to the next step after all the registrations have been created
          return $q.all(newRegistrants.map(createRegistrant));
        }).then(function () {
          //Delete existing registration
          return deleteRegistration($scope.currentRegistration);
        }).then(function () {
          // Reload the merged spouse registration
          return loadRegistration($scope.spouseRegistration.id);
        }).then(function (mergedRegistration) {
          // Update the UI to show the merged registration because it includes all of the registrants
          $scope.currentRegistration = mergedRegistration;

          // Hide certain elements and sections in the UI because the current user is not able make changes to their
          // spouses registration, even though they are now a registrant on that registration
          $scope.mergedRegistration = true;
        }).catch(errorFromResponse('An error occurred while merging spouse registrations.'));
    }

    // Called when the user clicks the register together button
    $scope.mergeAndConfirmRegistration = function () {
      // Complete the current registration before merging it with the spouse
      $scope.submittingRegistration = true;
      confirmRegistration().then(function () {
        return mergeWithSpouse();
      }).catch(handleRegistrationError).then(function() {
        $scope.submittingRegistration = false;
      }).catch(function () {
        $scope.submittingRegistration = false;
      });
    };

    ////// END EVENT-433 //////

  });
