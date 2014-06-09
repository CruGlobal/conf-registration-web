'use strict';

angular.module('confRegistrationWebApp')
  .directive('crsBlock', function () {
    return {
      templateUrl: 'views/blockDirective.html',
      restrict: 'A',
      controller: function ($scope, AnswerCache, RegistrationCache, uuid) {
        //expose lodash library on scope
        $scope._ = _;

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
            //$scope.$$childTail.editBlockAddOptionValue = '';
            console.log($scope.this.block.content.choices);
          }
        };

        $scope.editBlockDeleteOption = function (index) {
          $scope.this.block.content.choices.splice(index, 1);
          console.log($scope.this.block.content.choices);
        };

        $scope.toggleProfileType = function () {
          if (!$scope.this.block.profileType) {
            $scope.this.block.profileType = null;
          }

          if (!_.isNull($scope.this.block.profileType)) {
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
            }
          }
        };
      }
    };
  });
