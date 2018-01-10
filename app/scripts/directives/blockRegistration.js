import template from 'views/components/blockRegistration.html';

angular.module('confRegistrationWebApp')
  .directive('blockRegistration', function () {
    return {
      templateUrl: template,
      restrict: 'A',
      controller: function ($scope, $routeParams, RegistrationCache, uuid, validateRegistrant) {
        $scope.isString = _.isString;

        $onInit();

        function $onInit(){
          if ($scope.adminEditRegistrant) {
            initAdminEditMode();
          } else {
            initRegistrationMode();
          }
        }

        function initAdminEditMode(){
          const { answer, isNew } = initializeAnswer(
            $scope.adminEditRegistrant.answers,
            $scope.block,
            $scope.adminEditRegistrant.id
          );
          $scope.answer = answer;
          isNew && $scope.adminEditRegistrant.answers.push($scope.answer);
        }

        function initRegistrationMode(){
          const registrantId = $routeParams.reg;
          const registrantIndex = _.findIndex($scope.currentRegistration.registrants, {'id': registrantId});

          if (!registrantId || !$scope.block || registrantIndex === -1 || $scope.block.type === 'paragraphContent') {
            return;
          }

          const { answer, isNew } = initializeAnswer(
            $scope.currentRegistration.registrants[registrantIndex].answers,
            $scope.block,
            registrantId,
            $scope.block.content && $scope.block.content.default
          );
          $scope.answer = answer;
          isNew && $scope.currentRegistration.registrants[registrantIndex].answers.push($scope.answer);

          $scope.$watch('answer', function (answer, oldAnswer) {
            if (angular.isUndefined(answer) || angular.isUndefined(oldAnswer) || angular.equals(answer, oldAnswer)) {
              return;
            }

            RegistrationCache.updateCurrent($scope.conference.id, $scope.currentRegistration);
          }, true);
        }

        function initializeAnswer(registrantAnswers, block, registrantId, blockDefault) {
          const currentAnswer = _.find(registrantAnswers, {'blockId': block.id});
          return {
            answer: currentAnswer || {
              id: uuid(),
              registrantId: registrantId,
              blockId: block.id,
              value: getDefaultValue(block.type, blockDefault)
            },
            isNew: !currentAnswer
          };
        }

        function getDefaultValue(type, blockDefault){
          switch (type) {
            case 'nameQuestion':
              return {
                firstName: '',
                lastName: ''
              };
            case 'addressQuestion':
              return {
                address1: '',
                address2: '',
                city: '',
                state: '',
                zip: ''
              };
            case 'checkboxQuestion':
              return blockDefault || {};
            case 'radioQuestion':
            case 'selectQuestion':
            case 'dateQuestion':
            case 'birthDateQuestion':
              return blockDefault || '';
            case 'numberQuestion':
              return blockDefault || null;
            default:
              return '';
          }
        }

        $scope.blockVisible = function (block) {
          if (angular.isUndefined($scope.currentRegistration) || angular.isUndefined($scope.currentRegistrant)) {
            return false;
          }
          var registrant = _.find($scope.currentRegistration.registrants, {id: $scope.currentRegistrant});
          return validateRegistrant.blockVisible(block, registrant);
        };

        //Check if the checkbox matches force selection rules
        $scope.checkForceRule = function(block){
          if($scope.isAdmin){
            return true;
          }else{
            var registrant;
            if (angular.isDefined($scope.adminEditRegistrant)) {
              registrant = $scope.adminEditRegistrant;
            }else{
              registrant = _.find($scope.currentRegistration.registrants, {id: $scope.currentRegistrant});
            }
            var ruleStatus = validateRegistrant.checkboxDisable(block, registrant);
            if(ruleStatus){//making all checkbox with force selection to true
              for(var i in block.content.forceSelections){
                if(block.content.forceSelections[i] === true){
                  $scope.answer.value[i] = block.content.forceSelections[i];
                }
              }
            }
            return ruleStatus;
          }
        };

      }
    };
  });
