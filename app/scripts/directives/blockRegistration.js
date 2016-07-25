'use strict';

angular.module('confRegistrationWebApp')
  .directive('blockRegistration', function () {
    return {
      templateUrl: 'views/components/blockRegistration.html',
      restrict: 'A',
      controller: function ($scope, $routeParams, RegistrationCache, uuid, validateRegistrant) {
        if (angular.isDefined($scope.adminEditRegistrant)) {
          //registration object provided
          $scope.answer = _.find($scope.adminEditRegistrant.answers, {'blockId': $scope.block.id});
          if (angular.isUndefined($scope.answer)) {
            $scope.answer = {
              id: uuid(),
              registrantId: $scope.adminEditRegistrant.id,
              blockId: $scope.block.id,
              value: ($scope.block.type === 'checkboxQuestion') ? {} : ''
            };
            $scope.adminEditRegistrant.answers.push($scope.answer);
          }
        } else {
          var registrantId = $routeParams.reg;
          if (angular.isUndefined(registrantId) || angular.isUndefined($scope.block)) {
            return;
          }
          var registrantIndex = _.findIndex($scope.currentRegistration.registrants, {'id': registrantId});
          if (registrantIndex === -1) {
            return;
          }

          if ($scope.block.type !== 'paragraphContent') {
            $scope.answer = _.find($scope.currentRegistration.registrants[registrantIndex].answers, {'blockId': $scope.block.id});
            if (angular.isUndefined($scope.answer)) {
              $scope.answer = {
                id: uuid(),
                registrantId: registrantId,
                blockId: $scope.block.id
              };
              //default value
              switch ($scope.block.type) {
                case 'checkboxQuestion':
                  $scope.answer.value = {};
                  break;
                case 'nameQuestion':
                  $scope.answer.value = {
                    firstName: '',
                    lastName: ''
                  };
                  break;
                case 'addressQuestion':
                  $scope.answer.value = {
                    address1: '',
                    address2: '',
                    city: '',
                    state: '',
                    zip: ''
                  };
                  break;
                default:
                  $scope.answer.value = '';
              }
              $scope.currentRegistration.registrants[registrantIndex].answers.push($scope.answer);
            }

            $scope.$watch('answer', function (answer, oldAnswer) {
              if (angular.isUndefined(answer) || angular.isUndefined(oldAnswer) || angular.equals(answer, oldAnswer)) {
                return;
              }

              RegistrationCache.updateCurrent($scope.conference.id, $scope.currentRegistration);
            }, true);
          }
        }

        $scope.blockVisible = function (block) {
          if (angular.isUndefined($scope.currentRegistration) || angular.isUndefined($scope.currentRegistrant)) {
            return false;
          }
          var registrant = _.find($scope.currentRegistration.registrants, {id: $scope.currentRegistrant});
          return validateRegistrant.blockVisible(block, registrant);
        };
      }
    };
  });