'use strict';

angular.module('confRegistrationWebApp')
  .directive('crsBlock', function () {
    return {
      templateUrl: 'views/components/blockDirective.html',
      restrict: 'A',
      controller: function ($scope, AnswerCache, RegistrationCache, uuid) {
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
                registrationId : $scope.adminEditRegistration.id,
                blockId : $scope.block.id,
                value : ($scope.block.type === 'checkboxQuestion') ? {} : ''
              };
              $scope.adminEditRegistration.answers.push($scope.answer);
            }
          } else {
            //registration not provided, use current users
            RegistrationCache.getCurrent($scope.conference.id).then(function (currentRegistration) {
              var answerForThisBlock = _.where(currentRegistration.answers, { 'blockId': $scope.block.id });
              if (answerForThisBlock.length > 0) {
                $scope.answer = answerForThisBlock[0];
              }
              if (angular.isUndefined($scope.answer)) {
                $scope.answer = {
                  id : uuid(),
                  registrationId : currentRegistration.id,
                  blockId : $scope.block.id,
                  value : ($scope.block.type === 'checkboxQuestion') ? {} : ''
                };
                currentRegistration.answers.push($scope.answer);
              }
            });
            AnswerCache.syncBlock($scope, 'answer');
          }
        }

        $scope.editBlockAddOption = function (newOption) {
          if (angular.isUndefined($scope.this.block.content.choices)) {
            $scope.this.block.content = {'choices': [] };
          }
          if ($.inArray(newOption, $scope.this.block.content.choices) >= 0) {
            //alert('Option already exists.');
          } else {
            $scope.this.block.content.choices.push(newOption);
          }
        };

        $scope.editBlockDeleteOption = function (index) {
          $scope.this.block.content.choices.splice(index, 1);
        };

        var typeToProfile = [];
        //typeToProfile['emailQuestion'] = 'EMAIL';
        //typeToProfile['nameQuestion'] = 'NAME';
        typeToProfile.phoneQuestion = 'PHONE';
        typeToProfile.addressQuestion = 'ADDRESS';
        typeToProfile.genderQuestion = 'GENDER';
        typeToProfile.yearInSchoolQuestion = 'YEAR_IN_SCHOOL';

        $scope.this.profileCheck = !_.isNull($scope.this.block.profileType);
        $scope.this.profileOption = _.has(typeToProfile, $scope.this.block.type);
        $scope.this.requiredOption = !_.contains(['paragraphContent'], $scope.this.block.type);
        $scope.this.canDelete = !_.contains(['NAME', 'EMAIL'], $scope.this.block.profileType);
        $scope.this.hasOptions = _.contains(['radioQuestion', 'checkboxQuestion', 'selectQuestion'], $scope.this.block.type);

        $scope.toggleProfileType = function (value) {
          if (!value) {
            $scope.this.block.profileType = null;
          } else {
            $scope.this.block.profileType = typeToProfile[$scope.this.block.type];
            var profileCount = 0;
            $scope.conference.registrationPages.forEach(function (page) {
              page.blocks.forEach(function (block) {
                if ($scope.this.block.profileType === block.profileType) {
                  profileCount++;
                }
              });
            });
            if (profileCount > 1) {
              alert('Only one ' +
                $scope.this.block.profileType.charAt(0).toUpperCase() +
                $scope.this.block.profileType.slice(1).toLowerCase() +
                ' profile block can be used per form.');
              $scope.this.block.profileType = null;
              $scope.this.profileCheck = false;
            }
          }
        };
      }
    };
  });
