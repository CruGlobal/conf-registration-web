import template from 'views/components/blockEditor.html';
import popupHyperlinkInformationTemplate from 'views/popupHyperlinkInformation.html';
import choiceOptionsModalTemplate from 'views/modals/choiceOptions.html';
import { allCountries } from 'country-region-data';
import { getCurrentRegions } from '../filters/eventAddressFormat';

export const familyLifeMinistryId = '9f63db46-6ca9-43b0-868a-23326b3c4d91';

angular.module('confRegistrationWebApp').directive('blockEditor', function () {
  return {
    templateUrl: template,
    restrict: 'A',
    controller: function (
      $scope,
      $uibModal,
      modalMessage,
      uuid,
      expenseTypesConstants,
      ruleTypeConstants,
      blockIntegrationService,
    ) {
      $scope.activeTab = 'options';
      $scope.visibleRegTypes = {};
      $scope.showClearBtn = true;
      $scope.isAdmin = true;
      $scope.ruleTypeConstants = ruleTypeConstants;
      $scope.editBlockAddOptionAnswer = { value: '' };
      $scope.dateDependent =
        (angular.isDefined($scope.block.startDateBlockId) &&
          $scope.block.startDateBlockId !== null) ||
        (angular.isDefined($scope.block.endDateBlockId) &&
          $scope.block.endDateBlockId !== null);

      $scope.countries = allCountries;
      $scope.popup = {
        titleTemplateUrl: popupHyperlinkInformationTemplate,
      };
      $scope.integrationTypes =
        blockIntegrationService.integrationTypes() || [];
      $scope.blockIntegrations = $scope.$parent.blockIntegrations || [];

      // Ensure blockIntegrationId is initialized correctly
      if (!$scope.block.blockIntegrationId) {
        $scope.block.blockIntegrationId = null;
      }

      if (!$scope.answer) {
        $scope.answer = {};
      }

      // Migrate old paragraph content objects
      if (
        $scope.block.type === 'paragraphContent' &&
        angular.isDefined($scope.block.content) &&
        _.isString($scope.block.content)
      ) {
        var prevValue = $scope.block.content;
        $scope.block.content = {
          default: '',
          paragraph: prevValue,
          ruleoperand: 'AND',
          forceSelectionRuleOperand: 'AND',
        };
      }

      //initializing rule operand value in block object
      if (
        angular.isUndefined($scope.block.content) ||
        $scope.block.content === null ||
        $scope.block.content === ''
      ) {
        $scope.block.content = {
          default: '',
          ruleoperand: 'AND',
          forceSelections: {},
          forceSelectionRuleOperand: 'AND',
        };
        if ($scope.block.type === 'checkboxQuestion') {
          $scope.block.content.default = {};
        }
      }

      if (
        $scope.block.type === 'checkboxQuestion' &&
        angular.isUndefined($scope.block.content.forceSelectionRuleOperand)
      ) {
        $scope.block.content.forceSelectionRuleOperand = 'AND';
      }

      if (angular.isUndefined($scope.block.content.ruleoperand)) {
        $scope.block.content.ruleoperand = 'AND';
      }

      //mapping default value to answer model for showing in front end
      if (
        _.includes(
          [
            'numberQuestion',
            'dateQuestion',
            'radioQuestion',
            'checkboxQuestion',
            'selectQuestion',
            'birthDateQuestion',
            'campusQuestion',
            'dormitoryQuestion',
          ],
          $scope.block.type,
        )
      ) {
        $scope.answer = {
          value: $scope.block.content.default,
        };
      }

      if (_.includes(['addressQuestion'], $scope.block.type)) {
        $scope.answer = {
          value: {
            address1: null,
            address2: null,
            city: null,
            state: null,
            zip: null,
            country: 'US',
          },
        };
      }

      $scope.currentRegions = (country) => getCurrentRegions(country);

      $scope.$watch(
        'answer',
        function (answer, oldAnswer) {
          if (
            angular.isUndefined(answer) ||
            angular.isUndefined(oldAnswer) ||
            !_.includes(
              [
                'numberQuestion',
                'dateQuestion',
                'radioQuestion',
                'checkboxQuestion',
                'selectQuestion',
                'birthDateQuestion',
                'campusQuestion',
                'dormitoryQuestion',
              ],
              $scope.block.type,
            )
          ) {
            return;
          }
          $scope.block.content.default = $scope.answer.value;
          $scope.onChoiceOptionChange();
        },
        true,
      );

      //generate a map of regTypes where the keys are the type ids and the values are booleans indicating whether the regType is shown (false means hidden)
      angular.forEach($scope.conference.registrantTypes, function (type) {
        // We store the registrantTypes on the block that should NOT show the question.
        // Which is why the value is inverted here.
        $scope.visibleRegTypes[type.id] = !_.includes(
          $scope.block.registrantTypes,
          type.id,
        );
      });
      $scope.$watch(
        'visibleRegTypes',
        function (object) {
          if (angular.isDefined(object)) {
            //remove true values (ones that aren't hidden) and return an array of keys (the ids of the hidden registrantTypes)
            $scope.block.registrantTypes = _.keys(
              _.omitBy(object, function (value) {
                return value;
              }),
            ).sort();
            $scope.visibleRegTypesArray = _.keys(
              _.pickBy(object, function (value) {
                return value;
              }),
            );
          }
        },
        true,
      );

      $scope.typeToProfile = [];
      //$scope.typeToProfile['emailQuestion'] = 'EMAIL';
      //$scope.typeToProfile['nameQuestion'] = 'NAME';
      $scope.typeToProfile.phoneQuestion = 'PHONE';
      $scope.typeToProfile.addressQuestion = 'ADDRESS';
      $scope.typeToProfile.genderQuestion = 'GENDER';
      $scope.typeToProfile.yearInSchoolQuestion = 'YEAR_IN_SCHOOL';
      $scope.typeToProfile.opportunitiesQuestion = 'OPPORTUNITIES';
      $scope.typeToProfile.birthDateQuestion = 'BIRTH_DATE';
      $scope.typeToProfile.campusQuestion = 'CAMPUS';
      $scope.typeToProfile.dormitoryQuestion = 'DORMITORY';
      $scope.typeToProfile.graduationDateQuestion = 'GRADUATION_DATE';
      $scope.typeToProfile.ethnicityQuestion = 'ETHNICITY';

      $scope.profileCheck = !_.isNull($scope.block.profileType);
      $scope.profileOption = _.has($scope.typeToProfile, $scope.block.type);
      $scope.requiredOption = !_.includes(
        ['paragraphContent'],
        $scope.block.type,
      );
      $scope.hasOptions = _.includes(
        ['radioQuestion', 'checkboxQuestion', 'selectQuestion'],
        $scope.block.type,
      );

      var notName = !_.includes(['NAME'], $scope.block.profileType);
      var notNameOrEmail = !_.includes(
        ['NAME', 'EMAIL'],
        $scope.block.profileType,
      );
      const notEform = $scope.block.tag !== 'EFORM';
      $scope.canDelete = notNameOrEmail && notEform;
      $scope.eform = !notEform;
      $scope.canCopy = notEform;
      $scope.canHaveRules = notNameOrEmail;
      $scope.canHaveAnswerRules = notNameOrEmail && $scope.hasOptions;
      $scope.canChangeRegTypes = notName;
      $scope.expenseTypesConstants = expenseTypesConstants;
      $scope.canBeDateDependent = $scope.hasOptions;

      $scope.toggleBlockEdit = function (selectTab) {
        $scope.activeTab = {};
        if (selectTab) {
          $scope.editBlock = true;
          $scope.activeTab[selectTab] = true;
        } else {
          $scope.editBlock = !$scope.editBlock;
        }
      };

      $scope.editBlockAddOption = function (newOption) {
        if (angular.isUndefined($scope.block.content)) {
          $scope.block.content = { choices: [] };
        } else if (angular.isUndefined($scope.block.content.choices)) {
          $scope.block.content.choices = [];
        }
        if (_.some($scope.block.content.choices, ['value', newOption])) {
          modalMessage.error(
            'Error: You may not use the same answer more than once for this question. Each answer needs to be unique.',
          );
        } else {
          $scope.block.content.choices.push({
            value: newOption,
            desc: '',
            operand: 'OR',
          });
          $scope.editBlockAddOptionAnswer.value = '';
        }
      };

      $scope.editBlockOptionMoveUp = function (index) {
        if (index > 0 && index < $scope.block.content.choices.length) {
          var temp = $scope.block.content.choices[index];
          $scope.block.content.choices[index] =
            $scope.block.content.choices[index - 1];
          $scope.block.content.choices[index - 1] = temp;
        }
      };

      $scope.editBlockOptionMoveDown = function (index) {
        if (index >= 0 && index < $scope.block.content.choices.length - 1) {
          var temp = $scope.block.content.choices[index];
          $scope.block.content.choices[index] =
            $scope.block.content.choices[index + 1];
          $scope.block.content.choices[index + 1] = temp;
        }
      };

      $scope.editBlockDeleteOption = function (index) {
        $scope.block.content.choices.splice(index, 1);
      };

      $scope.editBlockOptionAdvanced = function (index) {
        $uibModal
          .open({
            templateUrl: choiceOptionsModalTemplate,
            controller: function (
              $scope,
              $uibModalInstance,
              choice,
              blockType,
              currency,
            ) {
              $scope.blockType = blockType;
              $scope.choice = choice;
              $scope.currency = currency;
              $scope.close = function () {
                $uibModalInstance.dismiss();
              };

              $scope.save = function (choice) {
                if (_.isUndefined(choice.amount)) {
                  choice.amount = 0;
                } else if (_.isString(choice.amount)) {
                  choice.amount = choice.amount.replace(',', '');
                }
                if (_.isNaN(Number(choice.amount))) {
                  modalMessage.error(
                    'Error: please enter a valid additional cost.',
                  );
                } else {
                  $uibModalInstance.close(choice);
                }
              };
            },
            resolve: {
              choice: function () {
                return angular.copy($scope.block.content.choices[index]);
              },
              blockType: function () {
                return $scope.block.type;
              },
              currency: function () {
                return $scope.conference.currency.currencyCode;
              },
            },
          })
          .result.then(function (choice) {
            choice.amount = Number(choice.amount);
            $scope.block.content.choices[index] = choice;
          });
      };

      $scope.toggleProfileType = function (value) {
        if (!value) {
          $scope.block.profileType = null;
        } else {
          $scope.block.profileType = $scope.typeToProfile[$scope.block.type];
          let profileCount = 0;
          $scope.conference.registrationPages.forEach(function (page) {
            page.blocks.forEach(function (block) {
              if ($scope.block.profileType === block.profileType) {
                profileCount++;
              }
            });
          });
          if (profileCount > 1) {
            $scope.pType =
              $scope.block.profileType == 'GENDER'
                ? 'Sex'
                : $scope.block.profileType.charAt(0).toUpperCase() +
                  $scope.block.profileType
                    .split('_')
                    .join(' ')
                    .slice(1)
                    .toLowerCase();
            modalMessage.error(
              'Only one ' +
                $scope.pType +
                ' profile block can be used per form.',
            );
            $scope.block.profileType = null;
            $scope.profileCheck = false;
          }
        }
      };
      $scope.registrationTypeName = function (id) {
        if (!id) {
          return;
        }
        return _.find($scope.conference.registrantTypes, { id: id }).name;
      };

      $scope.storePreviousValue = function (optionIndex) {
        if (!$scope.previousChoiceValues) {
          $scope.previousChoiceValues = {};
        }
        $scope.previousChoiceValues[optionIndex] =
          $scope.block.content.choices[optionIndex].value;
      };

      $scope.onChoiceOptionChange = function (optionIndex) {
        if ($scope.block.type === 'checkboxQuestion') {
          var keyName, key;

          if (angular.isDefined($scope.block.content.default)) {
            for (keyName in $scope.block.content.default) {
              key = keyName;
              if (
                _.filter($scope.block.content.choices, { value: keyName })
                  .length === 0
              ) {
                $scope.block.content.default[key] = undefined;
              }
            }
          }

          if (angular.isDefined($scope.block.content.forceSelections)) {
            for (keyName in $scope.block.content.forceSelections) {
              key = keyName;
              if (
                _.filter($scope.block.content.choices, { value: keyName })
                  .length === 0
              ) {
                $scope.block.content.forceSelections[key] = undefined;
              }
            }
          }
        }

        // if radio, update the selected answer if the selected option was edited
        if (
          $scope.block.type === 'radioQuestion' &&
          angular.isDefined(optionIndex)
        ) {
          const previousValue =
            $scope.previousChoiceValues &&
            $scope.previousChoiceValues[optionIndex];
          const currentSelectedValue = $scope.block.content.default;

          // If the previous value matches the currently selected value,
          // update the selected value to the new edited value
          if (previousValue && previousValue === currentSelectedValue) {
            const editedOption = $scope.block.content.choices[optionIndex];
            $scope.block.content.default = editedOption.value;

            // Also update the answer model
            if ($scope.answer) {
              $scope.answer.value = editedOption.value;
            }

            // Update the stored previous value to the new value for next edit
            $scope.previousChoiceValues[optionIndex] = editedOption.value;
          }
        }
      };

      $scope.disableForceSelectionRule = function () {
        if (
          _.isEmpty($scope.block.content.forceSelections) ||
          !_.includes(_.values($scope.block.content.forceSelections), true)
        ) {
          //$scope.block.additionalRules = [];
          _.remove($scope.block.rules, {
            ruleType: ruleTypeConstants.FORCE_SELECTION,
          });
          return true;
        }
        return false;
      };

      $scope.daysForBlock = function () {
        return 1;
      };

      $scope.toggleDateDependent = function (value) {
        if (!value) {
          $scope.block.startDateBlockId = null;
          $scope.block.endDateBlockId = null;
        }
      };

      $scope.dateBlocks = function () {
        var blocks = _.flatten(
          _.map($scope.conference.registrationPages, 'blocks'),
        );
        //remove blocks after current block
        var remove = false;
        _.remove(blocks, function (b) {
          if (b.id === $scope.block.id) {
            remove = true;
          }
          return remove;
        });

        var questionTypes = ['dateQuestion'];

        blocks = _.filter(blocks, function (b) {
          return _.includes(questionTypes, b.type);
        });

        return blocks;
      };

      $scope.choiceVisible = function () {
        return true;
      };

      $scope.eventHasQuestionType = function (questionType) {
        let questionTypeFound = false;
        $scope.conference.registrationPages.forEach(function (page) {
          page.blocks.forEach(function (block) {
            if (block.type === questionType) {
              questionTypeFound = true;
            }
          });
        });
        return questionTypeFound;
      };

      // On load, create a temporary block integration model to prevent
      // ng-model from directly updating block.blockIntegrationId before validation occurs
      // This is necessary to prevent server errors.
      $scope.selectedIntegrationId = $scope.block.blockIntegrationId;

      // Listen for integration types loaded event
      $scope.$on('integrationTypesLoaded', function () {
        $scope.integrationTypes = $scope.$parent.integrationTypes;
        $scope.blockIntegrations = $scope.$parent.blockIntegrations;
      });

      $scope.integrationTypeChanged = function (selectedIntegrationId) {
        const validation = blockIntegrationService.validateFieldSelection(
          selectedIntegrationId,
          $scope.blockIntegrations,
          $scope.block.id,
        );
        // Store validation result for display
        $scope.integrationValidation = validation;
        if (validation.valid) {
          // Update the blockIntegrationId property if validation passes
          $scope.block.blockIntegrationId = selectedIntegrationId;
          // We also need to update the parent controller to refetch the data
          $scope.$parent.fetchBlockIntegrations();
        } else {
          // Revert the dropdown selection to the previous valid blockIntegrationId
          $scope.selectedIntegrationId = $scope.block.blockIntegrationId;
        }
      };

      $scope.showIntegrationDropdown = function () {
        return $scope.conference.ministry === familyLifeMinistryId;
      };
    },
  };
});
