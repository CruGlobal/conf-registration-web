'use strict';

angular.module('confRegistrationWebApp')
  .directive('crsBlock', function () {
    return {
      templateUrl: 'views/components/blockDirective.html',
      restrict: 'A',
      controller: function ($scope, $routeParams, $modal, AnswerCache, RegistrationCache, uuid) {

        /////// IF OLD CHECKBOX/RADIO/SELECT FORMAT,  UPDATE ////
        if(_.contains(['checkboxQuestion', 'radioQuestion', 'selectQuestion'], $scope.block.type) && angular.isDefined($scope.block.content.choices) && $scope.block.content.choices.length){
          if(angular.isUndefined(_.first($scope.block.content.choices).value)){
            angular.forEach($scope.block.content.choices, function(c, i){
              $scope.block.content.choices[i] = {
                value: c,
                desc: ''
              };
            });
          }
        }
        /////////////////////////////////////////////////

        if (!$scope.wizard) {
          if (angular.isDefined($scope.adminEditRegistration)) {
            //registration object provided
            var answerForThisBlock = _.where($scope.adminEditRegistration.answers, { 'blockId': $scope.block.id });
            if (answerForThisBlock.length > 0) {
              $scope.answer = answerForThisBlock[0];
            }
            if (angular.isUndefined($scope.answer)) {
              $scope.answer = {
                id : uuid(),
                registrantId : $scope.adminEditRegistration.id,
                blockId : $scope.block.id,
                value : ($scope.block.type === 'checkboxQuestion') ? {} : ''
              };
              $scope.adminEditRegistration.answers.push($scope.answer);
            }
          } else {
            RegistrationCache.getCurrent($scope.conference.id).then(function (currentRegistration) {
              var registrantId = $routeParams.reg;
              if(angular.isUndefined(registrantId) || angular.isUndefined($scope.block)){
                return;
              }
              var registrantIndex = _.findIndex(currentRegistration.registrants, { 'id': registrantId });
              if(registrantIndex === -1){
                return;
              }

              var answerForThisBlock = _.where(currentRegistration.registrants[registrantIndex].answers, { 'blockId': $scope.block.id });
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
                currentRegistration.registrants[registrantIndex].answers.push($scope.answer);
              }
            });
            AnswerCache.syncBlock($scope, 'answer');
          }
        }

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
                  alert('Error: please enter a valid additional cost.');
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
          angular.forEach($scope.conference.registrantTypes, function(type) {
            $scope.visibleRegTypes[type.id] = !_.contains($scope.block.registrantTypes, type.id);
          });
          $scope.$watch('visibleRegTypes', function (object) {
            if (angular.isDefined(object)) {
              $scope.block.registrantTypes = [];
              angular.forEach(object, function(v, k) {
                if(!v){
                  $scope.block.registrantTypes.push(k);
                }
              });
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
              alert('Only one ' +
                $scope.block.profileType.charAt(0).toUpperCase() +
                $scope.block.profileType.slice(1).toLowerCase() +
                ' profile block can be used per form.');
              $scope.block.profileType = null;
              $scope.profileCheck = false;
            }
          }
        };
      }
    };
  });
