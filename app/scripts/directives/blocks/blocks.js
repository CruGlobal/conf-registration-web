import nameQuestionTemplate from './nameQuestion.html';
import addressQuestionTemplate from './addressQuestion.html';
import checkboxQuestionTemplate from './checkboxQuestion.html';
import emailQuestionTemplate from './emailQuestion.html';
import numberQuestionTemplate from './numberQuestion.html';
import phoneQuestionTemplate from './phoneQuestion.html';
import radioQuestionTemplate from './radioQuestion.html';
import selectQuestionTemplate from './selectQuestion.html';
import textQuestionTemplate from './textQuestion.html';
import genderQuestionTemplate from './genderQuestion.html';
import dateQuestionTemplate from './dateQuestion.html';
import yearInSchoolQuestionTemplate from './yearInSchoolQuestion.html';
import opportunitiesQuestionTemplate from './opportunitiesQuestion.html';
import textareaQuestionTemplate from './textareaQuestion.html';
import campusQuestionTemplate from './campusQuestion.html';
import graduationDateQuestionTemplate from './graduationDateQuestion.html';
import ethnicityQuestionTemplate from './ethnicityQuestion.html';

angular.module('confRegistrationWebApp').directive('nameQuestion', function () {
  return {
    templateUrl: nameQuestionTemplate,
    restrict: 'E',
    controller: function ($rootScope, $scope) {
      if (!$scope.answer && !$scope.answer.value) {
        $scope.answer.value = {};
      }

      const user = $rootScope.globalUser();
      // TODO: Remove employeeId fallback once HCM goes live
      const isStaff = user && (user.orca || user.employeeId);
      $scope.lockedStaffProfileBlock = Boolean(
        !$scope.adminEditRegistrant &&
          isStaff &&
          $scope.currentRegistration &&
          $scope.currentRegistrant ===
            $scope.currentRegistration.primaryRegistrantId &&
          $scope.block.profileType === 'NAME',
      );
    },
  };
});

angular
  .module('confRegistrationWebApp')
  .directive('addressQuestion', function () {
    return {
      templateUrl: addressQuestionTemplate,
      restrict: 'E',
    };
  });

angular
  .module('confRegistrationWebApp')
  .directive('checkboxQuestion', function () {
    return {
      templateUrl: checkboxQuestionTemplate,
      restrict: 'E',
      controller: function ($scope) {
        $scope.atLeastOneChecked = function () {
          if (!$scope.answer) {
            return false;
          }
          return angular.isDefined(
            _.findKey($scope.answer.value, function (v) {
              return v === true;
            }),
          );
        };
      },
    };
  });

angular
  .module('confRegistrationWebApp')
  .directive('emailQuestion', function () {
    return {
      templateUrl: emailQuestionTemplate,
      restrict: 'E',
      controller: function ($rootScope, $scope) {
        const user = $rootScope.globalUser();
        // TODO: Remove employeeId fallback once HCM goes live
        const isStaff = user && (user.orca || user.employeeId);
        $scope.lockedStaffProfileBlock = Boolean(
          !$scope.adminEditRegistrant &&
            isStaff &&
            $scope.currentRegistration &&
            $scope.currentRegistrant ===
              $scope.currentRegistration.primaryRegistrantId &&
            $scope.block.profileType === 'EMAIL',
        );
      },
    };
  });

angular
  .module('confRegistrationWebApp')
  .directive('numberQuestion', function () {
    return {
      templateUrl: numberQuestionTemplate,
      restrict: 'E',
    };
  });

angular
  .module('confRegistrationWebApp')
  .directive('phoneQuestion', function () {
    return {
      templateUrl: phoneQuestionTemplate,
      restrict: 'E',
    };
  });

