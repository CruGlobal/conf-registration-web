'use strict';

angular.module('confRegistrationWebApp')
  .controller('ReviewRegistrationCtrl', function ($scope, $rootScope, $location, registration, conference, $modal, $http, RegistrationCache) {

    $scope.conference = conference;
    $scope.registration = registration;
    $scope.answers = registration.answers;
    $scope.blocks = [];

    angular.forEach(conference.registrationPages, function (page) {
      angular.forEach(page.blocks, function (block) {
        if (block.type.indexOf('Content') === -1) {
          $scope.blocks.push(block);
        }
      });
    });

    $scope.findAnswer = function (blockId) {
      return _.find($scope.answers, {blockId: blockId});
    };

    $scope.confirmRegistration = function () {
      $('.btn-success').attr('value', 'Loading...');
      if (!conference.acceptCreditCards) {
        setRegistrationAsCompleted();
        return;
      }

      var currentPayment = $rootScope.currentPayment;
      currentPayment.readyToProcess = true;

      $http.post('payments/', currentPayment).success(function () {
        setRegistrationAsCompleted();
        delete $rootScope.currentPayment;
        RegistrationCache.emptyCache();
      }).error(function () {
          var errorModalOptions = {
            templateUrl: 'views/errorModal.html',
            controller: 'genericModal',
            backdrop: 'static',
            keyboard: false,
            resolve: {
              data: function () {
                return 'Your card was declined, please verify and re-enter your details or use a different card.';
              }
            }
          };
          $modal.open(errorModalOptions).result.then(function () {
            $location.path('/payment/' + conference.id);
          });
          return;
        });
    };

    function setRegistrationAsCompleted() {
      registration.completed = true;
      if (_.isNull(registration.totalDue)) {
        registration.totalDue = $rootScope.totalDue;
      }
      $http.put('registrations/' + registration.id, registration).success(function () {
        $scope.registration.completed = true;
      }).error(function (data) {
          alert('Error: ' + data);
        });
    }

    $scope.editRegistration = function () {
      $location.path('/register/' + conference.id + '/page/' + conference.registrationPages[0].id);
    };
    $scope.editPayment = function () {
      $location.path('/payment/' + conference.id);
    };
  });
