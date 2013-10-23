'use strict';

angular.module('confRegistrationWebApp')
  .controller('ReviewRegistrationCtrl', function ($scope, $location, registration, conference, $modal, Model) {

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
      setRegistrationAsCompleted();
      registration.currentPayment.readyToProcess = true;
      Model.update('/registrations/' + registration.id, registration, function (result) {

        console.log(result.status);

        if (result.status === 501) {
          var errorModalOptions = {
            templateUrl: 'views/errorModal.html',
            controller: 'errorModal',
            backdrop: 'static',
            keyboard: false,
            resolve: {
              message: function () {
                return 'Your card was declined, please verify and re-enter your details or use a different card.';
              }
            }
          };
          $modal.open(errorModalOptions).result.then(function () {
            $location.path('/payment/' + conference.id);
          });
          return;
        } else {
          setRegistrationAsCompleted();
        }
      });
    };

    function setRegistrationAsCompleted() {
      registration.completed = true;
      Model.update('/registrations/' + registration.id, registration, function () {
        $scope.registration.completed = true;
      });
    }

    $scope.editRegistration = function () {
      $location.path('/register/' + conference.id + '/page/' + conference.registrationPages[0].id);
    };
    $scope.editPayment = function () {
      $location.path('/payment/' + conference.id);
    };
  });
