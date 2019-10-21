import template from 'views/components/blockEditor.html';
import popupHyperlinkInformationTemplate from 'views/popupHyperlinkInformation.html';
import choiceOptionsModalTemplate from 'views/modals/choiceOptions.html';

angular.module('confRegistrationWebApp').directive('blockEditor', function() {
  return {
    templateUrl: template,
    restrict: 'A',
    controller: function(
      $scope,
      $uibModal,
      modalMessage,
      uuid,
      expenseTypesConstants,
      ruleTypeConstants,
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

      $scope.popup = {
        titleTemplateUrl: popupHyperlinkInformationTemplate,
      };

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

      $scope.$watch(
        'answer',
        function(answer, oldAnswer) {
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
      angular.forEach($scope.conference.registrantTypes, function(type) {
        $scope.visibleRegTypes[type.id] = !_.includes(
          $scope.block.registrantTypes,
          type.id,
        );
      });
      $scope.$watch(
        'visibleRegTypes',
        function(object) {
          if (angular.isDefined(object)) {
            //remove true values (ones that aren't hidden) and return an array of keys (the ids of the hidden registrantTypes)
            $scope.block.registrantTypes = _.keys(
              _.omitBy(object, function(value) {
                return value;
              }),
            ).sort();
            $scope.visibleRegTypesArray = _.keys(
              _.pickBy(object, function(value) {
                return value;
              }),
            );
          }
        },
        true,
      );

      var typeToProfile = [];
      //typeToProfile['emailQuestion'] = 'EMAIL';
      //typeToProfile['nameQuestion'] = 'NAME';
      typeToProfile.phoneQuestion = 'PHONE';
      typeToProfile.addressQuestion = 'ADDRESS';
      typeToProfile.genderQuestion = 'GENDER';
      typeToProfile.yearInSchoolQuestion = 'YEAR_IN_SCHOOL';
      typeToProfile.birthDateQuestion = 'BIRTH_DATE';
      typeToProfile.campusQuestion = 'CAMPUS';
      typeToProfile.dormitoryQuestion = 'DORMITORY';

      $scope.profileCheck = !_.isNull($scope.block.profileType);
      $scope.profileOption = _.has(typeToProfile, $scope.block.type);
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
      $scope.canDelete = notNameOrEmail;
      $scope.canHaveRules = notNameOrEmail;
      $scope.canHaveAnswerRules = notNameOrEmail && $scope.hasOptions;
      $scope.canChangeRegTypes = notName;
      $scope.expenseTypesConstants = expenseTypesConstants;
      $scope.canBeDateDependent = $scope.hasOptions;

      $scope.toggleBlockEdit = function(selectTab) {
        $scope.activeTab = {};
        if (selectTab) {
          $scope.editBlock = true;
          $scope.activeTab[selectTab] = true;
        } else {
          $scope.editBlock = !$scope.editBlock;
        }
      };

      $scope.editBlockAddOption = function(newOption) {
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

      $scope.editBlockOptionMoveUp = function(index) {
        if (index > 0 && index < $scope.block.content.choices.length) {
          var temp = $scope.block.content.choices[index];
          $scope.block.content.choices[index] =
            $scope.block.content.choices[index - 1];
          $scope.block.content.choices[index - 1] = temp;
        }
      };

      $scope.editBlockOptionMoveDown = function(index) {
        if (index >= 0 && index < $scope.block.content.choices.length - 1) {
          var temp = $scope.block.content.choices[index];
          $scope.block.content.choices[index] =
            $scope.block.content.choices[index + 1];
          $scope.block.content.choices[index + 1] = temp;
        }
      };

      $scope.editBlockDeleteOption = function(index) {
        $scope.block.content.choices.splice(index, 1);
      };

      $scope.editBlockOptionAdvanced = function(index) {
        $uibModal
          .open({
            templateUrl: choiceOptionsModalTemplate,
            controller: function(
              $scope,
              $uibModalInstance,
              choice,
              blockType,
              currency,
            ) {
              $scope.blockType = blockType;
              $scope.choice = choice;
              $scope.currency = currency;
              $scope.close = function() {
                $uibModalInstance.dismiss();
              };

              $scope.save = function(choice) {
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
              choice: function() {
                return angular.copy($scope.block.content.choices[index]);
              },
              blockType: function() {
                return $scope.block.type;
              },
              currency: function() {
                return $scope.conference.currency.shortSymbol;
              },
            },
          })
          .result.then(function(choice) {
            choice.amount = Number(choice.amount);
            $scope.block.content.choices[index] = choice;
          });
      };

      $scope.toggleProfileType = function(value) {
        if (!value) {
          $scope.block.profileType = null;
        } else {
          $scope.block.profileType = typeToProfile[$scope.block.type];
          var profileCount = 0;
          $scope.conference.registrationPages.forEach(function(page) {
            page.blocks.forEach(function(block) {
              if ($scope.block.profileType === block.profileType) {
                profileCount++;
              }
            });
          });
          if (profileCount > 1) {
            modalMessage.error(
              'Only one ' +
                $scope.block.profileType.charAt(0).toUpperCase() +
                $scope.block.profileType.slice(1).toLowerCase() +
                ' profile block can be used per form.',
            );
            $scope.block.profileType = null;
            $scope.profileCheck = false;
          }
        }
      };

      $scope.registrationTypeName = function(id) {
        if (!id) {
          return;
        }
        return _.find($scope.conference.registrantTypes, { id: id }).name;
      };

      $scope.onChoiceOptionChange = function() {
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
      };

      $scope.disableForceSelectionRule = function() {
        if (
          $scope.block.content.forceSelections === {} ||
          !_.includes(_.values($scope.block.content.forceSelections), true)
        ) {
          //$scope.block.additionalRules = [];
          _.remove($scope.block.rules, {
            ruleType: ruleTypeConstants.FORCE_SELECTION,
          });
          return true;
        } else {
          return false;
        }
      };

      $scope.daysForBlock = function() {
        return 1;
      };

      $scope.toggleDateDependent = function(value) {
        if (!value) {
          $scope.block.startDateBlockId = null;
          $scope.block.endDateBlockId = null;
        }
      };

      $scope.dateBlocks = function() {
        var blocks = _.flatten(
          _.map($scope.conference.registrationPages, 'blocks'),
        );
        //remove blocks after current block
        var remove = false;
        _.remove(blocks, function(b) {
          if (b.id === $scope.block.id) {
            remove = true;
          }
          return remove;
        });

        var questionTypes = ['dateQuestion'];

        blocks = _.filter(blocks, function(b) {
          return _.includes(questionTypes, b.type);
        });

        return blocks;
      };

      $scope.choiceVisible = function() {
        return true;
      };
    },
  };
});
