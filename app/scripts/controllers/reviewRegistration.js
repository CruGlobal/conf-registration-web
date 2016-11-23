'use strict';

angular.module('confRegistrationWebApp')
  .controller('ReviewRegistrationCtrl', function ($cacheFactory, $scope, $rootScope, $location, $route, $window, modalMessage, $http, registration, conference, RegistrationCache, validateRegistrant, $filter, uuid) {
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
          $scope.spouseRegistration = response.data;
          $scope.spouseSectionVisible = true;

          //Check if spouse is registered and display 'Spouse Registration' section if needed.
          var _spouseSectionVisible = sessionStorage.getItem('spouseSectionVisible');
          $scope.spouseIncludedOnCurrentRegistration = !_.isEmpty(_.intersection(_.map($scope.currentRegistration.registrants, 'email'), _.map($scope.spouseRegistration.registrants, 'email')));

          // 2. If the registrant does have a spouse who has already registered, then
          if ($scope.spouseRegistration !== null) {
            // A. If spouse is not included in that registration, then show another separate panel on the confirmation page,
            //    indicating that their spouse has already registered and would they like to add their registration to their spouses?
            //    . Call endpoint to copy registrant from one registration to another
            //    . (possibly) Call updateRegistration
            if ($scope.spouseIncludedOnCurrentRegistration && !_spouseSectionVisible) {
              $scope.spouseSectionVisible = true;
            }
            // B. Otherwise, indicate that they have already been included on their spouses registration. And possibly let them register anyway if they must.
            else {
              $scope.spouseSectionVisible = false;
            }
          }

          ///// TEST DATA START /////

          $scope.spouseRegistration.completed = true;
          $scope.spouseRegistration.registrants[0].email = 'janeworner3@hotmail.com';
          $scope.spouseRegistration.registrants[0].firstName = 'Jane';
          $scope.spouseRegistration.registrants[0].lastName = 'Worner3';

          var queryParameters = {
            block: [],
            //page: 1,
            //limit: 20,
            orderBy: 'last_name',
            order: 'ASC',
            filter: '',
            filterPayment: '',
            filterRegType: '',
            includeCheckedin: 'yes',
            includeWithdrawn: 'yes',
            includeIncomplete: 'yes'
          };

          $http.get('conferences/' + conference.id + '/registrations', {params: queryParameters})
            .then(function (response) {
              var _spouseNull = {};
              _.forEach(response.data.registrations, function(value, key) {
                if (value.registrants[0].email === $scope.spouseRegistration.registrants[0].email) {
                  $scope.spouseRegistration = response.data.registrations[key];
                  $scope.spouseSectionVisible = true;
                  $scope.spouseIncludedOnCurrentRegistration = true;
                  _spouseNull = $scope.spouseRegistration;
                }
                else {
                  _spouseNull = null;
                  $scope.spouseSectionVisible = false;
                  $scope.spouseIncludedOnCurrentRegistration = false;
                }
              });
              $scope.spouseRegistration = _spouseNull;
            }).catch(function(response){
            $scope.spouseRegistration = null;
            $scope.spouseSectionVisible = false;
            $scope.spouseIncludedOnCurrentRegistration = false;
            console.log('Failed to get all registered users for current conference. Status = ' + response.status);
          });

          ///// TEST DATA END ////

        }
        else {
          $scope.spouseRegistration = null;
          $scope.spouseSectionVisible = false;
          $scope.spouseIncludedOnCurrentRegistration = false;
          console.log('No current and/or spouse registration found for user with ID.');
        }
      }).catch(function(response) {
      $scope.spouseRegistration = null;
      $scope.spouseSectionVisible = false;
      $scope.spouseIncludedOnCurrentRegistration = false;
      console.log('No current and/or spouse registration found for user with ID. Status = ' + response.status);
      console.log(response.data);
      });

    //Click event for 'Include Spouse' button
    $scope.includeSpouseInRegistration = function () {

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

      //Generate new local UUID used for registrantId
      var _newRegistrantId = uuid();

      //Payload for new spouse registration
      var _newSpouseRegistration =
        {
          id: $scope.spouseRegistration.id,
          conferenceId: $scope.currentRegistration.conferenceId,
          registrants: [{
            id: _newRegistrantId,
            registrationId: $scope.spouseRegistration.id,
            registrantTypeId: $scope.currentRegistration.registrants[0].registrantTypeId,
            answers: []
          }]
        };

      //Get all answers
      var _answers = $scope.currentRegistration.registrants[0].answers.map(function(answer) {
        return _.assign({}, answer, {
          id: uuid(),
          registrantId: _newRegistrantId
        });
      });

      //Payload to add new registrants
      var _newRegistrants =
        {
          id: _newRegistrantId,
          registrationId: $scope.spouseRegistration.id,
          registrantTypeId: $scope.currentRegistration.registrants[0].registrantTypeId,
          answers: _answers,
          firstName: $scope.currentRegistration.registrants[0].firstName,
          lastName: $scope.currentRegistration.registrants[0].lastName,
          email: $scope.currentRegistration.registrants[0].email
        };

      //Add new registration
      //@Path("/registrations/{registrationId}")
      $http.put('/registrations/' + $scope.spouseRegistration.id, _newSpouseRegistration)
        .then(function () {
          $scope.spouseRegistration.registrants.push(_newRegistrants);
          //Add registrants to new registration
          //@Path("/registrants/{registrantId}")
          return $http.put('/registrants/' + _newRegistrantId, _newRegistrants);
        }).then(function () {
        //Delete existing registration
        //@Path("/registrations/{registrationId}")
        return $http.delete('/registrations/' + $scope.currentRegistration.id);
      }).then(function () {
        $scope.currentRegistration = $scope.spouseRegistration;

        $scope.currentRegistration.completed = true;
        registration = angular.copy($scope.currentRegistration);

        var _currentPayment = angular.copy($scope.currentPayment);
        _currentPayment.registrationId =  registration.id;
        delete _currentPayment.errors;
        if(_currentPayment.paymentType === 'CREDIT_CARD') {
          $http.get('payments/ccp-client-encryption-key')
            .then(function(ccpClientEncryptionKey) {
            ccp.initialize(ccpClientEncryptionKey);
            _currentPayment.creditCard.lastFourDigits = ccp.getAbbreviatedNumber(_currentPayment.creditCard.number);
            _currentPayment.creditCard.number = ccp.encrypt(_currentPayment.creditCard.number);
            _currentPayment.creditCard.cvvNumber = ccp.encrypt(_currentPayment.creditCard.cvvNumber);
            $http.post('payments/', _currentPayment)
              .then(function () {
                registration = angular.copy(registration);
                registration.completed = true;
                RegistrationCache.update('registrations/' + registration.id, registration, function () {
                  RegistrationCache.emptyCache();
                }, function(){
                  alert('An error occurred while updating your registration.');
                });
              }).catch(function (data) {
                $scope.submittingRegistration = false;
                modalMessage.error({
                  'message': data.error ? data.error.message : 'An error occurred while attempting to process your payment.',
                  'forceAction': true
                });
              });
          }).catch(function() {
            modalMessage.error('An error occurred while requesting the ccp encryption key. Please try your payment again.');
          });
        } else {
          $http.post('payments/', _currentPayment)
            .then(function () {
              registration = angular.copy(registration);
              registration.completed = true;
              RegistrationCache.update('registrations/' + registration.id, registration, function () {
                RegistrationCache.emptyCache();
              }, function(){
                alert('An error occurred while updating your registration.');
              });
            }).catch(function (data) {
              $scope.submittingRegistration = false;
              modalMessage.error({
                'message': data.error ? data.error.message : 'An error occurred while attempting to process your payment.',
                'forceAction': true
              });
            });
        }
      }).catch(function (response) {
        console.log('Add registration failed.  Status = ' + response.status + '.  Error Message = ' + response.data.error.message);
        alert('An error occurred while adding new spouse registration.');
      });
    };

    ////// END EVENT-433 //////

  });