angular
  .module('confRegistrationWebApp')
  .directive('radioQuestion', function () {
    return {
      templateUrl: radioQuestionTemplate,
      restrict: 'E',
      controller: function ($scope, $timeout) {
        $scope.otherSentinel = '__other__';

        $scope.selectOtherAnswer = () => {
          if ($scope.otherAnswer) {
            $scope.selectedAnswer = $scope.otherSentinel;
          }
        };

        $scope.clearAnswer = () => {
          $scope.selectedAnswer = '';
        };

        $scope.setAnswer = (value) => {
          if (
            $scope.block.content.otherOption &&
            $scope.block.content.otherOption.enabled &&
            value &&
            !_.includes(_.map($scope.block.content.choices, 'value'), value)
          ) {
            // An answer is present that isn't in the list of available choices, so it is an "Other" answer
            $scope.selectedAnswer = $scope.otherSentinel;
            $scope.otherAnswer = value;
          } else {
            $scope.selectedAnswer = value;
            $scope.otherAnswer = '';
          }
        };

        const answerValue = $scope.answer ? $scope.answer.value : '';
        $scope.setAnswer(answerValue);

        // We would use ng-model-options="{ debounce: 1000 }", but that causes the selection to disappear when
        // rapidly changing the selected option (https://stackoverflow.com/questions/31254291). To work-around,
        // we perform the debounce ourselves. We're writing our own debounce function instead of using _.debounce
        // because lodash's implementation uses setTimeout, but we need to use $timeout so that the timeout can
        // be manually flushed in tests.
        let currentTimeout = null;
        const updateAnswerValueDebounced = () => {
          if (currentTimeout) {
            // Cancel the previous timeout and start a new one
            $timeout.cancel(currentTimeout);
          }

          // Update the answer after one second
          currentTimeout = $timeout(() => {
            if ($scope.answer) {
              $scope.answer.value =
                $scope.selectedAnswer === $scope.otherSentinel
                  ? $scope.otherAnswer
                  : $scope.selectedAnswer;
            }
          }, 1000);
        };

        $scope.$watchGroup(
          ['selectedAnswer', 'otherAnswer'],
          updateAnswerValueDebounced,
        );

        // Watch for changes to answer.value and update selectedAnswer accordingly
        $scope.$watch('answer.value', function (newValue, oldValue) {
          if (newValue !== oldValue && newValue !== undefined) {
            $scope.setAnswer(newValue);
          }
        });
      },
    };
  });

angular
  .module('confRegistrationWebApp')
  .directive('selectQuestion', function () {
    return {
      templateUrl: selectQuestionTemplate,
      restrict: 'E',
      controller: function ($scope, $filter) {
        $scope.$watchGroup(
          ['block', 'days'],
          function () {
            $scope.visibleValues = [];
            angular.forEach($scope.block.content.choices, function (c) {
              var visibleValue = c.value;
              if (c.amount && !$scope.block.hideAmount) {
                visibleValue =
                  visibleValue +
                  ' - ' +
                  $filter('localizedCurrency')(
                    $scope.daysForBlock() * c.amount,
                    $scope.conference.currency.currencyCode,
                  );
              }
              $scope.visibleValues.push(visibleValue);
            });
          },
          true,
        );
      },
    };
  });

angular.module('confRegistrationWebApp').directive('textQuestion', function () {
  return {
    templateUrl: textQuestionTemplate,
    restrict: 'E',
  };
});

angular
  .module('confRegistrationWebApp')
  .directive('genderQuestion', function () {
    return {
      templateUrl: genderQuestionTemplate,
      restrict: 'E',
    };
  });

angular.module('confRegistrationWebApp').directive('dateQuestion', function () {
  return {
    templateUrl: dateQuestionTemplate,
    restrict: 'E',
  };
});

angular
  .module('confRegistrationWebApp')
  .directive('yearInSchoolQuestion', function () {
    return {
      templateUrl: yearInSchoolQuestionTemplate,
      restrict: 'E',
      controller: function ($scope) {
        $scope.block.content.staticChoices = [
          'Freshman',
          'Sophomore',
          'Junior',
          'Senior',
          'Graduate Student',
        ];
      },
    };
  });

angular
  .module('confRegistrationWebApp')
  .directive('textareaQuestion', function () {
    return {
      templateUrl: textareaQuestionTemplate,
      restrict: 'E',
    };
  });

