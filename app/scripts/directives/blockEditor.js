'use strict';

angular.module('confRegistrationWebApp')
  .directive('blockEditor', function () {
    return {
      templateUrl: 'views/components/blockEditor.html',
      restrict: 'A',
      controller: function ($scope, $modal, modalMessage, uuid, expenseTypesConstants, ruleTypeConstants) {
        $scope.activeTab = 'options';
        $scope.visibleRegTypes = {};
        $scope.showClearBtn = true;
        $scope.isAdmin = true;
        $scope.ruleTypeConstants = ruleTypeConstants;
        
        $scope.popup = {
          titleTemplateUrl:'views/popupHyperlinkInformation.html'
        };

        if ($scope.block.type === 'paragraphContent' &&
          angular.isDefined($scope.block.content) &&
          _.isString($scope.block.content)) {
          var prevValue = $scope.block.content;
          $scope.block.content = {
			      default: '',
            paragraph: prevValue,
            ruleoperand: 'AND',
            forceSelectionRuleOperand: 'AND'            
          };
        }

        //initializing rule operand value in block object
        if (angular.isUndefined($scope.block.content) || $scope.block.content === null || $scope.block.content === '') {
          $scope.block.content = {
		        default: '',
            ruleoperand: 'AND',
            forceSelections: {},
            forceSelectionRuleOperand: 'AND'
          };
        }

        if ($scope.block.type === 'checkboxQuestion' && angular.isUndefined($scope.block.content.forceSelectionRuleOperand)) {
          $scope.block.content.forceSelectionRuleOperand = 'AND';
        }    

        if (angular.isUndefined($scope.block.content.ruleoperand)) {
          $scope.block.content.ruleoperand = 'AND';
        }   

        //mapping default value to answer model for showing in front end
        $scope.answer = {
          value: $scope.block.content.default
        };

        $scope.$watch('answer', function (answer, oldAnswer) {
          if (angular.isUndefined(answer) || angular.isUndefined(oldAnswer) ||
           !_.contains(['numberQuestion', 'dateQuestion', 'radioQuestion', 'checkboxQuestion', 'selectQuestion'], $scope.block.type)) {
            return;
          }
          $scope.block.content.default = $scope.answer.value;
          $scope.onChoiceOptionChange();
        }, true);

        //generate a map of regTypes where the keys are the type ids and the values are booleans indicating whether the regType is shown (false means hidden)
        angular.forEach($scope.conference.registrantTypes, function(type) {
          $scope.visibleRegTypes[type.id] = !_.contains($scope.block.registrantTypes, type.id);
        });
        $scope.$watch('visibleRegTypes', function (object) {
          if (angular.isDefined(object)) {
            //remove true values (ones that aren't hidden) and return an array of keys (the ids of the hidden registrantTypes)
            $scope.block.registrantTypes = _.keys(_.omit(object, function(value){ return value; })).sort();
            $scope.visibleRegTypesArray = _.keys(_.omit(object, function(value){ return !value; }));
          }
        }, true);

        var typeToProfile = [];
        //typeToProfile['emailQuestion'] = 'EMAIL';
        //typeToProfile['nameQuestion'] = 'NAME';
        typeToProfile.phoneQuestion = 'PHONE';
        typeToProfile.addressQuestion = 'ADDRESS';
        typeToProfile.genderQuestion = 'GENDER';
        typeToProfile.yearInSchoolQuestion = 'YEAR_IN_SCHOOL';

        $scope.profileCheck = !_.isNull($scope.block.profileType);
        $scope.profileOption = _.has(typeToProfile, $scope.block.type);
        $scope.requiredOption = !_.contains(['paragraphContent'], $scope.block.type);
        $scope.hasOptions = _.contains(['radioQuestion', 'checkboxQuestion', 'selectQuestion'], $scope.block.type);

        var notName = !_.contains(['NAME'], $scope.block.profileType);
        var notNameOrEmail = !_.contains(['NAME', 'EMAIL'], $scope.block.profileType);
        $scope.canDelete = notNameOrEmail;
        $scope.canHaveRules = notNameOrEmail;
        $scope.canChangeRegTypes = notName;
        $scope.expenseTypesConstants = expenseTypesConstants;

        $scope.toggleBlockEdit = function (selectTab){
          $scope.activeTab = {};
          if(selectTab){
            $scope.editBlock = true;
            $scope.activeTab[selectTab] = true;
          }else{
            $scope.editBlock = !$scope.editBlock;
          }
        };

        $scope.editBlockAddOption = function (newOption) {
          if (angular.isUndefined($scope.block.content)) {
            $scope.block.content = { 'choices': [] };
          } else if(angular.isUndefined($scope.block.content.choices)){
            $scope.block.content.choices = [];
          }
          $scope.block.content.choices.push({
            value: newOption,
            desc: ''
          });
        };

        $scope.editBlockOptionMoveUp = function (index) {
          if(index > 0 && index < $scope.block.content.choices.length){
            var temp = $scope.block.content.choices[index];
            $scope.block.content.choices[index] = $scope.block.content.choices[index - 1];
            $scope.block.content.choices[index - 1] = temp;
          }
        };

        $scope.editBlockOptionMoveDown = function (index) {
          if(index >= 0 && index < $scope.block.content.choices.length - 1){
            var temp = $scope.block.content.choices[index];
            $scope.block.content.choices[index] = $scope.block.content.choices[index + 1];
            $scope.block.content.choices[index + 1] = temp;
          }
        };

        $scope.editBlockDeleteOption = function (index) {
          $scope.block.content.choices.splice(index, 1);
        };

        $scope.editBlockOptionAdvanced = function (index) {
          $modal.open({
            templateUrl: 'views/modals/choiceOptions.html',
            controller: function($scope, $modalInstance, choice, blockType){
              $scope.blockType = blockType;
              $scope.choice = choice;
              $scope.close = function () {
                $modalInstance.dismiss();
              };

              $scope.save = function (choice) {
                if(_.isUndefined(choice.amount)){
                  choice.amount = 0;
                }else if(_.isString(choice.amount)){
                  choice.amount = choice.amount.replace(',','');
                }
                if(_.isNaN(Number(choice.amount))){
                  modalMessage.error('Error: please enter a valid additional cost.');
                }else{
                  $modalInstance.close(choice);
                }
              };
            },
            resolve: {
              choice: function () {
                return angular.copy($scope.block.content.choices[index]);
              },
              blockType: function(){
                return $scope.block.type;
              }
            }
          }).result.then(function (choice) {
            choice.amount = Number(choice.amount);
            $scope.block.content.choices[index] = choice;
          });
        };

        $scope.toggleProfileType = function (value) {
          if (!value) {
            $scope.block.profileType = null;
          } else {
            $scope.block.profileType = typeToProfile[$scope.block.type];
            var profileCount = 0;
            $scope.conference.registrationPages.forEach(function (page) {
              page.blocks.forEach(function (block) {
                if ($scope.block.profileType === block.profileType) {
                  profileCount++;
                }
              });
            });
            if (profileCount > 1) {
              modalMessage.error('Only one ' +
                  $scope.block.profileType.charAt(0).toUpperCase() +
                  $scope.block.profileType.slice(1).toLowerCase() +
                  ' profile block can be used per form.');
              $scope.block.profileType = null;
              $scope.profileCheck = false;
            }
          }
        };

        $scope.registrationTypeName = function(id){
          if(!id){ return; }
          return _.find($scope.conference.registrantTypes, { 'id': id }).name;
        };

        $scope.onChoiceOptionChange = function () {
          if ($scope.block.type === 'checkboxQuestion' && !angular.isUndefined($scope.block.content.default)) {
            for (var keyName in $scope.block.content.default) {
              var key = keyName;
              if (_.where($scope.block.content.choices, { 'value': keyName }).length === 0) {
                $scope.block.content.default[key] = undefined;
              }
            }
          }
        };  

        $scope.disableForceSelectionRule = function () {
          if ($scope.block.content.forceSelections === {} || !_.contains(_.values($scope.block.content.forceSelections), true)) {
            //$scope.block.additionalRules = [];
            _.remove($scope.block.rules, { ruleType: ruleTypeConstants.FORCE_SELECTION });
            return true;
          } else {
            return false;
          }
        };

      }
    };
  });
