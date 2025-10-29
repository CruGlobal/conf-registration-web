import {
  isRegistrantCouple,
  findCoupleForSpouse,
} from '../utils/coupleTypeUtils';

angular
  .module('confRegistrationWebApp')
  .controller(
    'ReviewRegistrationCtrl',
    function (
      $scope,
      $rootScope,
      $location,
      $route,
      $filter,
      $window,
      modalMessage,
      $http,
      $q,
      currentRegistration,
      conference,
      error,
      registration,
      payment,
      validateRegistrant,
      analytics,
      globalPromotionService,
    ) {
      $rootScope.globalPage = {
        type: 'registration',
        mainClass: 'container front-form',
        bodyClass: 'user-registration',
        conference: conference,
        confId: conference.id,
        footer: false,
      };

      if (conference.ministry && conference.ministryActivity) {
        globalPromotionService.loadPromotions(
          conference.ministry,
          conference.ministryActivity,
        );
      }

      // Couple-spouse related utility functions
      $scope.isRegistrantCouple = isRegistrantCouple;
      $scope.findCoupleForSpouse = findCoupleForSpouse;

      $scope.setAllPromotions = function () {
        return [
          ...currentRegistration.globalPromotions.map((promo) => ({
            ...promo,
            isGlobal: true,
          })),
          ...currentRegistration.promotions.map((promo) => ({
            ...promo,
            isGlobal: false,
          })),
        ];
      };

      $scope.allPromotions = $scope.setAllPromotions();

      if (
        _.isEmpty(currentRegistration.registrants) &&
        !currentRegistration.completed
      ) {
        $location.path(
          '/' +
            ($rootScope.registerMode || 'register') +
            '/' +
            conference.id +
            '/page/',
        );
      }

      $scope.conference = conference;
      $scope.currentRegistration = currentRegistration;

      $scope.displayAddress = $filter('eventAddressFormat')(
        $scope.conference.locationCity,
        $scope.conference.locationState,
        $scope.conference.locationZipCode,
        $scope.conference.locationCountry,
      );

      $scope.blocks = [];
      $scope.regValidate = {};

      $scope.getRegistrantType = function (id) {
        return _.find(conference.registrantTypes, { id });
      };

      // Helper function to check if couple-spouse pair exists
      const coupleSpousePairExists = () => {
        return currentRegistration.registrants.some((registrant) => {
          return $scope.isRegistrantCouple(
            registrant,
            currentRegistration,
            $scope.getRegistrantType,
          );
        });
      };

      //check if group registration is allowed based on registrants already in registration
      $scope.allowGroupRegistration = () => {
        // If registration is completed and couple-spouse pair exists, prevent group registration
        if (currentRegistration.completed && coupleSpousePairExists()) {
          return false;
        }

        const allow = currentRegistration.registrants.some(
          (registrant) =>
            $scope.getRegistrantType(registrant.registrantTypeId)
              .allowGroupRegistrations,
        );
        return allow;
      };
      // TODO: $scope.currentPayment is always undefined and conference.accept* is also undefined
      // We need to need to use $scope.acceptedPaymentMethods() to calculate the initial payment type
      if (angular.isUndefined($scope.currentPayment)) {
        var paymentType;
        if (conference.acceptCreditCards) {
          paymentType = 'CREDIT_CARD';
        } else if (conference.acceptChecks) {
          paymentType = 'CHECK';
        } else if (conference.acceptTransfers) {
          paymentType = 'TRANSFER';
        } else if (conference.acceptScholarships) {
          paymentType = 'SCHOLARSHIP';
        }

        $scope.currentPayment = {
          amount: currentRegistration.remainingBalance,
          paymentType: paymentType,
        };
      }

      angular.forEach(
        _.flatten(_.map(conference.registrationPages, 'blocks')),
        function (block) {
          if (block.type.indexOf('Content') === -1) {
            $scope.blocks.push(block);
          }
        },
      );

      angular.forEach(currentRegistration.registrants, function (r) {
        $scope.regValidate[r.id] = validateRegistrant.validate(conference, r);
      });

      $scope.findAnswer = function (blockId) {
        return _.find($scope.answers, { blockId: blockId });
      };

      $scope.getBlock = function (blockId) {
        return _.find($scope.blocks, { id: blockId });
      };

      // Return a boolean indicating whether the register button(s) should be disabled
      $scope.registerDisabled = function () {
        return Boolean(
          $scope.registerMode === 'preview' ||
            !$scope.allRegistrantsValid() ||
            $scope.submittingRegistration ||
            $scope.requireSpouseRegistration(),
        );
      };

      $scope.requireSpouseRegistration = function () {
        const primaryRegistrantType = primaryRegType(currentRegistration);

        if (primaryRegistrantType.defaultTypeKey !== 'COUPLE') {
          return false;
        }
        return !$scope.spouseIsRegistered();
      };

      $scope.spouseIsRegistered = function () {
        return $scope.currentRegistration.registrants.find(function (
          registrant,
        ) {
          return $scope.isSpouse(registrant);
        });
      };

      // Display an error that occurred during registration completion
      function handleRegistrationError(error) {
        if (!error) {
          return;
        }

        modalMessage.error({
          message:
            error.message ||
            'An error occurred while attempting to complete your registration.',
          forceAction: true,
        });
      }

      function primaryRegType(currentRegistration) {
        let primaryRegistrant = _.find(currentRegistration.registrants, {
          id: currentRegistration.primaryRegistrantId,
        });
        return $scope.getRegistrantType(primaryRegistrant.registrantTypeId);
      }

      // Navigate to the correct page after completing a registration
      $scope.navigateToPostRegistrationPage = function () {
        let regType = primaryRegType(currentRegistration);
        regType.registrationCompleteRedirect
          ? ($window.location.href = regType.registrationCompleteRedirect)
          : $route.reload();
      };

      // Called when the user clicks the confirm button
      $scope.confirmRegistration = function () {
        $scope.submittingRegistration = true;

        $q.when()
          .then(function () {
            // Validate the payment client-side first to catch any errors as soon as possible
            return registration.validatePayment(
              $scope.currentPayment,
              currentRegistration,
              $scope.conference,
            );
          })
          .then(function () {
            return payment.pay(
              $scope.currentPayment,
              conference,
              currentRegistration,
              $scope.acceptedPaymentMethods(),
            );
          })
          .then(function () {
            return registration.completeRegistration(currentRegistration);
          })
          .then(function () {
            analytics.track('registration', {
              eventID: conference.id,
              registeredEventName: conference.name,
            });

            $scope.navigateToPostRegistrationPage();
          })
          .catch(function (response) {
            handleRegistrationError((response && response.data) || response);

            $scope.submittingRegistration = false;
          });
      };

      $scope.editRegistrant = (registrantId) => {
        $location
          .path(
            '/' +
              ($rootScope.registerMode || 'register') +
              '/' +
              conference.id +
              '/page/' +
              conference.registrationPages.filter((page) =>
                $scope.pageIsVisible(page, registrantId),
              )[0].id,
          )
          .search('reg', registrantId);
      };

      $scope.pageIsVisible = (page, registrantId) =>
        page.blocks.some((block) =>
          validateRegistrant.blockVisible(
            block,
            currentRegistration.registrants.find((r) => r.id === registrantId),
            false,
            $scope.conference,
          ),
        );

      $scope.removeRegistrant = function (id) {
        modalMessage
          .confirm({
            title: 'Delete registrant?',
            question: 'Are you sure you want to delete this registrant?',
          })
          .then(function () {
            $http({
              method: 'DELETE',
              url: 'registrants/' + id,
            })
              .then(function () {
                $route.reload();
              })
              .catch(function (response) {
                modalMessage.error({
                  message:
                    response.data && response.data.error
                      ? response.data.error.message
                      : 'An error occurred while removing registrant.',
                });
              });
          });
      };

      $scope.isBlockInvalid = function (rId, bId) {
        return _.includes($scope.regValidate[rId], bId);
      };

      $scope.allRegistrantsValid = function () {
        var returnVal = true;
        angular.forEach(currentRegistration.registrants, function (r) {
          if (angular.isUndefined($scope.regValidate[r.id])) {
            returnVal = false;
          } else {
            if ($scope.regValidate[r.id].length) {
              returnVal = false;
            }
          }
        });
        return returnVal;
      };

      $scope.blockVisibleForRegistrant = function (block, registrant) {
        return validateRegistrant.blockVisible(
          block,
          registrant,
          false,
          $scope.conference,
        );
      };

      $scope.acceptedPaymentMethods = function () {
        var regTypesInRegistration = _.uniq(
          _.map(currentRegistration.registrants, 'registrantTypeId'),
        ).map(function (registrantTypeId) {
          return $scope.getRegistrantType(registrantTypeId);
        });

        var paymentMethods = {
          acceptCreditCards: _.some(
            regTypesInRegistration,
            'acceptCreditCards',
          ),
          acceptChecks: _.some(regTypesInRegistration, 'acceptChecks'),
          acceptTransfers: _.some(regTypesInRegistration, 'acceptTransfers'),
          acceptScholarships: _.some(
            regTypesInRegistration,
            'acceptScholarships',
          ),
          acceptPayOnSite:
            _.some(regTypesInRegistration, 'acceptPayOnSite') &&
            !currentRegistration.completed,
        };
        return !_.some(paymentMethods) ? false : paymentMethods;
      };

      $scope.registrantDeletable = function (r) {
        if (
          currentRegistration.completed &&
          !conference.allowEditRegistrationAfterComplete
        ) {
          return false;
        }

        if (currentRegistration.primaryRegistrantId === r.id) {
          return false;
        }

        // Couple/spouse in particular should not be removable if registration is completed
        // The user would have to notify staff to make changes
        if (currentRegistration.completed) {
          // Check if this registrant is part of a couple/spouse group
          const isCoupleRegistrant = $scope.isRegistrantCouple(
            r,
            currentRegistration,
            $scope.getRegistrantType,
          );
          // return false if registrant is a couple or spouse type
          return !isCoupleRegistrant;
        }

        var groupRegistrants = 0,
          noGroupRegistrants = 0;
        angular.forEach(currentRegistration.registrants, function (r) {
          var regType = $scope.getRegistrantType(r.registrantTypeId);
          if (regType.allowGroupRegistrations) {
            groupRegistrants++;
          } else {
            noGroupRegistrants++;
          }
        });

        var regType = $scope.getRegistrantType(r.registrantTypeId);
        if (
          regType.allowGroupRegistrations &&
          groupRegistrants === 1 &&
          noGroupRegistrants
        ) {
          return false;
        }
        return true;
      };

      $scope.validatePromo = function (inputCode) {
        $scope.addingPromoCode = true;
        $http
          .post('registrations/' + currentRegistration.id + '/promotions', {
            code: inputCode,
          })
          .then(function () {
            $route.reload();
          })
          .catch(function (response) {
            $scope.addingPromoCode = false;
            var msg =
              response.data && response.data.error
                ? response.data.error.message
                : 'An error has occurred.';
            modalMessage.error({
              message:
                response.status === 404
                  ? 'The promo code you have entered is invalid or does not apply to your registration.'
                  : msg,
              title: 'Invalid Code',
              forceAction: false,
            });
          });
      };

      $scope.deletePromotion = function (promoId) {
        modalMessage
          .confirm({
            title: 'Delete Promotion',
            question: 'Are you sure you want to delete this promotion?',
          })
          .then(function () {
            const registrationCopy = angular.copy(currentRegistration);
            const promotion = $scope.allPromotions.find(function (promotion) {
              return promotion.id === promoId;
            });

            if (promotion.isGlobal) {
              _.remove(registrationCopy.globalPromotions, { id: promoId });
            } else {
              _.remove(registrationCopy.promotions, { id: promoId });
            }

            $http
              .put('registrations/' + currentRegistration.id, registrationCopy)
              .then(function () {
                $route.reload();
              })
              .catch(function (response) {
                modalMessage.error(
                  response.data && response.data.error
                    ? response.data.error.message
                    : 'An error occurred while deleting promotion.',
                );
              });
          });
      };

      $scope.showActivePromotions = function () {
        return $scope.allPromotions.length;
      };

      $scope.showPromotionsInput = function () {
        const hasLocalPromotions =
          conference.promotions && conference.promotions.length > 0;

        const hasRegistrantTypeAllowingGlobal = conference.registrantTypes.some(
          function (registrantType) {
            return registrantType.eligibleForGlobalPromotions;
          },
        );

        const hasGlobalPromotions =
          hasRegistrantTypeAllowingGlobal &&
          globalPromotionService.hasPromotionsForConference(
            conference.ministry,
            conference.ministryActivity,
          );

        return hasLocalPromotions || hasGlobalPromotions;
      };

      $scope.hasPendingPayments = function (payments) {
        return (
          _.some(payments, { status: 'REQUESTED' }) ||
          _.some(payments, { status: 'PENDING' })
        );
      };

      $scope.hasPendingCheckPayment = function (payments) {
        return _.some(payments, { paymentType: 'CHECK', status: 'PENDING' });
      };

      $scope.isSpouse = function (registrant) {
        const type = $scope.getRegistrantType(registrant.registrantTypeId);
        return (
          type &&
          !!$scope.findCoupleForSpouse(
            type.id,
            conference.registrantTypes,
            false,
          )
        );
      };
    },
  );
