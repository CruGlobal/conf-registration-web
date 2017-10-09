import nameQuestionTemplate from 'components/blocks/nameQuestion.html';

angular.module('confRegistrationWebApp')
  .directive('nameQuestion', function () {
    return {
      templateUrl: nameQuestionTemplate,
      restrict: 'E',
      controller: function ($scope) {
        if(!$scope.answer.value){
          $scope.answer.value = {};
        }
      }
    };
  });
