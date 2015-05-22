'use strict';

angular.module('confRegistrationWebApp')
  .directive('crsBlock', function () {
    return {
      templateUrl: 'views/components/blockDirective.html',
      restrict: 'A',
      controller: function ($scope, $routeParams, $modal, modalMessage, AnswerCache, uuid, validateRegistrant) {
        if (!$scope.wizard) {
          if (angular.isDefined($scope.adminEditRegistrant)) {
            //registration object provided
            var answerForThisBlock = _.where($scope.adminEditRegistrant.answers, { 'blockId': $scope.block.id });
            if (answerForThisBlock.length > 0) {
              $scope.answer = answerForThisBlock[0];
            }
            if (angular.isUndefined($scope.answer)) {
              $scope.answer = {
                id : uuid(),
                registrantId : $scope.adminEditRegistrant.id,
                blockId : $scope.block.id,
                value : ($scope.block.type === 'checkboxQuestion') ? {} : ''
              };
              $scope.adminEditRegistrant.answers.push($scope.answer);
            }
          } else {
            var registrantId = $routeParams.reg;
            if(angular.isUndefined(registrantId) || angular.isUndefined($scope.block)){
              return;
            }
            var registrantIndex = _.findIndex($scope.currentRegistration.registrants, { 'id': registrantId });
            if(registrantIndex === -1){
              return;
            }

            var answerForThisBlock = _.where($scope.currentRegistration.registrants[registrantIndex].answers, { 'blockId': $scope.block.id });
            if (answerForThisBlock.length > 0) {
              $scope.answer = answerForThisBlock[0];
            }
            if (angular.isUndefined($scope.answer)) {
              $scope.answer = {
                id : uuid(),
                registrantId : registrantId,
                blockId : $scope.block.id,
                value : ($scope.block.type === 'checkboxQuestion') ? {} : ''
              };
              $scope.currentRegistration.registrants[registrantIndex].answers.push($scope.answer);
            }

            AnswerCache.syncBlock($scope, 'answer');
          }
        }

        $scope.toggleBlockEdit = function (){
          $scope.editBlock = !$scope.editBlock;
        };

        $scope.editBlockAddOption = function (newOption) {
          if (angular.isUndefined($scope.block.content.choices)) {
            $scope.block.content = {'choices': [] };
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

        if($scope.wizard){
          $scope.activeTab = 'options';
          $scope.visibleRegTypes = {};
          //generate a map of regTypes where the keys are the type ids and the values are booleans indicating whether the regType is shown (false means hidden)
          angular.forEach($scope.conference.registrantTypes, function(type) {
            $scope.visibleRegTypes[type.id] = !_.contains($scope.block.registrantTypes, type.id);
          });
          $scope.$watch('visibleRegTypes', function (object) {
            if (angular.isDefined(object)) {
              //remove true values (ones that aren't hidden) and return an array of keys (the ids of the hidden registrantTypes)
              $scope.block.registrantTypes = _.keys(_.omit(object, function(value){ return value; })).sort();
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
          $scope.canDelete = !_.contains(['NAME', 'EMAIL'], $scope.block.profileType);
          $scope.canChangeRegTypes = !_.contains(['NAME'], $scope.block.profileType);
          $scope.hasOptions = _.contains(['radioQuestion', 'checkboxQuestion', 'selectQuestion'], $scope.block.type);
        }

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

        $scope.addRule = function(blockId){
          $scope.block.rules.push({
            id: uuid(),
            parentBlockId: $scope.ruleBlocks()[0].id,
            operator: '=',
            value: ''
          });
        };

        $scope.ruleBlocks = function(){
          var blocks = _.flatten(_.pluck($scope.conference.registrationPages, 'blocks'));
          //remove blocks after current block
          var remove = false;
          _.remove(blocks, function(b){
            if(b.id === $scope.block.id){
              remove = true;
            }
            return remove;
          });

          //remove invalid block types
          blocks = _.remove(blocks, function(b){
            return _.contains(['radioQuestion', 'selectQuestion', 'numberQuestion', 'dateQuestion', 'genderQuestion', 'yearInSchoolQuestion'], b.type);
          });

          return blocks;
        };

        $scope.ruleValues = function(parentBlockId){
          var blocks = _.flatten(_.pluck($scope.conference.registrationPages, 'blocks'));
          var block = _.find(blocks, { 'id': parentBlockId });

          switch (block.type) {
            case 'selectQuestion':
            case 'radioQuestion':
              return _.pluck(block.content.choices, 'value');
            case 'genderQuestion':
              return ['Male', 'Female'];
            case 'yearInSchoolQuestion':
              return ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate Student'];
            default:
              return [];
          }
        };

        $scope.removeRule = function(id){
          _.remove($scope.block.rules, {id: id});
        };


        $scope.blockVisibleRuleCheck = function(block){
          var registrant = _.find($scope.currentRegistration.registrants, {id: $scope.currentRegistrant});
          return validateRegistrant.blockVisibleRuleCheck(block, registrant);
        };
      }
    };
  });
