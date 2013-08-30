'use strict';

angular.module('confRegistrationWebApp')
  .directive('block', function () {
    return {
      templateUrl: 'views/blockDirective.html',
      restrict: 'E',
      controller: function ($scope, AnswerCache, RegistrationCache, uuid) {
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
              value : {}
            };
            currentRegistration.answers.push($scope.answer);
          }
        });
        AnswerCache.syncBlock($scope, 'answer');

        $scope.editBlockAddOption = function(){
          if(typeof $scope.this.block.content.choices === 'undefined'){
            $scope.this.block.content = {"choices": [] }
          }
          if($.inArray($scope.$$childTail.editBlockAddOptionValue, $scope.this.block.content.choices)>=0){
            alert('Option already exists.');
          }else{
            $scope.this.block.content.choices.push($scope.$$childTail.editBlockAddOptionValue);
            $scope.$$childTail.editBlockAddOptionValue='';
            console.log($scope.this.block.content.choices);
          }

        }

        $scope.editBlockDeleteOption = function(index){
          $scope.this.block.content.choices.splice(index,1);
          console.log($scope.this.block.content.choices);
        }
      }
    };
  });