// All future campus questions should use CAMPUS_V2, but we need to keep the old one around for existing questions that use it
angular
  .module('confRegistrationWebApp')
  .directive('campusQuestion', function () {
    return {
      templateUrl: campusQuestionTemplate,
      restrict: 'E',
      controller: function ($scope, $http) {
        if (
          $scope.block.profileType === 'CAMPUS_V2' &&
          $scope.answer &&
          angular.isObject($scope.answer.value)
        ) {
          $scope.campusName = $scope.answer.value.name;
          $scope.answer.value = $scope.answer.value.id;
        }

        $scope.searchCampuses = function (val) {
          $scope.params = {
            limit: 15,
          };
          $scope.params = $scope.block.content.showInternationalCampuses
            ? Object.assign($scope.params, { includeInternational: true })
            : $scope.params;
          return $http
            .get('campuses/' + val, { params: $scope.params })
            .then(function (campusNames) {
              return campusNames.data;
            });
        };

        $scope.searchCampusesV2 = function (val) {
          $scope.params = {
            name: val,
          };
          return $http
            .get('campuses/connections/search', { params: $scope.params })
            .then(function (campusNames) {
              return campusNames.data.records;
            });
        };

        $scope.selectCampus = function (campus) {
          $scope.answer.value = campus.id;
          $scope.campusName = campus.name;
        };

        if ($scope.answer.value) {
          if ($scope.block.profileType === 'CAMPUS_V2' && $scope.campusName) {
            $scope.searchCampusesV2($scope.campusName).then((data) => {
              if (!data.length) {
                $scope.answer.value = '';
                $scope.campusName = '';
              }
            });
          } else if ($scope.block.profileType !== 'CAMPUS_V2') {
            $scope.searchCampuses($scope.answer.value).then((data) => {
              if (!data.length) {
                $scope.answer.value = '';
              }
            });
          }
        }
      },
    };
  });

angular
  .module('confRegistrationWebApp')
  .directive('opportunitiesQuestion', function () {
    return {
      templateUrl: opportunitiesQuestionTemplate,
      restrict: 'E',
      controller: function ($scope) {
        $scope.block.content.staticChoices = [
          'Yes, via email',
          'Yes, via text',
          'Yes, via email & text',
          'No',
        ];
      },
    };
  });

angular
  .module('confRegistrationWebApp')
  .directive('graduationDateQuestion', function () {
    return {
      templateUrl: graduationDateQuestionTemplate,
      restrict: 'E',
    };
  });

angular
  .module('confRegistrationWebApp')
  .directive('ethnicityQuestion', function () {
    return {
      templateUrl: ethnicityQuestionTemplate,
      restrict: 'E',
      controller: function ($scope, $timeout) {
        $scope.otherSentinel = '__other__';

        $scope.block.content.staticChoices = [
          'American Indian/Native Alaskan',
          'Arab/Middle Eastern',
          'Asian/Asian American',
          'Black/African American',
          'Hispanic/Latino',
          'Multi-racial/Multi-ethnic',
          'Pacific Islander/Native Hawaiian',
          'White/European American',
          'Prefer not to answer',
        ];

        $scope.selectOtherAnswer = () => {
          if ($scope.otherAnswer) {
            $scope.selectedAnswer = $scope.otherSentinel;
          }
        };

        $scope.clearOther = () => {
          if ($scope.selectedAnswer != $scope.otherSentinel)
            $scope.otherAnswer = '';
        };

        const answerValue = $scope.answer ? $scope.answer.value : '';
        if (
          answerValue &&
          !_.includes($scope.block.content.staticChoices, answerValue)
        ) {
          // An answer is present that isn't in the list of available choices, so it is an "Other" answer
          $scope.selectedAnswer = $scope.otherSentinel;
          $scope.otherAnswer = answerValue;
        } else {
          $scope.selectedAnswer = answerValue;
          $scope.otherAnswer = '';
        }

        // We would use ng-model-options="{ debounce: 1000 }", but that causes the selection to disappear when
        // rapidly changing the selected option (https://stackoverflow.com/questions/31254291). To work-around,
        // we perform the debounce ourselves. We're writing our own debounce function instead of using _.debounce
        // because lodash's implementation uses setTimeout, but we need to use $timeout so that the timeout can
        // be manually flushed in tests.
        let currentTimeout = null;
        const updateAnswerValueDebounced = () => {
          if (currentTimeout) {
            // Cancel the previous timeout and start a new one
            $timeout.cancel(currentTimeout);
          }

          // Update the answer after one second
          currentTimeout = $timeout(() => {
            if ($scope.answer) {
              $scope.answer.value =
                $scope.selectedAnswer === $scope.otherSentinel
                  ? $scope.otherAnswer
                  : $scope.selectedAnswer;
            }
          }, 300);
        };

        $scope.$watchGroup(
          ['selectedAnswer', 'otherAnswer'],
          updateAnswerValueDebounced,
        );
      },
    };
  });
