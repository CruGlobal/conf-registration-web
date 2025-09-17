import template from 'views/components/blockRegistration.html';
import { allCountries } from 'country-region-data';
import { getCurrentRegions } from '../filters/eventAddressFormat';

angular
  .module('confRegistrationWebApp')
  .directive('blockRegistration', function (DateRangeService) {
    return {
      templateUrl: template,
      restrict: 'A',
      controller: function (
        $scope,
        $routeParams,
        RegistrationCache,
        uuid,
        validateRegistrant,
      ) {
        $scope.isString = _.isString;
        $scope.countries = allCountries;

        $onInit();

        function $onInit() {
          if ($scope.adminEditRegistrant) {
            initAdminEditMode();
          } else {
            initRegistrationMode();
          }

          $scope.days = 1;
          if ($scope.block.startDateBlockId !== null) {
            DateRangeService.subscribe(
              $scope.block.startDateBlockId,
              startDateChangeCallback,
            );
          }
          if ($scope.block.endDateBlockId !== null) {
            DateRangeService.subscribe(
              $scope.block.endDateBlockId,
              endDateChangeCallback,
            );
          }
        }

        function initAdminEditMode() {
          const { answer, isNew } = initializeAnswer(
            $scope.adminEditRegistrant.answers,
            $scope.block,
            $scope.adminEditRegistrant.id,
          );
          $scope.answer = answer;
          isNew && $scope.adminEditRegistrant.answers.push($scope.answer);
        }

        $scope.currentRegions = (country) => getCurrentRegions(country);

        function initRegistrationMode() {
          const registrantId = $routeParams.reg;
          const registrantIndex = _.findIndex(
            $scope.currentRegistration.registrants,
            { id: registrantId },
          );

          if (
            !registrantId ||
            !$scope.block ||
            registrantIndex === -1 ||
            $scope.block.type === 'paragraphContent'
          ) {
            return;
          }

          // Since we render all blocks for all registrants, even if they are not for this registrant type.
          // We ONLY need to initialize the answers/questions for the blocks that are visible
          const weShouldInitializeAnswer =
            validateRegistrant.blockInRegistrantType(
              $scope.block,
              $scope.currentRegistration.registrants[registrantIndex],
            );

          if (!weShouldInitializeAnswer) {
            return;
          }

          const { answer, isNew } = initializeAnswer(
            $scope.currentRegistration.registrants[registrantIndex].answers,
            $scope.block,
            registrantId,
            $scope.block.content && $scope.block.content.default,
          );
          $scope.answer = answer;
          isNew &&
            $scope.currentRegistration.registrants[
              registrantIndex
            ].answers.push($scope.answer);

          $scope.$watch(
            'answer',
            function (answer, oldAnswer) {
              if (
                angular.isUndefined(answer) ||
                angular.isUndefined(oldAnswer) ||
                angular.equals(answer, oldAnswer)
              ) {
                return;
              }

              RegistrationCache.updateCurrent(
                $scope.conference.id,
                $scope.currentRegistration,
              );
            },
            true,
          );
        }

        function startDateChangeCallback(value) {
          $scope.startDate = value;
          $scope.days = DateRangeService.calculateDateRange(
            $scope.startDate,
            $scope.endDate,
          );
        }

        function endDateChangeCallback(value) {
          $scope.endDate = value;
          $scope.days = DateRangeService.calculateDateRange(
            $scope.startDate,
            $scope.endDate,
          );
        }

        function initializeAnswer(
          registrantAnswers,
          block,
          registrantId,
          blockDefault,
        ) {
          var currentAnswer = _.find(registrantAnswers, { blockId: block.id });

          if (
            block.type === 'checkboxQuestion' &&
            angular.isDefined(currentAnswer)
          ) {
            // keep only choices that exist in the Block
            currentAnswer.value = _.pick(
              currentAnswer.value,
              _.map($scope.block.content.choices, 'value'),
            );
          }

          return {
            answer: currentAnswer || {
              id: uuid(),
              registrantId: registrantId,
              blockId: block.id,
              value: getDefaultValue(block.type, blockDefault),
            },
            isNew: !currentAnswer,
          };
        }

        function getDefaultValue(type, blockDefault) {
          switch (type) {
            case 'nameQuestion':
              return {
                firstName: '',
                lastName: '',
              };
            case 'addressQuestion':
              return {
                address1: '',
                address2: '',
                city: '',
                state: '',
                zip: '',
                country: 'US',
              };
            case 'checkboxQuestion':
              return blockDefault || {};
            case 'radioQuestion':
            case 'selectQuestion':
            case 'dateQuestion':
            case 'birthDateQuestion':
            case 'ethnicityQuestion':
            case 'campusQuestion':
            case 'opportunitiesQuestion':
            case 'graduationDateQuestion':
              return blockDefault || '';
            case 'numberQuestion':
              return blockDefault || null;
            default:
              return '';
          }
        }

        $scope.daysForBlock = function () {
          return $scope.days;
        };

        $scope.blockVisible = function (block) {
          if (
            angular.isUndefined($scope.currentRegistration) ||
            angular.isUndefined($scope.currentRegistrant)
          ) {
            return false;
          }
          var registrant = _.find($scope.currentRegistration.registrants, {
            id: $scope.currentRegistrant,
          });
          return validateRegistrant.blockVisible(
            block,
            registrant,
            false,
            $scope.conference,
          );
        };

        function clearAnswerIfOptionHidden(isVisible, block, $scope, choice) {
          // if the option of checkbox, select or radio should be hidden,
          // but it's currently selected, clear the value of that answer
          if (!isVisible && block.type === 'checkboxQuestion') {
            $scope.answer.value[choice.value] = false;
          } else if (
            !isVisible &&
            _.includes(['selectQuestion', 'radioQuestion'], block.type) &&
            $scope.answer.value === choice.value
          ) {
            $scope.answer.value = null;
          }
        }

        function setForceSelections(block, registrant, isVisible, choice) {
          if (block.type !== 'checkboxQuestion') {
            return;
          }
          var ruleStatus = validateRegistrant.checkboxDisable(
            block,
            registrant,
          );
          if (ruleStatus) {
            //making all checkbox with force selection to true
            if (
              angular.isDefined(block.content.forceSelections) &&
              block.content.forceSelections[choice.value] === true &&
              isVisible
            ) {
              $scope.answer.value[choice.value] =
                block.content.forceSelections[choice.value];
            }
          }
        }

        $scope.choiceVisible = function (block, choice) {
          if (angular.isUndefined(choice)) {
            return false;
          }
          var registrant;
          if (angular.isDefined($scope.adminEditRegistrant)) {
            registrant = $scope.adminEditRegistrant;
          } else {
            if (
              angular.isUndefined($scope.currentRegistration) ||
              angular.isUndefined($scope.currentRegistrant)
            ) {
              return false;
            }
            registrant = _.find($scope.currentRegistration.registrants, {
              id: $scope.currentRegistrant,
            });
          }
          var isVisible = validateRegistrant.choiceVisible(
            block,
            choice,
            registrant,
          );

          setForceSelections(block, registrant, isVisible, choice);

          clearAnswerIfOptionHidden(isVisible, block, $scope, choice);

          return isVisible;
        };

        //Check if the checkbox matches force selection rules
        $scope.checkForceRule = function (block) {
          if ($scope.isAdmin) {
            return true;
          } else {
            var registrant;
            if (angular.isDefined($scope.adminEditRegistrant)) {
              registrant = $scope.adminEditRegistrant;
            } else {
              registrant = _.find($scope.currentRegistration.registrants, {
                id: $scope.currentRegistrant,
              });
            }
            return validateRegistrant.checkboxDisable(block, registrant);
          }
        };

        //Get possible year values for graduation date. 5 years in the past and 7 years in the future.
        $scope.getYears = function () {
          let yearStart = new Date().getFullYear() - 5;
          let yearEnd = yearStart + 12;
          let years = Array(yearEnd - yearStart + 1)
            .fill()
            .map(() => yearStart++);
          return years;
        };
      },
    };
  });
