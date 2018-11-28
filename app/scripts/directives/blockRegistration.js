import template from 'views/components/blockRegistration.html';

angular.module('confRegistrationWebApp')
  .directive('blockRegistration', function (DateRangeService) {
    return {
      templateUrl: template,
      restrict: 'A',
      controller: function ($scope, $rootScope, $routeParams, RegistrationCache, uuid, validateRegistrant) {
        $scope.isString = _.isString;

        $onInit();

        function $onInit(){
          if ($scope.adminEditRegistrant) {
            initAdminEditMode();
          } else {
            initRegistrationMode();
          }

          $scope.days = 1;
          if ($scope.block.startDateBlockId !== null) {
            DateRangeService.subscribe($scope.block.startDateBlockId, startDateChangeCallback);
          }
          if ($scope.block.endDateBlockId !== null) {
            DateRangeService.subscribe($scope.block.endDateBlockId, endDateChangeCallback);
          }

          const answerChanged = _.debounce(function() {
            $rootScope.$broadcast('answerChanged');
          }, 500);

          $scope.$watch('answer', function (answer, oldAnswer) {
            if (angular.isUndefined(answer) || angular.isUndefined(oldAnswer) || angular.equals(answer, oldAnswer)) {
              return;
            }

            const blockTypes = ['checkboxQuestion', 'radioQuestion', 'selectQuestion', 'numberQuestion', 'dateQuestion', 'genderQuestion', 'yearInSchoolQuestion'];
            // only triggers if this block can have dependent blocks
            if (_.includes(blockTypes, $scope.block.type)) {
              answerChanged();
            }

            RegistrationCache.updateCurrent($scope.conference.id, $scope.currentRegistration);
          }, true);

          if (_.includes(['radioQuestion', 'selectQuestion', 'checkboxQuestion'], $scope.block.type)) {
            $scope.$on('answerChanged', function() {
              if ($scope.block.type === 'checkboxQuestion') {
                $scope.answer.value = _.pickBy($scope.answer.value, function(value, key) {
                  return value === true && $scope.choiceVisible($scope.block, { value: key });
                });

                RegistrationCache.updateCurrent($scope.conference.id, $scope.currentRegistration);
              } else {
                if (!$scope.choiceVisible($scope.block, $scope.answer)) {
                  $scope.answer.value = '';

                  RegistrationCache.updateCurrent($scope.conference.id, $scope.currentRegistration);
                }
              }
            });
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
        }

        function startDateChangeCallback(value) {
          $scope.startDate = value;
          $scope.days = DateRangeService.calculateDateRange($scope.startDate, $scope.endDate);
        }

        function endDateChangeCallback(value) {
          $scope.endDate = value;
          $scope.days = DateRangeService.calculateDateRange($scope.startDate, $scope.endDate);
        }

        function initializeAnswer(registrantAnswers, block, registrantId, blockDefault) {
          var currentAnswer = _.find(registrantAnswers, {'blockId': block.id});

          if (block.type === 'checkboxQuestion' && angular.isDefined(currentAnswer)) {
            // keep only choices that exist in the Block
            currentAnswer.value = _.pick(currentAnswer.value, _.map($scope.block.content.choices, 'value'));
          }

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

        $scope.daysForBlock = function () {
          return $scope.days;
        };

        $scope.blockVisible = function (block) {
          if (angular.isUndefined($scope.currentRegistration) || angular.isUndefined($scope.currentRegistrant)) {
            return false;
          }
          var registrant = _.find($scope.currentRegistration.registrants, {id: $scope.currentRegistrant});
          return validateRegistrant.blockVisible(block, registrant);
        };

        $scope.choiceVisible = function (block, choice) {
          if (angular.isUndefined(choice)) {
            return false;
          }
          var registrant;
          if (angular.isDefined($scope.adminEditRegistrant)) {
            registrant = $scope.adminEditRegistrant;
          } else {
            if (angular.isUndefined($scope.currentRegistration) || angular.isUndefined($scope.currentRegistrant)) {
              return false;
            }
            registrant = _.find($scope.currentRegistration.registrants, {id: $scope.currentRegistrant});
          }
          return validateRegistrant.choiceVisible(block, choice, registrant);
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
