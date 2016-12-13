'use strict';

angular.module('confRegistrationWebApp')
  .controller('ReviewRegistrationCtrl', function ($cacheFactory, $scope, $rootScope, $location, $route, $window, modalMessage, $q, $http, registration, conference, RegistrationCache, validateRegistrant, $filter, uuid) {
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

    $scope.confirmRegistration = function () {
      $scope.submittingRegistration = true;

      /*if the totalPaid (previously) AND the amount of this payment are less than the minimum required deposit, then
       show and error message. the first payment must be at least the minimum deposit amount.  subsequent payments
       can be less than the amount.  this is confirmed by making sure the total previously paid is above the min deposit amount.
       */
      if ($scope.currentRegistration.pastPayments.length === 0 && Number($scope.currentPayment.amount) < $scope.currentRegistration.calculatedMinimumDeposit) {
        $scope.currentPayment.errors.push('You are required to pay at least the minimum deposit of ' + $filter('currency')(registration.calculatedMinimumDeposit, '$') + ' to register for this event.');
      }

      if(Number($scope.currentPayment.amount) > $scope.currentRegistration.remainingBalance) {
        $scope.currentPayment.errors.push('You are paying more than the total due of ' + $filter('currency')(registration.remainingBalance, '$') + ' to register for this event.');
      }
      if (Number($scope.currentPayment.amount) === 0 || !$scope.acceptedPaymentMethods()) {
        setRegistrationAsCompleted();
        return;
      }

      if (!_.isEmpty($scope.currentPayment.errors)) {
        modalMessage.error({
          'title': 'Please correct the following errors:',
          'message': $scope.currentPayment.errors
        });
        $scope.submittingRegistration = false;
        return;
      }

      if($scope.currentPayment.paymentType === 'PAY_ON_SITE'){
        if(!$scope.currentRegistration.completed){
          setRegistrationAsCompleted();
        }else{
          $scope.submittingRegistration = false;
        }

        return;
      }

      var currentPayment = angular.copy($scope.currentPayment);
      currentPayment.registrationId =  registration.id;
      delete currentPayment.errors;
      if(currentPayment.paymentType === 'CREDIT_CARD'){
        $http.get('payments/ccp-client-encryption-key').success(function(ccpClientEncryptionKey) {
          ccp.initialize(ccpClientEncryptionKey);
          currentPayment.creditCard.lastFourDigits = ccp.getAbbreviatedNumber(currentPayment.creditCard.number);
          currentPayment.creditCard.number = ccp.encrypt(currentPayment.creditCard.number);
          currentPayment.creditCard.cvvNumber = ccp.encrypt(currentPayment.creditCard.cvvNumber);
          postPayment(currentPayment);
        }).error(function() {
          modalMessage.error('An error occurred while requesting the ccp encryption key. Please try your payment again.');
        });
      }else{
        postPayment(currentPayment);
      }
    };

    var postPayment = function(currentPayment){ // jshint ignore:line
      $http.post('payments/', currentPayment).success(function () {
        delete $scope.currentPayment;
        if(!$scope.currentRegistration.completed) {
          setRegistrationAsCompleted();
        } else {
          $route.reload();
        }
      }).error(function (data) {
        $scope.submittingRegistration = false;
        modalMessage.error({
          'message': data.error ? data.error.message : 'An error occurred while attempting to process your payment.',
          'forceAction': true
        });
      });
    };

    var setRegistrationAsCompleted = function() { // jshint ignore:line
      registration = angular.copy(registration);
      registration.completed = true;
      RegistrationCache.update('registrations/' + registration.id, registration, function () {
      RegistrationCache.emptyCache();
      if(conference.registrationCompleteRedirect){
        $window.location.href = conference.registrationCompleteRedirect;
      }else{
        $route.reload();
      }
    }, function (data) {
      $scope.currentRegistration.completed = false;
      $scope.submittingRegistration = false;
      modalMessage.error(data.error ? data.error.message : 'An error occurred while submitting your registration.');
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

    // Get spouse registration
    // End point:  getSpouseRegistration = /conferences/conferenceId/registrations/spouse
    ///// TEST DATA change end point url below to: /conferences/conferenceId/registrations/current /////
    $http.get('conferences/' + conference.id + '/registrations/current')
      .then(function(response) {
        if (response.status === 200) {
          // The spouse is registered
          $scope.spouseRegistration = response.data;

          // Check whether the current user is registered on their spouse's registration
          $scope.alreadyRegistered = !_.isEmpty(_.intersection(
            _.map($scope.currentRegistration.registrants, 'email'),
            _.map($scope.spouseRegistration.registrants, 'email')
          ));
        }
        else {
          // The spouse is not registered
          // Reject the promise and call the catch() handler
          throw response;
        }
      }).catch(function(response) {
        $scope.spouseRegistration = null;
        $scope.alreadyRegistered = false;
        console.log('No current and/or spouse registration found for user with ID. Status = ' + response.status);
        console.log(response.data);
      });

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
    $scope.mergeWithSpouse = function () {
      //Generate new local UUID used for registrantId
      var newRegistrantId = uuid();

      // When creating a new registration, only a few registrant attributes are required
      // Generate an array of "sparse" registrants that only include those required attributes
      var newRegistrantsSparse = $scope.currentRegistration.registrants.map(function (registrant) {
        return {
          id: uuid(),
          registrationId: $scope.spouseRegistration.id,
          registrantTypeId: registrant.registrantTypeId,
          answers: []
        }
      });

      // Generate an array of new registrants that include all attributes
      var newRegistrantsFull = $scope.currentRegistration.registrants.map(function (registrant, index) {
        var newRegistrantId = newRegistrantsSparse[index].id;

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
        registrants: newRegistrantsSparse
      };

      //Add new registration
      createRegistration(newSpouseRegistration)
        .then(function () {
          $scope.spouseRegistration.registrants = $scope.spouseRegistration.registrants.concat(newRegistrantsFull);

          //Add registrants to new registration
          // Advance to the next step after all the registrations have been created
          return $q.all(newRegistrantsFull.map(createRegistrant));
        }).then(function () {
          //Delete existing registration
          return deleteRegistration($scope.currentRegistration);
        }).then(function () {
          $scope.currentRegistration = $scope.spouseRegistration;
        }).catch(function (response) {
          console.log('Add registration failed.  Status = ' + response.status + '.  Error Message = ' + response.data.error.message);
          alert('An error occurred while adding new spouse registration.');
        });
    };

    ////// END EVENT-433 //////

  });
