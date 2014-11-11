'use strict';

angular.module('confRegistrationWebApp')
  .directive('nameQuestion', function () {
    return {
      templateUrl: 'views/blocks/nameQuestion.html',
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('addressQuestion', function () {
    return {
      templateUrl: 'views/blocks/addressQuestion.html',
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('checkboxQuestion', function () {
    return {
      templateUrl: 'views/blocks/checkboxQuestion.html',
      restrict: 'E',
      controller: function ($scope) {
        if ($scope.wizard) {
          $scope.answer = {value: {}};
        } else {
          $scope.$watch('answer.value', function () {
            if (angular.isDefined($scope.answer)) {
              if (angular.isDefined(_.findKey($scope.answer.value, function (v) { return v === true; }))) {
                $scope.atLeastOneChecked = true;
              } else {
                $scope.atLeastOneChecked = false;
              }
            }
          }, true);
        }
      }
    };
  });

angular.module('confRegistrationWebApp')
  .directive('emailQuestion', function () {
    return {
      templateUrl: 'views/blocks/emailQuestion.html',
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('numberQuestion', function () {
    return {
      templateUrl: 'views/blocks/numberQuestion.html',
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('phoneQuestion', function () {
    return {
      templateUrl: 'views/blocks/phoneQuestion.html',
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('radioQuestion', function () {
    return {
      templateUrl: 'views/blocks/radioQuestion.html',
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('selectQuestion', function () {
    return {
      templateUrl: 'views/blocks/selectQuestion.html',
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('textQuestion', function () {
    return {
      templateUrl: 'views/blocks/textQuestion.html',
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('genderQuestion', function () {
    return {
      templateUrl: 'views/blocks/genderQuestion.html',
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('dateQuestion', function () {
    return {
      templateUrl: 'views/blocks/dateQuestion.html',
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('yearInSchoolQuestion', function () {
    return {
      templateUrl: 'views/blocks/yearInSchoolQuestion.html',
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('rideshareQuestions', function () {
    return {
      templateUrl: 'views/blocks/rideshareQuestions.html',
      restrict: 'E',
      controller: function($scope, $http){
        var activePageId = $scope.$parent.$parent.activePageId;
        if(activePageId !== 'rideshare'){
          return;
        }

        var currentRegistrant = $scope.$parent.$parent.currentRegistrant;
        var defaultDepartTime = moment($scope.$parent.$parent.conference.eventStartTime).minute(0).subtract(2, 'hours');
        $http.get('registrants/' + currentRegistrant + '/rideshare').
          success(function(data) {
            if(_.isNull(data.departTime)){
              data.departTime = defaultDepartTime;
            }
            $scope.rideshare = data;
          }).
          error(function(data, status) {
            if(status === 404){
              //create rideshare entry
              $http.post('registrants/' + currentRegistrant + '/rideshare', {
                conferenceId: $scope.$parent.$parent.conference.id,
                personId: currentRegistrant
              }).success(function(data) {
                data.departTime = defaultDepartTime;
                $scope.rideshare = data;
              });
            }
          });

        $scope.$watch('rideshare', function(newValue, oldValue) {
          if (newValue === oldValue) {
            return;
          }
          var address1 = $scope.rideshare.address1;
          var city = $scope.rideshare.city;
          var state = $scope.rideshare.state;

          if(address1 && city && state){
            updateAddress(address1, city, state);
          }

          if(angular.isUndefined(oldValue)){
            return;
          }
          var putData = angular.copy($scope.rideshare);
          putData.departTime = moment(putData.departTime).format('YYYY-MM-DD HH:mm:ss');
          $http.put('rideshare/' + newValue.id, putData);
        }, true);

        var updateAddress = function(address1, city, state){
          var geocoder = new google.maps.Geocoder();
          var geocoderRequest = { address: address1 + ' ' + city + ', ' + state };
          geocoder.geocode(geocoderRequest, function(results){
            var location = {
              lat:  _.first(results).geometry.location.lat(),
              lng:  _.first(results).geometry.location.lng()
            };
            $scope.map = {
              id: 0,
              coords: {
                latitude: location.lat,
                longitude: location.lng
              },
              zoom: 14,
              center: {
                latitude: location.lat,
                longitude: location.lng
              }
            };
            $scope.rideshare.latitude = Number(location.lat.toFixed(6));
            $scope.rideshare.longitude = Number(location.lng.toFixed(6));
            $scope.$digest();
          });
        };
      }
    };
  });