import moment from 'moment';
import eventInformationTemplate from 'views/eventDetails/eventInformation.html';
import regOptionsTemplate from 'views/eventDetails/regOptions.html';
import regTypesTemplate from 'views/eventDetails/regTypes.html';
import paymentOptionsTemplate from 'views/eventDetails/paymentOptions.html';
import promotionsTemplate from 'views/eventDetails/promotions.html';
import contactInfoTemplate from 'views/eventDetails/contactInfo.html';
import addRegistrantTypeModalTemplate from 'views/modals/addRegistrantType.html';
import { allCountries } from 'country-region-data';
import popupHyperlinkInformationTemplate from 'views/popupHyperlinkInformation.html';
import { getCurrentRegions } from '../filters/eventAddressFormat';
import {
  findCoupleForSpouse,
  findSpouseForCouple,
  deleteSpouseType,
  syncCoupleDescriptions,
  shouldShowRegistrantType,
  isCoupleOrSpouseType,
  isCoupleType,
  isSpouseType,
} from '../utils/coupleTypeUtils';

angular
  .module('confRegistrationWebApp')
  .controller(
    'eventDetailsCtrl',
    function (
      $rootScope,
      $scope,
      $http,
      $sce,
      $timeout,
      $window,
      $uibModal,
      modalMessage,
      $filter,
      $location,
      conference,
      ConfCache,
      uuid,
      gettextCatalog,
      currencies,
    ) {
      $rootScope.globalPage = {
        type: 'admin',
        mainClass: 'container event-details',
        bodyClass: '',
        confId: conference.id,
        footer: true,
      };

      $scope.tabs = [
        {
          id: 'eventInfo',
          name: 'Event Information',
          view: eventInformationTemplate,
        },
        {
          id: 'regOptions',
          name: 'Registration Options',
          view: regOptionsTemplate,
        },
        { id: 'regTypes', name: 'Registrant Types', view: regTypesTemplate },
        {
          id: 'paymentOptions',
          name: 'Payment Options',
          view: paymentOptionsTemplate,
        },
        { id: 'promotions', name: 'Promotions', view: promotionsTemplate },
        {
          id: 'contactInfo',
          name: 'Contact Information',
          view: contactInfoTemplate,
        },
      ];

      $scope.descriptionPopup = {
        titleTemplateUrl: popupHyperlinkInformationTemplate,
      };

      /* Couple type related functions */
      $scope.findCoupleForSpouse = findCoupleForSpouse;
      $scope.findSpouseForCouple = findSpouseForCouple;
      $scope.deleteSpouseType = deleteSpouseType;
      $scope.isCoupleOrSpouseType = isCoupleOrSpouseType;
      $scope.isCoupleType = isCoupleType;
      $scope.isSpouseType = isSpouseType;
      // exposed to scope for testing
      $scope.syncCoupleDescriptions = syncCoupleDescriptions;
      $scope.shouldShowRegistrantType = function (type) {
        return shouldShowRegistrantType(
          type,
          $scope.conference.registrantTypes,
        );
      };

      $scope.changeTab = function (tab) {
        $scope.activeTab = tab;
        if (tab.id === 'regOptions') {
          $scope.resetImage();
        }
      };
      $scope.changeTab($scope.tabs[0]);

      $scope.paymentGateways = {
        TSYS: {
          name: gettextCatalog.getString('TSYS'),
          fields: {
            paymentGatewayId: {
              title: gettextCatalog.getString('Merchant Account ID'),
            },
          },
        },
      };

      $scope.originalConference = conference;
      $scope.conference = angular.copy(conference);
      $scope.currencies = currencies;
      $scope.countries = allCountries;
      $scope.conference.locationCountry = conference.locationCountry
        ? conference.locationCountry
        : 'US';
      $scope.currentRegions = getCurrentRegions(
        $scope.conference.locationCountry,
      );

      $scope.refreshAllowedRegistrantTypes = function () {
        $scope.conference.registrantTypes.forEach((type) => {
          type.allowedRegistrantTypeSet = _.map(
            $scope.conference.registrantTypes,
            (t) => {
              const existingChild = _.find(type.allowedRegistrantTypeSet, {
                childRegistrantTypeId: t.id,
              });
              return {
                id: existingChild ? existingChild.id : uuid(),
                name: t.name,
                childRegistrantTypeId: t.id,
                numberOfChildRegistrants: existingChild
                  ? existingChild.numberOfChildRegistrants
                  : 0,
                selected:
                  existingChild !== undefined &&
                  existingChild.selected !== false,
              };
            },
          );
        });
        conference = angular.copy($scope.conference);
      };

      $scope.refreshAllowedRegistrantTypes();

      // Get the payment gateway type for this conference
      $scope.getPaymentGatewayType = function () {
        // The UI will be distorted if the payment gateway type is not a key of $scope.paymentGateways, so treat it as
        // TSYS if it is not a valid payment gateway type.
        if (
          !_.includes(
            _.keys($scope.paymentGateways),
            $scope.conference.paymentGatewayType,
          )
        ) {
          return 'TSYS';
        }

        return $scope.conference.paymentGatewayType;
      };

      $scope.$on('$locationChangeStart', function (event) {
        if (!angular.equals(conference, $scope.conference)) {
          const newLocation = $location.path();
          event.preventDefault();
          modalMessage
            .confirm({
              title: 'Warning: Unsaved Changes',
              question:
                'You have some unsaved changes on this page, are you sure you want to leave? Your changes will be lost.',
              yesString: 'Discard changes',
              noString: 'Stay on this page',
              normalSize: true,
            })
            .then(function () {
              conference = angular.copy($scope.conference);
              $location.path(newLocation);
            });
        }
      });

      $scope.addPromotion = function () {
        $scope.conference.promotions.push({
          id: uuid(),
          applyToAllRegistrants: true,
          registrantTypeIds: _.map($scope.conference.registrantTypes, 'id'),
          activationDate: $scope.conference.registrationStartTime,
          deactivationDate: $scope.conference.registrationEndTime,
        });
      };

      $scope.promotionRegistrantTypeToggle = function (registrantTypes, id) {
        if (registrantTypes.indexOf(id) === -1) {
          registrantTypes.push(id);
        } else {
          registrantTypes.splice(registrantTypes.indexOf(id), 1);
        }
      };

      $scope.addRegType = function () {
        var modalInstance = $uibModal.open({
          templateUrl: addRegistrantTypeModalTemplate,
          controller: function ($scope, $uibModalInstance, registrantTypes) {
            $scope.types = registrantTypes.data;

            $scope.selectType = function (type) {
              $uibModalInstance.close(type);
            };
          },
          resolve: {
            registrantTypes: function () {
              return $http.get('registranttypes', { cache: true });
            },
          },
        });

        modalInstance.result.then(function (type) {
          type.id = uuid();
          type.eform = $scope.conference.eform;
          $scope.conference.registrantTypes.push(type);
        });

        return modalInstance;
      };

      $scope.deleteRegType = function (id) {
        if ($scope.conference.registrantTypes.length > 1) {
          _.remove($scope.conference.registrantTypes, function (type) {
            return type.id === id;
          });
          $scope.conference.registrantTypes.forEach((t) => {
            _.remove(t.allowedRegistrantTypeSet, function (childType) {
              return childType.childRegistrantTypeId === id;
            });
          });
        } else {
          $scope.notify = {
            class: 'alert-danger',
            message: $sce.trustAsHtml(
              'You must have at least one registrant type per event.',
            ),
          };
          $timeout(function () {
            $scope.notify = {};
          }, 3500);
        }
      };

      $scope.addEarlyRegistrationDiscount = function (type) {
        type.earlyRegistrationDiscounts.push({ id: uuid(), enabled: true });
      };

      $scope.setPristine = () => {
        $scope.eventDetails.$setPristine();
      };

      $scope.saveEvent = function () {
        //validation check
        const eventInformationPageHint =
          "<strong>*</strong>You can provide this information on the 'Event Information' page.";
        var validationErrors = [];
        var validationErrorsHint = '';
        var urlPattern = new RegExp(
          /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi,
        );
        var httpPattern = new RegExp(/^https?:\/\//gi);

        //contact website
        if (!_.isEmpty($scope.conference.contactWebsite)) {
          if (!urlPattern.test($scope.conference.contactWebsite)) {
            validationErrors.push('Please enter a valid contact website.');
          } else {
            if (!httpPattern.test($scope.conference.contactWebsite)) {
              $scope.conference.contactWebsite =
                'http://' + $scope.conference.contactWebsite;
            }
          }
        }

        //Event Name
        if (_.isEmpty($scope.conference.name)) {
          validationErrors.push('Please enter an event name.');
        }
        if (/[&"]/.test($scope.conference.name)) {
          validationErrors.push(
            'Please remove double quotes (") and ampersands (&) from the event name.',
          );
        }

        if (_.isEmpty($scope.conference.abbreviation)) {
          validationErrors.push('Please enter an event abbreviation.');
        }
        if (/[&"]/.test($scope.conference.abbreviation)) {
          validationErrors.push(
            'Please remove double quotes (") and ampersands (&) from the event abbreviation.',
          );
        }

        if (
          $scope.conference.abbreviation &&
          $scope.conference.abbreviation.length > 10
        ) {
          validationErrors.push(
            'Event abbreviation must be no longer than 10 characters.',
          );
        }

        //Event Dates
        if ($scope.conference.eventStartTime > $scope.conference.eventEndTime) {
          validationErrors.push(
            'Event end date/time must be after event start date/time.',
          );
        }

        //Registration Window
        if (
          $scope.conference.registrationStartTime >
          $scope.conference.registrationEndTime
        ) {
          validationErrors.push(
            'Registration end date/time must be after registration start date/time.',
          );
        }

        //allowEditRegistrationAfterComplete
        if (
          $scope.conference.allowEditRegistrationAfterComplete &&
          !(
            $scope.conference.relayLogin ||
            $scope.conference.facebookLogin ||
            $scope.conference.googleLogin
          )
        ) {
          validationErrors.push(
            "You must require sign in if allowing users to edit their registration after it's complete.",
          );
        }

        //registration complete redirect website
        angular.forEach($scope.conference.registrantTypes, function (type) {
          if (!_.isEmpty(type.registrationCompleteRedirect)) {
            urlPattern.lastIndex = 0;
            httpPattern.lastIndex = 0;
            !urlPattern.test(type.registrationCompleteRedirect)
              ? validationErrors.push(
                  'Please enter a valid completion redirect website.',
                )
              : !httpPattern.test(type.registrationCompleteRedirect)
              ? (type.registrationCompleteRedirect =
                  'http://' + type.registrationCompleteRedirect)
              : null;
          }
        });

        //Promo codes
        angular.forEach($scope.conference.promotions, function (p, index) {
          if (_.isEmpty(p.code)) {
            validationErrors.push(
              'Please enter a code for promotion ' + (index + 1) + '.',
            );
          } else {
            if (p.code.length < 5 || p.code.length > 20) {
              validationErrors.push(
                'Code for promotion ' +
                  (index + 1) +
                  ' must be greater than 5 characters and less than 20.',
              );
            }

            if (/[^a-zA-Z0-9]/.test(p.code)) {
              validationErrors.push(
                'Code for promotion ' +
                  (index + 1) +
                  ' must only contain letters and/or numbers.',
              );
            }
          }

          if (!p.amount || Number(p.amount) <= 0) {
            validationErrors.push(
              'Please enter a discount amount greater than 0 for promotion ' +
                (index + 1) +
                '.',
            );
          }
        });

        //Registrant Name
        angular.forEach($scope.conference.registrantTypes, function (t) {
          if (_.isEmpty(t.name)) {
            validationErrors.push(
              'Please enter a name for all Registrant types.',
            );
          }
        });

        //Event Cost
        angular.forEach($scope.conference.registrantTypes, function (t) {
          t.cost = Number(t.cost);
          if (_.isNaN(t.cost) || t.cost < 0) {
            validationErrors.push(
              "Event cost for '" + t.name + "' must be a positive number.",
            );
          }
        });

        //Credit cards
        if (
          _.isEmpty($scope.conference.paymentGatewayId) &&
          _.some($scope.conference.registrantTypes, 'acceptCreditCards')
        ) {
          var paymentGateway =
            $scope.paymentGateways[$scope.conference.paymentGatewayType];
          var fields = paymentGateway
            ? _.map(paymentGateway.fields, 'title').join(
                gettextCatalog.getString(' and '),
              )
            : gettextCatalog.getString('fields');
          validationErrors.push(
            gettextCatalog.getString(
              'Please enter the credit card {{fields}} under the "Payment Options" tab.',
              { fields: fields },
            ),
          );
        }

        //Minimum Deposit
        angular.forEach($scope.conference.registrantTypes, function (t) {
          if (
            ($scope.conference.relayLogin ||
              $scope.conference.facebookLogin ||
              $scope.conference.googleLogin) &&
            $scope.anyPaymentMethodAccepted(t) &&
            String(t.minimumDeposit).length > 0 &&
            !_.isNull(t.minimumDeposit)
          ) {
            t.minimumDeposit = Number(t.minimumDeposit);
            if (t.minimumDeposit > t.cost) {
              validationErrors.push(
                "The minimum deposit for '" +
                  t.name +
                  "' must be less than the cost.",
              );
            }
          } else {
            t.minimumDeposit = null;
          }
        });

        //Early bird discount
        angular.forEach($scope.conference.registrantTypes, function (t) {
          angular.forEach(t.earlyRegistrationDiscounts, function (d, index) {
            if (d.enabled) {
              d.amountOfDiscount = Number(d.amountOfDiscount);
              if (d.amountOfDiscount <= 0) {
                validationErrors.push(
                  'Early registration discount ' +
                    (index + 1) +
                    " for '" +
                    t.name +
                    "' must be a positive number.",
                );
              }
              if (!d.deadline) {
                validationErrors.push(
                  'Early registration discount ' +
                    (index + 1) +
                    " for '" +
                    t.name +
                    "' must include a valid date and time.",
                );
              }
            }
          });
        });

        //Cru Event
        if (
          typeof $scope.conference.cruEvent === 'undefined' ||
          $scope.conference.cruEvent === null
        ) {
          validationErrors.push('Please specify whether this is a Cru Event.*');
          validationErrorsHint = eventInformationPageHint;
        }

        //Ministries
        if ($scope.conference.cruEvent && !$scope.conference.ministry) {
          validationErrors.push('Please enter Ministry Hosting Event.*');
          validationErrorsHint = eventInformationPageHint;
        }

        if (
          $scope.conference.cruEvent &&
          $scope.conference.ministry &&
          $scope.getStrategies().length !== 0 &&
          !$scope.conference.strategy
        ) {
          validationErrors.push(
            'Please enter which Strategy is hosting the event if applicable.*',
          );
          validationErrorsHint = eventInformationPageHint;
        }

        if (
          $scope.conference.cruEvent &&
          $scope.conference.ministry &&
          $scope.getActivities().length !== 0 &&
          !$scope.conference.ministryActivity
        ) {
          validationErrors.push(
            'Please enter which Ministry Activity is applicable for this event.*',
          );
          validationErrorsHint = eventInformationPageHint;
        }

        if (
          $scope.conference.cruEvent &&
          $scope.conference.ministry &&
          $scope.getEventTypes().length &&
          !$scope.conference.eventType
        ) {
          validationErrors.push(
            'Please enter which Event Type is applicable for this event.*',
          );
          validationErrorsHint = eventInformationPageHint;
        }

        if ($scope.conference.cruEvent && !$scope.conference.type) {
          validationErrors.push('Please enter Ministry Purpose.*');
          validationErrorsHint = eventInformationPageHint;
        }

        $window.scrollTo(0, 0);
        if (validationErrors.length > 0) {
          var errorMsg =
            '<strong>Error!</strong> Please fix the following issues:<ul>';
          angular.forEach(validationErrors, function (e) {
            errorMsg = errorMsg + '<li>' + e + '</li>';
          });
          errorMsg = errorMsg + '</ul>';
          if (validationErrorsHint) {
            errorMsg = errorMsg + validationErrorsHint;
          }
          $scope.notify = {
            class: 'alert-danger',
            message: $sce.trustAsHtml(errorMsg),
          };
        } else {
          $scope.notify = {
            class: 'alert-warning',
            message: $sce.trustAsHtml('Saving...'),
          };

          var payload = angular.copy($scope.conference);

          // If the conference does not have a gateway type, set it to the default (TSYS) if an id is provided
          if (!payload.paymentGatewayType && payload.paymentGatewayId) {
            payload.paymentGatewayType = 'TSYS';
          }

          payload.registrantTypes.forEach((t) => {
            if (t.allowedRegistrantTypeSet && t.familyStatus === 'ENABLED') {
              const filtered = _.filter(t.allowedRegistrantTypeSet, {
                selected: true,
              });
              t.allowedRegistrantTypeSet = _.map(filtered, (t) => ({
                id: t.id,
                childRegistrantTypeId: t.childRegistrantTypeId,
                numberOfChildRegistrants: t.numberOfChildRegistrants,
              }));
            } else {
              t.allowedRegistrantTypeSet = null;
            }
          });
          let payloadWithoutImage = angular.copy(payload);
          payloadWithoutImage.image = null;
          $http({
            method: 'PUT',
            url: 'conferences/' + conference.id,
            data: payloadWithoutImage,
          })
            .then(function () {
              $scope.notify = {
                class: 'alert-success',
                message: $sce.trustAsHtml(
                  '<strong>Saved!</strong> Your event details have been updated.',
                ),
              };
              $http({
                method: 'GET',
                url: `conferences/${conference.id}`,
              }).then((response) => {
                $scope.conference = response.data;
                $scope.originalConference = conference = angular.copy(
                  response.data,
                );
                $scope.refreshAllowedRegistrantTypes();
              });

              //Clear cache
              ConfCache.empty();
              $scope.setPristine();
            })
            .catch(function (response) {
              $scope.notify = {
                class: 'alert-danger',
                message: $sce.trustAsHtml(
                  '<strong>Error:</strong> ' +
                    (response.data && response.data.error
                      ? response.data.error.message
                      : 'Details could not be saved.'),
                ),
              };
            });
        }
      };

      $scope.anyPaymentMethodAccepted = function (type) {
        return (
          type.acceptCreditCards ||
          type.acceptChecks ||
          type.acceptTransfers ||
          type.acceptScholarships
        );
      };

      $scope.previewEmail = function (reg) {
        var cost = $filter('localizedCurrency')(
          reg.cost,
          $scope.conference.currency.currencyCode,
        );
        var eventStartTime = moment(conference.eventStartTime).format(
          'dddd, MMMM D YYYY, h:mm a',
        );
        var eventEndTime = moment(conference.eventEndTime).format(
          'dddd, MMMM D YYYY, h:mm a',
        );
        var zero = $filter('localizedCurrency')(
          0,
          $scope.conference.currency.currencyCode,
        );
        modalMessage.info({
          title: 'Email Preview',
          message:
            '<p>Hello ' +
            $rootScope.globalGreetingName() +
            '!</p><p>You are registered for ' +
            $scope.conference.name +
            '.</p>' +
            '<p><strong>Start Time:</strong> ' +
            eventStartTime +
            '<br><strong>End Time:</strong> ' +
            eventEndTime +
            '</p>' +
            '<p><strong>Total Cost:</strong> ' +
            cost +
            '<br><strong>Total Amount Paid:</strong> ' +
            cost +
            '<br><strong>Remaining Balance:</strong> ' +
            zero +
            '</p>' +
            reg.customConfirmationEmailText,
          okString: 'Close',
        });
      };

      $scope.disableField = function (field, defaultTypeKey) {
        var fields = {
          groupSubRegistrantType: ['SPOUSE', 'CHILD'],
        };
        return _.includes(fields[field], defaultTypeKey);
      };

      $scope.wysiwygButtons = [
        ['bold', 'italic', 'underline'],
        ['font'],
        ['font-size'],
        ['remove-format'],
        ['ordered-list', 'unordered-list'],
        ['left-justify', 'center-justify', 'right-justify'],
        ['link', 'image'],
      ];

      $scope.getStrategies = () => {
        const currentMinistry =
          $scope.ministries &&
          $scope.ministries.find((m) => m.id === $scope.conference.ministry);
        return currentMinistry ? currentMinistry.strategies : [];
      };

      $scope.getActivities = () => {
        const currentMinistry =
          $scope.ministries &&
          $scope.ministries.find((m) => m.id === $scope.conference.ministry);
        return currentMinistry ? currentMinistry.activities : [];
      };

      $scope.getEventTypes = () => {
        const currentMinistry =
          $scope.ministries &&
          $scope.ministries.find((m) => m.id === $scope.conference.ministry);
        const currentPurpose =
          $scope.ministryPurposes &&
          $scope.ministryPurposes.find((m) => m.id === $scope.conference.type);
        return currentMinistry &&
          currentMinistry.eventTypes &&
          currentPurpose &&
          ((currentPurpose.name && currentPurpose.name.includes('Mission')) ||
            currentPurpose.name.includes('Conference'))
          ? currentMinistry.eventTypes
          : [];
      };

      $scope.$watch(
        'conference.type',
        function (newVal, oldVal) {
          if (newVal !== oldVal) {
            $scope.conference.eventType = null;
          }
        },
        true,
      );

      $scope.$watch(
        'conference.ministry',
        function (newVal, oldVal) {
          if (newVal !== oldVal) {
            $scope.conference.strategy = null;
            $scope.conference.eventType = null;
            $scope.conference.ministryActivity = null;
          }
        },
        true,
      );

      $scope.$watch(
        'conference.cruEvent',
        function (newVal, oldVal) {
          if (oldVal !== newVal) {
            $scope.conference.ministry = null;
            $scope.conference.strategy = null;
            $scope.conference.type = null;
            $scope.conference.eventType = null;
            $scope.conference.ministryActivity = null;
            $scope.conference.workProject = false;
          }
        },
        true,
      );

      $scope.$watch(
        'conference.virtual',
        (newVal, oldVal) => {
          if (oldVal !== newVal) {
            $scope.conference.locationName = null;
            $scope.conference.locationAddress = null;
            $scope.conference.locationCity = null;
            $scope.conference.locationState = null;
            $scope.conference.locationZipCode = null;
          }
        },
        true,
      );

      $scope.$watch('conference.eform', (newVal, oldVal) => {
        if (oldVal !== newVal) {
          // If eform is true, create related liability questions
          if (newVal === true) {
            $scope.createLiabilityQuestions();
            $scope.conference.registrantTypes.forEach((t) => (t.eform = true));
          } else {
            $scope.updateLiabilityQuestions();
            $scope.conference.registrantTypes.forEach((t) => (t.eform = false));
          }
        }
      });

      $scope.$watch(
        'conference.locationCountry',
        (newVal, oldVal) => {
          if (oldVal !== newVal) {
            $scope.currentRegions = getCurrentRegions(
              $scope.conference.locationCountry,
            );
            $scope.conference.locationZipCode = null;
            $scope.conference.locationState = null;
          }
        },
        true,
      );

      $scope.sortNamesWithNA = (v1, v2) => {
        return v1 === 'N/A' ? -1 : v1 < v2;
      };

      $http({
        method: 'GET',
        url: 'ministries',
      }).then(function (response) {
        $scope.ministries = response.data;
      });

      $http({
        method: 'GET',
        url: 'types',
      }).then(function (response) {
        $scope.ministryPurposes = response.data;
      });

      $scope.resetImage = () => {
        $scope.image = angular.copy($scope.conference.image);
        if (!$scope.image.displayType) {
          $scope.image.displayType = 'CENTERED';
        }
      };

      $scope.selectedImage = '';
      $scope.resetImage();

      $scope.deleteImage = () => {
        $scope.image.image = '';
        $scope.image.includeImageToAllPages = false;
        $scope.image.displayType = 'CENTERED';
        $scope.saveImage();
      };

      $scope.saveImage = () => {
        $http({
          method: 'PUT',
          url: `conferences/${conference.id}/image`,
          data: $scope.image,
        }).then(() => {
          $scope.conference.image = angular.copy($scope.image);
          conference.image = $scope.conference.image;
          ConfCache.update(conference.id, $scope.conference);
          $scope.notify = {
            class: 'alert-success',
            message: $sce.trustAsHtml(
              '<strong>Saved!</strong> Event image details have been updated.',
            ),
          };
        });
      };
      $scope.cruEventWithoutChartfield = () =>
        $scope.conference.cruEvent &&
        !(
          $scope.conference.businessUnit ||
          $scope.conference.operatingUnit ||
          $scope.conference.department
        );

      $scope.createLiabilityQuestions = () => {
        const minorQuestionId = uuid();
        const guardianNameId = uuid();
        const guardianEmailId = uuid();
        $scope.conference.registrationPages[0].blocks.push(
          {
            id: minorQuestionId,
            content: {
              forceSelectionRuleOperand: 'AND',
              forceSelections: {},
              ruleoperand: 'AND',
              choices: [
                { value: 'Yes', desc: '', operand: 'OR' },
                { value: 'No', desc: '', operand: 'OR' },
              ],
            },
            pageId: $scope.conference.registrationPages[0].id,
            required: true,
            title: 'Are you (the participant) under 18 years old?',
            type: 'selectQuestion',
            profileType: null,
            registrantTypes: [],
            rules: [],
            tag: 'EFORM',
          },
          {
            id: guardianNameId,
            pageId: $scope.conference.registrationPages[0].id,
            required: true,
            title: 'Guardian Name',
            type: 'nameQuestion',
            profileType: null,
            registrantTypes: [],
            rules: [
              {
                blockEntityOption: '',
                blockId: guardianNameId,
                id: uuid(),
                operator: '=',
                parentBlockId: minorQuestionId,
                ruleType: 'SHOW_QUESTION',
                value: 'Yes',
              },
            ],
            tag: 'EFORM',
          },
          {
            id: guardianEmailId,
            pageId: $scope.conference.registrationPages[0].id,
            required: true,
            title: 'Guardian Email',
            type: 'emailQuestion',
            profileType: null,
            registrantTypes: [],
            rules: [
              {
                blockEntityOption: '',
                blockId: guardianEmailId,
                id: uuid(),
                operator: '=',
                parentBlockId: minorQuestionId,
                ruleType: 'SHOW_QUESTION',
                value: 'Yes',
              },
            ],
            tag: 'EFORM',
          },
        );
        $http({
          method: 'PUT',
          url: 'conferences/' + conference.id,
          data: $scope.conference,
        }).then(() => {
          $scope.originalConference = conference = angular.copy(
            $scope.conference,
          );
          ConfCache.empty();
          $scope.setPristine();
        });
      };

      $scope.updateLiabilityQuestions = () => {
        $scope.conference.registrationPages.forEach((p) => {
          p.blocks = p.blocks.map((b) => {
            if (b.tag === 'EFORM') {
              b.tag = null;
            }
            return b;
          });
        });
        const payload = angular.copy($scope.conference);
        // Remove unwanted properties from sending to API.
        payload.registrantTypes = payload.registrantTypes.map((regType) => {
          regType.allowedRegistrantTypeSet =
            regType.allowedRegistrantTypeSet.map((set) => {
              delete set.name;
              delete set.selected;
              return set;
            });
          return regType;
        });
        $http({
          method: 'PUT',
          url: 'conferences/' + conference.id,
          data: payload,
        })
          .then(() => {
            $scope.originalConference = conference = angular.copy(
              $scope.conference,
            );

            ConfCache.empty();
            $scope.setPristine();
          })
          .catch((err) => {
            $scope.notify = {
              class: 'alert-danger',
              message: 'Error updating liability questions.',
            };
            throw err;
          });
      };
    },
  );
